import { BaseService } from "./BaseService";
import { User, UserStats } from "@/types/user";
import { Supabase } from "@/integration/supabase";
import { SupabaseRealtime } from "@/integration/supabase/realtime";

class UserService extends BaseService<User> {
  constructor() {
    super("a2_users", []);
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    const { data } = await Supabase.db.findMany<User>('profiles');
    if (data) {
      this.items = data;
      this.persist();
    }

    SupabaseRealtime.subscribeToTable('profiles', async () => {
      const { data: newData } = await Supabase.db.findMany<User>('profiles');
      if (newData) {
        this.items = newData;
        this.persist();
      }
    });
  }

  // Override create to use Supabase
  create(item: Omit<User, "id">, companyId?: string): User {
    const newItem = super.create(item, companyId);
    
    // Async call to Supabase in background
    Supabase.db.create('profiles', {
      id: newItem.id,
      full_name: newItem.name,
      role: newItem.role,
      company_id: companyId || newItem.company_id,
      status: newItem.status
    } as any).catch(err => console.error('Failed to sync create to Supabase:', err));

    return newItem;
  }

  // Override update to use Supabase
  update(id: string, data: Partial<User>): User | undefined {
    const updated = super.update(id, data);
    if (updated) {
      Supabase.db.update('profiles', id, {
        full_name: updated.name,
        role: updated.role,
        status: updated.status,
        company_id: updated.company_id
      } as any).catch(err => console.error('Failed to sync update to Supabase:', err));
    }
    return updated;
  }

  // Override delete to use Supabase
  delete(id: string): boolean {
    const success = super.delete(id);
    if (success) {
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
