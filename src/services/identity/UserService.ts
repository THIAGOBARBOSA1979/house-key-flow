import { BaseService } from "../BaseService";
import { User, UserStats } from "@/types/user";
import { Supabase } from "@/integrations/supabase";

class UserService extends BaseService<User> {
  constructor() {
    super({
      storageKey: "a2_users",
      supabaseTable: "profiles",
      auditEntityType: "user",
      shouldSyncWithSupabase: true
    }, []);
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    const { data } = await Supabase.db.findMany<User>('profiles');
    if (data) {
      this.items = data.map(raw => this.mapFromSupabase(raw));
      this.persist();
    }

    Supabase.realtime.subscribeToTable('profiles', async () => {
      const { data: newData } = await Supabase.db.findMany<User>('profiles');
      if (newData) {
        this.items = newData.map(raw => this.mapFromSupabase(raw));
        this.persist();
      }
    });
  }

  protected mapToSupabase(user: User): any {
    return {
      id: user.id,
      full_name: user.name,
      role: user.role,
      company_id: user.company_id,
      status: user.status
    };
  }

  protected mapFromSupabase(raw: any): User {
    return {
      ...raw,
      id: raw.id,
      name: raw.full_name || raw.name,
      email: raw.email || '',
      role: raw.role,
      status: raw.status || 'active',
      company_id: raw.company_id
    } as User;
  }

  // BaseService handles audit logging and basic operations.
  // We only override getStats as it's domain specific.

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
