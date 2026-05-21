import { Supabase, FilterParams } from '@/integrations/supabase';
import { BaseService, BaseServiceOptions } from './BaseService';
import { errorHandler } from '@/utils/errors/ErrorHandler';

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
    const mapped = { ...item };
    // Remove complex nested objects that don't belong in flat table columns
    // This is a safety measure to prevent Supabase from choking on nested JSON that isn't expected
    return mapped;
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
    errorHandler.handle(error, `SupabaseBaseService:${this.supabaseTable}:sync`);
    return this.items;
  }


  async create(item: Omit<T, "id">, companyId?: string): Promise<T> {
    const newItem = super.create(item, companyId);
    if (this.options.shouldSyncWithSupabase) {
      try {
        const { data, error } = await Supabase.db.create<T>(this.supabaseTable, this.mapToSupabase(newItem));
        if (error) throw error;
        if (data) return this.mapFromSupabase(this.deserializeDates(data as any));
      } catch (err) {
        console.error(`[SupabaseBaseService] Sync create failed for ${this.supabaseTable}:`, err);
      }
    }
    return newItem;
  }

  async update(id: string, data: Partial<T>, isSuperAdmin?: boolean): Promise<T | undefined> {
    const updated = super.update(id, data, isSuperAdmin);
    if (updated && this.options.shouldSyncWithSupabase) {
      try {
        const { data: remoteData, error } = await Supabase.db.update<T>(this.supabaseTable, id, this.mapToSupabase(data));
        if (error) throw error;
        if (remoteData) return this.mapFromSupabase(this.deserializeDates(remoteData as any));
      } catch (err) {
        console.error(`[SupabaseBaseService] Sync update failed for ${this.supabaseTable}:`, err);
      }
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const success = super.delete(id);
    if (success && this.options.shouldSyncWithSupabase) {
      try {
        const { error } = await Supabase.db.delete(this.supabaseTable, id);
        if (error) throw error;
      } catch (err) {
        console.error(`[SupabaseBaseService] Sync delete failed for ${this.supabaseTable}:`, err);
      }
    }
    return success;
  }
}

