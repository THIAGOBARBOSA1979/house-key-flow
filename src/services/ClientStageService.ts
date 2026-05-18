import { BaseService } from "./BaseService";
import { 
  ClientProfile, 
  ClientStage, 
  StageChange, 
  ClientEvent, 
  EventType, 
  StagePermissions,
  STAGE_PERMISSIONS
} from "@/types/clientFlow";

class ClientStageService extends BaseService<ClientProfile> {
  private events: ClientEvent[] = [];

  constructor() {
    super("a2_client_profiles", [
      { 
        id: "client-1", 
        name: "João Silva", 
        email: "joao@email.com", 
        propertyName: "Edifício Aurora", 
        propertyId: "1",
        unitNumber: "204", 
        currentStage: "inspection_enabled",
        createdAt: new Date(),
        stageHistory: []
      }
    ]);
  }

  protected loadFromStorage() {
    super.loadFromStorage();
    this.items = this.items.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt),
      stageHistory: Array.isArray(item.stageHistory) 
        ? item.stageHistory.map(h => ({ ...h, changedAt: new Date(h.changedAt) }))
        : []
    }));
    
    const storedEvents = localStorage.getItem("a2_client_events");
    if (storedEvents) {
      try {
        this.events = JSON.parse(storedEvents).map((e: any) => ({
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

  getAllProfiles(): ClientProfile[] {
    return [...this.items];
  }

  getClientProfile(id: string): ClientProfile | undefined {
    return this.getById(id);
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
        eventType: 'stage_changed' as any, // This is not in EventType but used in history/UI sometimes
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

  getEvents(clientId: string): ClientEvent[] {
    return this.events.filter(e => e.clientId === clientId);
  }

  getPermissions(clientId: string): StagePermissions {
    const profile = this.getById(clientId);
    const stage = profile?.currentStage || 'registered';
    return STAGE_PERMISSIONS[stage];
  }

  getTimeline(clientId: string) {
    return []; 
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
    return profile.currentStage === stage;
  }
}

export const clientStageService = new ClientStageService();
