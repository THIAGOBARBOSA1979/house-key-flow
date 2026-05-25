import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  supportTicketService, 
  ticketMessageService, 
  SupportTicket, 
  TicketMessage,
  whatsappConfigService,
  WhatsAppConfig
} from '@/services';
import { useToast } from '@/hooks/use-toast';
import { Supabase } from '@/integrations/supabase';

export const useSupportInbox = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    if (!user?.company_id) return;
    try {
      const data = await supportTicketService.getAll(user.company_id);
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchMessages = useCallback(async (ticketId: string) => {
    try {
      const data = await ticketMessageService.getByTicketId(ticketId);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    if (!user?.company_id) return;
    const data = await whatsappConfigService.getConfigByCompany(user.company_id);
    setConfig(data);
  }, [user]);

  useEffect(() => {
    fetchTickets();
    fetchConfig();
  }, [fetchTickets, fetchConfig]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
      
      // Realtime subscription for messages
      const subscription = Supabase.realtime.subscribeToTable('ticket_messages', (payload) => {
        if (payload.new && payload.new.ticket_id === selectedTicket.id) {
          fetchMessages(selectedTicket.id);
        }
      });
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedTicket, fetchMessages]);

  const sendMessage = async (content: string) => {
    if (!selectedTicket || !user) return;
    
    try {
      await ticketMessageService.create({
        ticketId: selectedTicket.id,
        senderId: user.id,
        senderType: 'staff',
        content,
      }, user.company_id);
      
      // No need to manually update state as realtime will trigger fetchMessages
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente em instantes.",
        variant: "destructive"
      });
    }
  };

  const updateTicketStatus = async (ticketId: string, status: SupportTicket['status']) => {
    try {
      await supportTicketService.update(ticketId, { status });
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status } : null);
      }
      toast({ title: "Status atualizado com sucesso" });
    } catch (error) {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    }
  };

  return {
    tickets,
    selectedTicket,
    setSelectedTicket,
    messages,
    config,
    isLoading,
    sendMessage,
    updateTicketStatus,
    refreshTickets: fetchTickets
  };
};
