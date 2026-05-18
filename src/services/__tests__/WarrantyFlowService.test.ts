import { describe, it, expect, beforeEach } from 'vitest';
import { warrantyFlowService } from '../WarrantyFlowService';

describe('WarrantyFlowService', () => {
  beforeEach(() => {
    // Clear localStorage to isolate tests if needed
    localStorage.clear();
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
    expect(request.history).toHaveLength(1);
  });

  it('should validate status transitions', () => {
    const request = warrantyFlowService.createRequest({ title: 'Transition Test' });
    
    // Valid transition: opened -> in_analysis
    const result = warrantyFlowService.changeStatus(request.id, 'in_analysis', 'admin-1');
    expect(result.success).toBe(true);
  });

  it('should prevent completion with unresolved problems', () => {
    // We must ensure the request is created and found
    const request = warrantyFlowService.createRequest({ 
      title: 'Problems Test',
      category: 'Elétrica',
      problems: [{ id: 'p1', category: 'Test', description: 'Problem', status: 'pending', location: 'X', severity: 'minor', photos: [] }]
    });
    
    // In our mock service, reaching "completed" might require specific steps
    // opened -> in_analysis
    warrantyFlowService.changeStatus(request.id, 'in_analysis', 'admin-1');
    
    // inspection_scheduled (needs technician)
    warrantyFlowService.update(request.id, { assignedTo: 'tech-1', assignedToName: 'Tech 1' });
    warrantyFlowService.changeStatus(request.id, 'inspection_scheduled', 'admin-1');
    
    // inspection_completed
    warrantyFlowService.changeStatus(request.id, 'inspection_completed', 'admin-1');

    // approved
    warrantyFlowService.changeStatus(request.id, 'approved', 'admin-1', false, 'Approved');
    
    const result = warrantyFlowService.changeStatus(request.id, 'completed', 'admin-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('itens pendentes');
  });
});

