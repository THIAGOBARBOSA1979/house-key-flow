import { BaseService } from "./BaseService";

export interface ClientEvent {
  id: string;
  clientId: string;
  type: string;
  title: string;
  description: string;
  date: Date;
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
    return this.update(id, { currentStage: stage });
  }

  addEvent(clientId: string, event: Omit<ClientEvent, "id" | "date">) {
    this.events.unshift({ ...event, id: crypto.randomUUID(), clientId, date: new Date() });
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
