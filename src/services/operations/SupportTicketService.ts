import { SupabaseBaseService } from "../SupabaseBaseService";

export type TicketStatus = 'open' | 'analyzing' | 'executing' | 'waiting_provider' | 'resolved' | 'reopened';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  protocol: string;
  company_id: string;
  client_id?: string;
  property_id?: string;
  subject: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to?: string;
  metadata?: any;
  created_at?: Date;
  updated_at?: Date;
}

class SupportTicketService extends SupabaseBaseService<SupportTicket> {
  constructor() {
    super({
      storageKey: "a2_support_tickets",
      supabaseTable: "support_tickets",
      auditEntityType: "support",
      shouldSyncWithSupabase: true
    });
  }

  async getByProtocol(protocol: string): Promise<SupportTicket | null> {
    const { data, error } = await this.supabase
      .from(this.supabaseTable)
      .select('*')
      .eq('protocol', protocol)
      .single();
    
    if (error) return null;
    return data;
  }
}

export const supportTicketService = new SupportTicketService();
