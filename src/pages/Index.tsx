import { memo, useState, useEffect } from "react";
import { AppLayout as DashboardLayout } from "@/components/layout/AppLayout";
import { Stats } from "@/components/dashboard/Stats";
import { ActiveProperties } from "@/components/dashboard/ActiveProperties";
import { ScheduledInspections } from "@/components/dashboard/ScheduledInspections";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, Layers, Activity, Users, ShieldAlert, History } from "lucide-react";
import { inspectionService, warrantyFlowService, auditLogService } from "@/services";
import { cn } from "@/lib/utils";

const Index = () => {
  const [inspections, setInspections] = useState<any[]>([]);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const inspData = await inspectionService.getAll();
      setInspections(inspData);
      const warData = await warrantyFlowService.getAll();
      setWarranties(warData);
      const logs = auditLogService.getAllLogs().slice(0, 5);
      setRecentLogs(logs);
    };
    loadData();
  }, []);

  return (
    <DashboardLayout>
      <PageHeader 
        title="Painel Estratégico" 
        description="Gestão de Ativos & Governança Operacional"
        icon={LayoutGrid}
      />
      
      <Stats className="mb-layout-gap-lg" />
      
      <div className="grid-dashboard gap-layout-gap-lg">
        <div className="lg:col-span-7 xl:col-span-8 layout-stack gap-layout-gap-lg">
          <ActiveProperties />
          <ScheduledInspections inspections={inspections} />
          
          <section className="animate-in fade-in slide-up duration-slow delay-100 p-card-padding-lg bg-card/60 backdrop-blur-xl rounded-card border border-border/40 shadow-sem-md hover:shadow-sem-lg transition-all duration-500">
            <div className="flex items-center justify-between mb-layout-gap">
              <h2 className="text-xl md:text-h4 flex items-center gap-4 font-black uppercase tracking-tighter group/title">
                <Layers className="text-primary h-7 w-7 group-hover/title:rotate-12 transition-transform duration-slow" strokeWidth={2.5} />
                Matriz de Não Conformidades (NCs)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-layout-gap">
              <div className="p-card-padding-lg bg-gradient-to-br from-status-critical/[0.04] to-transparent border border-status-critical/10 rounded-2xl transition-all hover:bg-status-critical/[0.08] hover:border-status-critical/30 group/nc cursor-default">
                <p className="text-[10px] font-black text-status-critical uppercase tracking-widest mb-component-gap-md flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-critical animate-pulse" />
                  NCs Estruturais
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-black text-status-critical tracking-tighter group-hover/nc:scale-105 transition-transform origin-left">0</p>
                  <span className="text-xs font-bold text-status-critical/40 uppercase tracking-widest">Patologias</span>
                </div>
                <p className="text-[11px] text-status-critical/70 font-semibold mt-card-gap leading-relaxed">Nenhuma patologia de alto risco detectada no ciclo técnico atual.</p>
              </div>
              <div className="p-card-padding-lg bg-gradient-to-br from-status-pending/[0.04] to-transparent border border-status-pending/10 rounded-2xl transition-all hover:bg-status-pending/[0.08] hover:border-status-pending/30 group/nc cursor-default">
                <p className="text-[10px] font-black text-status-pending uppercase tracking-widest mb-component-gap-md flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-pending animate-pulse" />
                  NCs de Acabamento
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-black text-status-pending tracking-tighter group-hover/nc:scale-105 transition-transform origin-left">14</p>
                  <span className="text-xs font-bold text-status-pending/40 uppercase tracking-widest">Ocorrências</span>
                </div>
                <p className="text-[11px] text-status-pending/70 font-semibold mt-card-gap leading-relaxed">08 protocolos em processo de homologação e correção imediata.</p>
              </div>
            </div>
          </section>

          <section className="animate-in fade-in slide-up duration-slow delay-200 p-card-padding-lg bg-card/60 backdrop-blur-xl rounded-card border border-border/40 shadow-sem-md">
            <div className="flex items-center justify-between mb-layout-gap">
              <h2 className="text-xl md:text-h4 flex items-center gap-4 font-black uppercase tracking-tighter">
                <History className="text-primary h-7 w-7" strokeWidth={2.5} />
                Rastreabilidade de Segurança Recente
              </h2>
            </div>
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/5 hover:bg-muted/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shadow-sm">
                      <Activity size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none mb-1">{log.details}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{log.performedByName} • {new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">
                    {log.action}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        </div>
        
        <div className="lg:col-span-5 xl:col-span-4 space-y-layout-gap-lg">
          <DashboardCharts inspections={inspections} warranties={warranties} />
          
          <Card className="rounded-card border-none bg-primary/5 dark:bg-primary/10 backdrop-blur-xl overflow-hidden shadow-sem-lg border border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-black tracking-tight flex items-center gap-3">
                <ShieldAlert className="text-primary h-5 w-5" />
                Alertas de Governança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-2xl bg-status-critical/5 border border-status-critical/10 flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-status-critical/10 flex items-center justify-center text-status-critical shrink-0">
                  <Activity size={14} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-status-critical">Backup Pendente</p>
                  <p className="text-[11px] text-status-critical/70 font-bold leading-relaxed">Último backup completo realizado há 18 horas. Recomenda-se sincronização manual.</p>
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-status-pending/5 border border-status-pending/10 flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-status-pending/10 flex items-center justify-center text-status-pending shrink-0">
                  <Users size={14} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-status-pending">Novos Registros</p>
                  <p className="text-[11px] text-status-pending/70 font-bold leading-relaxed">4 novos usuários aguardando homologação de acesso no módulo staff.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default memo(Index);
