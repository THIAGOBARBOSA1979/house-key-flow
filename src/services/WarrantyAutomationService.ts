
import { 
  WarrantyStage, 
  WarrantyNotificationType,
  WARRANTY_NOTIFICATION_TEMPLATES,
  WarrantyRequestFlow
} from '@/types/warrantyFlow';
import { warrantyFlowService } from './WarrantyFlowService';
import { warrantySLAService } from './WarrantySLAService';
import { notificationService } from './NotificationService';
import { NotificationType } from '@/types/clientFlow';

/**
 * Service for handling warranty-related automations
 * Triggers notifications, updates, and side effects based on warranty events
 */
class WarrantyAutomationService {
  /**
   * Handle status change event
   */
  onStatusChange(
    requestId: string,
    oldStatus: WarrantyStage,
    newStatus: WarrantyStage,
    changedBy: string,
    isAutomatic: boolean = false
  ): void {
    const request = warrantyFlowService.getRequest(requestId);
    if (!request) {
      console.error('[WarrantyAutomation] Request not found:', requestId);
      return;
    }

    console.log('[WarrantyAutomation] Status changed:', {
      requestId,
      from: oldStatus,
      to: newStatus,
      changedBy,
      isAutomatic
    });

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

    console.log('[WarrantyAutomation] Notification created:', {
      clientId: request.clientId,
      type: notificationType,
      requestId: request.id
    });
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
  private onStartAnalysis(request: WarrantyRequestFlow): void {
    console.log('[WarrantyAutomation] Analysis started for:', request.id);
    // Start SLA timer for analysis phase
  }

  /**
   * Handle inspection scheduled
   */
  private onInspectionScheduled(request: WarrantyRequestFlow): void {
    console.log('[WarrantyAutomation] Inspection scheduled for:', request.id);
    // Could send calendar invite, reminder notifications, etc.
  }

  /**
   * Handle inspection completed
   */
  private onInspectionCompleted(request: WarrantyRequestFlow): void {
    console.log('[WarrantyAutomation] Inspection completed for:', request.id);
    // Notify admin to make decision
    this.notifyAdminForDecision(request);
  }

  /**
   * Handle warranty approved
   */
  private onApproved(request: WarrantyRequestFlow): void {
    console.log('[WarrantyAutomation] Warranty approved:', request.id);
    // Start execution SLA timer
  }

  /**
   * Handle warranty rejected
   */
  private onRejected(request: WarrantyRequestFlow): void {
    console.log('[WarrantyAutomation] Warranty rejected:', request.id);
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
  checkSLAWarnings(): void {
    const allRequests = warrantyFlowService.getAllRequests();
    const warnings = warrantySLAService.checkSLAWarnings(allRequests);
    const expired = warrantySLAService.checkExpiredSLAs(allRequests);

    warnings.forEach(request => {
      console.log('[WarrantyAutomation] SLA Warning for:', request.id);
      // Create admin notification for SLA warning
    });

    expired.forEach(request => {
      // Update request SLA status if not already marked
      if (request.slaStatus !== 'expired') {
        console.log('[WarrantyAutomation] SLA Expired for:', request.id);
        // Create notifications for both admin and client
      }
    });
  }

  /**
   * Handle Kanban drag-and-drop
   */
  onKanbanDrop(
    requestId: string,
    fromStage: WarrantyStage,
    toStage: WarrantyStage,
    movedBy: string
  ): { success: boolean; error?: string } {
    console.log('[WarrantyAutomation] Kanban drop:', {
      requestId,
      from: fromStage,
      to: toStage,
      movedBy
    });

    // Use flow service to change status (includes validation)
    const result = warrantyFlowService.changeStatus(
      requestId,
      toStage,
      movedBy,
      false, // Not automatic
      `Movido via Kanban de ${fromStage} para ${toStage}`
    );

    if (result.success && result.request) {
      // Trigger automation for the status change
      this.onStatusChange(requestId, fromStage, toStage, movedBy, false);
    }

    return { success: result.success, error: result.error };
  }

  /**
   * Schedule inspection with automation
   */
  scheduleInspection(
    requestId: string,
    inspectionDate: Date,
    technicianId: string,
    technicianName: string,
    scheduledBy: string
  ): { success: boolean; error?: string } {
    const request = warrantyFlowService.getRequest(requestId);
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    const result = warrantyFlowService.scheduleInspection(
      requestId,
      inspectionDate,
      technicianId,
      technicianName,
      scheduledBy
    );

    if (result.success && result.request) {
      this.onStatusChange(
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
  completeInspection(
    requestId: string,
    notes: string,
    completedBy: string
  ): { success: boolean; error?: string } {
    const request = warrantyFlowService.getRequest(requestId);
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    const result = warrantyFlowService.completeInspection(requestId, notes, completedBy);

    if (result.success && result.request) {
      this.onStatusChange(
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
  approveWarranty(
    requestId: string,
    notes: string,
    approvedBy: string
  ): { success: boolean; error?: string } {
    const request = warrantyFlowService.getRequest(requestId);
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    const result = warrantyFlowService.approveWarranty(requestId, notes, approvedBy);

    if (result.success && result.request) {
      this.onStatusChange(
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
  rejectWarranty(
    requestId: string,
    reason: string,
    rejectedBy: string
  ): { success: boolean; error?: string } {
    const request = warrantyFlowService.getRequest(requestId);
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    const result = warrantyFlowService.rejectWarranty(requestId, reason, rejectedBy);

    if (result.success && result.request) {
      this.onStatusChange(
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
  startExecution(
    requestId: string,
    notes: string,
    startedBy: string
  ): { success: boolean; error?: string } {
    const request = warrantyFlowService.getRequest(requestId);
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    const result = warrantyFlowService.startExecution(requestId, notes, startedBy);

    if (result.success && result.request) {
      this.onStatusChange(
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
  completeWarranty(
    requestId: string,
    notes: string,
    completedBy: string
  ): { success: boolean; error?: string } {
    const request = warrantyFlowService.getRequest(requestId);
    if (!request) {
      return { success: false, error: "Solicitação não encontrada" };
    }

    const result = warrantyFlowService.completeWarranty(requestId, notes, completedBy);

    if (result.success && result.request) {
      this.onStatusChange(
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
