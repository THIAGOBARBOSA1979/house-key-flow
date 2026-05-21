import { Supabase, FilterParams, PaginationParams, SupabaseResponse } from '@/integrations/supabase';
import { Database } from '@/integrations/supabase/types';
import { errorHandler } from '@/utils/errors/ErrorHandler';


export abstract class SupabaseService<T extends { id: string; company_id?: string }> {
  protected table: keyof Database['public']['Tables'];

  constructor(table: keyof Database['public']['Tables']) {
    this.table = table;
  }

  async getAll(
    companyId?: string, 
    isSuperAdmin?: boolean, 
    options?: { filters?: FilterParams[]; pagination?: PaginationParams }
  ): Promise<T[]> {
    const filters: FilterParams[] = options?.filters || [];
    
    if (!isSuperAdmin) {
      if (!companyId) {
        console.warn(`[SupabaseService] getAll called without companyId for table ${this.table}`);
        return [];
      }
      filters.push({ column: 'company_id', operator: 'eq', value: companyId });
    }

    const { data, error } = await Supabase.db.findMany<T>(this.table, {
      filters,
      pagination: options?.pagination
    });

    if (error) {
      throw errorHandler.handle(error, `SupabaseService:${this.table}:getAll`);
    }


    return data || [];
  }

  async getById(id: string, companyId?: string, isSuperAdmin?: boolean, idColumn: string = 'id'): Promise<T | null> {
    const { data, error } = await Supabase.db.findOne<T>(this.table, id, idColumn);

    if (error || !data) return null;

    if (!isSuperAdmin && data.company_id !== companyId) {
      console.warn(`[SupabaseService] Tenant Isolation: Access denied to ${this.table}:${id}`);
      return null;
    }

    return data;
  }

  async create(item: Omit<T, 'id'>, companyId?: string): Promise<T> {
    const dataToInsert = {
      ...item,
      company_id: companyId || (item as any).company_id
    };

    const { data, error } = await Supabase.db.create<T>(this.table, dataToInsert);

    if (error || !data) {
      throw errorHandler.handle(error || new Error('Failed to create item'), `SupabaseService:${this.table}:create`);
    }

    return data;
  }

  async update(id: string, data: Partial<T>, idColumn: string = 'id'): Promise<T> {
    const { data: updated, error } = await Supabase.db.update<T>(this.table, id, data, idColumn);

    if (error || !updated) {
      throw errorHandler.handle(error || new Error('Failed to update item'), `SupabaseService:${this.table}:update`);
    }

    return updated;
  }

  async delete(id: string, idColumn: string = 'id'): Promise<boolean> {
    const { error } = await Supabase.db.delete(this.table, id, idColumn);
    return !error;
  }

  async count(companyId?: string, isSuperAdmin?: boolean): Promise<number> {
    const filters: FilterParams[] = [];
    if (!isSuperAdmin && companyId) {
      filters.push({ column: 'company_id', operator: 'eq', value: companyId });
    }
    
    const { data, error } = await Supabase.db.count(this.table, filters);
    return error ? 0 : (data || 0);
  }
}
