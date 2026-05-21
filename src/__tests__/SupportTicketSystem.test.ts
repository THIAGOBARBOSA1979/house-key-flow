
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supportService } from '@/services/operations/SupportService';

describe('Support Ticket System (Triagem)', () => {
  beforeEach(() => {
    localStorage.clear();
    supportService.clearAllData();
    vi.clearAllMocks();
  });

  it('should open a new technical ticket with SLA correctly', async () => {
    const ticket = await supportService.createTicket(
      'client-123',
      'Roberto Justos',
      {
        subject: 'Infiltração no teto',
        message: 'Identificada umidade excessiva na suíte master.',
        priority: 'high',
        category: 'technical'
      },
      {
        propertyName: 'Edifício Infinity',
        unitNumber: '1501'
      }
    );


    expect(ticket.status).toBe('pending');
    expect(ticket.priority).toBe('high');
    expect(ticket.category).toBe('technical');
    expect(ticket.slaDeadline).toBeDefined();
    expect(ticket.unitNumber).toBe('1501');
  });

  it('should transition ticket status and update SLA state', async () => {
    const ticket = await supportService.createTicket('c1', 'Client 1', { subject: 'Test', message: 'Initial message' });
    
    // Admin responds -> transitions to waiting_client
    await supportService.addMessageToTicket(ticket.id, 'admin-1', 'Admin', 'admin', 'Favor anexar fotos');
    
    const updated = await supportService.getById(ticket.id);
    expect(updated?.status).toBe('waiting_client');
    
    // Client responds -> transitions back to in_progress
    await supportService.addMessageToTicket(ticket.id, 'c1', 'Client 1', 'client', 'Fotos anexadas');

    
    const final = await supportService.getById(ticket.id);
    expect(final?.status).toBe('in_progress');
  });

  it('should filter tickets by status correctly for screening', async () => {
    await supportService.createTicket('c1', 'Client 1', { subject: 'P1', message: 'M1' });
    const t2 = await supportService.createTicket('c2', 'Client 2', { subject: 'P2', message: 'M2' });
    await supportService.updateTicketStatus(t2.id, 'closed');


    const all = supportService.getAllTickets();
    const pending = all.filter(t => t.status === 'pending');
    const closed = all.filter(t => t.status === 'closed');

    expect(pending).toHaveLength(1);
    expect(closed).toHaveLength(1);
  });
});
