import { SupabaseBaseService } from "../SupabaseBaseService";
import { Supabase } from "@/integrations/supabase";
import { Database } from "@/integrations/supabase/types";

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

// Removed INITIAL_TICKETS mock data


export class SupportService extends SupabaseBaseService<SupportTicket> {
  constructor() {
    super({
      storageKey: "a2_support_tickets",
      supabaseTable: "support_tickets" as any,
      auditEntityType: "system",
      shouldSyncWithSupabase: true
    });
  }

  protected mapToSupabase(item: Partial<SupportTicket>): any {
    const mapped = super.mapToSupabase(item);
    if (mapped.messages) {
      mapped.messages = JSON.stringify(mapped.messages);
    }
    return mapped;
  }

  protected mapFromSupabase(raw: any): SupportTicket {
    const item = super.mapFromSupabase(raw);
    if (typeof item.messages === 'string') {
      try {
        item.messages = JSON.parse(item.messages);
      } catch (e) {
        item.messages = [];
      }
    }
    return item;
  }

  getAllTickets() { return [...this.items]; }
  getTicketById(id: string) { return this.getById(id); }
  getTicketsByClient(clientId: string) { return this.items.filter(t => t.clientId === clientId); }

  async createTicket(clientId: string, clientName: string, data: any, context?: { propertyId?: string, propertyName?: string, unitNumber?: string }): Promise<SupportTicket> {
    const createdAt = new Date();
    const slaDeadline = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000);

    const ticketData: any = {
      client_id: clientId,
      company_id: (data as any).company_id,
      property_id: context?.propertyId,
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
      sla_deadline: slaDeadline,
      created_at: createdAt,
      updated_at: createdAt
    };

    return await this.create(ticketData);
  }

  async updateTicketStatus(id: string, status: SupportTicket['status']) {
    return await this.update(id, { status, updatedAt: new Date() } as any);
  }

  async addMessageToTicket(id: string, senderId: string, senderName: string, role: 'admin' | 'client', text: string) {
    const ticket = this.getById(id);
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
    } as any);
  }
}

export const supportService = new SupportService();
