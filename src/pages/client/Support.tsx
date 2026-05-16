
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supportService, SupportTicket } from "@/services/SupportService";
import { useMemo, useEffect } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";

const Support = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const clientId = user?.id || "client-1";
  const [formState, setFormState] = useState({
    subject: "",
    message: ""
  });
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    setTickets(supportService.getTicketsByClient(clientId));
  }, [clientId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    supportService.createTicket(clientId, formState.subject, formState.message);
    setTickets(supportService.getTicketsByClient(clientId));
    toast({
      title: "Solicitação enviada",
      description: "Sua mensagem foi enviada para nossa equipe de suporte. Responderemos em breve.",
    });
    setFormState({ subject: "", message: "" });
  };

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
    <div className="space-y-layout-gap pb-20 md:pb-6 animate-in fade-in duration-slow">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LifeBuoy className="h-8 w-8 text-primary" />
            Central de Ajuda
          </h1>
          <p className="text-muted-foreground mt-1">
            Encontre respostas rápidas ou fale com nossa equipe especializada.
          </p>
        </div>
      </div>

      {/* Hero Section / Knowledge Base Search */}
      <Card className="bg-gradient-to-br from-primary via-primary to-indigo-700 text-primary-foreground overflow-hidden relative border-none shadow-xl rounded-3xl">
        <div className="absolute right-[-5%] top-[-10%] opacity-10">
          <BookOpen size={200} />
        </div>
        <CardContent className="p-8 md:p-12 relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">Olá! Como podemos ajudar você hoje?</h2>
          <div className="w-full relative group">
            <Input 
              className="h-14 bg-white/15 border-white/20 text-white placeholder:text-white/60 rounded-2xl pl-12 pr-4 text-lg focus:bg-white focus:text-foreground transition-all duration-300 shadow-lg"
              placeholder="Pesquisar em nossa base de conhecimento..."
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-primary h-5 w-5 transition-colors" />
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/50 mr-2">Buscas comuns:</span>
            {['Vistorias', 'Garantias', 'Boletos', 'Prazos'].map(tag => (
              <span key={tag} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 cursor-pointer transition-colors border border-white/10">
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-layout-gap">
        {contactMethods.map((method, idx) => {
          const Icon = method.icon;
          return (
            <Card key={idx} className="hover:shadow-lg transition-all duration-300 group border-none bg-white">
              <CardContent className="p-8 text-center space-y-4">
                <div className={`mx-auto w-16 h-16 ${method.bg} ${method.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon size={28} />
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-tight">{method.title}</h3>
                  <p className="text-sm font-black text-primary mt-1">{method.detail}</p>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">{method.description}</p>
                </div>
                <Button variant="outline" className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest h-11">
                  {method.action}
                  <ChevronRight size={14} className="ml-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-layout-gap">
        {/* Support Ticket Form */}
        <Card className="shadow-lg border-none bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Send className="h-5 w-5 text-primary" />
              </div>
              Abrir um Chamado
            </CardTitle>
            <CardDescription className="font-medium">
              Não encontrou o que precisava? Envie sua solicitação detalhada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-6 hover:bg-muted/30 transition-all duration-300 cursor-pointer border-l-4 border-transparent hover:border-primary group">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded">#{ticket.id.split('-')[1]}</span>
                        <StatusBadge 
                          status={ticket.status === 'closed' ? 'complete' : (ticket.status === 'in_progress' ? 'progress' : 'pending')} 
                          label={ticket.status === 'closed' ? 'Resolvido' : (ticket.status === 'in_progress' ? 'Em Atendimento' : 'Aguardando')}
                          size="sm"
                        />
                      </div>
                      <h4 className="font-black text-sm mb-1.5 group-hover:text-primary transition-colors">{ticket.subject}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed font-medium">{ticket.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{ticket.createdAt.toLocaleDateString('pt-BR')}</p>
                        {ticket.status === 'closed' && (
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase text-primary hover:bg-primary/5 rounded-lg px-3">
                            Avaliar Atendimento
                          </Button>
                        )}
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
    </div>
  );
};

export default Support;
