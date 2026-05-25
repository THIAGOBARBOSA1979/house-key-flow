import React, { useState } from 'react';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  MoreVertical, 
  Send, 
  Clock, 
  User, 
  Building,
  CheckCircle2,
  AlertCircle,
  Settings
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useSupportInbox } from '@/hooks/operations/useSupportInbox';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SupportInbox() {
  const { 
    tickets, 
    selectedTicket, 
    setSelectedTicket, 
    messages, 
    sendMessage, 
    updateTicketStatus,
    isLoading 
  } = useSupportInbox();
  const [messageText, setMessageText] = useState('');

  const handleSend = async () => {
    if (!messageText.trim()) return;
    await sendMessage(messageText);
    setMessageText('');
  };

  const statusMap: Record<string, { label: string, color: string, icon: any }> = {
    open: { label: 'Aberto', color: 'bg-blue-500/10 text-blue-600', icon: MessageSquare },
    analyzing: { label: 'Em Análise', color: 'bg-amber-500/10 text-amber-600', icon: Clock },
    executing: { label: 'Em Execução', color: 'bg-purple-500/10 text-purple-600', icon: Settings },
    waiting_provider: { label: 'Aguardando Fornecedor', color: 'bg-orange-500/10 text-orange-600', icon: User },
    resolved: { label: 'Resolvido', color: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle2 },
    reopened: { label: 'Reaberto', color: 'bg-red-500/10 text-red-600', icon: AlertCircle },
  };

  return (
    <PageTemplate 
      title="Central de Atendimento" 
      description="Gestão integrada de protocolos via WhatsApp e Hub de IA."
      icon={MessageSquare}
    >
      <div className="flex h-[calc(100vh-280px)] gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Lista de Tickets */}
        <div className="w-96 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar protocolo ou cliente..." className="pl-10 rounded-xl" />
          </div>
          
          <ScrollArea className="flex-1 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="p-4 space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhum protocolo encontrado.</div>
              ) : (
                tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedTicket?.id === ticket.id 
                      ? 'border-brand bg-brand/5 shadow-sm' 
                      : 'border-border/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand">{ticket.protocol}</span>
                      <Badge className={`text-[9px] uppercase font-black ${statusMap[ticket.status]?.color}`}>
                        {statusMap[ticket.status]?.label}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-sm truncate mb-1">{ticket.subject}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                      <User size={12} />
                      <span>{ticket.metadata?.client_name || 'Cliente Externo'}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Área de Conversa */}
        <div className="flex-1 flex flex-col rounded-card border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Header do Chat */}
              <div className="p-6 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand font-black shadow-sm">
                    {selectedTicket.protocol.split('-')[1]?.substring(0, 2) || 'TK'}
                  </div>
                  <div>
                    <h3 className="font-black text-lg leading-tight uppercase tracking-tighter">{selectedTicket.subject}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{selectedTicket.protocol}</span>
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <Building size={10} /> {selectedTicket.metadata?.property_name || 'Sem Empreendimento'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    className="bg-muted/50 border border-border/50 rounded-lg text-xs font-bold p-2 outline-none"
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as any)}
                  >
                    {Object.entries(statusMap).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                  <Button variant="ghost" size="icon" className="rounded-xl"><MoreVertical size={18} /></Button>
                </div>
              </div>

              {/* Mensagens */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {messages.map((msg) => {
                    const isStaff = msg.senderType === 'staff';
                    const isIA = msg.senderType === 'ia';
                    return (
                      <div key={msg.id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] space-y-1 ${isStaff ? 'text-right' : 'text-left'}`}>
                          <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                            isStaff 
                              ? 'bg-brand text-brand-foreground rounded-tr-none' 
                              : isIA 
                                ? 'bg-purple-500/10 border border-purple-500/20 text-foreground rounded-tl-none'
                                : 'bg-muted/50 border border-border/50 text-foreground rounded-tl-none'
                          }`}>
                            {msg.content}
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-black uppercase tracking-widest px-1">
                            {isIA && <Badge variant="outline" className="text-[8px] h-4 bg-purple-500/5 text-purple-600 border-purple-500/20">IA</Badge>}
                            <span>{format(new Date(msg.createdAt || msg.created_at || new Date()), 'HH:mm', { locale: ptBR })}</span>
                          </div>
                        </div>
                      </div>
                    );


                  })}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-6 bg-muted/20 border-t border-border/50">
                <div className="flex gap-4 items-center bg-background/50 border border-border/50 p-2 rounded-xl focus-within:ring-2 ring-brand/20 transition-all">
                  <Input 
                    placeholder="Digite sua resposta..." 
                    className="border-none bg-transparent focus-visible:ring-0 h-12 text-sm"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <Button onClick={handleSend} className="rounded-xl h-11 w-11 p-0 shrink-0 bg-brand shadow-lg hover:shadow-brand/20">
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-muted/20 flex items-center justify-center">
                <MessageSquare size={40} className="opacity-20" />
              </div>
              <div>
                <h4 className="font-black uppercase tracking-tighter text-xl text-foreground">Sua Inbox está pronta</h4>
                <p className="max-w-xs mx-auto text-sm font-medium">Selecione um protocolo de atendimento ao lado para iniciar a conversa.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}
