import { BaseService } from "../BaseService";
import { auditLogService } from "../core/AuditLogService";

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

const INITIAL_TICKETS: SupportTicket[] = [
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
    ],
    createdAt: new Date(2024, 3, 15),
    updatedAt: new Date(2024, 3, 16)
  }
];

class SupportService extends BaseService<SupportTicket> {
  constructor() {
    super("a2_support_tickets", INITIAL_TICKETS);
  }

  protected loadFromStorage() {
    super.loadFromStorage();
    this.items = this.items.map(t => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
      messages: t.messages.map(m => ({ ...m, createdAt: new Date(m.createdAt) }))
    }));
  }

  getAllTickets() { return [...this.items]; }
  getTicketById(id: string) { return this.getById(id); }
  getTicketsByClient(clientId: string) { return this.items.filter(t => t.clientId === clientId); }

  createTicket(clientId: string, clientName: string, data: any): SupportTicket {
    const newTicket = super.create({
      clientId,
      subject: data.subject,
      status: 'pending',
      priority: data.priority || 'medium',
      category: data.category || 'other',
      messages: [{ id: crypto.randomUUID(), senderId: clientId, senderName: clientName, role: 'client', text: data.message, createdAt: new Date() }],
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);
    return newTicket;
  }

  updateTicketStatus(id: string, status: SupportTicket['status']) {
    return this.update(id, { status, updatedAt: new Date() });
  }

  addMessageToTicket(id: string, senderId: string, senderName: string, role: 'admin' | 'client', text: string) {
    const ticket = this.getById(id);
    if (!ticket) return null;
    const messages = [...ticket.messages, { id: crypto.randomUUID(), senderId, senderName, role, text, createdAt: new Date() }];
    return this.update(id, { messages, updatedAt: new Date() });
  }
}

export const supportService = new SupportService();
