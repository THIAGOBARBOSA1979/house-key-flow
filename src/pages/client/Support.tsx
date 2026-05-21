import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  FileQuestion, 
  HelpCircle, 
  ArrowRight,
  ChevronRight,
  LifeBuoy,
  BookOpen,
  Send,
  ExternalLink,
  Search,
  CheckCircle,
  Download
} from "lucide-react";
import { ClientFAQ } from "@/components/ClientFlow/ClientFAQ";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supportService, SupportTicket, TicketPriority, TicketCategory } from "@/services";
import { useMemo, useEffect } from "react";
import { StatusBadge } from "@/components/Shared/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { ResponsiveGrid } from "@/components/Shared/ResponsiveGrid";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea as ChatScrollArea } from "@/components/ui/scroll-area";

const Support = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const clientId = user?.id || "client-1";
  const [formState, setFormState] = useState<{
    subject: string;
    message: string;
    priority: TicketPriority;
    category: TicketCategory;
  }>({
    subject: "",
    message: "",
    priority: "medium",
    category: "technical"
  });
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    setTickets(supportService.getTicketsByClient(clientId));
  }, [clientId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    supportService.createTicket(clientId, user?.name || "Cliente", formState);
    setTickets(supportService.getTicketsByClient(clientId));
    toast({
      title: "Solicitação enviada",
      description: "Sua mensagem foi enviada para nossa equipe de suporte. Responderemos em breve.",
    });
    setFormState({ subject: "", message: "", priority: "medium", category: "technical" });
  };

  const handleSendReply = () => {
    if (!selectedTicketId || !replyText.trim()) return;
    supportService.addMessageToTicket(
      selectedTicketId, 
      clientId, 
      user?.name || "Cliente", 
      'client', 
      replyText
    );
    setTickets(supportService.getTicketsByClient(clientId));
    setReplyText("");
    toast({ title: "Resposta enviada", description: "Sua mensagem foi adicionada ao chamado." });
  };

  const selectedTicket = useMemo(() => 
    tickets.find(t => t.id === selectedTicketId), 
  [tickets, selectedTicketId]);

  const contactMethods = [
    {
      icon: Phone,
      title: "Telefone",
      detail: "(11) 4003-0000",
      description: "Segunda a Sexta, 08h às 18h",
      action: "Ligar agora",
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      icon: Mail,
      title: "E-mail",
      detail: "suporte@a2incorporadora.com.br",
      description: "Resposta em até 24h úteis",
      action: "Enviar e-mail",
      color: "text-purple-500",
      bg: "bg-purple-50"
    },
    {
      icon: MessageSquare,
      title: "WhatsApp",
      detail: "(11) 99999-0000",
      description: "Atendimento instantâneo",
      action: "Iniciar conversa",
      color: "text-green-500",
      bg: "bg-green-50"
    }
  ];

  return (
    <div className="container-responsive py-layout-gap space-y-layout-gap pb-20 md:pb-6 animate-in fade-in duration-slow">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground flex items-center gap-3 leading-tight">
            <div className="p-2.5 bg-primary/10 rounded-2xl shadow-inner">
              <LifeBuoy className="h-7 w-7 text-primary" strokeWidth={3} />
            </div>
            Central de Ajuda & Suporte
          </h1>
          <p className="text-muted-foreground font-bold mt-2 text-sm">
            Encontre soluções estratégicas ou fale com nossa engenharia de pós-venda.
          </p>
        </div>
      </div>

      {/* Hero Section / Knowledge Base Search */}
      <Card className="bg-gradient-to-br from-primary via-primary/95 to-indigo-800 text-primary-foreground overflow-hidden relative border-none shadow-2xl rounded-[3rem]">
        <div className="absolute right-[-2%] top-[-10%] opacity-10 pointer-events-none rotate-12 group-hover:rotate-0 transition-transform duration-1000">
          <BookOpen size={350} />
        </div>
        <CardContent className="p-10 md:p-20 relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <Badge className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black uppercase tracking-[0.25em] text-[10px] px-5 py-2 rounded-full mb-8 backdrop-blur-xl shadow-lg">Base de Conhecimento Estratégica</Badge>
          <h2 className="text-3xl md:text-5xl font-black mb-10 tracking-tighter leading-[1.1] scale-in-center">Como podemos acelerar <br className="hidden md:block" /> sua solução hoje?</h2>
          <div className="w-full relative group">
            <Input 
              className="h-16 md:h-20 bg-white/15 border-white/10 text-white placeholder:text-white/40 rounded-3xl pl-16 pr-6 text-xl focus:bg-white focus:text-foreground transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.2)] focus:ring-8 focus:ring-white/5 border-2 focus:border-white"
              placeholder="Digite sua dúvida técnica ou financeira..."
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary h-7 w-7 transition-all duration-300" strokeWidth={3} />
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <span className="text-[11px] font-black uppercase tracking-widest text-white/50 mr-2 self-center">Filtros inteligentes:</span>
            {['Vistorias ABNT', 'Garantias Técnicas', 'Segunda Via', 'Prazos de Obra', 'Contratos'].map(tag => (
              <span key={tag} className="text-[10px] font-black uppercase tracking-widest px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl cursor-pointer transition-all border border-white/5 backdrop-blur-md active:scale-95 hover:border-white/20 shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>


      {/* Contact Methods Grid */}
      <ResponsiveGrid columns={3} gap="layout">
        {contactMethods.map((method, idx) => {
          const Icon = method.icon;
          return (
            <Card key={idx} className="hover:shadow-2xl transition-all duration-500 group border-none bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-10 text-center space-y-6">
                <div className={`mx-auto w-20 h-20 ${method.bg} ${method.color} rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm border border-white/20`}>
                  <Icon size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight leading-tight">{method.title}</h3>
                  <p className="text-sm font-black text-primary mt-1.5 tracking-tight">{method.detail}</p>
                  <p className="text-[10px] text-muted-foreground mt-3 font-black uppercase tracking-widest opacity-60 leading-relaxed">{method.description}</p>
                </div>
                <Button variant="outline" className="w-full rounded-2xl text-[10px] font-black uppercase tracking-widest h-12 border-2 border-primary/10 group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  {method.action}
                  <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </ResponsiveGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-layout-gap">
        {/* Support Ticket Form */}
        <Card className="shadow-2xl border-none bg-card/60 backdrop-blur-md rounded-[2.5rem] overflow-hidden group">
          <div className="h-2 w-full bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="p-10 pb-6">
            <CardTitle className="flex items-center gap-4 text-2xl font-black tracking-tight">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                <Send className="h-6 w-6" />
              </div>
              Protocolo de Suporte
            </CardTitle>
            <CardDescription className="font-bold text-muted-foreground/80 mt-2">
              Não encontrou o que precisava? Envie sua solicitação detalhada e rastreie o atendimento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Categoria</label>
                  <Select value={formState.category} onValueChange={(v: TicketCategory) => setFormState(prev => ({...prev, category: v}))}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financeiro</SelectItem>
                      <SelectItem value="technical">Assistência Técnica</SelectItem>
                      <SelectItem value="administrative">Administrativo</SelectItem>
                      <SelectItem value="warranty">Garantia</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Prioridade</label>
                  <Select value={formState.priority} onValueChange={(v: TicketPriority) => setFormState(prev => ({...prev, priority: v}))}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Assunto da Mensagem</label>
                <Input 
                  value={formState.subject}
                  onChange={e => setFormState(prev => ({...prev, subject: e.target.value}))}
                  placeholder="Ex: Dúvida sobre a parcela de entrega" 
                  className="h-12 rounded-xl focus:ring-primary/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Descrição</label>
                <Textarea 
                  value={formState.message}
                  onChange={e => setFormState(prev => ({...prev, message: e.target.value}))}
                  placeholder="Explique seu caso com detalhes..." 
                  className="min-h-[150px] rounded-xl focus:ring-primary/20 resize-none"
                  required
                />
              </div>
              
              <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-xl border border-dashed">
                <ExternalLink className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-muted-foreground">Adicionar anexos (em breve)</span>
              </div>
              <Button type="submit" className="w-full h-14 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                Enviar Mensagem para Suporte
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Support Tickets List */}
        <Card className="shadow-lg border-none bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              Meus Chamados
            </CardTitle>
            <CardDescription className="font-medium">Histórico e status das suas solicitações.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {tickets.length > 0 ? (
                <div className="max-h-dialog-md overflow-y-auto scrollbar-hide">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-6 hover:bg-muted/30 transition-all duration-300 cursor-pointer border-l-4 border-transparent hover:border-primary group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded">#{ticket.id.includes('-') ? ticket.id.split('-')[1] : ticket.id}</span>
                          <Badge variant="outline" className="text-[9px] font-black uppercase bg-primary/5 border-primary/20">{ticket.category}</Badge>
                        </div>
                        <StatusBadge 
                          status={ticket.status === 'closed' ? 'complete' : (ticket.status === 'in_progress' ? 'progress' : 'pending')} 
                          label={ticket.status === 'closed' ? 'Resolvido' : (ticket.status === 'in_progress' ? 'Em Atendimento' : 'Aguardando')}
                          size="sm"
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="font-black text-sm group-hover:text-primary transition-colors">{ticket.subject}</h4>
                        {ticket.priority === 'urgent' && <Badge variant="destructive" className="h-4 text-[8px] px-1 animate-pulse">URGENTE</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed font-medium">
                        {ticket.messages[0]?.text}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{ticket.createdAt.toLocaleDateString('pt-BR')}</p>
                          {ticket.messages[0]?.attachments && ticket.messages[0].attachments.length > 0 && (
                             <span className="text-[10px] text-primary font-black uppercase flex items-center gap-1">
                               <ExternalLink className="h-3 w-3" /> {ticket.messages[0].attachments.length} Anexos
                             </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {ticket.status === 'closed' && (
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase text-primary hover:bg-primary/5 rounded-lg px-3">
                              Avaliar
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-[10px] font-black uppercase text-primary hover:bg-primary/5 rounded-lg px-3"
                            onClick={() => setSelectedTicketId(ticket.id)}
                          >
                            Ver Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center bg-muted/20 animate-in fade-in duration-700">
                  <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="h-10 w-10 text-primary/20" />
                  </div>
                  <h3 className="font-black text-xl text-foreground/80 tracking-tight">Nenhum chamado aberto</h3>
                  <p className="text-xs text-muted-foreground mt-2 max-w-[260px] mx-auto font-bold leading-relaxed">Você ainda não abriu nenhuma solicitação. Nossa equipe está à disposição!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-layout-gap mt-8">
        {/* Quick Links / Resources */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                Manuais e Documentos Úteis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y">
                {[
                  { title: "Manual do Proprietário", size: "4.2 MB", type: "PDF" },
                  { title: "Guia Rápido de Manutenção", size: "1.5 MB", type: "PDF" },
                  { title: "Termo de Garantia Geral", size: "0.8 MB", type: "PDF" },
                  { title: "Manual do Condômino", size: "3.1 MB", type: "PDF" }
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-6 hover:bg-muted/30 cursor-pointer transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-muted rounded-xl text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <FileQuestion className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black group-hover:text-primary transition-colors">{doc.title}</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter mt-1">{doc.type} • {doc.size}</p>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-indigo-600 text-white border-none shadow-xl overflow-hidden relative group">
            <div className="absolute right-[-10%] bottom-[-10%] opacity-20 rotate-12 group-hover:scale-110 transition-transform duration-700">
              <HelpCircle size={150} />
            </div>
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tight">Dica de Manutenção</CardTitle>
            </CardHeader>
            <CardContent className="text-sm font-medium leading-relaxed text-indigo-50 relative z-10">
              "Para manter o brilho e a durabilidade dos seus revestimentos, utilize apenas pano úmido e detergente neutro. Evite produtos abrasivos que podem comprometer a camada protetora."
            </CardContent>
            <CardFooter>
              <Button variant="secondary" size="sm" className="w-full font-black uppercase tracking-widest text-[10px] bg-white text-indigo-600 hover:bg-indigo-50">
                Ver mais dicas <ChevronRight size={14} className="ml-1" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-dashed shadow-none bg-muted/30 flex flex-col items-center p-6 text-center">
             <div className="p-3 bg-white rounded-full mb-3 shadow-sm">
               <CheckCircle className="h-6 w-6 text-green-500" />
             </div>
             <h4 className="text-sm font-black mb-1">Satisfação Garantida</h4>
             <p className="text-[10px] text-muted-foreground font-bold uppercase leading-tight max-w-[150px]">98% dos nossos clientes avaliam nosso suporte como excelente.</p>
          </Card>
        </div>
      </div>

      {/* FAQ Integration */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-1 bg-primary rounded-full" />
          <h2 className="text-2xl font-black tracking-tight">Perguntas Frequentes</h2>
        </div>
        <ClientFAQ />
      </div>

      <Dialog open={!!selectedTicketId} onOpenChange={(open) => !open && setSelectedTicketId(null)}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
          <DialogHeader className="p-8 border-b bg-muted/5">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-xl font-black tracking-tight">{selectedTicket?.subject}</DialogTitle>
                <DialogDescription className="font-bold text-[10px] uppercase tracking-widest mt-1">Protocolo #{selectedTicket?.id.split('-')[1] || selectedTicket?.id}</DialogDescription>
              </div>
              <StatusBadge 
                status={selectedTicket?.status === 'closed' ? 'complete' : (selectedTicket?.status === 'in_progress' ? 'progress' : 'pending')} 
                label={selectedTicket?.status === 'closed' ? 'Resolvido' : (selectedTicket?.status === 'in_progress' ? 'Atendimento' : 'Aguardando')}
                size="sm"
              />
            </div>
          </DialogHeader>
          
          <ChatScrollArea className="flex-1 p-8">
            <div className="space-y-6">
              {selectedTicket?.messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex flex-col max-w-[80%] space-y-2",
                  msg.role === 'client' ? "ml-auto items-end" : "items-start"
                )}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">{msg.senderName}</span>
                    <span className="text-[9px] font-medium text-muted-foreground/60">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.role === 'client' 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-muted text-foreground rounded-tl-none border border-border/20"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </ChatScrollArea>

          {selectedTicket?.status !== 'closed' && (
            <div className="p-6 bg-card border-t border-border/10">
              <div className="flex gap-3">
                <Input 
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Escreva sua resposta técnica..." 
                  className="h-12 rounded-xl focus:ring-primary/20"
                  onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                />
                <Button onClick={handleSendReply} className="h-12 w-12 rounded-xl p-0">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;
