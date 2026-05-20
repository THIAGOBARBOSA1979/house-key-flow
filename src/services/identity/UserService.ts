import { SupabaseBaseService } from "../SupabaseBaseService";
import { User, UserStats } from "@/types/user";
import { Supabase } from "@/integrations/supabase";
import { Tables } from "@/integrations/supabase/types";

class UserService extends SupabaseBaseService<User> {
  constructor() {
    super({
      storageKey: "a2_users",
      supabaseTable: "profiles",
      auditEntityType: "user",
      shouldSyncWithSupabase: true
    }, []);
    this.initializeRealtime();
  }

  private async initializeRealtime() {
    Supabase.realtime.subscribeToTable('profiles', async () => {
      await this.sync();
    });
  }

  protected mapToSupabase(user: Partial<User>): Partial<Tables<'profiles'>> {
    const mapped: any = {};
    if (user.name) mapped.full_name = user.name;
    if (user.role) mapped.role = user.role;
    if (user.company_id) mapped.company_id = user.company_id;
    if (user.avatar) mapped.avatar_url = user.avatar;
    return mapped;
  }

  protected mapFromSupabase(raw: Tables<'profiles'> & { email?: string }): User {
    return {
      id: raw.id,
      name: raw.full_name || "Sem Nome",
      email: raw.email || "",
      role: (raw.role as User['role']) || "client",
      status: "active", // Default status as 'profiles' table doesn't have it yet
      company_id: raw.company_id || undefined,
      avatar: raw.avatar_url || undefined,
      createdAt: raw.created_at ? new Date(raw.created_at) : undefined
    };
  }

  /**
   * Extends the base getAll to include specific logic if needed
   */
  public getStats(companyId?: string, isSuperAdmin?: boolean): UserStats {
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

  /**
   * Mock method for sending invitations
   */
  public async sendInvitation(user: User): Promise<boolean> {
    console.log(`Sending invitation to ${user.email || user.name}`);
    // In a real scenario, this would call an Edge Function
    return true;
  }
}

export const userService = new UserService();