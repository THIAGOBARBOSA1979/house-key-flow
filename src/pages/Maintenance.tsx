import { useState, useEffect } from "react";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { 
  Wrench, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  Building2,
  User as UserIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { maintenanceScheduleService, MaintenanceSchedule } from "@/services/operations/MaintenanceScheduleService";
import { propertyService } from "@/services";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks";

const Maintenance = () => {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<MaintenanceSchedule>>({
    title: "",
    description: "",
    status: "pending",
    frequency: "monthly",
    scheduled_date: new Date()
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [scheds, props] = await Promise.all([
        maintenanceScheduleService.getAll(),
        propertyService.getAll()
      ]);
      setSchedules(scheds);
      setProperties(props);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!formData.title || !formData.property_id || !formData.scheduled_date) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }

    try {
      await maintenanceScheduleService.create(formData as any);
      toast({ title: "Sucesso", description: "Manutenção agendada com sucesso." });
      setIsDialogOpen(false);
      loadData();
      setFormData({
        title: "",
        description: "",
        status: "pending",
        frequency: "monthly",
        scheduled_date: new Date()
      });
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao agendar manutenção.", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-500 text-white border-none font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg">Concluído</Badge>;
      case 'pending': return <Badge variant="outline" className="border-amber-500 text-amber-600 font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg">Pendente</Badge>;
      case 'in_progress': return <Badge className="bg-primary text-white border-none font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg">Em Andamento</Badge>;
      case 'cancelled': return <Badge variant="destructive" className="font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg">Cancelado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <PageTemplate
      title="Manutenção Preventiva (ISO 9001)"
      description="Gestão de cronogramas e ciclos de inspeção técnica preventiva para conformidade normativa."
      icon={Wrench}
    >
      <div className="space-y-8 animate-in fade-in duration-slow">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Buscar manutenções..." 
              className="pl-12 rounded-2xl h-12 bg-white/50 border-border/50 focus:bg-white focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px]">
              <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20">
                  <Plus className="mr-2 h-4 w-4" /> Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="bg-primary p-10 text-white">
                  <DialogTitle className="text-3xl font-black tracking-tighter">Agendar Manutenção</DialogTitle>
                  <DialogDescription className="text-white/80 font-medium">Configure os parâmetros técnicos para a nova inspeção ISO 9001.</DialogDescription>
                </DialogHeader>
                <div className="p-10 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Título da Manutenção</Label>
                    <Input 
                      placeholder="Ex: Inspeção Elétrica Geral" 
                      className="rounded-xl h-12"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Empreendimento</Label>
                      <Select onValueChange={(val) => setFormData({ ...formData, property_id: val })}>
                        <SelectTrigger className="rounded-xl h-12">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                          {properties.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Frequência</Label>
                      <Select onValueChange={(val: any) => setFormData({ ...formData, frequency: val })} defaultValue="monthly">
                        <SelectTrigger className="rounded-xl h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="quarterly">Trimestral</SelectItem>
                          <SelectItem value="biannual">Semestral</SelectItem>
                          <SelectItem value="annual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descrição Técnica</Label>
                    <Textarea 
                      placeholder="Detalhes sobre a conformidade técnica esperada..." 
                      className="rounded-xl min-h-[100px]"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter className="p-10 bg-muted/30">
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-black uppercase tracking-widest text-[10px]">Cancelar</Button>
                  <Button onClick={handleCreate} className="rounded-xl px-10 font-black uppercase tracking-widest text-[10px]">Salvar Agendamento</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="rounded-[2rem] border-none shadow-md bg-white p-8 group hover:shadow-xl transition-all">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/5 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                  <CalendarIcon size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Próximos 30 Dias</p>
                   <h3 className="text-3xl font-black tracking-tighter">12 Agendas</h3>
                </div>
             </div>
          </Card>
          <Card className="rounded-[2rem] border-none shadow-md bg-white p-8 group hover:shadow-xl transition-all">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Concluídos (Mês)</p>
                   <h3 className="text-3xl font-black tracking-tighter">45 Inspeções</h3>
                </div>
             </div>
          </Card>
          <Card className="rounded-[2rem] border-none shadow-md bg-white p-8 group hover:shadow-xl transition-all">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
                  <AlertCircle size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Atrasos Críticos</p>
                   <h3 className="text-3xl font-black tracking-tighter">02 Alertas</h3>
                </div>
             </div>
          </Card>
        </div>

        {/* Schedule List */}
        <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden">
           <CardHeader className="p-10 border-b border-border/5">
             <CardTitle className="text-2xl font-black tracking-tighter">Linha do Tempo de Manutenção</CardTitle>
             <CardDescription className="font-medium">Lista cronológica de inspeções e manutenções programadas para todos os ativos.</CardDescription>
           </CardHeader>
           <CardContent className="p-0">
             {isLoading ? (
               <div className="py-20 flex flex-col items-center justify-center gap-4">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando cronogramas...</span>
               </div>
             ) : schedules.length === 0 ? (
               <div className="py-20 text-center space-y-4">
                 <div className="p-6 bg-muted/30 rounded-full w-fit mx-auto text-muted-foreground">
                   <Wrench size={40} />
                 </div>
                 <p className="text-sm text-muted-foreground font-medium italic">Nenhum agendamento ativo no sistema.</p>
               </div>
             ) : (
               <div className="divide-y divide-border/5">
                 {schedules.map((item) => (
                   <div key={item.id} className="p-8 hover:bg-muted/30 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-8">
                         <div className="flex flex-col items-center justify-center bg-primary/5 p-4 rounded-2xl min-w-[100px] border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                            <span className="text-sm font-black uppercase tracking-widest">{format(new Date(item.scheduled_date), 'MMM', { locale: ptBR })}</span>
                            <span className="text-2xl font-black tracking-tighter">{format(new Date(item.scheduled_date), 'dd')}</span>
                         </div>
                         <div className="space-y-2">
                            <div className="flex items-center gap-3">
                               <h4 className="font-black text-xl tracking-tight group-hover:text-primary transition-colors">{item.title}</h4>
                               {getStatusBadge(item.status)}
                            </div>
                            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                               <span className="flex items-center gap-2 text-primary font-black"><Building2 size={14} /> {properties.find(p => p.id === item.property_id)?.name || "Empreendimento"}</span>
                               <span className="flex items-center gap-2"><Clock size={14} /> Ciclo {item.frequency}</span>
                               <span className="flex items-center gap-2"><UserIcon size={14} /> Resp: {item.assigned_to ? "Técnico Alocado" : "Pendente"}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 hover:bg-primary/5 text-primary">
                            <Edit size={20} />
                         </Button>
                         <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 hover:bg-destructive/5 text-destructive">
                            <Trash2 size={20} />
                         </Button>
                         <Button className="rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[10px] bg-primary group-hover:translate-x-1 transition-transform">Gerir Protocolo</Button>
                      </div>
                   </div>
                 ))}
               </div>
             )}
           </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default Maintenance;
