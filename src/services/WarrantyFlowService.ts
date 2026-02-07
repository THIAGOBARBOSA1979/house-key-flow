
import {
  WarrantyStage,
  WarrantyRequestFlow,
  WarrantyStatusHistory,
  SLADeadlineInfo,
  KanbanCardData,
  WarrantyMetrics,
  WarrantyFilters,
  WARRANTY_STAGES,
  STAGE_ORDER,
  FINAL_STAGES,
  isValidTransition,
  isFinalStage,
  DEFAULT_SLA_CONFIGS
} from '@/types/warrantyFlow';
import { warrantySLAService } from './WarrantySLAService';

// Mock warranty requests data
const mockWarrantyRequests: WarrantyRequestFlow[] = [
  {
    id: "wr-001",
    clientId: "client-1",
    clientName: "Maria Oliveira",
    propertyId: "prop-1",
    propertyName: "Edifício Aurora",
    unitNumber: "204",
    title: "Infiltração no banheiro",
    description: "Identificada infiltração na parede do box do banheiro social.",
    category: "Instalações Hidráulicas",
    priority: "high",
    currentStage: "in_analysis",
    stageStartedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    slaConfig: DEFAULT_SLA_CONFIGS.find(c => c.warrantyType === "Instalações Hidráulicas")!,
    slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    slaStatus: "on_track",
    assignedTo: "tech-1",
    assignedToName: "Carlos Técnico",
    history: [
      {
        id: "hist-001",
        requestId: "wr-001",
        fromStatus: null,
        toStatus: "opened",
        changedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        changedBy: "client-1",
        isAutomatic: false
      },
      {
        id: "hist-002",
        requestId: "wr-001",
        fromStatus: "opened",
        toStatus: "in_analysis",
        changedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        changedBy: "admin-1",
        isAutomatic: false,
        notes: "Iniciada análise técnica"
      }
    ]
  },
  {
    id: "wr-002",
    clientId: "client-2",
    clientName: "João Santos",
    propertyId: "prop-2",
    propertyName: "Residencial Bosque Verde",
    unitNumber: "305",
    title: "Porta empenada",
    description: "A porta do quarto principal está empenada e não fecha corretamente.",
    category: "Esquadrias",
    priority: "medium",
    currentStage: "inspection_scheduled",
    stageStartedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    slaConfig: DEFAULT_SLA_CONFIGS.find(c => c.warrantyType === "Esquadrias")!,
    slaDeadline: new Date(Date.now() + 60 * 60 * 60 * 1000),
    slaStatus: "on_track",
    assignedTo: "tech-2",
    assignedToName: "Ana Vistoriadora",
    inspectionDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    history: [
      {
        id: "hist-003",
        requestId: "wr-002",
        fromStatus: null,
        toStatus: "opened",
        changedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
        changedBy: "client-2",
        isAutomatic: false
      },
      {
        id: "hist-004",
        requestId: "wr-002",
        fromStatus: "opened",
        toStatus: "in_analysis",
        changedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        changedBy: "admin-1",
        isAutomatic: false
      },
      {
        id: "hist-005",
        requestId: "wr-002",
        fromStatus: "in_analysis",
        toStatus: "inspection_scheduled",
        changedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        changedBy: "admin-1",
        isAutomatic: false,
        notes: "Vistoria agendada para 10/02/2026"
      }
    ]
  },
  {
    id: "wr-003",
    clientId: "client-3",
    clientName: "Paulo Ferreira",
    propertyId: "prop-1",
    propertyName: "Edifício Aurora",
    unitNumber: "101",
    title: "Problema elétrico na cozinha",
    description: "Tomadas da cozinha não estão funcionando.",
    category: "Elétrica",
    priority: "critical",
    currentStage: "opened",
    stageStartedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    slaConfig: DEFAULT_SLA_CONFIGS.find(c => c.warrantyType === "Elétrica")!,
    slaDeadline: new Date(Date.now() + 44 * 60 * 60 * 1000),
    slaStatus: "on_track",
    assignedTo: null,
    assignedToName: null,
    history: [
      {
        id: "hist-006",
        requestId: "wr-003",
        fromStatus: null,
        toStatus: "opened",
        changedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        changedBy: "client-3",
        isAutomatic: false
      }
    ]
  },
  {
    id: "wr-004",
    clientId: "client-1",
    clientName: "Maria Oliveira",
    propertyId: "prop-1",
    propertyName: "Edifício Aurora",
    unitNumber: "204",
    title: "Rachadura na parede da sala",
    description: "Surgiu uma rachadura visível na parede da sala de estar.",
    category: "Estrutural",
    priority: "high",
    currentStage: "approved",
    stageStartedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    slaConfig: DEFAULT_SLA_CONFIGS.find(c => c.warrantyType === "Estrutural")!,
    slaDeadline: new Date(Date.now() + 700 * 60 * 60 * 1000),
    slaStatus: "on_track",
    assignedTo: "tech-1",
    assignedToName: "Carlos Técnico",
    inspectionDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
    inspectionNotes: "Rachadura superficial, não compromete estrutura",
    approvalDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    approvalNotes: "Aprovado para reparo",
    history: [
      {
        id: "hist-007",
        requestId: "wr-004",
        fromStatus: null,
        toStatus: "opened",
        changedAt: new Date(Date.now() - 120 * 60 * 60 * 1000),
        changedBy: "client-1",
        isAutomatic: false
      },
      {
        id: "hist-008",
        requestId: "wr-004",
        fromStatus: "opened",
        toStatus: "in_analysis",
        changedAt: new Date(Date.now() - 96 * 60 * 60 * 1000),
        changedBy: "admin-1",
        isAutomatic: false
      },
      {
        id: "hist-009",
        requestId: "wr-004",
        fromStatus: "in_analysis",
        toStatus: "inspection_scheduled",
        changedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
        changedBy: "admin-1",
        isAutomatic: false
      },
      {
        id: "hist-010",
        requestId: "wr-004",
        fromStatus: "inspection_scheduled",
        toStatus: "inspection_completed",
        changedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        changedBy: "tech-1",
        isAutomatic: false
      },
      {
        id: "hist-011",
        requestId: "wr-004",
        fromStatus: "inspection_completed",
        toStatus: "approved",
        changedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        changedBy: "admin-1",
        isAutomatic: false,
        notes: "Aprovado para reparo"
      }
    ]
  },
  {
    id: "wr-005",
    clientId: "client-4",
    clientName: "Carla Lima",
    propertyId: "prop-2",
    propertyName: "Residencial Bosque Verde",
    unitNumber: "102",
    title: "Vazamento no teto",
    description: "Vazamento aparente no teto do banheiro.",
    category: "Impermeabilização",
    priority: "critical",
    currentStage: "in_execution",
    stageStartedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    createdAt: new Date(Date.now() - 168 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    slaConfig: DEFAULT_SLA_CONFIGS.find(c => c.warrantyType === "Impermeabilização")!,
    slaDeadline: new Date(Date.now() + 312 * 60 * 60 * 1000),
    slaStatus: "on_track",
    assignedTo: "tech-3",
    assignedToName: "Roberto Obras",
    inspectionDate: new Date(Date.now() - 120 * 60 * 60 * 1000),
    inspectionNotes: "Falha na impermeabilização do andar superior",
    approvalDate: new Date(Date.now() - 72 * 60 * 60 * 1000),
    approvalNotes: "Urgente - aprovar imediatamente",
    executionStartDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
    executionNotes: "Equipe iniciou os trabalhos",
    history: []
  },
  {
    id: "wr-006",
    clientId: "client-5",
    clientName: "Fernando Costa",
    propertyId: "prop-1",
    propertyName: "Edifício Aurora",
    unitNumber: "501",
    title: "Piso solto na varanda",
    description: "Algumas peças do piso cerâmico estão soltas na varanda.",
    category: "Revestimentos Cerâmicos",
    priority: "low",
    currentStage: "completed",
    stageStartedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 240 * 60 * 60 * 1000), // 10 days ago
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    slaConfig: DEFAULT_SLA_CONFIGS.find(c => c.warrantyType === "Revestimentos Cerâmicos")!,
    slaDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
    slaStatus: "on_track",
    assignedTo: "tech-1",
    assignedToName: "Carlos Técnico",
    completionDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    completionNotes: "Piso reinstalado com sucesso",
    history: []
  }
];

