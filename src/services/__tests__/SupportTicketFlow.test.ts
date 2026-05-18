import { describe, it, expect, beforeEach } from 'vitest';
import { supportService } from '../operations/SupportService';

describe('Integration: Support Ticket Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    (supportService as any).items = [];
  });

  it('should create a ticket and handle message exchange', () => {
    // 1. Client creates a ticket
    const ticket = supportService.createTicket('client-123', 'Roberto Oliveira', {
      subject: 'Problema com infiltração',
      category: 'technical',
      priority: 'high',
      message: 'Identifiquei uma infiltração na parede da sala.'
    });

    expect(ticket.id).toBeDefined();
    expect(ticket.status).toBe('pending');
    expect(ticket.messages).toHaveLength(1);
    expect(ticket.messages[0].text).toContain('infiltração');

    // 2. Admin responds and changes status
    supportService.updateTicketStatus(ticket.id, 'in_progress');
    supportService.addMessageToTicket(
      ticket.id, 
      'admin-1', 
      'Suporte Técnico', 
      'admin', 
      'Recebemos seu chamado. Um técnico entrará em contato em breve.'
    );

    const updatedTicket = supportService.getTicketById(ticket.id);
    expect(updatedTicket?.status).toBe('in_progress');
    expect(updatedTicket?.messages).toHaveLength(2);
    expect(updatedTicket?.messages[1].role).toBe('admin');

    // 3. Client replies
    supportService.addMessageToTicket(
      ticket.id,
      'client-123',
      'Roberto Oliveira',
      'client',
      'Obrigado pelo retorno rápido.'
    );

    expect(supportService.getTicketById(ticket.id)?.messages).toHaveLength(3);

    // 4. Admin closes ticket
    supportService.updateTicketStatus(ticket.id, 'closed');
    expect(supportService.getTicketById(ticket.id)?.status).toBe('closed');
  });

  it('should filter tickets by client', () => {
    supportService.createTicket('c1', 'Client 1', { subject: 'T1', message: 'M1' });
    supportService.createTicket('c2', 'Client 2', { subject: 'T2', message: 'M2' });
    supportService.createTicket('c1', 'Client 1', { subject: 'T3', message: 'M3' });

    const c1Tickets = supportService.getTicketsByClient('c1');
    expect(c1Tickets).toHaveLength(2);
  });
});
