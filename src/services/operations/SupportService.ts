import { SupabaseBaseService } from "../SupabaseBaseService";

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent' | 'blocker';
export type TicketCategory = 'technical' | 'administrative' | 'warranty' | 'inspection' | 'legal' | 'safety' | 'other';

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
  company_id?: string;
  clientId: string;
  clientName: string;
  propertyId?: string;
  propertyName?: string;
  unitNumber?: string;
  subject: string;
  status: 'pending' | 'in_progress' | 'waiting_client' | 'closed';
  priority: TicketPriority;
  category: TicketCategory;
  messages: TicketMessage[];
  slaDeadline?: Date;
  slaStatus?: 'on_track' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

export class SupportService extends SupabaseBaseService<SupportTicket> {
  constructor() {
    super({
      storageKey: "a2_support_tickets",
      supabaseTable: "support_tickets",
      auditEntityType: "system",
      shouldSyncWithSupabase: true
    });
  }

  protected mapToSupabase(item: Partial<SupportTicket>): Record<string, any> {
    const mapped = super.mapToSupabase(item);
    if (mapped.messages && typeof mapped.messages !== 'string') {
      mapped.messages = JSON.stringify(mapped.messages);
    }
    return mapped;
  }

  protected mapFromSupabase(raw: any): SupportTicket {
    const item = super.mapFromSupabase(raw);
    if (typeof (item as any).messages === 'string') {
      try {
        item.messages = JSON.parse((item as any).messages);
      } catch (e) {
        item.messages = [];
      }
    }
    return item;
  }

  getAllTickets() { return [...this.items]; }
  async getTicketById(id: string) { return await this.getById(id); }
  getTicketsByClient(clientId: string) { return this.items.filter(t => t.clientId === clientId); }

  async createTicket(
    clientId: string, 
    clientName: string, 
    data: { subject: string, priority?: TicketPriority, category?: TicketCategory, message: string, company_id?: string }, 
    context?: { propertyId?: string, propertyName?: string, unitNumber?: string }
  ): Promise<SupportTicket> {
    const createdAt = new Date();
    const slaDeadline = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000);

    const ticketData: Omit<SupportTicket, 'id'> = {
      clientId,
      clientName,
      company_id: data.company_id,
      propertyId: context?.propertyId,
      propertyName: context?.propertyName,
      unitNumber: context?.unitNumber,
      subject: data.subject,
      status: 'pending',
      priority: data.priority || 'medium',
      category: data.category || 'other',
      messages: [{ 
        id: crypto.randomUUID(), 
        senderId: clientId, 
        senderName: clientName, 
        role: 'client', 
        text: data.message, 
        createdAt: new Date() 
      }],
      slaDeadline,
      createdAt,
      updatedAt: createdAt
    };

    return await this.create(ticketData);
  }

  async updateTicketStatus(id: string, status: SupportTicket['status']) {
    return await this.update(id, { status, updatedAt: new Date() });
  }

  async addMessageToTicket(id: string, senderId: string, senderName: string, role: 'admin' | 'client', text: string) {
    const ticket = await this.getById(id);
    if (!ticket) return null;
    
    const messages = [...(ticket.messages || []), { 
      id: crypto.randomUUID(), 
      senderId, 
      senderName, 
      role, 
      text, 
      createdAt: new Date() 
    }];
    
    const newStatus = role === 'admin' ? 'waiting_client' : 'in_progress';
    
    return await this.update(id, { 
      messages, 
      status: newStatus,
      updatedAt: new Date() 
    });
  }
}

export const supportService = new SupportService();
