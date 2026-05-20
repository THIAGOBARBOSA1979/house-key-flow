import { SupabaseBaseService } from "../SupabaseBaseService";
import { Supabase } from "@/integrations/supabase";
import { Database } from "@/integrations/supabase/types";
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
      supabaseTable: "audit_logs" as keyof Database['public']['Tables'], // Dummy table
      auditEntityType: "user",
      shouldSyncWithSupabase: false
    }, [
      { 
        id: "profile-1", 
        userId: "client-1",
        company_id: "comp-1",
        name: "João Silva", 
        email: "joao@email.com", 
        propertyName: "Edifício Aurora", 
        propertyId: "1",
        unitNumber: "204", 
        currentStage: "inspection_enabled",
        createdAt: new Date(),
        stageHistory: []
      },
      { 
        id: "profile-2", 
        userId: "client-1",
        company_id: "comp-1",
        name: "João Silva", 
        email: "joao@email.com", 
        propertyName: "Residencial Bosque Verde", 
        propertyId: "2",
        unitNumber: "102", 
        currentStage: "warranty_enabled",
        createdAt: new Date(),
        stageHistory: []
      }
    ]);
    this.loadEvents();
  }

  private loadEvents() {
    const storedEvents = localStorage.getItem("a2_client_events");
    if (storedEvents) {
      try {
        const parsed = JSON.parse(storedEvents);
        this.events = parsed.map((e: any) => ({
          ...e,
          createdAt: new Date(e.createdAt)
        }));
      } catch (e) {
        console.error("Error loading events", e);
      }
    }
  }

  private persistEvents() {
    localStorage.setItem("a2_client_events", JSON.stringify(this.events));
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
    this.persistEvents();
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
    return profile?.currentStage === stage;
  }
}

export const clientStageService = new ClientStageService();
