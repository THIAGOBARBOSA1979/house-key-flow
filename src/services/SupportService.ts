
export interface SupportTicket {
  id: string;
  clientId: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'closed';
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
      createdAt: new Date(2024, 3, 15),
      updatedAt: new Date(2024, 3, 16)
    }
  ];

  getTicketsByClient(clientId: string): SupportTicket[] {
    return this.tickets.filter(t => t.clientId === clientId);
  }

  createTicket(clientId: string, subject: string, message: string): SupportTicket {
    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      clientId,
      subject,
      message,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tickets.unshift(newTicket);
    return newTicket;
  }
}

export const supportService = new SupportService();
