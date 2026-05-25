import { SupabaseBaseService } from "../SupabaseBaseService";

export type MessageSenderType = 'staff' | 'client' | 'system' | 'ia';

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id?: string;
  sender_type: MessageSenderType;
  content: string;
  whatsapp_message_id?: string;
  metadata?: any;
  created_at?: Date;
}

class TicketMessageService extends SupabaseBaseService<TicketMessage> {
  constructor() {
    super({
      storageKey: "a2_ticket_messages",
      supabaseTable: "ticket_messages",
      auditEntityType: "support",
      shouldSyncWithSupabase: true
    });
  }

  async getByTicketId(ticketId: string): Promise<TicketMessage[]> {
    const { data, error } = await this.supabase
      .from(this.supabaseTable)
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    
    if (error) return [];
    return data;
  }
}

export const ticketMessageService = new TicketMessageService();
