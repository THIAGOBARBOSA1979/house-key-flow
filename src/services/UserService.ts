import { SupabaseService } from "./SupabaseService";
import { User, UserStats } from "@/types/user";
import { Supabase } from "@/integration/supabase";
import { SupabaseRealtime } from "@/integration/supabase/realtime";

class UserService extends SupabaseService<User> {
  public items: User[] = [];

  constructor() {
    super("profiles");
    this.initialize();
  }

  private async initialize() {
    this.getUsersAsync().then(users => {
      this.items = users;
    });

    SupabaseRealtime.subscribeToTable('profiles', async () => {
      this.items = await this.getUsersAsync();
    });
  }

  async getUsersAsync(companyId?: string, isSuperAdmin?: boolean): Promise<User[]> {
    return this.getAll(companyId, isSuperAdmin);
  }

  // Synchronous compatibility methods
  getAll(companyId?: string, isSuperAdmin?: boolean): User[] {
    if (isSuperAdmin) return this.items;
    if (!companyId) return [];
    return this.items.filter(u => u.company_id === companyId);
  }

  getByIdSync(id: string): User | undefined {
    return this.items.find(u => u.id === id);
  }

  count(companyId?: string, isSuperAdmin?: boolean): number {
    return this.getAll(companyId, isSuperAdmin).length;
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

  // Dummy methods for BaseService compatibility
  subscribe(callback: (items: User[]) => void) {
    const channel = SupabaseRealtime.subscribeToTable('profiles', async () => {
      const users = await this.getUsersAsync();
      this.items = users;
      callback(users);
    });
    return () => SupabaseRealtime.unsubscribe(channel);
  }

  async clearAllData() {
    this.items = [];
  }
}

export const userService = new UserService();
