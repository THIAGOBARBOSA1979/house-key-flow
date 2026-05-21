import { describe, it, expect, beforeEach, vi } from 'vitest';
import { warrantyFlowService } from '../warranty/WarrantyFlowService';

describe('WarrantyFlowService', () => {
  it('should create a new request with correct initial state', async () => {
    const request = await warrantyFlowService.createRequest({ 
      title: 'Base Test', 
      category: 'Elétrica',
      clientId: 'c1',
      clientName: 'Client 1'
    });
    
    const found = await warrantyFlowService.getRequest(request.id);
    expect(found?.title).toBe('Base Test');
    expect(found?.currentStage).toBe('opened');
  });

  it('should validate status transitions', async () => {
    const request = await warrantyFlowService.createRequest({ 
      title: 'Transition Test', 
      category: 'Elétrica' 
    });
    
    const result = await warrantyFlowService.changeStatus(request.id, 'in_analysis', 'admin-1');
    expect(result.success).toBe(true);
    expect(result.request?.currentStage).toBe('in_analysis');
  });

  it('should prevent completion with unresolved problems', async () => {
    const req = await warrantyFlowService.createRequest({ 
      title: 'Problems Test',
      category: 'Elétrica',
      problems: [{ id: 'p-test', category: 'Test', description: 'Problem', status: 'pending', location: 'X', severity: 'minor', photos: [] }]
    });
    
    const id = req.id;

    // Step through the flow
    await warrantyFlowService.changeStatus(id, 'in_analysis', 'admin-1');
    await warrantyFlowService.update(id, { assignedTo: 'tech-1', assignedToName: 'Tech 1' });
    await warrantyFlowService.changeStatus(id, 'inspection_scheduled', 'admin-1');
    await warrantyFlowService.changeStatus(id, 'inspection_completed', 'admin-1', false, 'Done');
    await warrantyFlowService.changeStatus(id, 'approved', 'admin-1', false, 'Approved');
    
    const result = await warrantyFlowService.changeStatus(id, 'completed', 'admin-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('itens pendentes');
  });
});
