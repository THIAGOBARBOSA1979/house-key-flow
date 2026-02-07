
// ============================================
// WARRANTY FLOW TYPES
// Complete module for warranty tracking, SLA, and automation
// ============================================

// Warranty Stages - All possible states in the flow
export type WarrantyStage = 
  | "opened"               // Cliente criou a solicitação
  | "in_analysis"          // Equipe está analisando
  | "inspection_scheduled" // Vistoria agendada
  | "inspection_completed" // Vistoria realizada
  | "approved"             // Garantia aprovada
  | "rejected"             // Garantia negada
  | "in_execution"         // Reparo em andamento
  | "completed";           // Garantia finalizada

// SLA Status indicators
export type SLAStatus = "on_track" | "warning" | "expired";

// Stage configuration with visual properties
export interface WarrantyStageConfig {
  key: WarrantyStage;
  label: string;
  description: string;
  order: number;
  isFinal: boolean;
  color: string; // Tailwind color class
  icon: string;  // Lucide icon name
}

// All stages configuration
export const WARRANTY_STAGES: Record<WarrantyStage, WarrantyStageConfig> = {
  opened: {
    key: "opened",
    label: "Solicitação Aberta",
    description: "Sua solicitação foi registrada e está na fila de análise",
    order: 1,
    isFinal: false,
    color: "blue",
    icon: "FileText"
  },
  in_analysis: {
    key: "in_analysis",
    label: "Em Análise",
    description: "A equipe técnica está analisando sua solicitação",
    order: 2,
    isFinal: false,
    color: "amber",
    icon: "Search"
  },
  inspection_scheduled: {
    key: "inspection_scheduled",
    label: "Vistoria Agendada",
    description: "Uma vistoria técnica foi agendada para seu imóvel",
    order: 3,
    isFinal: false,
    color: "purple",
    icon: "Calendar"
  },
  inspection_completed: {
    key: "inspection_completed",
    label: "Vistoria Realizada",
    description: "A vistoria foi concluída e está aguardando decisão",
    order: 4,
    isFinal: false,
    color: "indigo",
    icon: "ClipboardCheck"
  },
  approved: {
    key: "approved",
    label: "Aprovada",
    description: "Sua solicitação foi aprovada e será executada",
    order: 5,
    isFinal: false,
    color: "green",
    icon: "CheckCircle"
  },
  rejected: {
    key: "rejected",
    label: "Reprovada",
    description: "Sua solicitação foi analisada e não foi aprovada",
    order: 5,
    isFinal: true,
    color: "red",
    icon: "XCircle"
  },
  in_execution: {
    key: "in_execution",
    label: "Em Execução",
    description: "O reparo está em andamento",
    order: 6,
    isFinal: false,
    color: "orange",
    icon: "Wrench"
  },
  completed: {
    key: "completed",
    label: "Finalizada",
    description: "A garantia foi executada com sucesso",
    order: 7,
    isFinal: true,
    color: "emerald",
    icon: "CheckCircle2"
  }
};

// Stage order for Kanban and Timeline
export const STAGE_ORDER: WarrantyStage[] = [
  "opened",
  "in_analysis",
  "inspection_scheduled",
  "inspection_completed",
  "approved",
  "in_execution",
  "completed"
];

// Final stages (cannot be moved from)
export const FINAL_STAGES: WarrantyStage[] = ["rejected", "completed"];

// SLA Configuration per warranty type
export interface SLAConfig {
  warrantyType: string;
  analysisHours: number;      // Hours for analysis stage
  inspectionHours: number;    // Hours to schedule inspection
  decisionHours: number;      // Hours for approval decision
  executionHours: number;     // Hours for repair execution
  totalHours: number;         // Total SLA for the entire flow
}

