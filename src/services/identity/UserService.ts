import { BaseService } from "../BaseService";
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
    const mapped: any = super.mapToSupabase(user);
    if (user.name) mapped.full_name = user.name;
    if (user.avatar) mapped.avatar_url = user.avatar;
    
    // Delete frontend-only fields
    delete mapped.name;
    delete mapped.avatar;
    delete mapped.created_at; // Handled by DB
    delete mapped.id; // Usually not updated manually
    delete mapped.email; // email is in auth.users
    
    return mapped;
  }

  protected mapFromSupabase(raw: Tables<'profiles'> & { email?: string }): User {
    const mapped = super.mapFromSupabase(raw) as User;
    return {
      ...mapped,
      name: raw.full_name || mapped.name || "Sem Nome",
      email: raw.email || mapped.email || "",
      avatar: raw.avatar_url || mapped.avatar,
      createdAt: raw.created_at ? new Date(raw.created_at) : mapped.createdAt
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
      const newUser = await this.create({
        ...data,
        status: data.status || 'active',
        createdAt: new Date()
      }, data.company_id);

      // If it's a client, also initialize their journey stage
      if (newUser.role === 'client' || newUser.role === 'user') {
        const { clientStageService } = await import("@/services/operations/ClientStageService");
        
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

        const newStageProfile = await clientStageService.create(stageData, newUser.company_id);
        if (newStageProfile.id !== newUser.id) {
          await (clientStageService as any).update(newStageProfile.id, { id: newUser.id }, true);
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