import { SupabaseBaseService } from "../SupabaseBaseService";
import { Supabase } from "@/integrations/supabase";

export type TicketStatus = 'open' | 'analyzing' | 'executing' | 'waiting_provider' | 'resolved' | 'reopened';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  protocol: string;
  companyId: string;
  clientId?: string;
  propertyId?: string;
  subject: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo?: string;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

class SupportTicketService extends SupabaseBaseService<SupportTicket> {
  constructor() {
    super({
      storageKey: "a2_support_tickets_v2",
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
}

export const supportTicketService = new SupportTicketService();