// Default SLA configurations by warranty type
export const DEFAULT_SLA_CONFIGS: SLAConfig[] = [
  {
    warrantyType: "Estrutural",
    analysisHours: 72,        // 3 days
    inspectionHours: 120,     // 5 days
    decisionHours: 48,        // 2 days
    executionHours: 720,      // 30 days
    totalHours: 960
  },
  {
    warrantyType: "Instalações Hidráulicas",
    analysisHours: 48,        // 2 days
    inspectionHours: 72,      // 3 days
    decisionHours: 24,        // 1 day
    executionHours: 168,      // 7 days
    totalHours: 312
  },
  {
    warrantyType: "Elétrica",
    analysisHours: 48,
    inspectionHours: 72,
    decisionHours: 24,
    executionHours: 168,
    totalHours: 312
  },
  {
    warrantyType: "Impermeabilização",
    analysisHours: 72,
    inspectionHours: 120,
    decisionHours: 48,
    executionHours: 360,      // 15 days
    totalHours: 600
  },
  {
    warrantyType: "Acabamentos",
    analysisHours: 48,
    inspectionHours: 72,
    decisionHours: 24,
    executionHours: 120,      // 5 days
    totalHours: 264
  },
  {
    warrantyType: "Esquadrias",
    analysisHours: 48,
    inspectionHours: 72,
    decisionHours: 24,
    executionHours: 240,      // 10 days
    totalHours: 384
  },
  {
    warrantyType: "Revestimentos Cerâmicos",
    analysisHours: 48,
    inspectionHours: 72,
    decisionHours: 24,
    executionHours: 168,
    totalHours: 312
  },
  {
    warrantyType: "Equipamentos",
    analysisHours: 48,
    inspectionHours: 72,
    decisionHours: 24,
    executionHours: 168,
    totalHours: 312
  }
];

// History entry for status changes
export interface WarrantyStatusHistory {
  id: string;
  requestId: string;
  fromStatus: WarrantyStage | null;
  toStatus: WarrantyStage;
  changedAt: Date;
  changedBy: string;
  isAutomatic: boolean;
  notes?: string;
}

// SLA deadline info
export interface SLADeadlineInfo {
  stage: WarrantyStage;
  startedAt: Date;
  deadline: Date;
  hoursRemaining: number;
  percentageRemaining: number;
  status: SLAStatus;
}

// Extended warranty request with flow data
export interface WarrantyRequestFlow {
  id: string;
  clientId: string;
  clientName: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  
  // Request details
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  
  // Flow state
  currentStage: WarrantyStage;
  stageStartedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // SLA tracking
  slaConfig: SLAConfig;
  slaDeadline: Date;
  slaStatus: SLAStatus;
  
  // Assignment
  assignedTo: string | null;
  assignedToName: string | null;
  
  // Stage-specific data
  inspectionDate?: Date;
  inspectionNotes?: string;
  inspectionTechnicianId?: string;
  inspectionTechnicianName?: string;
  
  approvalDate?: Date;
  approvalNotes?: string;
  rejectionReason?: string;
  
  executionStartDate?: Date;
  executionNotes?: string;
  
  completionDate?: Date;
  completionNotes?: string;
  
  // History
  history: WarrantyStatusHistory[];
  
  // Problems breakdown (from existing system)
  problems?: WarrantyProblemDetail[];
}

// Problem detail for breakdown
export interface WarrantyProblemDetail {
  id: string;
  category: string;
  location: string;
  description: string;
  severity: "minor" | "moderate" | "severe";
  photos: string[];
}

// Timeline step for client view
export interface WarrantyTimelineStep {
  stage: WarrantyStage;
  config: WarrantyStageConfig;
  status: "completed" | "current" | "pending" | "blocked";
  startedAt?: Date;
  completedAt?: Date;
  sla?: SLADeadlineInfo;
  notes?: string;
}

// Kanban card data
export interface KanbanCardData {
  id: string;
  request: WarrantyRequestFlow;
  slaInfo: SLADeadlineInfo;
  dragDisabled: boolean;
}

// Metrics data structures
export interface WarrantyMetrics {
  // Volume metrics
  totalOpen: number;
  openedToday: number;
  openedThisWeek: number;
  openedThisMonth: number;
  completedThisMonth: number;
  
  // SLA metrics
  onTrackCount: number;
  warningCount: number;
  expiredCount: number;
  slaComplianceRate: number;
  
  // Time metrics
  averageResolutionTime: number; // in hours
  averageTimeByStage: Record<WarrantyStage, number>;
  averageTimeByType: Record<string, number>;
  
  // Bottleneck analysis
  bottleneckStage: WarrantyStage | null;
  stageDistribution: Record<WarrantyStage, number>;
  
  // By type breakdown
  byType: Record<string, {
    total: number;
    avgTime: number;
    slaCompliance: number;
  }>;
  
  // By priority
  byPriority: Record<string, number>;
}

