import { BaseService } from "../BaseService";
import { User, UserStats } from "@/types/user";
import { Supabase } from "@/integration/supabase";
import { SupabaseRealtime } from "@/integration/supabase/realtime";

class UserService extends BaseService<User> {
  constructor() {
    super({
      storageKey: "a2_users",
      auditEntityType: "user",
      shouldSyncWithSupabase: true
    }, []);
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    const { data } = await Supabase.db.findMany<User>('profiles');
    if (data) {
      this.items = data.map(raw => ({
        ...raw,
        name: (raw as any).full_name || (raw as any).name
      } as User));
      this.persist();
    }

    SupabaseRealtime.subscribeToTable('profiles', async () => {
      const { data: newData } = await Supabase.db.findMany<User>('profiles');
      if (newData) {
        this.items = newData.map(raw => ({
          ...raw,
          name: (raw as any).full_name || (raw as any).name
        } as User));
        this.persist();
      }
    });
  }

  // BaseService handles audit logging and basic operations.
  // Overriding only for Supabase specific logic if needed, but BaseService handles it better now.
  // We can remove these overrides if we trust the new BaseService implementation.
  // However, profiles table in Supabase has different column names (full_name vs name).

  async create(item: Omit<User, "id">, companyId?: string): Promise<User> {
    const newItem = super.create(item, companyId);
    
    if (this.options.shouldSyncWithSupabase) {
      Supabase.db.create('profiles', {
        id: newItem.id,
        full_name: newItem.name,
        role: newItem.role,
        company_id: companyId || newItem.company_id,
        status: newItem.status
      } as any).catch(err => console.error('Failed to sync create to Supabase:', err));
    }

    return newItem;
  }

  async update(id: string, data: Partial<User>): Promise<User | undefined> {
    const updated = super.update(id, data);
    if (updated && this.options.shouldSyncWithSupabase) {
      Supabase.db.update('profiles', id, {
        full_name: updated.name,
        role: updated.role,
        status: updated.status,
        company_id: updated.company_id
      } as any).catch(err => console.error('Failed to sync update to Supabase:', err));
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const success = super.delete(id);
    if (success && this.options.shouldSyncWithSupabase) {
      Supabase.db.delete('profiles', id).catch(err => console.error('Failed to sync delete to Supabase:', err));
    }
    return success;
  }

  getStats(companyId?: string, isSuperAdmin?: boolean): UserStats {
    const relevant = this.getAll(companyId, isSuperAdmin);
    const clients = relevant.filter(u => u.role === 'client').length;
    return {
      total: relevant.length,
      active: relevant.filter(u => u.status === 'active').length,
      inactive: relevant.filter(u => u.status === 'inactive').length,
      clients,
      staff: relevant.length - clients,
    };
  }
}

export const userService = new UserService();
