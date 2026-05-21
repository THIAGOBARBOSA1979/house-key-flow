import { Supabase, FilterParams } from '@/integrations/supabase';
import { BaseService, BaseServiceOptions } from './BaseService';
import { Database } from '@/integrations/supabase/types';
import { toSnakeCase, toCamelCase, mapObjectKeys } from '@/utils/caseConverter';
import { BaseEntity } from '@/types/shared';
import { z } from 'zod';

export interface SupabaseBaseServiceOptions extends BaseServiceOptions {
  supabaseTable: keyof Database['public']['Tables'];
  fieldMapping?: Record<string, string>;
  validationSchema?: z.ZodSchema;
}

export abstract class SupabaseBaseService<T extends BaseEntity> extends BaseService<T> {
  protected supabaseTable: keyof Database['public']['Tables'];
  protected fieldMapping: Record<string, string>;
  protected validationSchema?: z.ZodSchema;

  constructor(options: SupabaseBaseServiceOptions, initialItems: T[] = []) {
    super(options, initialItems);
    this.supabaseTable = options.supabaseTable;
    this.fieldMapping = options.fieldMapping || {};
    this.validationSchema = options.validationSchema;
  }

  protected validate(data: any) {
    if (this.validationSchema) {
      return this.validationSchema.parse(data);
    }
    return data;
  }

  protected mapToSupabase(item: any): any {
    const mapped = { ...item };
    delete (mapped as any).error;
    delete (mapped as any).isLoading;
    Object.entries(this.fieldMapping).forEach(([frontendKey, backendKey]) => {
      if (mapped[frontendKey] !== undefined) {
        mapped[backendKey] = mapped[frontendKey];
        delete mapped[frontendKey];
      }
    });
    return mapObjectKeys(mapped, toSnakeCase);
  }

  protected mapFromSupabase(raw: any): T {
    if (!raw) return null as any;
    const mapped = mapObjectKeys(raw, toCamelCase);
    Object.entries(this.fieldMapping).forEach(([frontendKey, backendKey]) => {
      const backendValue = raw[backendKey];
      if (backendValue !== undefined) (mapped as any)[frontendKey] = backendValue;
    });
    return mapped as T;
  }

  async getAll(companyId?: string, isSuperAdmin?: boolean): Promise<T[]> {
    try {
      const filters: FilterParams[] = [];
      if (!isSuperAdmin && companyId) {
        filters.push({ column: 'company_id', operator: 'eq', value: companyId });
      }
      
      const options: any = { filters, pagination: { page: 1, pageSize: 1000 } };
      
      const { data, error } = await Supabase.db.findMany<any>(this.supabaseTable, options);
      if (error) throw error;
      this.items = (data || []).map(item => this.mapFromSupabase(item));
      this.notifyListeners();
      return this.items;
    } catch (err) {
      this.handleError(err, 'getAll');
      return this.items;
    }
  }

  async getById(id: string, companyId?: string, isSuperAdmin?: boolean): Promise<T | undefined> {
    try {
      const { data, error } = await Supabase.db.findOne<any>(this.supabaseTable, id);
      if (error) throw error;
      if (!data) return undefined;
      const mapped = this.mapFromSupabase(data);
      if (!isSuperAdmin && companyId && (mapped as any).companyId && (mapped as any).companyId !== companyId) return undefined;
      return mapped;
    } catch (err) {
      this.handleError(err, 'getById');
      return undefined;
    }
  }

  async create(item: Omit<T, "id">, companyId?: string): Promise<T> {
    try {
      this.validate(item);
      const payload = { ...item, company_id: companyId || (item as any).companyId };
      const { data, error } = await Supabase.db.create<any>(this.supabaseTable, this.mapToSupabase(payload));
      if (error) throw error;
      const created = this.mapFromSupabase(data);
      this.addItem(created);
      return created;
    } catch (err) {
      this.handleError(err, 'create');
      throw err;
    }
  }

  async update(id: string, data: Partial<T>, isSuperAdmin?: boolean): Promise<T | undefined> {
    try {
      // Partial validation could be complex with Zod, skipping for now or requiring full object if schema exists
      const { data: remoteData, error } = await Supabase.db.update<any>(this.supabaseTable, id, this.mapToSupabase(data));
      if (error) throw error;
      const updated = this.mapFromSupabase(remoteData);
      this.updateItem(updated);
      return updated;
    } catch (err) {
      this.handleError(err, 'update');
      throw err;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await Supabase.db.delete(this.supabaseTable, id);
      if (error) throw error;
      this.removeItem(id);
      return true;
    } catch (err) {
      this.handleError(err, 'delete');
      return false;
    }
  }
}
