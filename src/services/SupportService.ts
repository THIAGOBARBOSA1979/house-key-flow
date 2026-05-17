export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'financial' | 'technical' | 'administrative' | 'warranty' | 'other';

export interface SupportTicket {
  id: string;
  clientId: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'closed';
  priority: TicketPriority;
  category: TicketCategory;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

class SupportService {
  private tickets: SupportTicket[] = [
    {
      id: 'ticket-1',
      clientId: 'client-1',
      subject: 'Dúvida sobre boleto',
      message: 'Não recebi o boleto deste mês por e-mail.',
      status: 'closed',
      priority: 'medium',
      category: 'financial',
      createdAt: new Date(2024, 3, 15),
      updatedAt: new Date(2024, 3, 16)
    }
  ];

  getTicketsByClient(clientId: string): SupportTicket[] {
    return this.tickets.filter(t => t.clientId === clientId);
  }

  getTicketById(id: string): SupportTicket | undefined {
    return this.tickets.find(t => t.id === id);
  }

  createTicket(clientId: string, data: { subject: string, message: string, priority?: TicketPriority, category?: TicketCategory, attachments?: string[] }): SupportTicket {
    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      clientId,
      subject: data.subject,
      message: data.message,
      status: 'pending',
      priority: data.priority || 'medium',
      category: data.category || 'other',
      attachments: data.attachments || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tickets.unshift(newTicket);
    return newTicket;
  }

  updateTicketStatus(ticketId: string, status: SupportTicket['status']): void {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date();
    }
  }

  addMessageToTicket(ticketId: string, message: string): void {
    const ticket = this.getTicketById(ticketId);
    if (ticket) {
      ticket.message += `\n\n[Nova Mensagem - ${new Date().toLocaleString('pt-BR')}]\n${message}`;
      ticket.updatedAt = new Date();
    }
  }
}

export const supportService = new SupportService();