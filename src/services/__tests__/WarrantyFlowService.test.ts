import { describe, it, expect, vi } from 'vitest';
import { warrantyFlowService } from '../WarrantyFlowService';
import { WarrantyStage } from '../../types/warrantyFlow';

describe('WarrantyFlowService', () => {
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
    expect(request.history[0].toStatus).toBe('opened');
  });

  it('should validate status transitions', () => {
    const request = warrantyFlowService.createRequest({ title: 'Transition Test' });
    
    // Valid transition: opened -> in_analysis
    const result = warrantyFlowService.changeStatus(request.id, 'in_analysis', 'admin-1');
    expect(result.success).toBe(true);
    
    // Invalid transition: opened -> completed (skipped stages rule might apply, but let's test specific logic)
    // Actually, isValidTransition determines this.
    const invalidResult = warrantyFlowService.changeStatus(request.id, 'completed', 'admin-1');
    // completed requires approved first in most flows
    expect(invalidResult.success).toBe(false);
  });

  it('should prevent completion with unresolved problems', () => {
    const request = warrantyFlowService.createRequest({ 
      title: 'Problems Test',
      problems: [{ id: 'p1', category: 'Test', description: 'Problem', status: 'pending', location: 'X', severity: 'minor' }]
    });
    
    // Move to approved first (needed to reach completed eventually)
    warrantyFlowService.changeStatus(request.id, 'in_analysis', 'admin-1');
    warrantyFlowService.changeStatus(request.id, 'approved', 'admin-1', false, 'Approved');
    
    const result = warrantyFlowService.changeStatus(request.id, 'completed', 'admin-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('itens pendentes');
  });
});
