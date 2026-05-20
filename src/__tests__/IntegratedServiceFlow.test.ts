
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supportService } from '@/services/operations/SupportService';
import { inspectionService } from '@/services/operations/InspectionService';
import { documentService } from '@/services/operations/DocumentService';
import { checklistService } from '@/services/operations/ChecklistService';

describe('Integrated Technical Flow (E2E Service Logic)', () => {
  beforeEach(() => {
    localStorage.clear();
    supportService.clearAllData();
    inspectionService.clearAllData();
    documentService.clearAllData();
    checklistService.clearAllData();
    vi.clearAllMocks();
  });

  it('should execute the full technical cycle from ticket to signature', async () => {
    // 1. Client opens a ticket
    const ticket = supportService.createTicket(
      'user-1', 
      'João Client', 
      { subject: 'Vazamento', message: 'Urgente', priority: 'high', category: 'technical' },
      { propertyId: 'prop-1', propertyName: 'Edifício A', unitNumber: '101' }
    );
    expect(ticket.status).toBe('pending');

    // 2. Admin screens the ticket and schedules an inspection
    const inspection = inspectionService.schedule({
      date: new Date(),
      time: '09:00',
      inspectionType: 'technical',
      technician: 'tech-1',
      requestId: ticket.id
    }, {
      property: ticket.propertyName || '',
      unit: ticket.unitNumber || '',
      client: ticket.clientName
    });
    
    expect(inspection.requestId).toBe(ticket.id);
    expect(inspection.status).toBe('pending');

    // 3. Technician completes the inspection checklist
    inspectionService.update(inspection.id, {
      status: 'complete',
      conformityScore: 95,
      notes: 'Reparo simples efetuado no local.'
    });

    // 4. System/Admin generates a technical report (Document)
    const report = documentService.createDocument({
      title: `Relatório Técnico - Unidade ${inspection.unit}`,
      category: 'relatorio',
      associatedTo: { 
        client: inspection.client, 
        property: inspection.property, 
        unit: inspection.unit 
      },
      status: 'published'
    });

    expect(report.category).toBe('relatorio');

    // 5. Digital signature flow
    const clientSigner = documentService.addSigner(report.id, {
      name: inspection.client,
      email: 'joao@client.com',
      role: 'Client',
      confirmationMethod: 'email'
    });

    if (clientSigner) {
      const signed = documentService.signDocument(report.id, clientSigner.id);
      expect(signed).toBe(true);
      
      const finalDoc = documentService.getById(report.id);
      expect(finalDoc?.isSigned).toBe(true);
      expect(finalDoc?.signatures?.[0].status).toBe('signed');
    }

    // 6. Close the original ticket
    supportService.updateTicketStatus(ticket.id, 'closed');
    const finalTicket = supportService.getById(ticket.id);
    expect(finalTicket?.status).toBe('closed');
  });
});
