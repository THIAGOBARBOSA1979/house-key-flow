
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checklistService } from '@/services/operations/ChecklistService';
import { inspectionService } from '@/services/operations/InspectionService';

describe('Checklist & Inspection System', () => {
  beforeEach(() => {
    localStorage.clear();
    checklistService.clearAllData();
    inspectionService.clearAllData();
    vi.clearAllMocks();
  });

  it('should create and retrieve a checklist template', async () => {
    const templateData = {
      title: 'Vistoria ABNT NBR 15575',
      description: 'Checklist normatizado para entrega de chaves',
      category: 'vistoria',
      groups: [
        {
          id: 'g1',
          name: 'Áreas Úmidas',
          items: [
            { id: 'i1', name: 'Estanqueidade de box', abntReference: 'NBR 15575-6' }
          ]
        }
      ]
    };

    const template = await checklistService.createTemplate(templateData);
    expect(template.title).toBe(templateData.title);
    
    const retrieved = checklistService.getTemplateById(template.id);
    expect(retrieved?.groups).toHaveLength(1);
  });

  it('should calculate technical conformity score after inspection', async () => {
    const inspection = await inspectionService.schedule({
      date: new Date(),
      time: '10:00',
      inspectionType: 'technical',
      technician: 'tech-1',
      checklist: '1'
    }, {
      property: 'Residencial Alpha',
      unit: '202',
      client: 'Maria Souza'
    });

    // Simulate completion with 100% conformity
    await inspectionService.update(inspection.id, {
      status: 'complete',
      conformityScore: 100,
      nonConformitiesFound: 0
    });

    const stats = inspectionService.getTechnicalConformityScore();
    expect(stats).toBeGreaterThan(0);
  });


  it('should track non-conformities found during inspection', async () => {
     const inspection = await inspectionService.schedule({
      date: new Date(),
      time: '14:00',
      inspectionType: 'technical',
      technician: 'tech-1'
    });

    await inspectionService.update(inspection.id, {
      status: 'complete',
      conformityScore: 80,
      nonConformitiesFound: 2
    });

    const updated = inspectionService.getById(inspection.id);
    expect(updated?.nonConformitiesFound).toBe(2);
    expect(updated?.conformityScore).toBe(80);
  });

});
