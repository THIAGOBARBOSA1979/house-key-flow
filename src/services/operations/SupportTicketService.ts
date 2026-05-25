import { SupabaseBaseService } from "../SupabaseBaseService";
import { Supabase } from "@/integrations/supabase";

export type TicketStatus = 'open' | 'analyzing' | 'executing' | 'waiting_provider' | 'resolved' | 'reopened' | 'pending' | 'in_progress' | 'waiting_client' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent' | 'blocker';
export type TicketCategory = 'technical' | 'administrative' | 'warranty' | 'inspection' | 'legal' | 'safety' | 'other';

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId?: string;
  senderName?: string;
  senderType: 'staff' | 'client' | 'system' | 'ia';
  role?: 'admin' | 'client';
  text?: string;
  content: string;
  whatsappMessageId?: string;
  metadata?: any;
  createdAt?: Date;
  created_at?: Date;
}

export interface SupportTicket {
  id: string;
  protocol: string;
  companyId: string;
  company_id?: string;
  clientId?: string;
  clientName?: string;
  propertyId?: string;
  propertyName?: string;
  unitNumber?: string;
  subject: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: TicketCategory;
  assignedTo?: string;
  messages?: TicketMessage[];
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

class SupportTicketService extends SupabaseBaseService<SupportTicket> {
  constructor() {
    super({
      storageKey: "a2_support_tickets_v3",
      supabaseTable: "support_tickets",
      auditEntityType: "system",
      shouldSyncWithSupabase: true
    });
  }

  async getByProtocol(protocol: string): Promise<SupportTicket | null> {
    const { data, error } = await Supabase.db.findOne<any>(this.supabaseTable, protocol, 'protocol');
    if (error) return null;
    return this.mapFromSupabase(data);
  }

  async updateTicketStatus(id: string, status: TicketStatus) {
    return await this.update(id, { status, updatedAt: new Date() });
  }
}

export const supportTicketService = new SupportTicketService();
export const supportService = supportTicketService;
