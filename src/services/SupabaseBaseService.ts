import { Supabase, FilterParams } from '@/integrations/supabase';
import { BaseService, BaseServiceOptions } from './BaseService';
import { Database } from '@/integrations/supabase/types';
import { toSnakeCase, toCamelCase, mapObjectKeys } from '@/utils/caseConverter';
import { BaseEntity } from '@/types/shared';
import { z } from 'zod';
import { Result, success, failure } from '@/types/result';
import { AppError, ErrorCode } from '@/utils/errors/AppError';

export interface SupabaseBaseServiceOptions extends BaseServiceOptions {
  supabaseTable: keyof Database['public']['Tables'];
  fieldMapping?: Record<string, string>;
  validationSchema?: z.ZodSchema;
}

export abstract class SupabaseBaseService<T extends BaseEntity> extends BaseService<T> {
  protected supabaseTable: keyof Database['public']['Tables'];
  protected fieldMapping: Record<string, string>;
  protected validationSchema?: z.ZodSchema;
  protected cache: Map<string, { data: T[]; timestamp: number }> = new Map();
  protected readonly CACHE_TTL = 30 * 1000; // 30 seconds cache for list queries

  constructor(options: SupabaseBaseServiceOptions, initialItems: T[] = []) {
    super(options, initialItems);
    this.supabaseTable = options.supabaseTable;
    this.fieldMapping = options.fieldMapping || {};
    this.validationSchema = options.validationSchema;
  }

  protected invalidateCache() {
    this.cache.clear();
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

  // --- Core CRUD (Standard Pattern - throws error) ---

  async getAll(companyId?: string, isSuperAdmin?: boolean, extraFilters: FilterParams[] = []): Promise<T[]> {
    const cacheKey = JSON.stringify({ companyId, isSuperAdmin, extraFilters });
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const filters: FilterParams[] = [...extraFilters];
      if (!isSuperAdmin && companyId) {
        filters.push({ column: 'company_id', operator: 'eq', value: companyId });
      }
      
      const options = { filters, pagination: { page: 1, pageSize: 1000 } };
      
      const { data, error } = await Supabase.db.findMany<any>(this.supabaseTable, options);
      if (error) throw error;
      
      const mappedData = (data || []).map(item => this.mapFromSupabase(item));
      
      // Update local items state and cache
      this.items = mappedData;
      this.cache.set(cacheKey, { data: mappedData, timestamp: Date.now() });
      this.notifyListeners();
      
      return mappedData;
    } catch (err: any) {
      throw AppError.fromError(err, `${this.constructor.name}.getAll`);
    }
  }

  async getById(id: string, companyId?: string, isSuperAdmin?: boolean): Promise<T | undefined> {
    try {
      const { data, error } = await Supabase.db.findOne<any>(this.supabaseTable, id);
      if (error) throw error;
      if (!data) return undefined;
      
      const mapped = this.mapFromSupabase(data);
      if (!isSuperAdmin && companyId && (mapped as any).companyId && (mapped as any).companyId !== companyId) {
        throw new Error('Acesso negado');
      }
      
      return mapped;
    } catch (err) {
      this.handleError(err, 'getById');
    }
  }

  async create(item: Omit<T, "id">, companyId?: string): Promise<T> {
    try {
      const validated = this.validate(item);
      const payload = { ...validated, companyId: companyId || (validated as any).companyId };
      
      const { data, error } = await Supabase.db.create<any>(this.supabaseTable, this.mapToSupabase(payload));
      if (error) throw error;
      
      const created = this.mapFromSupabase(data);
      this.addItem(created);
      this.invalidateCache();
      return created;
    } catch (err) {
      this.handleError(err, 'create');
    }
  }

  async update(id: string, data: Partial<T>, isSuperAdmin?: boolean): Promise<T | undefined> {
    try {
      const { data: remoteData, error } = await Supabase.db.update<any>(this.supabaseTable, id, this.mapToSupabase(data));
      if (error) throw error;
      
      const updated = this.mapFromSupabase(remoteData);
      this.updateItem(updated);
      this.invalidateCache();
      return updated;
    } catch (err) {
      this.handleError(err, 'update');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await Supabase.db.delete(this.supabaseTable, id);
      if (error) throw error;
      
      this.removeItem(id);
      this.invalidateCache();
      return true;
    } catch (err) {
      this.handleError(err, 'delete');
    }
  }

  // --- Result-based wrappers (New Pattern - Onda 18) ---

  async tryGetAll(companyId?: string, isSuperAdmin?: boolean, extraFilters: FilterParams[] = []): Promise<Result<T[]>> {
    try {
      const data = await this.getAll(companyId, isSuperAdmin, extraFilters);
      return success(data);
    } catch (err: any) {
      return failure(err.message || 'Erro ao buscar registros');
    }
  }

  async tryGetById(id: string, companyId?: string, isSuperAdmin?: boolean): Promise<Result<T | undefined>> {
    try {
      const data = await this.getById(id, companyId, isSuperAdmin);
      return success(data);
    } catch (err: any) {
      return failure(err.message || 'Erro ao buscar registro');
    }
  }

  async tryCreate(item: Omit<T, "id">, companyId?: string): Promise<Result<T>> {
    try {
      const data = await this.create(item, companyId);
      return success(data);
    } catch (err: any) {
      return failure(err.message || 'Erro ao criar registro');
    }
  }

  async tryUpdate(id: string, data: Partial<T>): Promise<Result<T>> {
    try {
      const updated = await this.update(id, data);
      if (!updated) return failure('Registro não encontrado');
      return success(updated);
    } catch (err: any) {
      return failure(err.message || 'Erro ao atualizar registro');
    }
  }
}
