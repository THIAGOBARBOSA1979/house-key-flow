import { Supabase, FilterParams } from '@/integrations/supabase';

import { BaseService, BaseServiceOptions } from './BaseService';

export abstract class SupabaseBaseService<T extends { id: string; company_id?: string }> extends BaseService<T> {
  protected supabaseTable: string;

  constructor(options: BaseServiceOptions & { supabaseTable: string }, initialData: T[] = []) {
    super(options, initialData);
    this.supabaseTable = options.supabaseTable;
  }

  async sync(companyId?: string, isSuperAdmin?: boolean): Promise<T[]> {
    const filters: FilterParams[] = [];
    if (!isSuperAdmin && companyId) {
      filters.push({ column: 'company_id', operator: 'eq', value: companyId });
    }

    const { data, error } = await Supabase.db.findMany<T>(this.supabaseTable, { filters });
    
    if (error) {
      console.error(`[SupabaseBaseService] Sync failed for ${this.supabaseTable}:`, error);
      return this.items;
    }

    if (data) {
      const deserialized = data.map(item => this.mapFromSupabase(this.deserializeDates(item as any)));
      this.items = deserialized;
      this.persist();
      return this.items;
    }
    
    return this.items;
  }

  create(item: Omit<T, "id">, companyId?: string): T {
    const newItem = super.create(item, companyId);
    
    if (this.options.shouldSyncWithSupabase) {
      const data = this.mapToSupabase(newItem);
      Supabase.db.create(this.supabaseTable, data)
        .catch(err => console.error(`[SupabaseBaseService] Failed to sync create to Supabase for ${this.supabaseTable}:`, err));
    }
    
    return newItem;
  }

  update(id: string, data: Partial<T>, isSuperAdmin?: boolean): T | undefined {
    const updated = super.update(id, data, isSuperAdmin);
    
    if (updated && this.options.shouldSyncWithSupabase) {
      const syncData = this.mapToSupabase(updated);
      Supabase.db.update(this.supabaseTable, id, syncData)
        .catch(err => console.error(`[SupabaseBaseService] Failed to sync update to Supabase for ${this.supabaseTable}:`, err));
    }
    
    return updated;
  }

  delete(id: string): boolean {
    const success = super.delete(id);
    
    if (success && this.options.shouldSyncWithSupabase) {
      Supabase.db.delete(this.supabaseTable, id)
        .catch(err => console.error(`[SupabaseBaseService] Failed to sync delete to Supabase for ${this.supabaseTable}:`, err));
    }
    
    return success;
  }
}
