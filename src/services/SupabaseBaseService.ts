import { Supabase, FilterParams } from '@/integrations/supabase';
import { BaseService, BaseServiceOptions } from './BaseService';
import { Database } from '@/integrations/supabase/types';
import { toSnakeCase, toCamelCase, mapObjectKeys } from '@/utils/caseConverter';
import { BaseEntity } from '@/types/shared';
import { z } from 'zod';
import { Result, success, failure } from '@/types/result';

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

  protected validate(data: unknown): T {
    if (this.validationSchema) {
      return this.validationSchema.parse(data) as T;
    }
    return data as T;
  }

  protected mapToSupabase(item: Partial<T>): Record<string, any> {
    const mapped = { ...item } as any;
    delete mapped.error;
    delete mapped.isLoading;
    
    Object.entries(this.fieldMapping).forEach(([frontendKey, backendKey]) => {
      if (mapped[frontendKey] !== undefined) {
        mapped[backendKey] = mapped[frontendKey];
        delete mapped[frontendKey];
      }
    });
    
    return mapObjectKeys(mapped, toSnakeCase);
  }

  protected mapFromSupabase(raw: any): T {
    if (!raw) return null as unknown as T;
    const mapped = mapObjectKeys(raw, toCamelCase);
    
    Object.entries(this.fieldMapping).forEach(([frontendKey, backendKey]) => {
      const backendValue = raw[backendKey];
      if (backendValue !== undefined) (mapped as any)[frontendKey] = backendValue;
    });
    
    return mapped as T;
  }

  // --- Result-based methods (New Pattern - Onda 18) ---

  async tryGetAll(companyId?: string, isSuperAdmin?: boolean, extraFilters: FilterParams[] = []): Promise<Result<T[]>> {
    try {
      const filters: FilterParams[] = [...extraFilters];
      if (!isSuperAdmin && companyId) {
        filters.push({ column: 'company_id', operator: 'eq', value: companyId });
      }
      
      const options = { filters, pagination: { page: 1, pageSize: 1000 } };
      
      const { data, error } = await Supabase.db.findMany<any>(this.supabaseTable, options);
      if (error) throw error;
      
      const mappedData = (data || []).map(item => this.mapFromSupabase(item));
      this.items = mappedData;
      this.notifyListeners();
      
      return success(mappedData);
    } catch (err) {
      const appError = this.handleError(err, 'getAll');
      return failure(appError.message, appError.code);
    }
  }

  async tryGetById(id: string, companyId?: string, isSuperAdmin?: boolean): Promise<Result<T | undefined>> {
    try {
      const { data, error } = await Supabase.db.findOne<any>(this.supabaseTable, id);
      if (error) throw error;
      if (!data) return success(undefined);
      
      const mapped = this.mapFromSupabase(data);
      if (!isSuperAdmin && companyId && (mapped as any).companyId && (mapped as any).companyId !== companyId) {
        return failure('Acesso negado', 'FORBIDDEN');
      }
      
      return success(mapped);
    } catch (err) {
      const appError = this.handleError(err, 'getById');
      return failure(appError.message, appError.code);
    }
  }

  async tryCreate(item: Omit<T, "id">, companyId?: string): Promise<Result<T>> {
    try {
      const validated = this.validate(item);
      const payload = { ...validated, companyId: companyId || (validated as any).companyId };
      
      const { data, error } = await Supabase.db.create<any>(this.supabaseTable, this.mapToSupabase(payload));
      if (error) throw error;
      
      const created = this.mapFromSupabase(data);
      this.addItem(created);
      return success(created);
    } catch (err) {
      const appError = this.handleError(err, 'create');
      return failure(appError.message, appError.code);
    }
  }

  async tryUpdate(id: string, data: Partial<T>): Promise<Result<T>> {
    try {
      const { data: remoteData, error } = await Supabase.db.update<any>(this.supabaseTable, id, this.mapToSupabase(data));
      if (error) throw error;
      
      const updated = this.mapFromSupabase(remoteData);
      this.updateItem(updated);
      return success(updated);
    } catch (err) {
      const appError = this.handleError(err, 'update');
      return failure(appError.message, appError.code);
    }
  }

  async tryDelete(id: string): Promise<Result<boolean>> {
    try {
      const { error } = await Supabase.db.delete(this.supabaseTable, id);
      if (error) throw error;
      
      this.removeItem(id);
      return success(true);
    } catch (err) {
      const appError = this.handleError(err, 'delete');
      return failure(appError.message, appError.code);
    }
  }

  // --- Compatibility methods (Onda 17) ---

  async getAll(companyId?: string, isSuperAdmin?: boolean, extraFilters: FilterParams[] = []): Promise<T[]> {
    const res = await this.tryGetAll(companyId, isSuperAdmin, extraFilters);
    if (res.success) return res.data;
    throw new Error(res.error);
  }

  async getById(id: string, companyId?: string, isSuperAdmin?: boolean): Promise<T | undefined> {
    const res = await this.tryGetById(id, companyId, isSuperAdmin);
    if (res.success) return res.data;
    throw new Error(res.error);
  }

  async create(item: Omit<T, "id">, companyId?: string): Promise<T> {
    const res = await this.tryCreate(item, companyId);
    if (res.success) return res.data;
    throw new Error(res.error);
  }

  async update(id: string, data: Partial<T>): Promise<T | undefined> {
    const res = await this.tryUpdate(id, data);
    if (res.success) return res.data;
    throw new Error(res.error);
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.tryDelete(id);
    if (res.success) return res.data;
    throw new Error(res.error);
  }
}
