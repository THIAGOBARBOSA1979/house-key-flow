import { SupabaseService } from "./SupabaseService";
import { User, UserStats } from "@/types/user";
import { Supabase } from "@/integration/supabase";

class UserService extends SupabaseService<User> {
  constructor() {
    super("profiles"); // In Supabase, users are linked to profiles
  }

  async getStats(companyId?: string, isSuperAdmin?: boolean): Promise<UserStats> {
    const filters: any[] = [];
    if (!isSuperAdmin && companyId) {
      filters.push({ column: 'company_id', operator: 'eq', value: companyId });
    }

    const { data: total } = await Supabase.db.count(this.table, filters);
    const { data: active } = await Supabase.db.count(this.table, [...filters, { column: 'status', operator: 'eq', value: 'active' }]);
    const { data: inactive } = await Supabase.db.count(this.table, [...filters, { column: 'status', operator: 'eq', value: 'inactive' }]);
    const { data: clients } = await Supabase.db.count(this.table, [...filters, { column: 'role', operator: 'eq', value: 'client' }]);

    return {
      total: total || 0,
      active: active || 0,
      inactive: inactive || 0,
      clients: clients || 0,
      staff: (total || 0) - (clients || 0),
    };
  }

  async clearAllData() {
    // In Supabase we don't clear all data easily for security reasons
    console.warn('clearAllData not implemented for Supabase UserService');
  }
}

export const userService = new UserService();
