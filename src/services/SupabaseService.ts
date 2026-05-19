import { Supabase, FilterParams, PaginationParams } from '@/integrations/supabase';
import { Database } from '@/integrations/supabase/types';

export abstract class SupabaseService<T extends { id: string; company_id?: string }> {
  protected table: keyof Database['public']['Tables'];

  constructor(table: keyof Database['public']['Tables']) {
    this.table = table;
  }

  async getAll(companyId?: string, isSuperAdmin?: boolean, options?: { filters?: FilterParams[]; pagination?: PaginationParams }): Promise<T[]> {
    const filters: FilterParams[] = options?.filters || [];
    
    if (!isSuperAdmin && companyId) {
      filters.push({ column: 'company_id', operator: 'eq', value: companyId });
    } else if (!isSuperAdmin && !companyId) {
      console.warn(`[SupabaseService] getAll called without companyId for table ${this.table}`);
      return [];
    }

    const { data, error } = await Supabase.db.findMany<T>(this.table, {
      filters,
      pagination: options?.pagination
    });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async getById(id: string, companyId?: string, isSuperAdmin?: boolean, idColumn: string = 'id'): Promise<T | null> {
    const { data, error } = await Supabase.db.findOne<T>(this.table, id, idColumn);

    if (error) return null;
    if (!data) return null;

    if (!isSuperAdmin && data.company_id !== companyId) {
      return null;
    }

    return data;
  }

  async create(item: Omit<T, 'id'>, companyId?: string): Promise<T> {
    const dataToInsert = {
      ...item,
      company_id: companyId || (item as any).company_id
    };

    const { data, error } = await Supabase.db.create<T>(this.table, dataToInsert as any);

    if (error) {
      throw new Error(error.message);
    }

    if (!data) throw new Error('Failed to create item');
    return data;
  }

  async update(id: string, data: Partial<T>, idColumn: string = 'id'): Promise<T> {
    const { data: updated, error } = await Supabase.db.update<T>(this.table, id, data, idColumn);

    if (error) {
      throw new Error(error.message);
    }

    if (!updated) throw new Error('Failed to update item');
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
    if (error) return 0;
    return data || 0;
  }
}
