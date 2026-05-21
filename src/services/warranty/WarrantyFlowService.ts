import {
  WarrantyStage,
  WarrantyRequestFlow,
  WarrantyStatusHistory,
  KanbanCardData,
  WarrantyMetrics,
  WarrantyFilters,
  WARRANTY_STAGES,
  STAGE_ORDER,
  FINAL_STAGES,
  isFinalStage,
  isValidTransition,
  DEFAULT_SLA_CONFIGS,
  WarrantyProblemDetail
} from '../../types/warrantyFlow';
import { warrantySLAService } from './WarrantySLAService';
import { auditLogService, AuditAction } from '../core/AuditLogService';
import { SupabaseBaseService } from '../SupabaseBaseService';
import { Supabase } from '@/integrations/supabase';
import { warrantyAutomationService } from './WarrantyAutomationService';

// Eliminando mocks estáticos para persistência real via Supabase
const initialMockRequests: WarrantyRequestFlow[] = [];

class WarrantyFlowService extends SupabaseBaseService<WarrantyRequestFlow> {
  private debugMode = false;
  private debugLogs: Array<{ timestamp: Date; level: 'info' | 'error'; message: string; data?: unknown }> = [];

  constructor() {
    super({
      storageKey: "a2_warranty_requests",
      supabaseTable: "warranty_requests",
      auditEntityType: "warranty",
      shouldSyncWithSupabase: true,
      fieldMapping: {
        assignedTo: 'assigned_technician_id',
        currentStage: 'status'
      }
    });
  }

  setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
  }

  getLogs() {
    return [...this.debugLogs];
  }

  clearLogs() {
    this.debugLogs = [];
  }

  private internalLog(level: 'info' | 'error', message: string, data?: unknown) {
    const entry = { timestamp: new Date(), level, message, data };
    this.debugLogs.push(entry);
    if (this.debugMode) {
      const consoleMethod = level === 'error' ? 'error' : 'log';
      console[consoleMethod](`[WarrantyFlowService] ${message}`, data || '');
    }
  }

  getAllRequestsSync(companyId?: string, isSuperAdmin?: boolean): WarrantyRequestFlow[] {
    return this.getAllSync(companyId, isSuperAdmin);
  }

  getRequestSync(requestId: string, companyId?: string, isSuperAdmin?: boolean): WarrantyRequestFlow | undefined {
    return this.getByIdSync(requestId, companyId, isSuperAdmin);
  }

  async getAllRequests(companyId?: string, isSuperAdmin?: boolean): Promise<WarrantyRequestFlow[]> {
    return await this.getAll(companyId, isSuperAdmin);
  }

  async getRequest(requestId: string, companyId?: string, isSuperAdmin?: boolean): Promise<WarrantyRequestFlow | undefined> {
    return await this.getById(requestId, companyId, isSuperAdmin);
  }

  /**
   * Create a new warranty request
   */
  async createRequest(data: Partial<WarrantyRequestFlow>): Promise<WarrantyRequestFlow> {
    this.internalLog('info', 'Creating new request', { title: data.title });
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
          notes: "Protocolo de assistência técnica aberto estrategicamente pelo cliente"
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

    // Persist real via Supabase
    const created = await this.create(newRequest);

    this.log('created', id, `Solicitação de garantia criada: ${newRequest.title}`, {
      performedBy: data.clientId || 'client',
      performedByName: data.clientName || 'Cliente',
      performedByRole: 'client'
    });

    return created;
  }

  /**
   * Get requests for a specific client
   */
  async getClientRequests(clientId: string, companyId?: string, isSuperAdmin?: boolean): Promise<WarrantyRequestFlow[]> {
    const requests = await this.getAllRequests(companyId, isSuperAdmin);
    return requests.filter(r => r.clientId === clientId);
  }

  getClientRequestsSync(clientId: string, companyId?: string, isSuperAdmin?: boolean): WarrantyRequestFlow[] {
    return this.getAllRequestsSync(companyId, isSuperAdmin).filter(r => r.clientId === clientId);
  }

  /**
   * Get requests by stage
   */
  getRequestsByStageSync(stage: WarrantyStage, companyId?: string, isSuperAdmin?: boolean): WarrantyRequestFlow[] {
    return this.getAllRequestsSync(companyId, isSuperAdmin).filter(r => r.currentStage === stage);
  }

  async getRequestsByStage(stage: WarrantyStage, companyId?: string, isSuperAdmin?: boolean): Promise<WarrantyRequestFlow[]> {
    const requests = await this.getAllRequests(companyId, isSuperAdmin);
    return requests.filter(r => r.currentStage === stage);
  }

  /**
   * Get requests filtered
   */
  async getFilteredRequests(filters: WarrantyFilters, companyId?: string, isSuperAdmin?: boolean): Promise<WarrantyRequestFlow[]> {
    let requests = await this.getAllRequests(companyId, isSuperAdmin);
    
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
      requests = requests.filter(r => new Date(r.createdAt) >= filters.dateFrom!);
    }
    
    if (filters.dateTo) {
      requests = requests.filter(r => new Date(r.createdAt) <= filters.dateTo!);
    }

    if (filters.isPaused !== undefined) {
      requests = requests.filter(r => r.isPaused === filters.isPaused);
    }
    
    return requests;
  }

  /**
   * Cancel a request
   */
  async cancelRequest(requestId: string, clientId: string): Promise<boolean> {
    const request = await this.getById(requestId, undefined, true);
    if (!request || request.clientId !== clientId) return false;
    
    // Only allow canceling if not already in final stages
    if (isFinalStage(request.currentStage)) return false;

    this.update(requestId, {
      currentStage: "rejected",
      rejectionReason: "Cancelado pelo cliente",
      updatedAt: new Date(),
      history: [
        ...request.history,
        {
          id: crypto.randomUUID(),
          requestId,
          fromStatus: request.currentStage,
          toStatus: "rejected",
          changedAt: new Date(),
          changedBy: clientId,
          isAutomatic: false,
          notes: "Protocolo encerrado estrategicamente pelo solicitante"
        }
      ]
    } as any);

    // Trigger automation for cancellation
    warrantyAutomationService.onStatusChange(requestId, request.currentStage, "rejected", clientId, false);

    return true;
  }

  /**
   * Add update/comment to a request
   */
  async addUpdate(requestId: string, authorId: string, authorName: string, text: string): Promise<{ success: boolean; error?: string; request?: WarrantyRequestFlow }> {
    const request = await this.getById(requestId, undefined, true);
    if (!request) return { success: false, error: "Solicitação não encontrada" };

    const updateEntry = {
      id: crypto.randomUUID(),
      date: new Date(),
      author: authorName,
      text
    };

    const updatedRequest: WarrantyRequestFlow = {
      ...request,
      updates: [...(request.updates || []), updateEntry],
      updatedAt: new Date()
    };

    this.update(requestId, updatedRequest);
    return { success: true, request: updatedRequest };
  }

  /**
   * Change request status (with validation and audit)
   */
  async changeStatus(
    requestId: string,
    newStatus: WarrantyStage,
    changedBy: string,
    isAutomatic: boolean = false,
    notes?: string,
    performedByRole: 'admin' | 'client' = 'admin',
    userName?: string
  ): Promise<{ success: boolean; error?: string; request?: WarrantyRequestFlow }> {
    this.internalLog('info', `Attempting status change for ${requestId} to ${newStatus}`, { changedBy, performedByRole });
    const request = await this.getById(requestId, undefined, true);
    
    if (!request) {
      this.internalLog('error', `Request ${requestId} not found for status change`);
      return { success: false, error: "Solicitação não encontrada" };
    }
    
    if (isFinalStage(request.currentStage) && newStatus !== 'in_analysis') {
      this.internalLog('error', `Cannot move finalized request ${requestId} to ${newStatus}`);
      return { success: false, error: "Não é possível alterar uma solicitação finalizada (exceto para reabertura em análise)" };
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
    
    // Business Rule: Moving to 'in_execution' requires internal notes for tracking
    if (newStatus === 'in_execution' && !notes && !request.internalNotes) {
      return { success: false, error: "Por favor, adicione uma observação técnica antes de iniciar a execução." };
    }
    
    // Business Rule: moving to approved requires at least one problem to be confirmed/analyzed (simplified for now)
    
    // Global bypass for E2E tests if necessary, but here we'll just fix the validation
    if (!isValidTransition(request.currentStage, newStatus) && newStatus !== 'in_analysis') {
      this.internalLog('error', `Invalid transition from ${request.currentStage} to ${newStatus}`);
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

    this.update(requestId, updatedRequest);
    
    const auditAction: AuditAction = newStatus === 'opened' ? 'created' : (newStatus === 'approved' ? 'accepted' : (newStatus === 'rejected' ? 'rejected' : 'stage_changed'));
    
    this.log(auditAction, requestId, notes || `Sincronização estratégica: protocolo avançou para ${WARRANTY_STAGES[newStatus].label}`, {
      fromStatus: request.currentStage, 
      toStatus: newStatus,
      technician: updatedRequest.assignedToName,
      problemCount: updatedRequest.problems?.length || 0,
      performedBy: changedBy,
      performedByName: performedByRole === 'admin' ? 'Administrador' : (request.clientName || 'Cliente'),
      performedByRole: performedByRole
    });
    
    // Trigger status automation
    warrantyAutomationService.onStatusChange(requestId, request.currentStage, newStatus, changedBy, isAutomatic);

    return { success: true, request: updatedRequest };
  }

  /**
   * Pause or resume a request
   */
  async togglePause(
    requestId: string,
    isPaused: boolean,
    reason: string,
    changedBy: string,
    performedByRole: 'admin' | 'client' = 'admin'
  ): Promise<{ success: boolean; error?: string; request?: WarrantyRequestFlow }> {
    const request = await this.getById(requestId, undefined, true);
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

    this.update(requestId, updatedRequest);

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

  async updateCosts(
    requestId: string,
    data: { estimatedCost?: number; actualCost?: number; materials?: WarrantyRequestFlow["materials"] },
    changedBy: string
  ): Promise<{ success: boolean; error?: string; request?: WarrantyRequestFlow }> {
    const request = await this.getById(requestId, undefined, true);
    if (!request) return { success: false, error: "Solicitação não encontrada" };

    const updatedRequest: WarrantyRequestFlow = {
      ...request,
      ...data,
      updatedAt: new Date()
    };

    this.update(requestId, updatedRequest);
    
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
   * Assign or change technician
   */
  async assignTechnician(
    requestId: string,
    technicianId: string,
    technicianName: string,
    assignedBy: string
  ): Promise<{ success: boolean; error?: string; request?: WarrantyRequestFlow }> {
    const request = await this.getById(requestId, undefined, true);
    if (!request) return { success: false, error: "Solicitação não encontrada" };

    const updatedRequest: WarrantyRequestFlow = {
      ...request,
      assignedTo: technicianId,
      assignedToName: technicianName,
      updatedAt: new Date()
    };

    this.update(requestId, updatedRequest);

    auditLogService.log({
      entityType: 'warranty',
      entityId: requestId,
      action: 'assigned',
      performedBy: assignedBy,
      performedByName: 'Administrador',
      performedByRole: 'admin',
      details: `Responsável técnico alterado para ${technicianName}`,
      metadata: { technicianId, technicianName }
    });

    return { success: true, request: updatedRequest };
  }

  /**
   * Schedule inspection
   */
  async scheduleInspection(
    requestId: string,
    inspectionDate: Date,
    technicianId: string,
    technicianName: string,
    scheduledBy: string
  ): Promise<{ success: boolean; error?: string; request?: WarrantyRequestFlow }> {
    const request = await this.getById(requestId, undefined, true);
    if (!request) return { success: false, error: "Solicitação não encontrada" };

    const statusResult = await this.changeStatus(
      requestId,
      "inspection_scheduled",
      scheduledBy,
      false,
      `Vistoria agendada para ${inspectionDate.toLocaleDateString('pt-BR')}`
    );

    if (!statusResult.success) return statusResult;

    const updatedRequest: WarrantyRequestFlow = {
      ...statusResult.request!,
      inspectionDate,
      inspectionTechnicianId: technicianId,
      inspectionTechnicianName: technicianName,
      assignedTo: technicianId,
      assignedToName: technicianName
    };

    this.update(requestId, updatedRequest);

    return { success: true, request: updatedRequest };
  }

  /**
   * Complete inspection
   */
  async completeInspection(
    requestId: string,
    notes: string,
    completedBy: string
  ): Promise<{ success: boolean; error?: string; request?: WarrantyRequestFlow }> {
    const statusResult = await this.changeStatus(requestId, "inspection_completed", completedBy, false, notes);
    if (!statusResult.success) return statusResult;

    const updatedRequest: WarrantyRequestFlow = {
      ...statusResult.request!,
      inspectionNotes: notes
    };

    this.update(requestId, updatedRequest);
    return { success: true, request: updatedRequest };
  }

  /**
   * Approve warranty
   */
  async approveWarranty(
    requestId: string,
    notes: string,
    approvedBy: string
  ): Promise<{ success: boolean; error?: string; request?: WarrantyRequestFlow }> {
    const statusResult = await this.changeStatus(requestId, "approved", approvedBy, false, notes);
    if (!statusResult.success) return statusResult;

    const updatedRequest: WarrantyRequestFlow = {
      ...statusResult.request!,
      approvalDate: new Date(),
      approvalNotes: notes
    };

    this.update(requestId, updatedRequest);
    return { success: true, request: updatedRequest };
  }

  /**
   * Reject warranty
   */
  async rejectWarranty(
    requestId: string,
    reason: string,
    rejectedBy: string
  ): Promise<{ success: boolean; error?: string; request?: WarrantyRequestFlow }> {
    const statusResult = await this.changeStatus(requestId, "rejected", rejectedBy, false, reason);
    if (!statusResult.success) return statusResult;

    const updatedRequest: WarrantyRequestFlow = {
      ...statusResult.request!,
      rejectionReason: reason
    };

    this.update(requestId, updatedRequest);
    return { success: true, request: updatedRequest };
  }

  /**
   * Start execution
   */
  async startExecution(
    requestId: string,
    notes: string,
    startedBy: string
  ): Promise<{ success: boolean; error?: string; request?: WarrantyRequestFlow }> {
    const statusResult = await this.changeStatus(requestId, "in_execution", startedBy, false, notes);
    if (!statusResult.success) return statusResult;

    const updatedRequest: WarrantyRequestFlow = {
      ...statusResult.request!,
      executionStartDate: new Date(),
      executionNotes: notes
    };

    this.update(requestId, updatedRequest);
    return { success: true, request: updatedRequest };
  }

  /**
   * Complete warranty
   */
  async completeWarranty(
    requestId: string,
    notes: string,
    completedBy: string
  ): Promise<{ success: boolean; error?: string; request?: WarrantyRequestFlow }> {
    const request = await this.getRequest(requestId);
    if (!request) return { success: false, error: "Solicitação não encontrada" };

    if (request.problems && request.problems.some(p => p.status !== "resolved")) {
      return { success: false, error: "Não é possível finalizar a garantia com problemas pendentes. Resolva todos os itens primeiro." };
    }

    const statusResult = await this.changeStatus(requestId, "completed", completedBy, false, notes);
    if (!statusResult.success) return statusResult;

    const updatedRequest: WarrantyRequestFlow = {
      ...statusResult.request!,
      completionDate: new Date(),
      completionNotes: notes
    };

    this.update(requestId, updatedRequest);
    return { success: true, request: updatedRequest };
  }

  /**
   * Add a problem to a request breakdown
   */
  async addProblemToRequest(
    requestId: string,
    problemData: Partial<WarrantyProblemDetail>,
    changedBy: string
  ): Promise<{ success: boolean; error?: string; request?: WarrantyRequestFlow }> {
    const request = await this.getById(requestId, undefined, true);
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

    this.update(requestId, updatedRequest);

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
   * Toggle problem resolution status
   */
  async toggleProblemStatus(
    requestId: string,
    problemId: string,
    changedBy: string
  ): Promise<{ success: boolean; error?: string; request?: WarrantyRequestFlow }> {
    const request = await this.getById(requestId, undefined, true);
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

    this.update(requestId, updatedRequest);

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
   * Add material to request
   */
  async addMaterial(
    requestId: string,
    material: { name: string; quantity: number; unit: string; cost?: number },
    changedBy: string
  ): Promise<{ success: boolean; error?: string; request?: WarrantyRequestFlow }> {
    const request = await this.getById(requestId, undefined, true);
    if (!request) return { success: false, error: "Solicitação não encontrada" };

    const materials = request.materials || [];
    const newMaterial = { ...material, id: crypto.randomUUID() };
    
    const updatedRequest: WarrantyRequestFlow = {
      ...request,
      materials: [...materials, newMaterial],
      actualCost: (request.actualCost || 0) + (material.cost || 0),
      updatedAt: new Date()
    };

    this.update(requestId, updatedRequest);

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
   * Update problem details
   */
  async updateProblem(
    requestId: string,
    problemId: string,
    data: Partial<WarrantyProblemDetail>,
    changedBy: string
  ): Promise<{ success: boolean; error?: string; request?: WarrantyRequestFlow }> {
    const request = await this.getById(requestId, undefined, true);
    if (!request || !request.problems) return { success: false, error: "Solicitação ou problema não encontrado" };

    const problems = request.problems.map(p => 
      p.id === problemId ? { ...p, ...data } : p
    );

    const updatedRequest: WarrantyRequestFlow = {
      ...request,
      problems,
      updatedAt: new Date()
    };

    this.update(requestId, updatedRequest);

    return { success: true, request: updatedRequest };
  }


  /**
   * Get timeline for a request (for client view)
   */
  async getRequestTimeline(requestId: string): Promise<WarrantyStatusHistory[]> {
    const request = await this.getById(requestId, undefined, true);
    if (!request) return [];
    
    return [...request.history].sort((a, b) => 
      a.changedAt.getTime() - b.changedAt.getTime()
    );
  }

  /**
   * Get Kanban card data for all active requests
   */
  async getKanbanData(companyId?: string, isSuperAdmin?: boolean): Promise<Map<WarrantyStage, KanbanCardData[]>> {
    const kanbanData = new Map<WarrantyStage, KanbanCardData[]>();
    
    // Initialize all stages
    STAGE_ORDER.forEach(stage => {
      kanbanData.set(stage, []);
    });
    kanbanData.set("rejected", []);
    
    // Populate with requests
    (await this.getAllRequests(companyId, isSuperAdmin)).forEach(request => {
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
  async calculateMetrics(companyId?: string, isSuperAdmin?: boolean): Promise<WarrantyMetrics> {
    const allRequests = await this.getAllRequests(companyId, isSuperAdmin);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Volume metrics
    const openRequests = allRequests.filter(r => !(FINAL_STAGES as unknown as string[]).includes(r.currentStage));
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
      if (!(FINAL_STAGES as unknown as string[]).includes(stage as WarrantyStage) && count > maxCount) {
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