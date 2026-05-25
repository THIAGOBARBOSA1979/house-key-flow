import { SupabaseBaseService } from "../SupabaseBaseService";
import { Supabase } from "@/integrations/supabase";

export type MessageSenderType = 'staff' | 'client' | 'system' | 'ia';

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId?: string;
  senderName?: string;
  senderType: MessageSenderType;
  role?: 'admin' | 'client';
  content: string;
  text?: string;
  whatsappMessageId?: string;
  metadata?: any;
  createdAt?: Date;
  created_at?: Date;
}


class TicketMessageService extends SupabaseBaseService<TicketMessage> {
  constructor() {
    super({
      storageKey: "a2_ticket_messages",
      supabaseTable: "ticket_messages",
      auditEntityType: "system",
      shouldSyncWithSupabase: true
    });
  }

  async getByTicketId(ticketId: string): Promise<TicketMessage[]> {
    const { data, error } = await Supabase.db.findMany<any>(this.supabaseTable, {
      filters: [{ column: 'ticket_id', operator: 'eq', value: ticketId }]
    });
    
    if (error) return [];
    return (data || []).map(item => this.mapFromSupabase(item));
  }
}

export const ticketMessageService = new TicketMessageService();
