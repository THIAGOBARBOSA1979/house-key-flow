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

  public async createProfile(data: any): Promise<{ data?: User, error?: any }> {
    try {
      const newUser = this.create({
        ...data,
        status: data.status || 'active',
        createdAt: new Date()
      }, data.company_id);

      // If it's a client, also initialize their journey stage
      if (newUser.role === 'client' || newUser.role === 'user') {
        const { clientStageService } = await import("@/services/operations/ClientStageService");
        
        // Use any to bypass strict Omit<ClientProfile, "id"> if needed, or pass correct structure
        const stageData: any = {
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          propertyId: data.propertyId || "",
          propertyName: data.propertyName || "",
          unitNumber: data.unit || "",
          currentStage: 'registered',
          createdAt: new Date(),
          stageHistory: [{
            id: crypto.randomUUID(),
            fromStage: null,
            toStage: 'registered',
            changedAt: new Date(),
            reason: 'Cadastro inicial homologado',
            changedBy: 'Sistema',
            isAutomatic: true
          }]
        };

        // If BaseService.create handles ID generation, we don't pass it in Omit<T, "id">
        // but here we want to sync the IDs
        const newStageProfile = clientStageService.create(stageData, newUser.company_id);
        // Force sync the IDs if BaseService generated a new one
        if (newStageProfile.id !== newUser.id) {
          (clientStageService as any).update(newStageProfile.id, { id: newUser.id }, true);
        }
      }

      return { data: newUser };
    } catch (error) {
      return { error };
    }
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