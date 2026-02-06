
// Client Stage Types
export type ClientStage = 'registered' | 'inspection_enabled' | 'warranty_enabled';

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
  name: string;
  email: string;
  phone?: string;
  currentStage: ClientStage;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
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
  registered: {
    label: 'Cadastrado',
    order: 1,
    description: 'Cliente cadastrado no sistema. Aguardando liberação de vistoria.'
  },
  inspection_enabled: {
    label: 'Vistoria Liberada',
    order: 2,
    description: 'Cliente pode agendar e realizar vistorias.'
  },
  warranty_enabled: {
    label: 'Garantia Liberada',
    order: 3,
    description: 'Cliente pode solicitar garantias respeitando as regras de elegibilidade.'
  }
};

// Permission mappings per stage
export const STAGE_PERMISSIONS: Record<ClientStage, StagePermissions> = {
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
    title: 'Vistoria Liberada!',
    message: 'Você já pode agendar sua vistoria de pré-entrega.',
    urgent: true
  },
  inspection_scheduled: {
    title: 'Vistoria Agendada',
    message: 'Sua vistoria foi agendada com sucesso.',
    urgent: false
  },
  inspection_reminder: {
    title: 'Lembrete de Vistoria',
    message: 'Sua vistoria está agendada para amanhã.',
    urgent: true
  },
  inspection_approved: {
    title: 'Vistoria Aprovada!',
    message: 'Sua vistoria foi aprovada. Garantia liberada!',
    urgent: true
  },
  inspection_rejected: {
    title: 'Vistoria com Pendências',
    message: 'Sua vistoria identificou itens que precisam de ajustes.',
    urgent: true
  },
  warranty_enabled: {
    title: 'Garantia Liberada',
    message: 'Você já pode solicitar garantias para seu imóvel.',
    urgent: false
  },
  warranty_created: {
    title: 'Solicitação Registrada',
    message: 'Sua solicitação de garantia foi registrada com sucesso.',
    urgent: false
  },
  warranty_updated: {
    title: 'Atualização na Solicitação',
    message: 'Há uma atualização na sua solicitação de garantia.',
    urgent: false
  },
  warranty_completed: {
    title: 'Garantia Concluída',
    message: 'Sua solicitação de garantia foi concluída.',
    urgent: false
  },
  stage_changed: {
    title: 'Atualização de Status',
    message: 'O status do seu cadastro foi atualizado.',
    urgent: false
  }
};
