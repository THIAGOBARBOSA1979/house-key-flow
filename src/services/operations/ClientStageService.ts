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
  private events: ClientEvent[] = [];

  constructor() {
    super({
      storageKey: "a2_client_profiles",
      supabaseTable: "client_profiles", 
      auditEntityType: "client_profile",
      shouldSyncWithSupabase: true
    }, []);
    // this.loadEvents(); // Disabled for DB-first
  }

  private loadEvents() {
    // Disabled
  }

  private persistEvents() {
    // Disabled
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

  advanceStage(id: string, stage: ClientStage, notes: string = "", changedBy: string = "system", automatic: boolean = false) {
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

    const updated = this.update(id, {
      currentStage: stage,
      stageHistory: [...(profile.stageHistory || []), stageChange]
    });

    if (updated) {
      this.addEvent({
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

  addEvent(event: Omit<ClientEvent, "id" | "createdAt">) {
    const newEvent: ClientEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date()
    } as ClientEvent;
    this.events.unshift(newEvent);
    // this.persistEvents(); // Disabled
    this.notify();
    return newEvent;
  }

  getEvents(clientId: string, companyId?: string, isSuperAdmin?: boolean): ClientEvent[] {
    return this.events.filter(e => e.clientId === clientId);
  }

  getPermissions(clientId: string): StagePermissions {
    const profile = this.getById(clientId);
    const stage = profile?.currentStage || 'registered';
    return STAGE_PERMISSIONS[stage];
  }

  getTimeline(clientId: string) {
    return this.getEvents(clientId);
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
