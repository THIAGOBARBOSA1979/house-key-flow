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
  DEFAULT_SLA_CONFIGS,
  WarrantyProblemDetail
} from '@/types/warrantyFlow';
import { warrantySLAService } from './WarrantySLAService';
import { auditLogService } from './AuditLogService';

// Mock warranty requests data
const initialMockRequests: WarrantyRequestFlow[] = [
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
    stageStartedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    slaConfig: DEFAULT_SLA_CONFIGS.find(c => c.warrantyType === "Instalações Hidráulicas")!,
    slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    slaStatus: "on_track",
    assignedTo: "tech-1",
    assignedToName: "Carlos Técnico",
    estimatedCost: 850,
    actualCost: 120,
    materials: [
      { id: "mat-1", name: "Vedante Silicone", quantity: 2, unit: "un", cost: 40 },
      { id: "mat-2", name: "Rejunte Impermeável", quantity: 1, unit: "kg", cost: 25 }
    ],
    internalNotes: "Análise inicial sugere falha no rejuntamento.",
    problems: [
      {
        id: "prob-1",
        category: "Hidráulica",
        location: "Banheiro Social",
        description: "Vazamento no registro",
        severity: "moderate",
        photos: [],
        status: "pending",
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ],
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
    stageStartedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    slaConfig: DEFAULT_SLA_CONFIGS.find(c => c.warrantyType === "Esquadrias")!,
    slaDeadline: new Date(Date.now() + 60 * 60 * 60 * 1000),
    slaStatus: "on_track",
    isPaused: true,
    pausedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    pauseReason: "Aguardando disponibilidade do morador",
    assignedTo: "tech-2",
    assignedToName: "Ana Vistoriadora",
    inspectionDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
  }
];

class WarrantyFlowService {
  private requests: Map<string, WarrantyRequestFlow> = new Map();
  private storageKey = "a2_warranty_requests";

