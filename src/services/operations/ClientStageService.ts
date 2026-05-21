import { SupabaseBaseService } from "../SupabaseBaseService";
import { Supabase } from "@/integrations/supabase";
import { 
  ClientProfile, 
  ClientStage, 
  StageChange, 
  ClientEvent, 
  StagePermissions,
  STAGE_PERMISSIONS
} from "@/types/clientFlow";

class ClientStageService extends SupabaseBaseService<ClientProfile> {
  constructor() {
    super({
      storageKey: "a2_client_profiles",
      supabaseTable: "client_profiles", 
      auditEntityType: "client_profile",
      shouldSyncWithSupabase: true
    });
  }

  private async initializeRealtime() {
    Supabase.realtime.subscribeToTable('client_profiles', async () => {
      await this.sync();
    });
  }

  getAllProfiles(companyId?: string, isSuperAdmin?: boolean): ClientProfile[] {
    return [...this.getAll(companyId, isSuperAdmin)];
  }

  getProfilesByUserId(userId: string): ClientProfile[] {
    return this.items.filter(p => p.userId === userId || p.id === userId);
  }

  getClientProfile(id: string, companyId?: string, isSuperAdmin?: boolean): ClientProfile | undefined {
    return this.getById(id, companyId, isSuperAdmin);
  }

  async advanceStage(id: string, stage: ClientStage, notes: string = "", changedBy: string = "system", automatic: boolean = false) {
    const profile = this.getById(id);
    if (!profile) return { success: false, error: "Cliente não encontrado" };

    const stageChange: StageChange = {
      id: crypto.randomUUID(),
      fromStage: profile.currentStage,
      toStage: stage,
      changedAt: new Date(),
      reason: notes,
      changedBy,
      isAutomatic: automatic
    };

    const updated = await this.update(id, {
      currentStage: stage,
      stageHistory: [...(profile.stageHistory || []), stageChange]
    });

    if (updated) {
      await this.addEvent({
        clientId: id,
        company_id: profile.company_id,
        eventType: 'stage_changed' as any,
        title: 'Mudança de Etapa',
        description: notes || `Cliente movido para a etapa: ${stage}`,
        metadata: { performedBy: changedBy, isAutomatic: automatic }
      });
      return { ...updated, success: true };
    }

    return { success: false, error: "Falha ao atualizar perfil" };
  }

  async addEvent(event: Omit<ClientEvent, "id" | "createdAt">) {
    const { data, error } = await Supabase.db.create('client_events', {
      client_id: event.clientId,
      company_id: event.company_id,
      event_type: event.eventType,
      title: event.title,
      description: event.description,
      metadata: event.metadata,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error("Error adding client event:", error);
      return null;
    }

    this.notify();
    return data;
  }

  async getEvents(clientId: string, companyId?: string, isSuperAdmin?: boolean): Promise<ClientEvent[]> {
    const { data, error } = await Supabase.db.findMany<any>('client_events', {
      filters: [{ column: 'client_id', operator: 'eq', value: clientId }]
    });

    if (error) {
      console.error("Error fetching client events:", error);
      return [];
    }

    return (data || [])
      .map(e => ({
        id: e.id,
        clientId: e.client_id,
        company_id: e.company_id,
        eventType: e.event_type,
        title: e.title,
        description: e.description,
        createdAt: new Date(e.created_at),
        metadata: e.metadata
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getPermissions(clientId: string): StagePermissions {
    const profile = this.getById(clientId);
    const stage = profile?.currentStage || 'registered';
    return STAGE_PERMISSIONS[stage];
  }

  canScheduleInspection(clientId: string): boolean {
    return this.getPermissions(clientId).canScheduleInspection;
  }

  canRequestWarranty(clientId: string): boolean {
    return this.getPermissions(clientId).canRequestWarranty;
  }

  isStageReached(clientId: string, stage: ClientStage): boolean {
    const profile = this.getById(clientId);
    if (!profile) return false;
    
    const stages: ClientStage[] = ['lead', 'registered', 'inspection_enabled', 'warranty_enabled'];
    const currentOrder = stages.indexOf(profile.currentStage);
    const targetOrder = stages.indexOf(stage);
    
    return currentOrder >= targetOrder;
  }
}

export const clientStageService = new ClientStageService();