// Filter options for Kanban and Dashboard
export interface WarrantyFilters {
  search?: string;
  propertyId?: string;
  category?: string;
  priority?: string;
  assignedTo?: string;
  slaStatus?: SLAStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

// Notification types for warranty events
export type WarrantyNotificationType = 
  | "warranty_opened"
  | "warranty_in_analysis"
  | "warranty_inspection_scheduled"
  | "warranty_inspection_done"
  | "warranty_approved"
  | "warranty_rejected"
  | "warranty_in_execution"
  | "warranty_completed"
  | "sla_warning"
  | "sla_expired";

// Notification template
export interface WarrantyNotificationTemplate {
  type: WarrantyNotificationType;
  title: string;
  message: string;
  urgent: boolean;
  forClient: boolean;
  forAdmin: boolean;
}

// All notification templates
export const WARRANTY_NOTIFICATION_TEMPLATES: Record<WarrantyNotificationType, WarrantyNotificationTemplate> = {
  warranty_opened: {
    type: "warranty_opened",
    title: "Solicitação Registrada",
    message: "Sua solicitação de garantia foi registrada com sucesso.",
    urgent: false,
    forClient: true,
    forAdmin: false
  },
  warranty_in_analysis: {
    type: "warranty_in_analysis",
    title: "Em Análise",
    message: "Sua solicitação está sendo analisada pela equipe técnica.",
    urgent: false,
    forClient: true,
    forAdmin: false
  },
  warranty_inspection_scheduled: {
    type: "warranty_inspection_scheduled",
    title: "Vistoria Agendada",
    message: "Uma vistoria técnica foi agendada para seu imóvel.",
    urgent: true,
    forClient: true,
    forAdmin: false
  },
  warranty_inspection_done: {
    type: "warranty_inspection_done",
    title: "Vistoria Realizada",
    message: "A vistoria foi concluída e está aguardando decisão.",
    urgent: false,
    forClient: true,
    forAdmin: false
  },
  warranty_approved: {
    type: "warranty_approved",
    title: "Garantia Aprovada",
    message: "Sua solicitação foi aprovada e será executada.",
    urgent: true,
    forClient: true,
    forAdmin: false
  },
  warranty_rejected: {
    type: "warranty_rejected",
    title: "Garantia Não Aprovada",
    message: "Sua solicitação foi analisada e não foi aprovada.",
    urgent: true,
    forClient: true,
    forAdmin: false
  },
  warranty_in_execution: {
    type: "warranty_in_execution",
    title: "Reparo Iniciado",
    message: "O reparo da sua garantia foi iniciado.",
    urgent: false,
    forClient: true,
    forAdmin: false
  },
  warranty_completed: {
    type: "warranty_completed",
    title: "Garantia Concluída",
    message: "O atendimento da sua garantia foi finalizado com sucesso.",
    urgent: false,
    forClient: true,
    forAdmin: false
  },
  sla_warning: {
    type: "sla_warning",
    title: "Prazo Próximo do Limite",
    message: "Uma solicitação está com menos de 20% do prazo SLA restante.",
    urgent: true,
    forClient: false,
    forAdmin: true
  },
  sla_expired: {
    type: "sla_expired",
    title: "SLA Estourado",
    message: "O prazo SLA de uma solicitação foi excedido.",
    urgent: true,
    forClient: true,
    forAdmin: true
  }
};

// Helper function to get stage label
export function getStageLabel(stage: WarrantyStage): string {
  return WARRANTY_STAGES[stage]?.label || stage;
}

// Helper function to check if stage is final
export function isFinalStage(stage: WarrantyStage): boolean {
  return FINAL_STAGES.includes(stage);
}

// Helper function to get next valid stages
export function getNextValidStages(currentStage: WarrantyStage): WarrantyStage[] {
  const currentOrder = WARRANTY_STAGES[currentStage].order;
  
  if (isFinalStage(currentStage)) {
    return [];
  }
  
  // Special case: after inspection_completed, can go to approved or rejected
  if (currentStage === "inspection_completed") {
    return ["approved", "rejected"];
  }
  
  // Normal flow: go to next stage
  return STAGE_ORDER.filter(stage => 
    WARRANTY_STAGES[stage].order === currentOrder + 1
  );
}

// Helper function to check if transition is valid
export function isValidTransition(from: WarrantyStage, to: WarrantyStage): boolean {
  const validNext = getNextValidStages(from);
  return validNext.includes(to);
}

// Helper function to calculate SLA status
export function calculateSLAStatus(
  deadline: Date, 
  now: Date = new Date()
): { status: SLAStatus; hoursRemaining: number; percentageRemaining: number } {
  const diffMs = deadline.getTime() - now.getTime();
  const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60));
  
  // Assuming 48h as baseline for percentage calculation
  const totalHours = 48;
  const percentageRemaining = Math.max(0, Math.min(100, (hoursRemaining / totalHours) * 100));
  
  let status: SLAStatus;
  if (hoursRemaining <= 0) {
    status = "expired";
  } else if (percentageRemaining <= 20) {
    status = "warning";
  } else {
    status = "on_track";
  }
  
  return { status, hoursRemaining, percentageRemaining };
}
