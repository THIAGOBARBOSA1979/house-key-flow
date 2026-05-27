
import { 
  WarrantyStage, 
  WarrantyNotificationType,
  WARRANTY_NOTIFICATION_TEMPLATES,
  WarrantyRequestFlow
} from '@/types/warrantyFlow';
import { warrantyFlowService } from './WarrantyFlowService';
import { warrantySLAService } from './WarrantySLAService';
import { notificationService } from '../core/NotificationService';
import { NotificationType } from '@/types/clientFlow';

/**
 * Service for handling warranty-related automations
 * Triggers notifications, updates, and side effects based on warranty events
 */
class WarrantyAutomationService {
  /**
   * Handle status change event
   */
  async onStatusChange(
    requestId: string,
    oldStatus: WarrantyStage,
    newStatus: WarrantyStage,
    changedBy: string,
    isAutomatic: boolean = false
  ): Promise<void> {
    const request = await warrantyFlowService.getRequest(requestId);
    if (!request) {
      return;
    }

    // Trigger appropriate notification based on new status
    this.createNotificationForStatus(request, newStatus);

    // Trigger appropriate notification based on new status
    this.createNotificationForStatus(request, newStatus);

    // Handle specific transitions
    switch (newStatus) {
      case 'in_analysis':
        this.onStartAnalysis(request);
        break;
      case 'inspection_scheduled':
        this.onInspectionScheduled(request);
        break;
      case 'inspection_completed':
        this.onInspectionCompleted(request);
        break;
      case 'approved':
        this.onApproved(request);
        break;
      case 'rejected':
        this.onRejected(request);
        break;
      case 'in_execution':
        this.onExecutionStarted(request);
        break;
      case 'completed':
        this.onCompleted(request);
        break;
    }
  }

  /**
   * Create notification for client based on status
   */
  private createNotificationForStatus(
    request: WarrantyRequestFlow,
    status: WarrantyStage
  ): void {
    const notificationMap: Record<WarrantyStage, WarrantyNotificationType | null> = {
      'opened': 'warranty_opened',
      'in_analysis': 'warranty_in_analysis',
      'inspection_scheduled': 'warranty_inspection_scheduled',
      'inspection_completed': 'warranty_inspection_done',
      'approved': 'warranty_approved',
      'rejected': 'warranty_rejected',
      'in_execution': 'warranty_in_execution',
      'completed': 'warranty_completed'
    };

    const notificationType = notificationMap[status];
    if (!notificationType) return;

    const template = WARRANTY_NOTIFICATION_TEMPLATES[notificationType];
    if (!template.forClient) return;

    // Create notification using existing service
    // Map to existing notification types where possible
    const clientFlowType = this.mapToClientFlowNotificationType(notificationType);
    if (clientFlowType) {
      notificationService.createNotification(
        request.clientId,
        clientFlowType,
        request.company_id || '',
        {
          relatedEntityId: request.id,
          relatedEntityType: 'warranty',
          actionUrl: '/client/warranty'
        },
        {
          title: template.title,
          message: `${template.message} - ${request.title}`
        }
      );
    }
  }

  /**
   * Map warranty notification type to existing client flow type
   */
  private mapToClientFlowNotificationType(
    warrantyType: WarrantyNotificationType
  ): NotificationType | null {
    const mapping: Record<WarrantyNotificationType, NotificationType | null> = {
      'warranty_opened': 'warranty_created',
      'warranty_in_analysis': 'warranty_updated',
      'warranty_inspection_scheduled': 'warranty_updated',
      'warranty_inspection_done': 'warranty_updated',
      'warranty_approved': 'warranty_updated',
      'warranty_rejected': 'warranty_updated',
      'warranty_in_execution': 'warranty_updated',
      'warranty_completed': 'warranty_completed',
      'sla_warning': null,
      'sla_expired': null
    };
    return mapping[warrantyType];
  }

  /**
   * Handle start of analysis
   */
  private onStartAnalysis(_request: WarrantyRequestFlow): void {
    // Start SLA timer for analysis phase
  }

  /**
   * Handle inspection scheduled
   */
  private onInspectionScheduled(_request: WarrantyRequestFlow): void {
    // Could send calendar invite, reminder notifications, etc.
  }

  /**
   * Handle inspection completed
   */
  private onInspectionCompleted(request: WarrantyRequestFlow): void {
    // Notify admin to make decision
    this.notifyAdminForDecision(request);
  }

  /**
   * Handle warranty approved
   */
  private onApproved(_request: WarrantyRequestFlow): void {
    // Start execution SLA timer
  }

  /**
   * Handle warranty rejected
   */
  private onRejected(_request: WarrantyRequestFlow): void {
    // Final state - no further actions needed
  }

  /**
   * Handle execution started
   */
  private onExecutionStarted(request: WarrantyRequestFlow): void {
    console.log('[WarrantyAutomation] Execution started for:', request.id);
    // Start execution SLA timer
  }

  /**
   * Handle warranty completed
   */
  private onCompleted(request: WarrantyRequestFlow): void {
    console.log('[WarrantyAutomation] Warranty completed:', request.id);
    // Final state - send satisfaction survey, update statistics, etc.
  }

