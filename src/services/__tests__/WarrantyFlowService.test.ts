import { describe, it, expect, beforeEach } from 'vitest';
import { warrantyFlowService } from '../WarrantyFlowService';

describe('WarrantyFlowService', () => {
  beforeEach(() => {
    // Clear the internal state of the service for tests
    // Since it's a singleton, we might need a reset method or just work with new IDs
  });

  it('should create a new request with correct initial state', () => {
    const data = {
      title: 'Test Request',
      category: 'Elétrica',
      clientId: 'c1',
      clientName: 'Client 1'
    };
    const request = warrantyFlowService.createRequest(data);
    
    expect(request.title).toBe(data.title);
    expect(request.currentStage).toBe('opened');
  });

  it('should validate status transitions', () => {
    const request = warrantyFlowService.createRequest({ title: 'Transition Test', category: 'Elétrica' });
    
    // Valid transition: opened -> in_analysis
    const result = warrantyFlowService.changeStatus(request.id, 'in_analysis', 'admin-1');
    expect(result.success).toBe(true);
  });

  it('should prevent completion with unresolved problems', () => {
    const request = warrantyFlowService.createRequest({ 
      title: 'Problems Test',
      category: 'Elétrica',
      problems: [{ id: 'p1', category: 'Test', description: 'Problem', status: 'pending', location: 'X', severity: 'minor', photos: [] }]
    });
    
    // Step through the flow
    warrantyFlowService.changeStatus(request.id, 'in_analysis', 'admin-1');
    
    // Set technician for stages that require it
    warrantyFlowService.update(request.id, { assignedTo: 'tech-1', assignedToName: 'Tech 1' });
    
    warrantyFlowService.changeStatus(request.id, 'inspection_scheduled', 'admin-1');
    warrantyFlowService.changeStatus(request.id, 'inspection_completed', 'admin-1', false, 'Done');
    warrantyFlowService.changeStatus(request.id, 'approved', 'admin-1', false, 'Approved');
    
    // Should fail because problem is still 'pending'
    const result = warrantyFlowService.changeStatus(request.id, 'completed', 'admin-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('itens pendentes');
  });
});


