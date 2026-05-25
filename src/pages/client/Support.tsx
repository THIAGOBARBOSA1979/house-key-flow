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
  FileQuestion
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
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <LifeBuoy className="h-7 w-7 text-primary" strokeWidth={3} />
            </div>
            Central de Garantia e Suporte
          </h1>
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
              <Button type="submit" className="w-full h-14 font-black uppercase tracking-widest text-[11px]">
                Abrir Protocolo de Garantia
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none bg-white rounded-[2.5rem]">
          <CardHeader>
            <CardTitle className="text-xl font-black tracking-tight">Meus Protocolos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {tickets.length > 0 ? (
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-6 rounded-[1.5rem] bg-muted/30 hover:bg-primary/5 transition-all border border-transparent hover:border-primary/20 cursor-pointer" onClick={() => setSelectedTicketId(ticket.id)}>
                      <div className="flex items-center justify-between mb-3">
                         <span className="text-[10px] font-black uppercase tracking-widest text-brand">{ticket.protocol}</span>
                         <StatusBadge status={ticket.status === 'resolved' ? 'complete' : 'progress'} label={ticket.status} size="sm" />
                      </div>
                      <h4 className="font-black text-sm mb-2">{ticket.subject}</h4>
                      <p className="text-[10px] text-muted-foreground font-bold">Atualizado em: {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString() : ''}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-20 text-center opacity-40">
                <MessageSquare size={48} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-[10px]">Sem protocolos abertos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedTicketId} onOpenChange={(open) => !open && setSelectedTicketId(null)}>
        <DialogContent className="max-w-2xl h-[70vh] flex flex-col p-8 overflow-hidden rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
            <DialogDescription>Protocolo: {selectedTicket?.protocol}</DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex-1 bg-muted/20 rounded-2xl p-6 overflow-y-auto">
             <p className="text-sm font-medium leading-relaxed">{selectedTicket?.description}</p>
             <div className="mt-8 border-t pt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acompanhe pelo WhatsApp</p>
                <p className="text-xs font-bold mt-2">Você receberá atualizações automáticas sobre este protocolo diretamente no seu celular.</p>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;
