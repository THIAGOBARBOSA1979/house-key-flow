import { BaseService } from "./BaseService";

export type EventType = 'stage_changed' | 'document_added' | 'inspection_scheduled' | 'inspection_completed' | 'inspection_accepted' | 'inspection_rejected' | 'warranty_created' | 'warranty_updated' | 'warranty_completed' | 'payment_received' | 'announcement';

export interface ClientEvent {
  id: string;
  clientId: string;
  type: string;
  eventType: EventType;
  title: string;
  description: string;
  date: Date;
  createdAt: Date;
  metadata?: any;
}

export interface StagePermissions {
  canViewDashboard: boolean;
  canViewDocuments: boolean;
  canViewProperty: boolean;
  canScheduleInspection: boolean;
  canConfirmPresence: boolean;
  canRequestWarranty: boolean;
  canViewFinancial: boolean;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  propertyName: string;
  propertyId: string;
  unitNumber: string;
  currentStage: any;
  createdAt: Date;
  stageHistory: any[];
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
  
  advanceStage(id: string, stage: any, changedBy?: string, performedByRole?: string, notes?: string) {
    const result = this.update(id, { currentStage: stage });
    return result ? { ...result, success: true } : { success: false, error: "Profile not found" };
  }

  addEvent(clientId: string, event: any) {
    const newEvent: ClientEvent = { 
      ...event, 
      id: crypto.randomUUID(), 
      clientId, 
      date: new Date(),
      createdAt: new Date(),
      eventType: event.eventType || 'announcement'
    };
    this.events.unshift(newEvent);
    return newEvent;
  }

  getEvents(clientId: string): ClientEvent[] {
    return this.events.filter(e => e.clientId === clientId);
  }

  getPermissions(clientId: string): StagePermissions { 
    return { 
      canViewDashboard: true,
      canViewDocuments: true,
      canViewProperty: true,
      canScheduleInspection: true,
      canConfirmPresence: true,
      canRequestWarranty: true,
      canViewFinancial: true
    }; 
  }
  
  getTimeline(clientId: string) { return []; }
  canScheduleInspection(clientId: string) { return true; }
  canRequestWarranty(clientId: string) { return true; }
  isStageReached(clientId: string, stage: string) { return true; }
}

export const clientStageService = new ClientStageService();
