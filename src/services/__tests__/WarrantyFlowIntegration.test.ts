import { describe, it, expect, beforeEach, vi } from 'vitest';
import { warrantyFlowService } from '../WarrantyFlowService';
import { WarrantyRequestFlow, WARRANTY_STAGES } from '../../types/warrantyFlow';

describe('Warranty Flow E2E Integration Tests', () => {
  let requestId: string;

  beforeEach(() => {
    // Create a fresh request for each test
    const newRequest = warrantyFlowService.createRequest({
      title: 'E2E Flow Test',
      category: 'Estrutural',
      clientId: 'client-test',
      clientName: 'Test Client',
      propertyId: 'prop-1',
      propertyName: 'Test Property',
      unitNumber: '101'
    });
    requestId = newRequest.id;
  });

  it('should handle full positive flow: opening -> analysis -> inspection -> execution -> completion', () => {
    // 1. Initial State
    let request = warrantyFlowService.getRequest(requestId)!;
    expect(request.currentStage).toBe('opened');
    expect(request.history).toHaveLength(1);
    expect(request.history[0].toStatus).toBe('opened');

    // 2. Start Analysis
    let result = warrantyFlowService.changeStatus(requestId, 'in_analysis', 'admin-1');
    expect(result.success).toBe(true);
    request = warrantyFlowService.getRequest(requestId)!;
    expect(request.currentStage).toBe('in_analysis');

    // 3. Schedule Inspection (requires technician)
    // First assign technician to satisfy rule
    warrantyFlowService.assignTechnician(requestId, 'tech-1', 'Carlos Técnico', 'admin-1');
    
    result = warrantyFlowService.scheduleInspection(
      requestId,
      new Date(Date.now() + 86400000), // Tomorrow
      'tech-1',
      'Carlos Técnico',
      'admin-1'
    );
    expect(result.success).toBe(true);
    request = warrantyFlowService.getRequest(requestId)!;

    expect(request.currentStage).toBe('inspection_scheduled');
    expect(request.assignedTo).toBe('tech-1');
    expect(request.inspectionDate).toBeDefined();

    // 4. Complete Inspection
    result = warrantyFlowService.completeInspection(requestId, 'Inspection details OK', 'admin-1');
    expect(result.success).toBe(true);
    request = warrantyFlowService.getRequest(requestId)!;
    expect(request.currentStage).toBe('inspection_completed');
    expect(request.inspectionNotes).toBe('Inspection details OK');

    // 5. Approve Warranty
    result = warrantyFlowService.approveWarranty(requestId, 'Approval notes', 'admin-1');
    expect(result.success).toBe(true);
    request = warrantyFlowService.getRequest(requestId)!;
    expect(request.currentStage).toBe('approved');
    expect(request.approvalNotes).toBe('Approval notes');

    // 6. Start Execution (requires internal notes if not provided in changeStatus)
    result = warrantyFlowService.startExecution(requestId, 'Starting repairs now', 'admin-1');
    expect(result.success).toBe(true);
    request = warrantyFlowService.getRequest(requestId)!;
    expect(request.currentStage).toBe('in_execution');
    expect(request.executionNotes).toBe('Starting repairs now');

    // 7. Complete Warranty
    result = warrantyFlowService.completeWarranty(requestId, 'All done', 'admin-1');
    expect(result.success).toBe(true);
    request = warrantyFlowService.getRequest(requestId)!;
    expect(request.currentStage).toBe('completed');
    expect(request.completionNotes).toBe('All done');
    expect(request.history).toHaveLength(7);
  });

  it('should handle cancellation/rejection and reopening', () => {
    // 1. Move to analysis
    warrantyFlowService.changeStatus(requestId, 'in_analysis', 'admin-1');
    
    // 2. Reject warranty
    const result = warrantyFlowService.rejectWarranty(requestId, 'Not covered by warranty', 'admin-1');
    expect(result.success).toBe(true);
    
    let request = warrantyFlowService.getRequest(requestId)!;
    expect(request.currentStage).toBe('rejected');
    expect(request.rejectionReason).toBe('Not covered by warranty');

    // 3. Reopen (Final stage to in_analysis)
    const reopenResult = warrantyFlowService.changeStatus(requestId, 'in_analysis', 'admin-1', false, 'Reopening for review');
    expect(reopenResult.success).toBe(true);
    
    request = warrantyFlowService.getRequest(requestId)!;
    expect(request.currentStage).toBe('in_analysis');
    expect(request.history[request.history.length - 1].notes).toBe('Reopening for review');
  });

  it('should validate business rules and prevent invalid jumps', () => {
    // Try to jump from opened to completed
    const result = warrantyFlowService.changeStatus(requestId, 'completed', 'admin-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Transição inválida');

    // Try to schedule inspection without technician assigned
    // changeStatus directly to inspection_scheduled should fail if no assignedTo
    const result2 = warrantyFlowService.changeStatus(requestId, 'inspection_scheduled', 'admin-1');
    expect(result2.success).toBe(false);
    expect(result2.error).toContain('atribuir um responsável');
  });

  it('should track SLA and status history correctly during transitions', () => {
    const request = warrantyFlowService.getRequest(requestId)!;
    const initialDeadline = request.slaDeadline;
    
    // Move through stages and check history record accuracy
    warrantyFlowService.changeStatus(requestId, 'in_analysis', 'admin-1', false, 'Analysis notes');
    
    const updatedRequest = warrantyFlowService.getRequest(requestId)!;
    expect(updatedRequest.history).toHaveLength(2);
    
    const latestHistory = updatedRequest.history[1];
    expect(latestHistory.fromStatus).toBe('opened');
    expect(latestHistory.toStatus).toBe('in_analysis');
    expect(latestHistory.changedBy).toBe('admin-1');
    expect(latestHistory.notes).toBe('Analysis notes');
    
    // Check that SLA deadline was updated for new stage
    expect(updatedRequest.slaDeadline.getTime()).not.toBe(initialDeadline.getTime());
  });
});
