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

  async getAll(companyId?: string, isSuperAdmin?: boolean, extraFilters: FilterParams[] = []): Promise<Result<T[]>> {
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
      this.handleError(err, 'getAll');
      return failure('Erro ao buscar registros');
    }
  }

  async getById(id: string, companyId?: string, isSuperAdmin?: boolean): Promise<Result<T | undefined>> {
    try {
      const { data, error } = await Supabase.db.findOne<any>(this.supabaseTable, id);
      if (error) throw error;
      if (!data) return success(undefined);
      
      const mapped = this.mapFromSupabase(data);
      if (!isSuperAdmin && companyId && (mapped as any).companyId && (mapped as any).companyId !== companyId) {
        return failure('Acesso negado');
      }
      
      return success(mapped);
    } catch (err) {
      this.handleError(err, 'getById');
      return failure('Erro ao buscar registro');
    }
  }

  async create(item: Omit<T, "id">, companyId?: string): Promise<Result<T>> {
    try {
      const validated = this.validate(item);
      const payload = { ...validated, companyId: companyId || (validated as any).companyId };
      
      const { data, error } = await Supabase.db.create<any>(this.supabaseTable, this.mapToSupabase(payload));
      if (error) throw error;
      
      const created = this.mapFromSupabase(data);
      this.addItem(created);
      return success(created);
    } catch (err) {
      this.handleError(err, 'create');
      return failure('Erro ao criar registro');
    }
  }

  async update(id: string, data: Partial<T>): Promise<Result<T>> {
    try {
      const { data: remoteData, error } = await Supabase.db.update<any>(this.supabaseTable, id, this.mapToSupabase(data));
      if (error) throw error;
      
      const updated = this.mapFromSupabase(remoteData);
      this.updateItem(updated);
      return success(updated);
    } catch (err) {
      this.handleError(err, 'update');
      return failure('Erro ao atualizar registro');
    }
  }

  async delete(id: string): Promise<Result<boolean>> {
    try {
      const { error } = await Supabase.db.delete(this.supabaseTable, id);
      if (error) throw error;
      
      this.removeItem(id);
      return success(true);
    } catch (err) {
      this.handleError(err, 'delete');
      return failure('Erro ao remover registro');
    }
  }
}
