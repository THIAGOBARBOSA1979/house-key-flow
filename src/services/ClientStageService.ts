
import { 
  ClientStage, 
  ClientProfile, 
  StagePermissions,
  TimelineItem,
  ClientEvent,
  StageChange,
  STAGE_PERMISSIONS,
  STAGE_CONFIG,
  EventType
} from '@/types/clientFlow';

// Mock data for demo client
const mockClientProfile: ClientProfile = {
  id: 'client-1',
  name: 'Maria Oliveira',
  email: 'maria.oliveira@email.com',
  phone: '(11) 97777-6666',
  currentStage: 'inspection_enabled',
  propertyId: 'prop-1',
  propertyName: 'Edifício Aurora',
  unitNumber: '204',
  createdAt: new Date(2024, 10, 20),
  stageHistory: [
    {
      id: 'sh-1',
      fromStage: null,
      toStage: 'registered',
      changedAt: new Date(2024, 10, 20),
      reason: 'Cadastro inicial do cliente',
      changedBy: 'Sistema',
      isAutomatic: true
    },
    {
      id: 'sh-2',
      fromStage: 'registered',
      toStage: 'inspection_enabled',
      changedAt: new Date(2025, 2, 15),
      reason: 'Liberação de vistoria pelo administrador',
      changedBy: 'Admin',
      isAutomatic: false
    }
  ]
};

// Mock events
const mockEvents: ClientEvent[] = [
  {
    id: 'evt-1',
    clientId: 'client-1',
    eventType: 'client_registered',
    title: 'Cadastro Realizado',
    description: 'Cliente cadastrado no sistema',
    createdAt: new Date(2024, 10, 20),
    metadata: { isAutomatic: true }
  },
  {
    id: 'evt-2',
    clientId: 'client-1',
    eventType: 'inspection_enabled',
    title: 'Vistoria Liberada',
    description: 'Liberação de vistoria aprovada pelo administrador',
    createdAt: new Date(2025, 2, 15),
    metadata: { performedBy: 'Admin', isAutomatic: false }
  },
  {
    id: 'evt-3',
    clientId: 'client-1',
    eventType: 'inspection_scheduled',
    title: 'Vistoria Agendada',
    description: 'Vistoria de pré-entrega agendada para 15/05/2025',
    createdAt: new Date(2025, 4, 10),
    metadata: { relatedEntityId: 'insp-1', relatedEntityType: 'inspection' }
  }
];

class ClientStageService {
  private clientProfiles: Map<string, ClientProfile> = new Map();
  private clientEvents: Map<string, ClientEvent[]> = new Map();

  constructor() {
    // Initialize with mock data
    this.clientProfiles.set('client-1', mockClientProfile);
    this.clientEvents.set('client-1', mockEvents);
  }

  // Get client profile
  getClientProfile(clientId: string): ClientProfile | null {
    return this.clientProfiles.get(clientId) || null;
  }

  // Get current stage
  getCurrentStage(clientId: string): ClientStage | null {
    const profile = this.clientProfiles.get(clientId);
    return profile?.currentStage || null;
  }

  // Get permissions based on stage
  getPermissions(clientId: string): StagePermissions {
    const stage = this.getCurrentStage(clientId);
    if (!stage) {
      return STAGE_PERMISSIONS.registered;
    }
    return STAGE_PERMISSIONS[stage];
  }

  // Check if client can schedule inspection
  canScheduleInspection(clientId: string): boolean {
    const permissions = this.getPermissions(clientId);
    return permissions.canScheduleInspection;
  }

  // Check if client can request warranty
  canRequestWarranty(clientId: string): boolean {
    const permissions = this.getPermissions(clientId);
    return permissions.canRequestWarranty;
  }

  // Advance client stage
  advanceStage(
    clientId: string, 
    newStage: ClientStage, 
    reason: string,
    changedBy: string = 'Sistema',
    isAutomatic: boolean = false
  ): { success: boolean; error?: string } {
    const profile = this.clientProfiles.get(clientId);
    
    if (!profile) {
      return { success: false, error: 'Cliente não encontrado' };
    }

    const currentOrder = STAGE_CONFIG[profile.currentStage].order;
    const newOrder = STAGE_CONFIG[newStage].order;

    // Can only advance or stay at same stage (for updates)
    if (newOrder < currentOrder) {
      return { success: false, error: 'Não é possível retroceder etapas' };
    }

    // Record stage change
    const stageChange: StageChange = {
      id: `sh-${Date.now()}`,
      fromStage: profile.currentStage,
      toStage: newStage,
      changedAt: new Date(),
      reason,
      changedBy,
      isAutomatic
    };

    profile.stageHistory.push(stageChange);
    profile.currentStage = newStage;
    
    this.clientProfiles.set(clientId, profile);

    // Record event
    const event: ClientEvent = {
      id: `evt-${Date.now()}`,
      clientId,
      eventType: this.mapStageToEventType(newStage),
      title: `Etapa atualizada: ${STAGE_CONFIG[newStage].label}`,
      description: reason,
      createdAt: new Date(),
      metadata: {
        performedBy: changedBy,
        isAutomatic
      }
    };

    const events = this.clientEvents.get(clientId) || [];
    events.push(event);
    this.clientEvents.set(clientId, events);

    return { success: true };
  }

