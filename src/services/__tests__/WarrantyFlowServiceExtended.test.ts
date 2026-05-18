import { describe, it, expect, beforeEach } from 'vitest';
import { warrantyFlowService } from '../WarrantyFlowService';
import { WarrantyRequestFlow } from '../../types/warrantyFlow';

describe('WarrantyFlowService Extended Tests', () => {
  let request: WarrantyRequestFlow;

  beforeEach(() => {
    // Start with a clean slate for each test
    request = warrantyFlowService.createRequest({ 
      title: 'Flow Test Request', 
      category: 'Elétrica',
      clientId: 'c1',
      clientName: 'Client 1'
    });
  });

  it('should require a technician for inspection_scheduled', () => {
    const result = warrantyFlowService.changeStatus(request.id, 'inspection_scheduled', 'admin-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('atribuir um responsável');
  });

  it('should require a technician for in_execution', () => {
    // First move to approved
    warrantyFlowService.changeStatus(request.id, 'in_analysis', 'admin-1');
    warrantyFlowService.changeStatus(request.id, 'approved', 'admin-1', false, 'Approved');
    
    const result = warrantyFlowService.changeStatus(request.id, 'in_execution', 'admin-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('atribuir um responsável');
  });

  it('should require internal notes when moving to in_execution', () => {
    // Assign tech
    warrantyFlowService.update(request.id, { assignedTo: 'tech-1', assignedToName: 'Tech 1' });
    
    // Move to approved
    warrantyFlowService.changeStatus(request.id, 'in_analysis', 'admin-1');
    warrantyFlowService.changeStatus(request.id, 'approved', 'admin-1', false, 'Approved');
    
    // Attempt move to in_execution without notes
    const result = warrantyFlowService.changeStatus(request.id, 'in_execution', 'admin-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('observação técnica');
  });

  it('should successfully complete a full valid flow', () => {
    // 1. opened -> in_analysis
    let result = warrantyFlowService.changeStatus(request.id, 'in_analysis', 'admin-1');
    expect(result.success).toBe(true);

    // 2. Assign tech
    warrantyFlowService.update(request.id, { assignedTo: 'tech-1', assignedToName: 'Tech 1' });

    // 3. in_analysis -> inspection_scheduled
    result = warrantyFlowService.changeStatus(request.id, 'inspection_scheduled', 'admin-1');
    expect(result.success).toBe(true);

    // 4. inspection_scheduled -> inspection_completed
    result = warrantyFlowService.changeStatus(request.id, 'inspection_completed', 'admin-1', false, 'Vistoria ok');
    expect(result.success).toBe(true);

    // 5. inspection_completed -> approved
    result = warrantyFlowService.changeStatus(request.id, 'approved', 'admin-1', false, 'Aprovado');
    expect(result.success).toBe(true);

    // 6. approved -> in_execution (requires notes)
    result = warrantyFlowService.changeStatus(request.id, 'in_execution', 'admin-1', false, 'Iniciando reparos');
    expect(result.success).toBe(true);

    // 7. in_execution -> completed
    result = warrantyFlowService.changeStatus(request.id, 'completed', 'admin-1');
    expect(result.success).toBe(true);
    expect(result.request?.currentStage).toBe('completed');
  });

  it('should block invalid transitions (e.g., opened direct to completed)', () => {
    const result = warrantyFlowService.changeStatus(request.id, 'completed', 'admin-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Transição inválida');
  });

  it('should allow pausing and resuming a request', () => {
    const pauseResult = warrantyFlowService.togglePause(request.id, true, 'Aguardando peças', 'admin-1');
    expect(pauseResult.success).toBe(true);
    expect(pauseResult.request?.isPaused).toBe(true);
    expect(pauseResult.request?.pauseReason).toBe('Aguardando peças');

    const resumeResult = warrantyFlowService.togglePause(request.id, false, '', 'admin-1');
    expect(resumeResult.success).toBe(true);
    expect(resumeResult.request?.isPaused).toBe(false);
  });
});
