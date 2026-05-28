import { useState, useEffect, useMemo } from "react";
import { 
  LifeBuoy, 
  Send, 
  Search, 
  MessageSquare,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Download,
  FileQuestion,
  Clock,
  Smartphone,
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supportTicketService as supportService, SupportTicket, TicketPriority, TicketCategory } from "@/services";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClientFAQ } from "@/components/client-flow/ClientFAQ";
import { SatisfactionSurvey } from "@/components/shared/SatisfactionSurvey";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Support = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    subject: "",
    message: "",
    priority: "medium" as TicketPriority,
    category: "warranty" as TicketCategory
  });
  const [showSurvey, setShowSurvey] = useState(false);

  const fetchTickets = async () => {
    if (!user?.company_id) return;
    const data = await supportService.getAll(user.company_id);
    setTickets(data);
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.company_id) return;

    await supportService.create({
      subject: formState.subject,
      description: formState.message,
      priority: formState.priority,
      status: 'open',
      companyId: user.company_id,
      clientId: user.id,
      metadata: { client_name: user.name }
    }, user.company_id);

    toast({
      title: "Solicitação enviada",
      description: "Seu protocolo foi gerado com sucesso.",
    });
    
    setFormState({ subject: "", message: "", priority: "medium", category: "warranty" });
    fetchTickets();
  };

  const selectedTicket = useMemo(() => 
    tickets.find(t => t.id === selectedTicketId), 
  [tickets, selectedTicketId]);

  return (
    <div className="container-responsive py-4 md:py-8 space-y-8 md:space-y-12 pb-24 md:pb-6 animate-in fade-in duration-slow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <span className="w-2.5 h-2.5 rounded-full bg-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Suporte ao Proprietário • Central de SLA</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground flex items-center gap-3">
            Garantia & Suporte <span className="text-primary">.</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-primary/5 text-primary border-primary/10 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl">
            SLA de Resposta: 24h
          </Badge>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl">
            WhatsApp Ativo
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & History */}
        <div className="lg:col-span-8 space-y-8">
        <Card className="shadow-2xl border-none bg-card/60 backdrop-blur-md rounded-[2.5rem]">
          <CardHeader className="p-10 pb-6">
            <CardTitle className="text-2xl font-black tracking-tight">Nova Solicitação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Assunto do Protocolo</label>
                  <Input 
                    value={formState.subject} 
                    onChange={e => setFormState(prev => ({...prev, subject: e.target.value}))} 
                    placeholder="Ex: Infiltração parede suíte" 
                    className="h-12 rounded-xl focus:ring-primary/20 transition-all" required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Categoria</label>
                  <Select 
                    value={formState.category} 
                    onValueChange={(val: TicketCategory) => setFormState(prev => ({...prev, category: val}))}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="warranty" className="font-bold">Assistência Técnica</SelectItem>
                      <SelectItem value="financial" className="font-bold">Financeiro</SelectItem>
                      <SelectItem value="document" className="font-bold">Documentação</SelectItem>
                      <SelectItem value="other" className="font-bold">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Descrição detalhada</label>
                <Textarea 
                  value={formState.message} 
                  onChange={e => setFormState(prev => ({...prev, message: e.target.value}))} 
                  placeholder="Descreva o ocorrido com o máximo de detalhes para agilizarmos seu atendimento..." 
                  className="min-h-[120px] rounded-xl resize-none" required 
                />
              </div>
              <Button type="submit" className="w-full h-14 font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-lg shadow-primary/10 active:scale-95 transition-all">
                Abrir Protocolo de Garantia
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none bg-white rounded-[2.5rem] flex flex-col overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-xl font-black tracking-tight">Meus Protocolos Ativos</CardTitle>
            <CardDescription className="font-bold">Acompanhe a evolução do seu suporte</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {tickets.length > 0 ? (
              <ScrollArea className="h-[450px]">
                <div className="p-6 pt-0 space-y-4">
                  {tickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className={cn(
                        "p-6 rounded-3xl transition-all duration-300 border-2 cursor-pointer group",
                        selectedTicketId === ticket.id 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-muted/20 bg-muted/10 hover:border-primary/20 hover:bg-white"
                      )} 
                      onClick={() => setSelectedTicketId(ticket.id)}
                    >
                      <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-white px-3 py-1 border border-border/50 text-brand font-black text-[9px] uppercase tracking-widest">
                            {ticket.protocol}
                          </Badge>
                          <StatusBadge 
                            status={ticket.status === 'resolved' ? 'complete' : (ticket.status === 'open' ? 'progress' : 'pending')} 
                            label={ticket.status === 'resolved' ? 'Finalizado' : (ticket.status === 'open' ? 'Em Fila' : 'Em Análise')} 
                            size="sm" 
                          />
                      </div>
                      <h4 className="font-black text-base text-foreground mb-2 group-hover:text-primary transition-colors">{ticket.subject}</h4>
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2">
                          <Clock size={12} /> {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}
                        </p>
                        <ChevronRight size={14} className={cn("transition-transform", selectedTicketId === ticket.id ? "rotate-90" : "")} />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-20 text-center opacity-40">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare size={32} />
                </div>
                <p className="font-black uppercase tracking-widest text-[10px]">Sem protocolos registrados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

        {/* Right Column: FAQ & Quick Help */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-slate-900 text-white p-8 overflow-hidden relative group">
            <div className="absolute right-[-10%] top-[-10%] opacity-10 group-hover:rotate-12 transition-transform duration-1000">
               <HelpCircle size={200} />
            </div>
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-black tracking-tighter">Dúvidas Frequentes</CardTitle>
              <CardDescription className="text-slate-400 font-bold">Respostas instantâneas para você</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               <div className="relative mb-6">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                 <Input 
                   placeholder="Pesquisar na base de conhecimento..." 
                   className="pl-11 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-slate-500 h-12"
                 />
               </div>
               <ClientFAQ />
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                <BookOpen size={20} strokeWidth={3} />
              </div>
              <h3 className="text-lg font-black tracking-tighter">Manuais Técnicos</h3>
            </div>
            <div className="space-y-4">
              {[
                { title: "Manual do Proprietário", size: "4.5 MB" },
                { title: "Guia de Garantia ABNT", size: "1.2 MB" },
                { title: "Normas de Reforma", size: "2.1 MB" }
              ].map((manual, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-primary/5 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-muted-foreground group-hover:text-primary" />
                    <span className="text-xs font-bold">{manual.title}</span>
                  </div>
                  <Download size={14} className="text-muted-foreground group-hover:text-primary" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedTicketId} onOpenChange={(open) => !open && setSelectedTicketId(null)}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
          <div className="h-2 w-full bg-primary" />
          <div className="p-10 flex-1 flex flex-col">
            <DialogHeader className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl">
                  Protocolo: {selectedTicket?.protocol}
                </Badge>
                <StatusBadge 
                  status={selectedTicket?.status === 'resolved' ? 'complete' : (selectedTicket?.status === 'open' ? 'progress' : 'pending')} 
                  size="sm" 
                />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tighter leading-tight">{selectedTicket?.subject}</DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground/60 text-base">Abertura: {selectedTicket?.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString() : ''}</DialogDescription>
            </DialogHeader>
            <div className="flex-1 bg-muted/10 rounded-[2rem] p-8 overflow-y-auto border border-border/5">
               <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Relato do Proprietário</h5>
               <p className="text-base font-medium leading-relaxed text-foreground/80">{selectedTicket?.description}</p>
               
               <div className="mt-12 pt-8 border-t border-border/10">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Próximos Passos & SLA</h5>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-border/5">
                      <div className="p-2 bg-primary/5 text-primary rounded-lg"><Clock size={16} strokeWidth={2.5} /></div>
                      <p className="text-xs font-bold leading-relaxed">Nossa equipe técnica analisará sua solicitação em até <span className="text-primary">24 horas úteis</span>.</p>
                    </div>
                    <div className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-border/5">
                      <div className="p-2 bg-emerald-500/5 text-emerald-600 rounded-lg"><Smartphone size={16} strokeWidth={2.5} /></div>
                      <p className="text-xs font-bold leading-relaxed">Você receberá atualizações automáticas via <span className="text-emerald-600">WhatsApp</span> para cada mudança de status.</p>
                    </div>
                  </div>
               </div>
            </div>
            <div className="mt-8 flex gap-4">
              {selectedTicket?.status === 'resolved' && (
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] border-2 border-primary text-primary hover:bg-primary/5"
                  onClick={() => {
                    setShowSurvey(true);
                    setSelectedTicketId(null);
                  }}
                >
                  <Star size={14} className="mr-2" /> Avaliar Atendimento
                </Button>
              )}
              <Button 
                className={cn("h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl", selectedTicket?.status === 'resolved' ? "w-1/3" : "w-full")} 
                onClick={() => setSelectedTicketId(null)}
              >
                Fechar Detalhes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSurvey} onOpenChange={setShowSurvey}>
        <DialogContent className="max-w-md p-0 border-none bg-transparent shadow-none">
          <SatisfactionSurvey 
            onDismiss={() => setShowSurvey(false)}
            onSubmit={(data) => {
              console.log("Feedback enviado:", data);
              toast({
                title: "Feedback recebido",
                description: "Obrigado por nos ajudar a melhorar nossos processos.",
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;