  // Get client timeline
  getTimeline(clientId: string): TimelineItem[] {
    const profile = this.clientProfiles.get(clientId);
    const events = this.clientEvents.get(clientId) || [];
    
    if (!profile) {
      return [];
    }

    const currentStageOrder = STAGE_CONFIG[profile.currentStage].order;
    
    const timeline: TimelineItem[] = [
      {
        id: 'tl-1',
        title: 'Cadastro Realizado',
        description: 'Cliente cadastrado no sistema',
        date: profile.createdAt,
        status: 'completed',
        eventType: 'client_registered'
      },
      {
        id: 'tl-2',
        title: 'Vistoria Liberada',
        description: STAGE_CONFIG.inspection_enabled.description,
        date: profile.stageHistory.find(s => s.toStage === 'inspection_enabled')?.changedAt,
        status: currentStageOrder >= 2 ? 'completed' : 'pending',
        eventType: 'inspection_enabled'
      }
    ];

    // Add inspection events
    const inspectionScheduledEvent = events.find(e => e.eventType === 'inspection_scheduled');
    if (inspectionScheduledEvent) {
      timeline.push({
        id: 'tl-3',
        title: 'Vistoria Agendada',
        description: inspectionScheduledEvent.description,
        date: inspectionScheduledEvent.createdAt,
        status: 'current',
        eventType: 'inspection_scheduled'
      });
    } else if (currentStageOrder >= 2) {
      timeline.push({
        id: 'tl-3',
        title: 'Vistoria Agendada',
        description: 'Agende sua vistoria de pré-entrega',
        status: 'pending',
        eventType: 'inspection_scheduled'
      });
    }

    // Add remaining timeline items
    const inspectionCompletedEvent = events.find(e => e.eventType === 'inspection_completed');
    timeline.push({
      id: 'tl-4',
      title: 'Vistoria Realizada',
      description: inspectionCompletedEvent?.description || 'Aguardando realização da vistoria',
      date: inspectionCompletedEvent?.createdAt,
      status: inspectionCompletedEvent ? 'completed' : 'pending',
      eventType: 'inspection_completed'
    });

    const inspectionApprovedEvent = events.find(e => e.eventType === 'inspection_approved');
    const inspectionRejectedEvent = events.find(e => e.eventType === 'inspection_rejected');
    
    if (inspectionApprovedEvent) {
      timeline.push({
        id: 'tl-5',
        title: 'Vistoria Aprovada',
        description: 'Vistoria concluída com sucesso',
        date: inspectionApprovedEvent.createdAt,
        status: 'completed',
        eventType: 'inspection_approved'
      });
    } else if (inspectionRejectedEvent) {
      timeline.push({
        id: 'tl-5',
        title: 'Vistoria com Pendências',
        description: 'Itens identificados para correção',
        date: inspectionRejectedEvent.createdAt,
        status: 'blocked',
        eventType: 'inspection_rejected'
      });
    } else {
      timeline.push({
        id: 'tl-5',
        title: 'Aprovação da Vistoria',
        description: 'Aguardando resultado da vistoria',
        status: 'pending',
        eventType: 'inspection_approved'
      });
    }

    // Warranty stage
    timeline.push({
      id: 'tl-6',
      title: 'Garantia Liberada',
      description: STAGE_CONFIG.warranty_enabled.description,
      date: profile.stageHistory.find(s => s.toStage === 'warranty_enabled')?.changedAt,
      status: currentStageOrder >= 3 ? 'completed' : 'pending',
      eventType: 'warranty_enabled'
    });

    return timeline;
  }

  // Get client events
  getEvents(clientId: string): ClientEvent[] {
    return this.clientEvents.get(clientId) || [];
  }

  // Add custom event
  addEvent(event: Omit<ClientEvent, 'id' | 'createdAt'>): ClientEvent {
    const newEvent: ClientEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      createdAt: new Date()
    };

    const events = this.clientEvents.get(event.clientId) || [];
    events.push(newEvent);
    this.clientEvents.set(event.clientId, events);

    return newEvent;
  }

  // Helper to map stage to event type
  private mapStageToEventType(stage: ClientStage): EventType {
    const mapping: Record<ClientStage, EventType> = {
      registered: 'client_registered',
      inspection_enabled: 'inspection_enabled',
      warranty_enabled: 'warranty_enabled'
    };
    return mapping[stage];
  }

  // Get stage info
  getStageInfo(stage: ClientStage) {
    return STAGE_CONFIG[stage];
  }

  // Check if stage is reached
  isStageReached(clientId: string, targetStage: ClientStage): boolean {
    const currentStage = this.getCurrentStage(clientId);
    if (!currentStage) return false;
    
    return STAGE_CONFIG[currentStage].order >= STAGE_CONFIG[targetStage].order;
  }
}

// Export singleton instance
export const clientStageService = new ClientStageService();
