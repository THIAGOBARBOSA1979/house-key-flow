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

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: crypto.randomUUID(),
    company_id: 'comp-1',
    clientId: 'client-1',
    clientName: 'João Silva',
    propertyName: 'Edifício Aurora',
    unitNumber: '101',
    status: 'closed',
    priority: 'medium',
    category: 'technical',
    messages: [
      {
        id: crypto.randomUUID(),
        senderId: 'client-1',
        senderName: 'João Silva',
        role: 'client',
        text: 'Gostaria de saber quando será a próxima revisão do condomínio.',
        createdAt: new Date(2024, 3, 15)
      },
    ],
    createdAt: new Date(2024, 3, 15),
    updatedAt: new Date(2024, 3, 16)
  }
];

export class SupportService extends SupabaseBaseService<SupportTicket> {
  constructor() {
    super({
      storageKey: "a2_support_tickets",
      supabaseTable: "audit_logs" as keyof Database['public']['Tables'], // Dummy table for now if it doesn't exist
      auditEntityType: "system",
      shouldSyncWithSupabase: false
    }, INITIAL_TICKETS);
  }

  getAllTickets() { return [...this.items]; }
  getTicketById(id: string) { return this.getById(id); }
  getTicketsByClient(clientId: string) { return this.items.filter(t => t.clientId === clientId); }

  createTicket(clientId: string, clientName: string, data: any, context?: { propertyId?: string, propertyName?: string, unitNumber?: string }): SupportTicket {
    const createdAt = new Date();
    // Default 24h SLA for initial response
    const slaDeadline = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    return super.create({
      clientId,
      clientName,
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
      slaStatus: 'on_track',
      createdAt,
      updatedAt: createdAt
    } as any);
  }

  updateTicketStatus(id: string, status: SupportTicket['status']) {
    return this.update(id, { status, updatedAt: new Date() });
  }

  addMessageToTicket(id: string, senderId: string, senderName: string, role: 'admin' | 'client', text: string) {
    const ticket = this.getById(id);
    if (!ticket) return null;
    const messages = [...ticket.messages, { 
      id: crypto.randomUUID(), 
      senderId, 
      senderName, 
      role, 
      text, 
      createdAt: new Date() 
    }];
    const newStatus = role === 'admin' ? 'waiting_client' : 'in_progress';
    return this.update(id, { 
      messages, 
      status: newStatus,
      updatedAt: new Date() 
    });
  }
}

export const supportService = new SupportService();
