
// Client Stage Types
export type ClientStage = 'lead' | 'registered' | 'inspection_enabled' | 'warranty_enabled';

// Inspection Acceptance Types
export type InspectionAcceptanceStatus = 'pending_acceptance' | 'accepted' | 'rejected';

export interface InspectionAcceptance {
  inspectionId: string;
  clientId: string;
  status: InspectionAcceptanceStatus;
  acceptedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  registeredBy: string;
}

export type NotificationType = 
  | 'inspection_enabled'
  | 'inspection_scheduled'
  | 'inspection_reminder'
  | 'inspection_approved'
  | 'inspection_rejected'
  | 'warranty_enabled'
  | 'warranty_created'
  | 'warranty_updated'
  | 'warranty_completed'
  | 'stage_changed';

export type TimelineItemStatus = 'completed' | 'current' | 'pending' | 'blocked';

export type EventType = 
  | 'client_registered'
  | 'inspection_enabled'
  | 'inspection_scheduled'
  | 'inspection_completed'
  | 'inspection_approved'
  | 'inspection_rejected'
  | 'warranty_enabled'
  | 'warranty_requested'
  | 'warranty_completed'
  | 'manual_release';

// Interfaces
export interface ClientProfile {
  id: string;
  userId?: string;
  company_id?: string;
  name: string;
  email: string;
  phone?: string;
  currentStage: ClientStage;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  block?: string;
  floor?: string;
  createdAt: Date;
  stageHistory: StageChange[];
}

export interface StageChange {
  id: string;
  fromStage: ClientStage | null;
  toStage: ClientStage;
  changedAt: Date;
  reason: string;
  changedBy: string;
  isAutomatic: boolean;
}

export interface StagePermissions {
  canViewDashboard: boolean;
  canViewDocuments: boolean;
  canViewProperty: boolean;
  canScheduleInspection: boolean;
  canStartInspection: boolean;
  canRequestWarranty: boolean;
  canViewWarrantyHistory: boolean;
}

export interface ClientEvent {
  id: string;
  company_id?: string;
  clientId: string;
  eventType: EventType;
  title: string;
  description: string;
  createdAt: Date;
  metadata?: {
    relatedEntityId?: string;
    relatedEntityType?: 'inspection' | 'warranty' | 'stage';
    performedBy?: string;
    isAutomatic?: boolean;
  };
}

export interface ClientNotification {
  id: string;
  company_id?: string;
  clientId: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  urgent: boolean;
  metadata?: {
    relatedEntityId?: string;
    relatedEntityType?: 'inspection' | 'warranty' | 'stage';
    actionUrl?: string;
  };
}

export interface NotificationSettings {
  email: {
    inspections: boolean;
    warranty: boolean;
    updates: boolean;
    reminders: boolean;
  };
  sms: {
    inspections: boolean;
    warranty: boolean;
    updates: boolean;
    reminders: boolean;
  };
}

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: Date;
  status: TimelineItemStatus;
  icon?: string;
  eventType: EventType;
}

// Stage configuration
export const STAGE_CONFIG: Record<ClientStage, { 
  label: string; 
  order: number;
  description: string;
}> = {
  lead: {
    label: 'Potencial Proprietário',
    order: 0,
    description: 'Lead qualificado com interesse estratégico em portfólio. Aguardando integração.'
  },

  registered: {
    label: 'Proprietário Integrado',
    order: 1,
    description: 'Cadastro homologado no ecossistema digital. Aguardando janela de vistoria técnica.'
  },
  inspection_enabled: {
    label: 'Vistoria Técnica Habilitada',
    order: 2,
    description: 'Protocolo de entrega técnica disponível para agendamento estratégico.'
  },
  warranty_enabled: {
    label: 'Ecossistema de Garantias Ativo',
    order: 3,
    description: 'Habilitado para governança de assistência técnica e pós-venda premium.'
  }

};

// Permission mappings per stage
export const STAGE_PERMISSIONS: Record<ClientStage, StagePermissions> = {
  lead: {
    canViewDashboard: true,
    canViewDocuments: false,
    canViewProperty: false,
    canScheduleInspection: false,
    canStartInspection: false,
    canRequestWarranty: false,
    canViewWarrantyHistory: false
  },

  registered: {
    canViewDashboard: true,
    canViewDocuments: true,
    canViewProperty: true,
    canScheduleInspection: false,
    canStartInspection: false,
    canRequestWarranty: false,
    canViewWarrantyHistory: false
  },
  inspection_enabled: {
    canViewDashboard: true,
    canViewDocuments: true,
    canViewProperty: true,
    canScheduleInspection: true,
    canStartInspection: true,
    canRequestWarranty: false,
    canViewWarrantyHistory: false
  },
  warranty_enabled: {
    canViewDashboard: true,
    canViewDocuments: true,
    canViewProperty: true,
    canScheduleInspection: true,
    canStartInspection: true,
    canRequestWarranty: true,
    canViewWarrantyHistory: true
  }
};

// Notification templates
export const NOTIFICATION_TEMPLATES: Record<NotificationType, { title: string; message: string; urgent: boolean }> = {
  inspection_enabled: {
    title: 'Janela de Vistoria Habilitada!',
    message: 'Seu protocolo de entrega técnica já está disponível para agendamento estratégico.',
    urgent: true
  },
  inspection_scheduled: {
    title: 'Protocolo de Vistoria Confirmado',
    message: 'O cronograma para sua entrega técnica foi definido com sucesso.',
    urgent: false
  },
  inspection_reminder: {
    title: 'Alerta de Compromisso Técnico',
    message: 'Lembrete: sua vistoria técnica está agendada para o próximo ciclo de 24h.',
    urgent: true
  },
  inspection_approved: {
    title: 'Vistoria Homologada!',
    message: 'Sua unidade foi aprovada nos critérios de excelência. Módulo de garantias ativo!',
    urgent: true
  },
  inspection_rejected: {
    title: 'Pendências Técnicas Identificadas',
    message: 'A vistoria apontou itens que requerem readequação para conformidade total.',
    urgent: true
  },
  warranty_enabled: {
    title: 'Governança de Garantias Ativada',
    message: 'Seu imóvel agora conta com o ecossistema completo de suporte e assistência técnica.',
    urgent: false
  },
  warranty_created: {
    title: 'Solicitação Protocolada',
    message: 'Seu pedido de assistência técnica foi registrado e integrado ao nosso fluxo de SLA.',
    urgent: false
  },
  warranty_updated: {
    title: 'Evolução no Protocolo de Assistência',
    message: 'Houve uma atualização estratégica no status da sua solicitação de garantia.',
    urgent: false
  },
  warranty_completed: {
    title: 'Assistência Finalizada & Homologada',
    message: 'O ciclo de reparo técnico foi concluído e validado conforme nossos padrões.',
    urgent: false
  },
  stage_changed: {
    title: 'Evolução na Jornada do Proprietário',
    message: 'O status do seu posicionamento na nossa jornada digital foi atualizado.',
    urgent: false
  }

};
