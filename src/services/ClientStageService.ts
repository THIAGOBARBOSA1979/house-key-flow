import { BaseService } from "./BaseService";

export interface ClientEvent {
  id: string;
  clientId: string;
  type: string;
  eventType?: string;
  title: string;
  description: string;
  date: Date;
  createdAt?: Date;
  metadata?: any;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  propertyName: string;
  propertyId?: string;
  unitNumber: string;
  currentStage: any;
  createdAt?: Date;
  stageHistory?: any[];
  success?: boolean;
  error?: string;
}

const INITIAL_PROFILES: ClientProfile[] = [
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
];

class ClientStageService extends BaseService<ClientProfile> {
  private events: ClientEvent[] = [];

  constructor() {
    super("a2_client_profiles", INITIAL_PROFILES);
  }

  getAllProfiles() { return [...this.items]; }
  getClientProfile(id: string) { return this.getById(id); }
  
  advanceStage(id: string, stage: any) {
    const result = this.update(id, { currentStage: stage });
    return result ? { ...result, success: true } : { success: false, error: "Profile not found" };
  }

  addEvent(clientId: string, event: any) {
    this.events.unshift({ 
      ...event, 
      id: crypto.randomUUID(), 
      clientId, 
      date: new Date(),
      createdAt: new Date()
    });
  }

  getEvents(clientId: string) {
    return this.events.filter(e => e.clientId === clientId);
  }

  getPermissions(clientId: string) { return { canSchedule: true }; }
  getTimeline(clientId: string) { return []; }
  canScheduleInspection(clientId: string) { return true; }
  canRequestWarranty(clientId: string) { return true; }
  isStageReached(clientId: string, stage: string) { return true; }
}

export const clientStageService = new ClientStageService();
