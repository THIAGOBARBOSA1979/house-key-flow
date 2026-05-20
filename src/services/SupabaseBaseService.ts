import { Supabase, FilterParams } from '@/integrations/supabase';
import { BaseService, BaseServiceOptions } from './BaseService';
import { Database } from '@/integrations/supabase/types';

export interface SupabaseBaseServiceOptions extends BaseServiceOptions {
  supabaseTable: keyof Database['public']['Tables'];
}

export abstract class SupabaseBaseService<T extends { id: string; company_id?: string }> extends BaseService<T> {
  protected supabaseTable: keyof Database['public']['Tables'];

  constructor(options: SupabaseBaseServiceOptions, initialData: T[] = []) {
    super(options, initialData);
    this.supabaseTable = options.supabaseTable;
  }

  protected mapToSupabase(item: any): any {
    return item;
  }

  protected mapFromSupabase(raw: any): T {
    return raw as T;
  }

  async sync(companyId?: string, isSuperAdmin?: boolean): Promise<T[]> {
    try {
      const filters: FilterParams[] = [];
      if (!isSuperAdmin && companyId) {
        filters.push({ column: 'company_id', operator: 'eq', value: companyId });
      }

      const { data, error } = await Supabase.db.findMany<T>(this.supabaseTable, { filters });
      
      if (error) {
        return this.handleSyncError(error);
      }

      if (data) {
        this.items = data
          .filter(item => item !== null && item !== undefined)
          .map(item => this.mapFromSupabase(this.deserializeDates(item as any)));
        this.persist();
      }
      
      return this.items;
    } catch (err) {
      return this.handleSyncError(err);
    }
  }

  private handleSyncError(error: any): T[] {
    console.error(`[SupabaseBaseService] Sync failed for ${this.supabaseTable}:`, error);
    // Return current items but notify listeners of potential stale state if needed
    return this.items;
  }


  create(item: Omit<T, "id">, companyId?: string): T {
    const newItem = super.create(item, companyId);
    if (this.options.shouldSyncWithSupabase) {
      Supabase.db.create<T>(this.supabaseTable, this.mapToSupabase(newItem))
        .catch(err => console.error(`[SupabaseBaseService] Sync create failed:`, err));
    }
    return newItem;
  }

  update(id: string, data: Partial<T>, isSuperAdmin?: boolean): T | undefined {
    const updated = super.update(id, data, isSuperAdmin);
    if (updated && this.options.shouldSyncWithSupabase) {
      Supabase.db.update<T>(this.supabaseTable, id, this.mapToSupabase(data))
        .catch(err => console.error(`[SupabaseBaseService] Sync update failed:`, err));
    }
    return updated;
  }

  delete(id: string): boolean {
    const success = super.delete(id);
    if (success && this.options.shouldSyncWithSupabase) {
      Supabase.db.delete(this.supabaseTable, id)
        .catch(err => console.error(`[SupabaseBaseService] Sync delete failed:`, err));
    }
    return success;
  }
}
