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
  Smartphone
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
import { cn } from "@/lib/utils";

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
    <div className="container-responsive py-layout-gap space-y-layout-gap pb-20 md:pb-6 animate-in fade-in duration-slow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <span className="w-2.5 h-2.5 rounded-full bg-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Suporte ao Proprietário • Central de SLA</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground flex items-center gap-3">
            Garantia & Suporte <span className="text-primary">.</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-primary/5 text-primary border-primary/10 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl">
            SLA de Resposta: 24h
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-layout-gap">
        <Card className="shadow-2xl border-none bg-card/60 backdrop-blur-md rounded-[2.5rem]">
          <CardHeader className="p-10 pb-6">
            <CardTitle className="text-2xl font-black tracking-tight">Nova Solicitação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Assunto</label>
                <Input 
                  value={formState.subject} 
                  onChange={e => setFormState(prev => ({...prev, subject: e.target.value}))} 
                  placeholder="Ex: Vazamento na cozinha" 
                  className="h-12 rounded-xl" required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Descrição</label>
                <Textarea 
                  value={formState.message} 
                  onChange={e => setFormState(prev => ({...prev, message: e.target.value}))} 
                  placeholder="Detalhe o ocorrido..." 
                  className="min-h-[150px] rounded-xl resize-none" required 
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
            <div className="mt-8">
              <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl" onClick={() => setSelectedTicketId(null)}>
                Fechar Protocolo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;