/**
 * Service for managing warranty flow and history
 */
class WarrantyFlowService {
  private requests: Map<string, WarrantyRequestFlow> = new Map();

  constructor() {
    // Initialize with mock data
    mockWarrantyRequests.forEach(request => {
      this.requests.set(request.id, request);
    });
  }

  /**
   * Get all warranty requests
   */
  getAllRequests(): WarrantyRequestFlow[] {
    return Array.from(this.requests.values());
  }

  /**
   * Get request by ID
   */
  getRequest(requestId: string): WarrantyRequestFlow | undefined {
    return this.requests.get(requestId);
  }

  /**
   * Get requests for a specific client
   */
  getClientRequests(clientId: string): WarrantyRequestFlow[] {
    return this.getAllRequests().filter(r => r.clientId === clientId);
  }

  /**
   * Get requests by stage
   */
  getRequestsByStage(stage: WarrantyStage): WarrantyRequestFlow[] {
    return this.getAllRequests().filter(r => r.currentStage === stage);
  }

  /**
   * Get requests filtered
   */
  getFilteredRequests(filters: WarrantyFilters): WarrantyRequestFlow[] {
    let requests = this.getAllRequests();
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      requests = requests.filter(r => 
        r.title.toLowerCase().includes(search) ||
        r.clientName.toLowerCase().includes(search) ||
        r.propertyName.toLowerCase().includes(search)
      );
    }
    
