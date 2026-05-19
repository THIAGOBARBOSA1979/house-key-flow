import { Supabase, FilterParams } from '@/integrations/supabase';
import { Database } from '@/integrations/supabase/types';
import { BaseService, BaseServiceOptions } from './BaseService';

export abstract class SupabaseBaseService<T extends { id: string; company_id?: string }> extends BaseService<T> {
  protected supabaseTable: keyof Database['public']['Tables'];

  constructor(options: BaseServiceOptions & { supabaseTable: keyof Database['public']['Tables'] }, initialData: T[] = []) {
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

  async createRemote(item: T): Promise<T | undefined> {
    if (!this.options.shouldSyncWithSupabase) return item;
    
    const data = this.mapToSupabase(item);
    const { data: created, error } = await Supabase.db.create<T>(this.supabaseTable, data);
    
    if (error) {
      console.error(`[SupabaseBaseService] Failed to sync create to Supabase for ${this.supabaseTable}:`, error);
      return undefined;
    }
    
    return created || undefined;
  }

  create(item: Omit<T, "id">, companyId?: string): T {
    const newItem = super.create(item, companyId);
    this.createRemote(newItem);
    return newItem;
  }

  async updateRemote(id: string, data: Partial<T>): Promise<T | undefined> {
    if (!this.options.shouldSyncWithSupabase) return undefined;
    
    const syncData = this.mapToSupabase(data as any);
    const { data: updated, error } = await Supabase.db.update<T>(this.supabaseTable, id, syncData);
    
    if (error) {
      console.error(`[SupabaseBaseService] Failed to sync update to Supabase for ${this.supabaseTable}:`, error);
      return undefined;
    }
    
    return updated || undefined;
  }

  update(id: string, data: Partial<T>, isSuperAdmin?: boolean): T | undefined {
    const updated = super.update(id, data, isSuperAdmin);
    if (updated) {
      this.updateRemote(id, data);
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