  /**
   * Notify admin that a decision is needed
   */
  private notifyAdminForDecision(request: WarrantyRequestFlow): void {
    // In a real implementation, this would notify admins
    console.log('[WarrantyAutomation] Admin notification: Decision needed for', request.id);
  }

  /**
   * Check and process SLA warnings
   * Should be called periodically (e.g., every hour)
   */
  async checkSLAWarnings(): Promise<void> {
    const allRequests = await warrantyFlowService.getAllRequests();
    const warnings = warrantySLAService.checkSLAWarnings(allRequests);
    const expired = warrantySLAService.checkExpiredSLAs(allRequests);

    warnings.forEach(_request => {
      // Create admin notification for SLA warning
    });

    expired.forEach(request => {
      // Update request SLA status if not already marked
      if (request.slaStatus !== 'expired') {
        // Create notifications for both admin and client
      }
    });
  }

  /**
   * Handle Kanban drag-and-drop
   */
  async onKanbanDrop(
    requestId: string,
    fromStage: WarrantyStage,
    toStage: WarrantyStage,
    movedBy: string
  ): Promise<{ success: boolean; error?: string }> {

    // Special case: if moving to 'inspection_scheduled', this is usually triggered by a form,
    // but if dragged here, we might need extra handling or just prevent it if data is missing.
    
    // Use flow service to change status (includes validation)
    const result = await warrantyFlowService.changeStatus(
      requestId,
      toStage,
      movedBy,
      false, // Not automatic
      `Movido via Kanban de ${fromStage} para ${toStage}`,
      'admin'
    );

    if (result.success && result.request) {
      // Trigger automation for the status change
      await this.onStatusChange(requestId, fromStage, toStage, movedBy, false);
      
      // Auto-assign task if moving to execution and no responsible yet
      if (toStage === 'in_execution' && !result.request.assignedTo) {
        // Logic for auto-assignment could be implemented here
      }
    }


    return { success: result.success, error: result.error };
  }

  /**
   * Schedule inspection with automation
   */
  async scheduleInspection(
    requestId: string,
    inspectionDate: Date,
    technicianId: string,
    technicianName: string,
    scheduledBy: string
  ): Promise<{ success: boolean; error?: string }> {
    const request = await warrantyFlowService.getRequest(requestId);
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    const result = await warrantyFlowService.scheduleInspection(
      requestId,
      inspectionDate,
      technicianId,
      technicianName,
      scheduledBy
    );

    if (result.success && result.request) {
      await this.onStatusChange(
        requestId,
        request.currentStage,
        'inspection_scheduled',
        scheduledBy,
        false
      );
    }

    return { success: result.success, error: result.error };
  }

  /**
   * Complete inspection with automation
   */
  async completeInspection(
    requestId: string,
    notes: string,
    completedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    const request = await warrantyFlowService.getRequest(requestId);
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    const result = await warrantyFlowService.completeInspection(requestId, notes, completedBy);

    if (result.success && result.request) {
      await this.onStatusChange(
        requestId,
        request.currentStage,
        'inspection_completed',
        completedBy,
        false
      );
    }

    return { success: result.success, error: result.error };
  }

  /**
   * Approve warranty with automation
   */
  async approveWarranty(
    requestId: string,
    notes: string,
    approvedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    const request = await warrantyFlowService.getRequest(requestId);
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    const result = await warrantyFlowService.approveWarranty(requestId, notes, approvedBy);

    if (result.success && result.request) {
      await this.onStatusChange(
        requestId,
        request.currentStage,
        'approved',
        approvedBy,
        false
      );
    }

    return { success: result.success, error: result.error };
  }

  /**
   * Reject warranty with automation
   */
  async rejectWarranty(
    requestId: string,
    reason: string,
    rejectedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    const request = await warrantyFlowService.getRequest(requestId);
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    const result = await warrantyFlowService.rejectWarranty(requestId, reason, rejectedBy);

    if (result.success && result.request) {
      await this.onStatusChange(
        requestId,
        request.currentStage,
        'rejected',
        rejectedBy,
        false
      );
    }

    return { success: result.success, error: result.error };
  }

  /**
   * Start execution with automation
   */
  async startExecution(
    requestId: string,
    notes: string,
    startedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    const request = await warrantyFlowService.getRequest(requestId);
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    const result = await warrantyFlowService.startExecution(requestId, notes, startedBy);

    if (result.success && result.request) {
      await this.onStatusChange(
        requestId,
        request.currentStage,
        'in_execution',
        startedBy,
        false
      );
    }

    return { success: result.success, error: result.error };
  }

  /**
   * Complete warranty with automation
   */
  async completeWarranty(
    requestId: string,
    notes: string,
    completedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    const request = await warrantyFlowService.getRequest(requestId);
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    const result = await warrantyFlowService.completeWarranty(requestId, notes, completedBy);

    if (result.success && result.request) {
      await this.onStatusChange(
        requestId,
        request.currentStage,
        'completed',
        completedBy,
        false
      );
    }

    return { success: result.success, error: result.error };
  }
}

export const warrantyAutomationService = new WarrantyAutomationService();