    if (filters.propertyId) {
      requests = requests.filter(r => r.propertyId === filters.propertyId);
    }
    
    if (filters.category) {
      requests = requests.filter(r => r.category === filters.category);
    }
    
    if (filters.priority) {
      requests = requests.filter(r => r.priority === filters.priority);
    }
    
    if (filters.assignedTo) {
      requests = requests.filter(r => r.assignedTo === filters.assignedTo);
    }
    
    if (filters.slaStatus) {
      requests = requests.filter(r => r.slaStatus === filters.slaStatus);
    }
    
    if (filters.dateFrom) {
      requests = requests.filter(r => r.createdAt >= filters.dateFrom!);
    }
    
    if (filters.dateTo) {
      requests = requests.filter(r => r.createdAt <= filters.dateTo!);
    }
    
    return requests;
  }

  /**
   * Change request status (with validation)
   */
  changeStatus(
    requestId: string,
    newStatus: WarrantyStage,
    changedBy: string,
    isAutomatic: boolean = false,
    notes?: string
  ): { success: boolean; error?: string; request?: WarrantyRequestFlow } {
    const request = this.requests.get(requestId);
    
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }
    
    if (isFinalStage(request.currentStage)) {
      return { success: false, error: "Não é possível alterar uma solicitação finalizada" };
    }
    
    if (!isValidTransition(request.currentStage, newStatus)) {
      return { 
        success: false, 
        error: `Transição inválida de ${WARRANTY_STAGES[request.currentStage].label} para ${WARRANTY_STAGES[newStatus].label}` 
      };
    }
    
    // Create history entry
    const historyEntry: WarrantyStatusHistory = {
      id: `hist-${Date.now()}`,
      requestId,
      fromStatus: request.currentStage,
      toStatus: newStatus,
      changedAt: new Date(),
      changedBy,
      isAutomatic,
      notes
    };
    
    // Update request
    const updatedRequest: WarrantyRequestFlow = {
      ...request,
      currentStage: newStatus,
      stageStartedAt: new Date(),
      updatedAt: new Date(),
      slaStatus: warrantySLAService.getSLAStatus({ ...request, currentStage: newStatus, stageStartedAt: new Date() }),
      history: [...request.history, historyEntry]
    };
    
    // Update deadline based on new stage
    const slaInfo = warrantySLAService.calculateSLADeadlineInfo(updatedRequest);
    updatedRequest.slaDeadline = slaInfo.deadline;
    
    this.requests.set(requestId, updatedRequest);
    
    console.log('[WarrantyFlowService] Status changed:', {
      requestId,
      from: request.currentStage,
      to: newStatus,
      changedBy,
      isAutomatic
    });
    
    return { success: true, request: updatedRequest };
  }

  /**
   * Assign technician to request
   */
  assignTechnician(
    requestId: string,
    technicianId: string,
    technicianName: string,
    assignedBy: string
  ): { success: boolean; error?: string } {
    const request = this.requests.get(requestId);
    
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }
    
    const updatedRequest: WarrantyRequestFlow = {
      ...request,
      assignedTo: technicianId,
      assignedToName: technicianName,
      updatedAt: new Date()
    };
    
    this.requests.set(requestId, updatedRequest);
    
    console.log('[WarrantyFlowService] Technician assigned:', {
      requestId,
      technicianId,
      technicianName
    });
    
    return { success: true };
  }

  /**
   * Schedule inspection
   */
  scheduleInspection(
    requestId: string,
    inspectionDate: Date,
    technicianId: string,
    technicianName: string,
    scheduledBy: string
  ): { success: boolean; error?: string; request?: WarrantyRequestFlow } {
    const request = this.requests.get(requestId);
    
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }
    
    // First change status to inspection_scheduled
    const statusResult = this.changeStatus(
      requestId,
      "inspection_scheduled",
      scheduledBy,
      false,
      `Vistoria agendada para ${inspectionDate.toLocaleDateString('pt-BR')}`
    );
    
    if (!statusResult.success) {
      return statusResult;
    }
    
    // Then update inspection details
    const updatedRequest: WarrantyRequestFlow = {
      ...statusResult.request!,
      inspectionDate,
      inspectionTechnicianId: technicianId,
      inspectionTechnicianName: technicianName
    };
    
    this.requests.set(requestId, updatedRequest);
    
    return { success: true, request: updatedRequest };
  }

  /**
   * Complete inspection
   */
  completeInspection(
    requestId: string,
    notes: string,
    completedBy: string
  ): { success: boolean; error?: string; request?: WarrantyRequestFlow } {
    const request = this.requests.get(requestId);
    
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }
    
    const statusResult = this.changeStatus(
      requestId,
      "inspection_completed",
      completedBy,
      false,
      notes
    );
    
    if (!statusResult.success) {
      return statusResult;
    }
    
    const updatedRequest: WarrantyRequestFlow = {
      ...statusResult.request!,
      inspectionNotes: notes
    };
    
    this.requests.set(requestId, updatedRequest);
    
    return { success: true, request: updatedRequest };
  }

  /**
   * Approve warranty
   */
  approveWarranty(
    requestId: string,
    notes: string,
    approvedBy: string
  ): { success: boolean; error?: string; request?: WarrantyRequestFlow } {
    const request = this.requests.get(requestId);
    
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }
    
    const statusResult = this.changeStatus(
      requestId,
      "approved",
      approvedBy,
      false,
      notes
    );
    
    if (!statusResult.success) {
      return statusResult;
    }
    
    const updatedRequest: WarrantyRequestFlow = {
      ...statusResult.request!,
      approvalDate: new Date(),
      approvalNotes: notes
    };
    
    this.requests.set(requestId, updatedRequest);
    
    return { success: true, request: updatedRequest };
  }

  /**
   * Reject warranty
   */
  rejectWarranty(
    requestId: string,
    reason: string,
    rejectedBy: string
  ): { success: boolean; error?: string; request?: WarrantyRequestFlow } {
    const request = this.requests.get(requestId);
    
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }
    
    const statusResult = this.changeStatus(
      requestId,
      "rejected",
      rejectedBy,
      false,
      reason
    );
    
    if (!statusResult.success) {
      return statusResult;
    }
    
    const updatedRequest: WarrantyRequestFlow = {
      ...statusResult.request!,
      rejectionReason: reason
    };
    
    this.requests.set(requestId, updatedRequest);
    
    return { success: true, request: updatedRequest };
  }

  /**
   * Start execution
   */
  startExecution(
    requestId: string,
    notes: string,
    startedBy: string
  ): { success: boolean; error?: string; request?: WarrantyRequestFlow } {
    const request = this.requests.get(requestId);
    
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }
    
    const statusResult = this.changeStatus(
      requestId,
      "in_execution",
      startedBy,
      false,
      notes
    );
    
    if (!statusResult.success) {
      return statusResult;
    }
    
    const updatedRequest: WarrantyRequestFlow = {
      ...statusResult.request!,
      executionStartDate: new Date(),
      executionNotes: notes
    };
    
    this.requests.set(requestId, updatedRequest);
    
    return { success: true, request: updatedRequest };
  }

  /**
   * Complete warranty
   */
  completeWarranty(
    requestId: string,
    notes: string,
    completedBy: string
  ): { success: boolean; error?: string; request?: WarrantyRequestFlow } {
    const request = this.requests.get(requestId);
    
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }
    
    const statusResult = this.changeStatus(
      requestId,
      "completed",
      completedBy,
      false,
      notes
    );
    
    if (!statusResult.success) {
      return statusResult;
    }
    
    const updatedRequest: WarrantyRequestFlow = {
      ...statusResult.request!,
      completionDate: new Date(),
      completionNotes: notes
    };
    
    this.requests.set(requestId, updatedRequest);
    
    return { success: true, request: updatedRequest };
  }

  /**
   * Get timeline for a request (for client view)
   */
  getRequestTimeline(requestId: string): WarrantyStatusHistory[] {
    const request = this.requests.get(requestId);
    if (!request) return [];
    
    return [...request.history].sort((a, b) => 
      a.changedAt.getTime() - b.changedAt.getTime()
    );
  }

  /**
   * Get Kanban card data for all active requests
   */
  getKanbanData(): Map<WarrantyStage, KanbanCardData[]> {
    const kanbanData = new Map<WarrantyStage, KanbanCardData[]>();
    
    // Initialize all stages
    STAGE_ORDER.forEach(stage => {
      kanbanData.set(stage, []);
    });
    kanbanData.set("rejected", []);
    
    // Populate with requests
    this.getAllRequests().forEach(request => {
      const slaInfo = warrantySLAService.calculateSLADeadlineInfo(request);
      const cardData: KanbanCardData = {
        id: request.id,
        request,
        slaInfo,
        dragDisabled: isFinalStage(request.currentStage)
      };
      
      const stageCards = kanbanData.get(request.currentStage) || [];
      stageCards.push(cardData);
      kanbanData.set(request.currentStage, stageCards);
    });
    
    // Sort each column by urgency
    kanbanData.forEach((cards, stage) => {
      const sortedRequests = warrantySLAService.sortByUrgency(cards.map(c => c.request));
      const sortedCards = sortedRequests.map(r => cards.find(c => c.id === r.id)!);
      kanbanData.set(stage, sortedCards);
    });
    
    return kanbanData;
  }

  /**
   * Calculate metrics
   */
  calculateMetrics(): WarrantyMetrics {
    const allRequests = this.getAllRequests();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Volume metrics
    const openRequests = allRequests.filter(r => !FINAL_STAGES.includes(r.currentStage));
    const completedThisMonth = allRequests.filter(r => 
      r.currentStage === "completed" && r.completionDate && r.completionDate >= monthAgo
    );
    
    // SLA metrics
    let onTrackCount = 0;
    let warningCount = 0;
    let expiredCount = 0;
    
    openRequests.forEach(request => {
      const slaInfo = warrantySLAService.calculateSLADeadlineInfo(request);
      if (slaInfo.status === "on_track") onTrackCount++;
      else if (slaInfo.status === "warning") warningCount++;
      else expiredCount++;
    });
    
    // Stage distribution
    const stageDistribution: Record<WarrantyStage, number> = {} as Record<WarrantyStage, number>;
    STAGE_ORDER.forEach(stage => {
      stageDistribution[stage] = allRequests.filter(r => r.currentStage === stage).length;
    });
    stageDistribution["rejected"] = allRequests.filter(r => r.currentStage === "rejected").length;
    
    // Find bottleneck
    let bottleneckStage: WarrantyStage | null = null;
    let maxCount = 0;
    Object.entries(stageDistribution).forEach(([stage, count]) => {
      if (!FINAL_STAGES.includes(stage as WarrantyStage) && count > maxCount) {
        maxCount = count;
        bottleneckStage = stage as WarrantyStage;
      }
    });
    
    // By type breakdown
    const byType: Record<string, { total: number; avgTime: number; slaCompliance: number }> = {};
    const typeGroups: Record<string, WarrantyRequestFlow[]> = {};
    
    allRequests.forEach(request => {
      if (!typeGroups[request.category]) {
        typeGroups[request.category] = [];
      }
      typeGroups[request.category].push(request);
    });
    
    Object.entries(typeGroups).forEach(([type, requests]) => {
      const completed = requests.filter(r => r.currentStage === "completed" && r.completionDate);
      const avgTime = completed.length > 0
        ? completed.reduce((acc, r) => acc + (r.completionDate!.getTime() - r.createdAt.getTime()), 0) / completed.length / (1000 * 60 * 60)
        : 0;
      
      byType[type] = {
        total: requests.length,
        avgTime: Math.round(avgTime),
        slaCompliance: warrantySLAService.calculateComplianceRate(requests)
      };
    });
    
    // By priority
    const byPriority: Record<string, number> = {
      critical: allRequests.filter(r => r.priority === "critical").length,
      high: allRequests.filter(r => r.priority === "high").length,
      medium: allRequests.filter(r => r.priority === "medium").length,
      low: allRequests.filter(r => r.priority === "low").length
    };
    
    return {
      totalOpen: openRequests.length,
      openedToday: allRequests.filter(r => r.createdAt >= today).length,
      openedThisWeek: allRequests.filter(r => r.createdAt >= weekAgo).length,
      openedThisMonth: allRequests.filter(r => r.createdAt >= monthAgo).length,
      completedThisMonth: completedThisMonth.length,
      onTrackCount,
      warningCount,
      expiredCount,
      slaComplianceRate: warrantySLAService.calculateComplianceRate(allRequests),
      averageResolutionTime: Math.round(
        completedThisMonth.reduce((acc, r) => 
          acc + (r.completionDate!.getTime() - r.createdAt.getTime()), 0
        ) / (completedThisMonth.length || 1) / (1000 * 60 * 60)
      ),
      averageTimeByStage: {} as Record<WarrantyStage, number>,
      averageTimeByType: warrantySLAService.calculateAverageTimeByType(
        allRequests.filter(r => r.currentStage === "completed")
      ),
      bottleneckStage,
      stageDistribution,
      byType,
      byPriority
    };
  }
}

export const warrantyFlowService = new WarrantyFlowService();