  constructor() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        parsed.forEach((req: any) => {
          this.requests.set(req.id, {
            ...req,
            stageStartedAt: new Date(req.stageStartedAt),
            createdAt: new Date(req.createdAt),
            updatedAt: new Date(req.updatedAt),
            slaDeadline: req.slaDeadline ? new Date(req.slaDeadline) : undefined,
            inspectionDate: req.inspectionDate ? new Date(req.inspectionDate) : undefined,
            history: req.history.map((h: any) => ({ ...h, changedAt: new Date(h.changedAt) }))
          });
        });
      } catch (e) {
        console.error("Failed to load warranty requests", e);
      }
    }

    if (this.requests.size === 0) {
      initialMockRequests.forEach(request => {
        this.requests.set(request.id, request);
      });
      this.persist();
    }
  }

  private persist() {
    localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.requests.values())));
  }


  /**
   * Create a new warranty request
   */
  createRequest(data: Partial<WarrantyRequestFlow>): WarrantyRequestFlow {
    const id = data.id || `wr-${crypto.randomUUID()}`;
    const category = data.category || "Outros";
    const slaConfig = DEFAULT_SLA_CONFIGS.find(c => c.warrantyType === category) || DEFAULT_SLA_CONFIGS[0];
    
    const newRequest: WarrantyRequestFlow = {
      id,
      clientId: data.clientId || "",
      clientName: data.clientName || "",
      propertyId: data.propertyId || "",
      propertyName: data.propertyName || "",
      unitNumber: data.unitNumber || "",
      title: data.title || "",
      description: data.description || "",
      category,
      priority: data.priority || "medium",
      currentStage: "opened",
      stageStartedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      slaStatus: "on_track",
      slaConfig,
      slaDeadline: new Date(), // placeholder, updated below
      assignedTo: undefined,
      assignedToName: undefined,
      history: [
        {
          id: crypto.randomUUID(),
          requestId: id,
          fromStatus: null,
          toStatus: "opened",
          changedAt: new Date(),
          changedBy: data.clientId || "client",
          isAutomatic: false,
          notes: "Solicitação aberta pelo cliente"
        }
      ],
      problems: (data.problems || []).map(p => ({
        ...p,
        id: p.id || `prob-${crypto.randomUUID()}`,
        status: p.status || "pending",
        createdAt: p.createdAt || new Date(),
        updatedAt: p.updatedAt || new Date()
      })) as WarrantyProblemDetail[],
    };

    // Calculate actual initial SLA
    const slaInfo = warrantySLAService.calculateSLADeadlineInfo(newRequest);
    newRequest.slaDeadline = slaInfo.deadline;

    this.requests.set(id, newRequest);
    this.persist();

    auditLogService.log({
      entityType: 'warranty',
      entityId: id,
      action: 'created',
      performedBy: data.clientId || 'client',
      performedByName: data.clientName || 'Cliente',
      performedByRole: 'client',
      details: `Solicitação de garantia criada: ${newRequest.title}`
    });

    return newRequest;
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

    if (filters.isPaused !== undefined) {
      requests = requests.filter(r => r.isPaused === filters.isPaused);
    }
    
    return requests;
  }

  /**
   * Change request status (with validation and audit)
   */
  changeStatus(
    requestId: string,
    newStatus: WarrantyStage,
    changedBy: string,
    isAutomatic: boolean = false,
    notes?: string,
    performedByRole: 'admin' | 'client' = 'admin'
  ): { success: boolean; error?: string; request?: WarrantyRequestFlow } {
    const request = this.requests.get(requestId);
    
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }
    
    if (isFinalStage(request.currentStage)) {
      return { success: false, error: "Não é possível alterar uma solicitação finalizada" };
    }

    // Validation: Require assignee for 'inspection_scheduled' or 'in_execution'
    if ((newStatus === 'inspection_scheduled' || newStatus === 'in_execution') && !request.assignedTo) {
      return { success: false, error: "É necessário atribuir um responsável antes de prosseguir para esta etapa." };
    }

    // Business Rule: Check for unresolved problems when moving to 'completed'
    if (newStatus === 'completed' && request.problems) {
      const hasUnresolved = request.problems.some(p => p.status !== 'resolved' && p.status !== 'canceled');
      if (hasUnresolved) {
        return { 
          success: false, 
          error: "Não é possível finalizar uma solicitação com itens pendentes no breakdown. Resolva ou cancele todos os problemas primeiro." 
        };
      }
    }
    
    // Business Rule: moving to approved requires at least one problem to be confirmed/analyzed (simplified for now)
    
    if (!isValidTransition(request.currentStage, newStatus)) {
      return { 
        success: false, 
        error: `Transição inválida de ${WARRANTY_STAGES[request.currentStage].label} para ${WARRANTY_STAGES[newStatus].label}` 
      };
    }
    
    // Create history entry
    const historyEntry: WarrantyStatusHistory = {
      id: crypto.randomUUID(),
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
    
    // Auto-assignment if moving to in_analysis and no technician
    if (newStatus === 'in_analysis' && !updatedRequest.assignedTo) {
      // In a real app, logic for auto-assignment would go here
      // For now, we'll keep it manual but prepare the structure
    }

    this.requests.set(requestId, updatedRequest);
    this.persist();
    
    auditLogService.log({
      entityType: 'warranty',
      entityId: requestId,
      action: newStatus === 'opened' ? 'created' : (newStatus === 'approved' ? 'accepted' : (newStatus === 'rejected' ? 'rejected' : 'stage_changed')),
      performedBy: changedBy,
      performedByName: performedByRole === 'admin' ? 'Administrador' : (request.clientName || 'Cliente'),
      performedByRole: performedByRole,
      details: notes || `Solicitação movida para a etapa ${WARRANTY_STAGES[newStatus].label}`,
      metadata: { 
        fromStatus: request.currentStage, 
        toStatus: newStatus,
        technician: updatedRequest.assignedToName,
        problemCount: updatedRequest.problems?.length || 0
      }
    });
    
    return { success: true, request: updatedRequest };
  }

  /**
   * Pause or resume a request
   */
  togglePause(
    requestId: string,
    isPaused: boolean,
    reason: string,
    changedBy: string,
    performedByRole: 'admin' | 'client' = 'admin'
  ): { success: boolean; error?: string; request?: WarrantyRequestFlow } {
    const request = this.requests.get(requestId);
    if (!request) return { success: false, error: "Solicitação não encontrada" };

    const updatedRequest: WarrantyRequestFlow = {
      ...request,
      isPaused,
      pausedAt: isPaused ? new Date() : undefined,
      pauseReason: isPaused ? reason : undefined,
      updatedAt: new Date(),
      history: [
        ...request.history,
        {
          id: crypto.randomUUID(),
          requestId,
          fromStatus: request.currentStage,
          toStatus: request.currentStage,
          changedAt: new Date(),
          changedBy,
          isAutomatic: false,
          notes: isPaused ? `Solicitação pausada: ${reason}` : "Solicitação retomada"
        }
      ]
    };

    this.requests.set(requestId, updatedRequest);
    this.persist();

    auditLogService.log({
      entityType: 'warranty',
      entityId: requestId,
      action: 'updated',
      performedBy: changedBy,
      performedByName: performedByRole === 'admin' ? 'Administrador' : (request.clientName || 'Cliente'),
      performedByRole: performedByRole,
      details: isPaused ? `Solicitação pausada: ${reason}` : "Solicitação retomada",
      metadata: { isPaused, reason }
    });

    return { success: true, request: updatedRequest };
  }

  /**
   * Update request costs and materials
   */
  updateCosts(
    requestId: string,
    data: { estimatedCost?: number; actualCost?: number; materials?: any[] },
    changedBy: string
  ): { success: boolean; error?: string; request?: WarrantyRequestFlow } {
    const request = this.requests.get(requestId);
    if (!request) return { success: false, error: "Solicitação não encontrada" };

    const updatedRequest: WarrantyRequestFlow = {
      ...request,
      ...data,
      updatedAt: new Date()
    };

    this.requests.set(requestId, updatedRequest);
    this.persist();
    
    auditLogService.log({
      entityType: 'warranty',
      entityId: requestId,
      action: 'updated',
      performedBy: changedBy,
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: 'Custos e materiais atualizados'
    });

    return { success: true, request: updatedRequest };
  }

  /**
   * Toggle problem resolution status
   */
  toggleProblemStatus(
    requestId: string,
    problemId: string,
    changedBy: string
  ): { success: boolean; error?: string; request?: WarrantyRequestFlow } {
    const request = this.requests.get(requestId);
    if (!request || !request.problems) return { success: false, error: "Solicitação ou problema não encontrado" };

    const problemIndex = request.problems.findIndex(p => p.id === problemId);
    if (problemIndex === -1) return { success: false, error: "Problema não encontrado" };

    const problem = request.problems[problemIndex];
    const newStatus = problem.status === 'resolved' ? 'pending' : 'resolved';
    
    const updatedProblems = [...request.problems];
    updatedProblems[problemIndex] = {
      ...problem,
      status: newStatus,
      resolvedAt: newStatus === 'resolved' ? new Date() : undefined,
      updatedAt: new Date()
    };

    const updatedRequest: WarrantyRequestFlow = {
      ...request,
      problems: updatedProblems,
      updatedAt: new Date()
    };

    this.requests.set(requestId, updatedRequest);
    this.persist();

    auditLogService.log({
      entityType: 'warranty',
      entityId: requestId,
      action: 'updated',
      performedBy: changedBy,
      performedByName: changedBy === 'admin-1' ? 'Administrador' : (request.clientName || 'Usuário'),
      performedByRole: changedBy === 'admin-1' ? 'admin' : 'client',
      details: `Item do breakdown "${problem.description}" marcado como ${newStatus === 'resolved' ? 'resolvido' : 'pendente'}.`,
      metadata: { problemId, newStatus }
    });

    return { success: true, request: updatedRequest };
  }

  /**
   * Add a problem to a request breakdown
   */
  addProblemToRequest(
    requestId: string, 
    problemData: Partial<WarrantyProblemDetail>,
    changedBy: string
  ): { success: boolean; error?: string; request?: WarrantyRequestFlow } {
    const request = this.requests.get(requestId);
    if (!request) return { success: false, error: "Solicitação não encontrada" };

    const newProblem: WarrantyProblemDetail = {
      id: crypto.randomUUID(),
      category: problemData.category || "Geral",
      location: problemData.location || "A definir",
      description: problemData.description || "Novo problema identificado",
      severity: problemData.severity || "moderate",
      photos: [],
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...problemData
    };

    const updatedRequest: WarrantyRequestFlow = {
      ...request,
      problems: [...(request.problems || []), newProblem],
      updatedAt: new Date()
    };

    this.requests.set(requestId, updatedRequest);
    this.persist();

    auditLogService.log({
      entityType: 'warranty',
      entityId: requestId,
      action: 'info_added',
      performedBy: changedBy,
      performedByName: changedBy === 'admin-1' ? 'Administrador' : (request.clientName || 'Usuário'),
      performedByRole: changedBy === 'admin-1' ? 'admin' : 'client',
      details: `Novo item adicionado ao breakdown: ${newProblem.description}`
    });

    return { success: true, request: updatedRequest };
  }

  /**
   * Add material to request
   */
  addMaterial(
    requestId: string,
    material: { name: string; quantity: number; unit: string; cost?: number },
    changedBy: string
  ): { success: boolean; error?: string; request?: WarrantyRequestFlow } {
    const request = this.requests.get(requestId);
    if (!request) return { success: false, error: "Solicitação não encontrada" };

    const materials = request.materials || [];
    const newMaterial = { ...material, id: crypto.randomUUID() };
    
    const updatedRequest: WarrantyRequestFlow = {
      ...request,
      materials: [...materials, newMaterial],
      actualCost: (request.actualCost || 0) + (material.cost || 0),
      updatedAt: new Date()
    };

    this.requests.set(requestId, updatedRequest);
    this.persist();

    auditLogService.log({
      entityType: 'warranty',
      entityId: requestId,
      action: 'info_added',
      performedBy: changedBy,
      performedByName: changedBy === 'admin-1' ? 'Administrador' : 'Usuário',
      performedByRole: changedBy === 'admin-1' ? 'admin' : 'user',
      details: `Novo material registrado: ${newMaterial.name} (${newMaterial.quantity} ${newMaterial.unit})`
    });

    return { success: true, request: updatedRequest };
  }

  /**
   * Assign or change technician
   */
  assignTechnician(
    requestId: string,
    technicianId: string,
    technicianName: string,
    assignedBy: string
  ): { success: boolean; error?: string; request?: WarrantyRequestFlow } {
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
    this.persist();
    
    auditLogService.log({
      entityType: 'warranty',
      entityId: requestId,
      action: 'updated',
      performedBy: assignedBy,
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Responsável técnico alterado para ${technicianName}`
    });
    
    return { success: true, request: updatedRequest };
  }


  /**
   * Update problem details
   */
  updateProblem(
    requestId: string,
    problemId: string,
    data: Partial<WarrantyProblemDetail>,
    changedBy: string
  ): { success: boolean; error?: string; request?: WarrantyRequestFlow } {
    const request = this.requests.get(requestId);
    if (!request || !request.problems) return { success: false, error: "Solicitação ou problema não encontrado" };

    const problems = request.problems.map(p => 
      p.id === problemId ? { ...p, ...data } : p
    );

    const updatedRequest: WarrantyRequestFlow = {
      ...request,
      problems,
      updatedAt: new Date()
    };

    this.requests.set(requestId, updatedRequest);
    this.persist();

    return { success: true, request: updatedRequest };
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

    // Business Rule: Check if all problems are resolved
    if (request.problems && request.problems.some(p => p.status !== "resolved")) {
      return { 
        success: false, 
        error: "Não é possível finalizar a garantia com problemas pendentes. Resolva todos os itens primeiro." 
      };
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

  /**
   * Add a comment/update to a request
   */
  addUpdate(
    requestId: string,
    authorId: string,
    authorName: string,
    text: string
  ): { success: boolean; error?: string; request?: WarrantyRequestFlow } {
    const request = this.requests.get(requestId);
    if (!request) return { success: false, error: "Solicitação não encontrada" };

    const newUpdate = {
      id: `upd-${crypto.randomUUID()}`,
      date: new Date(),
      author: authorName,
      text: text
    };

    const updatedRequest: WarrantyRequestFlow = {
      ...request,
      updates: [...request.updates || [], newUpdate],
      updatedAt: new Date()
    };

    this.requests.set(requestId, updatedRequest);
    this.persist();

    auditLogService.log({
      entityType: 'warranty',
      entityId: requestId,
      action: 'updated',
      performedBy: authorId,
      performedByName: authorName,
      performedByRole: authorId === 'admin-1' ? 'admin' : 'client',
      details: `Novo comentário adicionado à solicitação.`
    });

    return { success: true, request: updatedRequest };
  }

  /**
   * Cancel a request
   */
  cancelRequest(requestId: string, clientId: string): boolean {
    const request = this.requests.get(requestId);
    if (request && request.clientId === clientId) {
      this.changeStatus(requestId, 'rejected' as any, clientId, false, "Solicitação cancelada pelo cliente");
      return true;
    }
    return false;
  }
}

export const warrantyFlowService = new WarrantyFlowService();