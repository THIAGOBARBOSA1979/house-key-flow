
import { useState, useMemo, useEffect } from "react";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Send, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Download,
  Paperclip,
  Eye
} from "lucide-react";
import { PageHeader } from "@/components/Layout/PageHeader";
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
import { supportService, SupportTicket, TicketMessage } from "@/services";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const AdminSupport = () => {
  const { toast } = useToast();
  const { user: adminUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    setTickets(supportService.getAllTickets());
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = 
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, statusFilter]);

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    if (ticket.status === 'pending') {
      supportService.updateTicketStatus(ticket.id, 'in_progress');
      setTickets(supportService.getAllTickets());
    }
  };

  const handleSendReply = () => {
    if (!selectedTicket || !replyText.trim()) return;

    supportService.addMessageToTicket(
      selectedTicket.id,
      adminUser?.id || "admin-1",
      adminUser?.name || "Administrador",
      'admin',
      replyText
    );

    setReplyText("");
    setTickets(supportService.getAllTickets());
    setSelectedTicket(supportService.getTicketById(selectedTicket.id) || null);
    
    toast({
      title: "Resposta enviada",
      description: "Sua mensagem foi enviada ao cliente com sucesso.",
    });
  };

  const handleCloseTicket = (ticketId: string) => {
    supportService.updateTicketStatus(ticketId, 'closed');
    setTickets(supportService.getAllTickets());
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(supportService.getTicketById(ticketId) || null);
    }
    toast({
      title: "Ticket encerrado",
      description: "O atendimento foi finalizado e o ticket foi fechado.",
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-in fade-in duration-slow">
      <PageHeader
        icon={MessageSquare}
        title="Central de Atendimento"
        description="Gerencie os chamados e suporte aos clientes da A2."
      >
        <Button variant="outline" className="rounded-xl">
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
        {/* Ticket List Section */}
        <Card className="lg:col-span-4 overflow-hidden border-none shadow-sem-lg rounded-[2rem] flex flex-col">
          <CardHeader className="p-6 border-b">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar tickets..." 
                  className="pl-10 h-11 bg-muted/30 border-none rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {['all', 'pending', 'in_progress', 'closed'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-[10px] font-black uppercase tracking-widest rounded-lg flex-1"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' ? 'Todos' : 
                     status === 'pending' ? 'Pendentes' : 
                     status === 'in_progress' ? 'Em Aberto' : 'Fechados'}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border/40">
              {filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id}
                  onClick={() => handleSelectTicket(ticket)}
                  className={cn(
                    "p-5 cursor-pointer transition-all hover:bg-primary/5 group relative",
                    selectedTicket?.id === ticket.id ? "bg-primary/5 border-l-4 border-primary" : "border-l-4 border-transparent"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">#{ticket.id.substring(0, 8)}</span>
                    <StatusBadge 
                      status={ticket.status === 'closed' ? 'complete' : (ticket.status === 'in_progress' ? 'progress' : 'pending')} 
                      size="sm"
                      label={ticket.status === 'closed' ? 'Fechado' : (ticket.status === 'in_progress' ? 'Atendimento' : 'Pendente')}
                    />
                  </div>
                  <h4 className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors mb-2 line-clamp-1">{ticket.subject}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                    <User className="h-3 w-3" />
                    <span>{ticket.messages[0]?.senderName}</span>
                    <span className="mx-1">•</span>
                    <Clock className="h-3 w-3" />
                    <span>{ticket.updatedAt.toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
              {filteredTickets.length === 0 && (
                <div className="p-10 text-center opacity-40">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3" />
                  <p className="text-xs font-black uppercase tracking-widest">Nenhum ticket encontrado</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Conversation Section */}
        <Card className="lg:col-span-8 overflow-hidden border-none shadow-sem-lg rounded-[2rem] flex flex-col bg-card/50 backdrop-blur-sm">
          {selectedTicket ? (
            <>
              <CardHeader className="p-6 border-b bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black tracking-tight">{selectedTicket.subject}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] font-black uppercase">{selectedTicket.category}</Badge>
                        <span className="text-xs font-medium">Cliente: {selectedTicket.messages[0]?.senderName}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTicket.status !== 'closed' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl text-xs font-bold text-status-critical border-status-critical/20 hover:bg-status-critical/5"
                        onClick={() => handleCloseTicket(selectedTicket.id)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Fechar Ticket
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-none shadow-sem-xl">
                        <DropdownMenuItem className="font-medium cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" /> Ver Perfil do Cliente
                        </DropdownMenuItem>
                        <DropdownMenuItem className="font-medium cursor-pointer">
                          <AlertCircle className="mr-2 h-4 w-4" /> Alterar Prioridade
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {selectedTicket.messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={cn(
                        "flex flex-col max-w-[80%] space-y-2",
                        message.role === 'admin' ? "ml-auto items-end" : "items-start"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {message.senderName}
                        </span>
                        <span className="text-[9px] text-muted-foreground/50 font-medium">
                          {message.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div 
                        className={cn(
                          "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                          message.role === 'admin' 
                            ? "bg-primary text-primary-foreground rounded-tr-none" 
                            : "bg-muted text-foreground rounded-tl-none border border-border/20"
                        )}
                      >
                        {message.text}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.attachments.map((at, i) => (
                              <Badge key={i} variant="outline" className="bg-white/10 border-white/20 text-white gap-1 py-1">
                                <Paperclip size={10} /> Anexo {i + 1}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-6 bg-card border-t">
                {selectedTicket.status === 'closed' ? (
                  <div className="flex items-center justify-center p-4 bg-muted/50 rounded-2xl border border-dashed text-muted-foreground italic text-sm">
                    Este ticket foi encerrado. Para novas mensagens, o cliente deverá reabrir ou criar um novo chamado.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Textarea 
                      placeholder="Escreva sua resposta aqui..." 
                      className="min-h-[100px] rounded-2xl border-none bg-muted/30 focus-visible:ring-primary/20 resize-none"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                      <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary">
                        <Paperclip className="mr-2 h-4 w-4" />
                        Anexar Arquivo
                      </Button>
                      <Button className="rounded-xl px-6 h-11 font-black uppercase tracking-widest text-[11px]" onClick={handleSendReply}>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Resposta
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30">
              <div className="h-32 w-32 bg-primary/5 rounded-full flex items-center justify-center mb-8">
                <MessageSquare size={60} className="text-primary" />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-foreground/50">Selecione um Chamado</h3>
              <p className="mt-2 text-sm font-medium max-w-xs">Escolha um ticket na lista à esquerda para visualizar o histórico de mensagens e responder ao cliente.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminSupport;
