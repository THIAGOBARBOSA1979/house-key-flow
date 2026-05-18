import { supabase } from '@/lib/supabase';
import { SupabaseResponse, PaginationParams, FilterParams } from './types';
import { SupabaseErrorHandler } from './error-handler';

export class SupabaseDatabase {
  static async findMany<T>(
    table: string,
    params?: {
      filters?: FilterParams[];
      pagination?: PaginationParams;
      select?: string;
    }
  ): Promise<SupabaseResponse<T[]>> {
    let query = supabase.from(table).select(params?.select || '*');

    if (params?.filters) {
      params.filters.forEach(filter => {
        // @ts-ignore - Generic operator application
        query = query[filter.operator](filter.column, filter.value);
      });
    }

    if (params?.pagination) {
      const { page = 1, pageSize = 10, orderBy, orderDirection = 'asc' } = params.pagination;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query.range(from, to);
      if (orderBy) {
        query = query.order(orderBy, { ascending: orderDirection === 'asc' });
      }
    }

    const result = await query;
    return SupabaseErrorHandler.wrap(Promise.resolve(result as any));
  }

  static async findOne<T>(table: string, id: string, idColumn: string = 'id'): Promise<SupabaseResponse<T>> {
    const result = await supabase.from(table).select('*').eq(idColumn, id).single();
    return SupabaseErrorHandler.wrap(Promise.resolve(result as any));
  }

  static async create<T>(table: string, data: Partial<T>): Promise<SupabaseResponse<T>> {
    const result = await supabase.from(table).insert(data).select().single();
    return SupabaseErrorHandler.wrap(Promise.resolve(result as any));
  }

  static async update<T>(table: string, id: string, data: Partial<T>, idColumn: string = 'id'): Promise<SupabaseResponse<T>> {
    const result = await supabase.from(table).update(data).eq(idColumn, id).select().single();
    return SupabaseErrorHandler.wrap(Promise.resolve(result as any));
  }

  static async delete(table: string, id: string, idColumn: string = 'id'): Promise<SupabaseResponse<void>> {
    const result = await supabase.from(table).delete().eq(idColumn, id);
    return SupabaseErrorHandler.wrap(Promise.resolve({ data: null, error: result.error }));
  }

  static async count(table: string, filters?: FilterParams[]): Promise<SupabaseResponse<number>> {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });

    if (filters) {
      filters.forEach(filter => {
        // @ts-ignore
        query = query[filter.operator](filter.column, filter.value);
      });
    }

    const { count, error } = await query;
    return { data: count || 0, error: error ? SupabaseErrorHandler.handle(error) : null };
  }

  static async rpc<T>(name: string, params?: any): Promise<SupabaseResponse<T>> {
    const result = await supabase.rpc(name, params);
    return SupabaseErrorHandler.wrap(Promise.resolve(result as any));
  }
}
