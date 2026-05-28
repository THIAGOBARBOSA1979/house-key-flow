import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { maintenanceScheduleService, MaintenanceSchedule } from "@/services/operations/MaintenanceScheduleService";
import { useClientStage } from "@/hooks";
import { 
  Wrench, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building2,
  Info,
  ShieldCheck,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ClientMaintenance = () => {
  const { user } = useAuth();
  const { profile } = useClientStage(user?.id || "");
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.propertyId) {
      maintenanceScheduleService.getAll(undefined, true, [
        { column: 'property_id', operator: 'eq', value: profile.propertyId }
      ]).then(data => {
        setSchedules(data);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [profile?.propertyId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-500 text-white border-none font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg">Concluído</Badge>;
      case 'pending': return <Badge variant="outline" className="border-amber-500 text-amber-600 font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg">Programado</Badge>;
      case 'in_progress': return <Badge className="bg-primary text-white border-none font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg">Em Andamento</Badge>;
      case 'cancelled': return <Badge variant="destructive" className="font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg">Suspenso</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container-responsive py-8 space-y-12 animate-in fade-in duration-slow">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Governança Técnica • ISO 9001</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
            Manutenção <span className="text-primary">Preventiva</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6">
            <Info className="mr-2 h-4 w-4" /> Guia de Manutenção
          </Button>
          <Button className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-xl shadow-primary/20">
             Solicitar Assistência <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Welcome Card */}
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 overflow-hidden relative group">
             <div className="absolute right-[-5%] bottom-[-5%] opacity-10 group-hover:scale-110 transition-transform duration-1000">
               <ShieldCheck size={280} />
             </div>
             <div className="relative z-10 space-y-6 max-w-lg">
                <Badge className="bg-primary border-none font-black uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 rounded-xl shadow-lg shadow-primary/20">Segurança & Qualidade</Badge>
                <h3 className="text-3xl font-black tracking-tighter">Cuidamos de cada detalhe do seu patrimônio.</h3>
                <p className="text-slate-300 font-medium leading-relaxed">
                  Nosso plano de manutenção preventiva garante que as áreas comuns e a infraestrutura técnica do seu empreendimento estejam sempre em conformidade com as normas ABNT e ISO 9001.
                </p>
                <div className="flex items-center gap-8 pt-4">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Próxima Visita</p>
                      <p className="font-black text-lg text-primary">12 de Junho</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status Geral</p>
                      <p className="font-black text-lg text-emerald-400">100% OK</p>
                   </div>
                </div>
             </div>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
             <CardHeader className="p-10 border-b border-border/5">
                <CardTitle className="text-2xl font-black tracking-tighter">Cronograma Técnico</CardTitle>
                <CardDescription className="font-medium">Confira as manutenções programadas para o seu empreendimento.</CardDescription>
             </CardHeader>
             <CardContent className="p-0">
                {isLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando registros...</span>
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="py-20 text-center space-y-6">
                    <div className="p-6 bg-muted/30 rounded-full w-fit mx-auto text-muted-foreground">
                       <Wrench size={40} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg">Sem agendas para este mês</h4>
                      <p className="text-xs text-muted-foreground font-medium mt-1">Todas as manutenções de rotina estão em dia.</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-border/5">
                    {schedules.map((item) => (
                      <div key={item.id} className="p-8 hover:bg-muted/30 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary transition-all group-hover:bg-primary group-hover:text-white">
                              <CalendarIcon size={24} />
                           </div>
                           <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{item.title}</h4>
                                {getStatusBadge(item.status)}
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Data: {format(new Date(item.scheduled_date), 'dd/MM/yyyy')} • Ciclo {item.frequency}
                              </p>
                           </div>
                        </div>
                        <Button variant="ghost" className="rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary/5 text-primary group-hover:translate-x-1 transition-transform">
                          Ver Detalhes <ChevronRight size={16} className="ml-2" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
             </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
           <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 space-y-6">
              <h3 className="text-xl font-black tracking-tighter flex items-center gap-3">
                 <div className="p-3 bg-primary/5 rounded-xl text-primary">
                    <CheckCircle2 size={20} strokeWidth={3} />
                 </div>
                 Garantia Ativa
              </h3>
              <div className="space-y-4">
                 {[
                   { label: "Elétrica", days: "245 dias" },
                   { label: "Hidráulica", days: "365 dias" },
                   { label: "Estrutura", days: "1.460 dias" }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/5">
                      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-black text-primary">{item.days} restantes</span>
                   </div>
                 ))}
              </div>
              <p className="text-[10px] font-medium text-muted-foreground text-center">
                 A manutenção preventiva em dia assegura a validade integral das suas garantias contratuais.
              </p>
           </Card>

           <Card className="rounded-[2.5rem] border-none shadow-xl bg-primary p-8 text-white relative overflow-hidden group">
              <div className="absolute right-[-10%] top-[-10%] opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                 <AlertCircle size={180} />
              </div>
              <div className="relative z-10 space-y-4">
                 <h4 className="text-xl font-black tracking-tighter">Emergência Técnica?</h4>
                 <p className="text-xs text-white/80 font-medium leading-relaxed">
                    Em caso de vazamentos ou falhas críticas na infraestrutura, acione nosso plantão técnico imediato.
                 </p>
                 <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-2xl font-black uppercase tracking-widest text-[10px] h-12">
                    Ligar para Plantão
                 </Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientMaintenance;
