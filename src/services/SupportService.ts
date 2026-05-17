
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'financial' | 'technical' | 'administrative' | 'warranty' | 'other';

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  role: 'admin' | 'client';
  text: string;
  createdAt: Date;
  attachments?: string[];
}

export interface SupportTicket {
  id: string;
  clientId: string;
  subject: string;
  status: 'pending' | 'in_progress' | 'closed';
  priority: TicketPriority;
  category: TicketCategory;
  messages: TicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

class SupportService {
  private tickets: SupportTicket[] = [
    {
      id: crypto.randomUUID(),
      clientId: 'client-1',
      subject: 'Dúvida sobre boleto',
      status: 'closed',
      priority: 'medium',
      category: 'financial',
      messages: [
        {
          id: crypto.randomUUID(),
          senderId: 'client-1',
          senderName: 'João Silva',
          role: 'client',
          text: 'Não recebi o boleto deste mês por e-mail.',
          createdAt: new Date(2024, 3, 15)
        },
        {
          id: crypto.randomUUID(),
          senderId: 'admin-1',
          senderName: 'Suporte A2',
          role: 'admin',
          text: 'Olá João, enviamos o boleto novamente para o seu e-mail cadastrado.',
          createdAt: new Date(2024, 3, 16)
        }
      ],
      createdAt: new Date(2024, 3, 15),
      updatedAt: new Date(2024, 3, 16)
    }
  ];

  private storageKey = "a2_support_tickets";

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.tickets = parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
          messages: t.messages.map((m: any) => ({
            ...m,
            createdAt: new Date(m.createdAt)
          }))
        }));
      } catch (e) {
        console.error("Erro ao carregar tickets do storage", e);
      }
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.tickets));
  }

  getTicketsByClient(clientId: string): SupportTicket[] {
    return this.tickets.filter(t => t.clientId === clientId);
  }

  getAllTickets(): SupportTicket[] {
    return this.tickets;
  }

  getTicketById(id: string): SupportTicket | undefined {
    return this.tickets.find(t => t.id === id);
  }

  createTicket(clientId: string, clientName: string, data: { subject: string, message: string, priority?: TicketPriority, category?: TicketCategory, attachments?: string[] }): SupportTicket {
    const ticketId = crypto.randomUUID();
    const newTicket: SupportTicket = {
      id: ticketId,
      clientId,
      subject: data.subject,
      status: 'pending',
      priority: data.priority || 'medium',
      category: data.category || 'other',
      messages: [
        {
          id: crypto.randomUUID(),
          senderId: clientId,
          senderName: clientName,
          role: 'client',
          text: data.message,
          createdAt: new Date(),
          attachments: data.attachments
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tickets.unshift(newTicket);
    this.saveToStorage();
    return newTicket;
  }

  updateTicketStatus(ticketId: string, status: SupportTicket['status']): void {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date();
      this.saveToStorage();
    }
  }

  addMessageToTicket(ticketId: string, senderId: string, senderName: string, role: 'admin' | 'client', text: string, attachments?: string[]): void {
    const ticket = this.getTicketById(ticketId);
    if (ticket) {
      ticket.messages.push({
        id: crypto.randomUUID(),
        senderId,
        senderName,
        role,
        text,
        createdAt: new Date(),
        attachments
      });
      ticket.updatedAt = new Date();
      this.saveToStorage();
    }
  }
}

export const supportService = new SupportService();