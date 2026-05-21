import { describe, it, expect, beforeEach, vi } from 'vitest';
import { inspectionService } from '../operations/InspectionService';
import { checklistService } from '../operations/ChecklistService';

describe('Integration: Inspection and Delivery Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset internal state
    (inspectionService as any).items = [];
    (checklistService as any).items = [];
    (checklistService as any).executions = [];
  });

  it('should handle full inspection lifecycle with checklist execution', async () => {
    // 1. Setup a checklist template
    const template = await checklistService.createTemplate({
      title: 'Vistoria de Entrega',
      description: 'Checklist para entrega de chaves',
      category: 'entrega',
      groups: [
        {
          id: 'g1',
          name: 'Área Interna',
          items: [
            { id: 'i1', description: 'Pintura', status: 'pending' },
            { id: 'i2', description: 'Instalações Elétricas', status: 'pending' }
          ]
        }
      ]
    });

    expect(template.id).toBeDefined();

    // 2. Schedule an inspection using that checklist
    const inspection = await inspectionService.schedule({
      date: new Date(),
      time: '10:00',
      inspectionType: 'technicalInspection',
      technician: 'tech-1',
      checklist: template.id,
      notes: 'Primeira vistoria'
    }, {
      property: 'Residencial Vida',
      unit: '202',
      client: 'Maria Souza'
    });

    expect(inspection.checklistId).toBe(template.id);
    expect(inspection.status).toBe('pending');


    // 3. Perform the inspection (log checklist execution)
    const executedGroups = [
      {
        id: 'g1',
        name: 'Área Interna',
        items: [
          { id: 'i1', description: 'Pintura', status: 'ok' as const },
          { id: 'i2', description: 'Instalações Elétricas', status: 'ok' as const }
        ]
      }
    ];

    const execution = checklistService.logExecution(
      template.id,
      executedGroups as any,
      'Tudo em ordem na vistoria técnica.',
      'Carlos Técnico'
    );

    expect(execution.templateId).toBe(template.id);
    expect(checklistService.getAllExecutions()).toHaveLength(1);

    // 4. Update inspection status to completed
    const updated = await inspectionService.updateStatus(inspection.id, 'completed', 'Vistoria finalizada com sucesso.');
    expect(updated?.status).toBe('completed');

    // 5. Client signs acceptance
    const signed = await inspectionService.signAcceptance(inspection.id, 'client- Maria', { data: 'sig-data' });
    expect(signed?.status).toBe('accepted');

  });

  it('should handle rescheduling requests', async () => {
    const inspection = await inspectionService.schedule({
      date: new Date(),
      time: '14:00',
      inspectionType: 'delivery',
      technician: 'tech-2'
    });

    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 2);
    
    const rescheduled = await inspectionService.requestReschedule(
      inspection.id, 
      'client-1', 
      newDate, 
      '16:00', 
      'Mudança de planos'
    );

    expect(rescheduled?.status).toBe('reschedule_requested');
    expect(rescheduled?.time).toBe('16:00');
  });

});
