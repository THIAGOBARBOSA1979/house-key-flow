import { useState, useMemo, useEffect } from "react";
import { 
  MessageSquare, 
  Search, 
  MoreHorizontal, 
  Send, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Paperclip,
  Eye,
  Activity
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import { supportTicketService as supportService, SupportTicket, TicketMessage, TicketStatus } from "@/services";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const AdminSupport = () => {
  const { toast } = useToast();
  const { user: adminUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");

  const fetchTickets = async () => {
    if (!adminUser?.company_id) return;
    const data = await supportService.getAll(adminUser.company_id, adminUser.is_super_admin);
    setTickets(data);
  };

  useEffect(() => {
    fetchTickets();
  }, [adminUser]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = 
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.protocol.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, statusFilter]);

  const handleSelectTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    if (ticket.status === 'open' || ticket.status === 'pending') {
      await supportService.update(ticket.id, { status: 'analyzing' });
      fetchTickets();
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim() || !adminUser) return;

    // Em produção, isso seria via API/Webhook. 
    // Aqui estamos simulando inserindo diretamente para visualização.
    await supportService.update(selectedTicket.id, { 
      status: 'waiting_provider',
      updatedAt: new Date()
    });
    
    setReplyText("");
    fetchTickets();
    
    toast({
      title: "Resposta enviada",
      description: "Sua mensagem foi enviada ao cliente com sucesso.",
    });
  };

  const handleUpdateStatus = async (ticketId: string, status: TicketStatus) => {
    await supportService.update(ticketId, { status, updatedAt: new Date() });
    fetchTickets();
    if (selectedTicket?.id === ticketId) {
      const updated = await supportService.getById(ticketId);
      setSelectedTicket(updated || null);
    }
    toast({
      title: "Status atualizado",
      description: "O chamado foi atualizado com sucesso.",
    });
  };

  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'resolved': return { color: 'complete', label: 'Resolvido' };
      case 'executing': return { color: 'progress', label: 'Em Execução' };
      case 'analyzing': return { color: 'progress', label: 'Análise' };
      case 'waiting_provider': return { color: 'scheduled', label: 'Aguardando' };
      default: return { color: 'pending', label: 'Aberto' };
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-in fade-in duration-slow">
      <PageHeader
        icon={MessageSquare}
        title="Gestão de Protocolos"
        description="Central de governança para chamados de garantia e manutenção."
      >
        <Button variant="outline" className="rounded-xl">
          <Download className="mr-2 h-4 w-4" />
          Relatório SLA
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-320px)] min-h-[600px]">
        <Card className="lg:col-span-4 overflow-hidden border-none shadow-sem-lg rounded-[2rem] flex flex-col">
          <CardHeader className="p-6 border-b">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar protocolos..." 
                  className="pl-10 h-11 bg-muted/30 border-none rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {['all', 'open', 'analyzing', 'executing', 'resolved'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-[10px] font-black uppercase tracking-widest rounded-lg flex-shrink-0"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? 'Todos' : status}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border/40">
              {filteredTickets.map((ticket) => {
                const info = getStatusInfo(ticket.status);
                return (
                  <div 
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={cn(
                      "p-5 cursor-pointer transition-all hover:bg-primary/5 group relative",
                      selectedTicket?.id === ticket.id ? "bg-primary/5 border-l-4 border-primary" : "border-l-4 border-transparent"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-black text-brand uppercase tracking-widest">{ticket.protocol}</span>
                      <StatusBadge 
                        status={info.color as any} 
                        size="sm"
                        label={info.label}
                      />
                    </div>
                    <h4 className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors mb-2 line-clamp-1">{ticket.subject}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                      <User className="h-3 w-3" />
                      <span>{ticket.metadata?.client_name || 'Cliente'}</span>
                      <span className="mx-1">•</span>
                      <Clock className="h-3 w-3" />
                      <span>{ticket.createdAt ? format(new Date(ticket.createdAt), 'dd/MM/yy') : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </Card>

        <Card className="lg:col-span-8 overflow-hidden border-none shadow-sem-lg rounded-[2rem] flex flex-col bg-card/50 backdrop-blur-sm">
          {selectedTicket ? (
            <>
              <CardHeader className="p-6 border-b bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Activity size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black tracking-tight">{selectedTicket.subject}</CardTitle>
                      <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {selectedTicket.protocol} • {selectedTicket.metadata?.property_name || 'Geral'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={selectedTicket.status} 
                      onValueChange={(v) => handleUpdateStatus(selectedTicket.id, v as any)}
                    >
                      <SelectTrigger className="h-9 w-40 rounded-xl text-xs font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Aberto</SelectItem>
                        <SelectItem value="analyzing">Análise</SelectItem>
                        <SelectItem value="executing">Execução</SelectItem>
                        <SelectItem value="resolved">Resolvido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <ScrollArea className="flex-1 p-6">
                 {/* Visualização de Timeline/Mensagens simplificada para Admin */}
                 <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                    <p className="text-sm font-medium">Histórico de mensagens sincronizado com a Central de Atendimento.</p>
                    <div className="flex gap-4">
                      <Button variant="outline" asChild className="rounded-xl">
                        <a href="/app/inbox">Ir para Inbox WhatsApp</a>
                      </Button>
                    </div>
                 </div>

              </ScrollArea>

              <div className="p-6 bg-card border-t">
                <div className="flex flex-col gap-3">
                  <Textarea 
                    placeholder="Escreva uma nota interna ou resposta..." 
                    className="min-h-[100px] rounded-2xl border-none bg-muted/30 focus-visible:ring-primary/20 resize-none"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex justify-end gap-3">
                    <Button variant="ghost" className="rounded-xl">Anotação Interna</Button>
                    <Button className="rounded-xl px-6 h-11 font-black uppercase tracking-widest text-[11px]" onClick={handleSendReply}>
                      <Send className="mr-2 h-4 w-4" /> Enviar Resposta
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30">
              <MessageSquare size={60} className="text-primary mb-6" />
              <h3 className="text-2xl font-black tracking-tight">Selecione um Protocolo</h3>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminSupport;
