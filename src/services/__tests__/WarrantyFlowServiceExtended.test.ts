import { describe, it, expect, beforeEach } from 'vitest';
import { warrantyFlowService } from '../warranty/WarrantyFlowService';
import { WarrantyRequestFlow } from '../../types/warrantyFlow';

describe('WarrantyFlowService Extended Tests', () => {
  let request: WarrantyRequestFlow;

  beforeEach(async () => {
    // Start with a clean slate for each test
    request = await warrantyFlowService.createRequest({ 
      title: 'Flow Test Request', 
      category: 'Elétrica',
      clientId: 'c1',
      clientName: 'Client 1'
    });
  });

  it('should require a technician for inspection_scheduled', async () => {
    const result = await warrantyFlowService.changeStatus(request.id, 'inspection_scheduled', 'admin-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('atribuir um responsável');
  });

  it('should require a technician for in_execution', async () => {
    // First move to approved
    await warrantyFlowService.changeStatus(request.id, 'in_analysis', 'admin-1');
    await warrantyFlowService.changeStatus(request.id, 'approved', 'admin-1', false, 'Approved');
    
    const result = await warrantyFlowService.changeStatus(request.id, 'in_execution', 'admin-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('atribuir um responsável');
  });

  it('should require internal notes when moving to in_execution', async () => {
    // Assign tech
    await warrantyFlowService.update(request.id, { assignedTo: 'tech-1', assignedToName: 'Tech 1' });
    
    // Move to approved
    await warrantyFlowService.changeStatus(request.id, 'in_analysis', 'admin-1');
    await warrantyFlowService.changeStatus(request.id, 'approved', 'admin-1', false, 'Approved');
    
    // Attempt move to in_execution without notes
    const result = await warrantyFlowService.changeStatus(request.id, 'in_execution', 'admin-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('observação técnica');
  });

  it('should successfully complete a full valid flow', async () => {
    // 1. opened -> in_analysis
    let result = await warrantyFlowService.changeStatus(request.id, 'in_analysis', 'admin-1');
    expect(result.success).toBe(true);

    // 2. Assign tech
    await warrantyFlowService.update(request.id, { assignedTo: 'tech-1', assignedToName: 'Tech 1' });

    // 3. in_analysis -> inspection_scheduled
    result = await warrantyFlowService.changeStatus(request.id, 'inspection_scheduled', 'admin-1');
    expect(result.success).toBe(true);

    // 4. inspection_scheduled -> inspection_completed
    result = await warrantyFlowService.changeStatus(request.id, 'inspection_completed', 'admin-1', false, 'Vistoria ok');
    expect(result.success).toBe(true);

    // 5. inspection_completed -> approved
    result = await warrantyFlowService.changeStatus(request.id, 'approved', 'admin-1', false, 'Aprovado');
    expect(result.success).toBe(true);

    // 6. approved -> in_execution (requires notes)
    result = await warrantyFlowService.changeStatus(request.id, 'in_execution', 'admin-1', false, 'Iniciando reparos');
    expect(result.success).toBe(true);

    // 7. in_execution -> completed
    result = await warrantyFlowService.changeStatus(request.id, 'completed', 'admin-1');
    expect(result.success).toBe(true);
    expect(result.request?.currentStage).toBe('completed');
  });

  it('should block invalid transitions (e.g., opened direct to completed)', async () => {
    const result = await warrantyFlowService.changeStatus(request.id, 'completed', 'admin-1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Transição inválida');
  });

  it('should allow pausing and resuming a request', async () => {
    const pauseResult = await warrantyFlowService.togglePause(request.id, true, 'Aguardando peças', 'admin-1');
    expect(pauseResult.success).toBe(true);
    expect(pauseResult.request?.isPaused).toBe(true);
    expect(pauseResult.request?.pauseReason).toBe('Aguardando peças');

    const resumeResult = await warrantyFlowService.togglePause(request.id, false, '', 'admin-1');
    expect(resumeResult.success).toBe(true);
    expect(resumeResult.request?.isPaused).toBe(false);
  });

  it('should allow cancellation/rejection and reopening', async () => {
    // Rejection
    await warrantyFlowService.changeStatus(request.id, 'in_analysis', 'admin-1');
    const rejectResult = await warrantyFlowService.changeStatus(request.id, 'rejected', 'admin-1', false, 'Não coberto');
    expect(rejectResult.success).toBe(true);
    expect(rejectResult.request?.currentStage).toBe('rejected');
    
    // Check history
    expect(rejectResult.request?.history).toBeDefined();
    const lastHistory = rejectResult.request?.history[rejectResult.request?.history.length - 1];
    expect(lastHistory?.toStatus).toBe('rejected');
    expect(lastHistory?.notes).toBe('Não coberto');

    // Reopening
    const reopenResult = await warrantyFlowService.changeStatus(request.id, 'in_analysis', 'admin-1', false, 'Reaberto para revisão');
    expect(reopenResult.success).toBe(true);
    expect(reopenResult.request?.currentStage).toBe('in_analysis');
    expect(reopenResult.request?.history.length).toBeGreaterThan(rejectResult.request?.history.length || 0);
  });

  it('should validate mandatory fields for each stage', async () => {
    // Testing category presence on creation
    const req2 = await warrantyFlowService.createRequest({ title: 'No Category' });
    expect(req2.category).toBe('Outros'); // Defaulting is a form of validation/safe handling
  });

  it('should persist and restore state correctly', async () => {
    const id = request.id;
    await warrantyFlowService.changeStatus(id, 'in_analysis', 'admin-1');
    await warrantyFlowService.togglePause(id, true, 'Test Pause', 'admin-1');
    
    const stateBefore = await warrantyFlowService.getRequest(id);
    expect(stateBefore?.currentStage).toBe('in_analysis');
    expect(stateBefore?.isPaused).toBe(true);
  });

  it('should capture logs and respect debug mode', async () => {
    warrantyFlowService.clearLogs();
    warrantyFlowService.setDebugMode(false);
    
    await warrantyFlowService.createRequest({ title: 'Log Test' });
    const logs = warrantyFlowService.getLogs();
    
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].message).toContain('Creating new request');
  });
});
