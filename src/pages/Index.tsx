import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Stats } from "@/components/Dashboard/Stats";
import { DashboardCharts } from "@/components/Dashboard/DashboardCharts";
import { PropertyCard } from "@/components/Properties/PropertyCard";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { InspectionItem } from "@/components/Inspection/InspectionItem";
import { WarrantyClaim } from "@/components/Warranty/WarrantyClaim";
import { 
  Calendar, 
  ClipboardCheck, 
  ShieldCheck, 
  ChevronRight, 
  Home, 
  Plus, 
  Activity, 
  RefreshCw, 
  Layers, 
  Clock, 
  History as HistoryIcon,
  DollarSign,
  Users,
  Star
} from "lucide-react";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { propertyService } from "@/services/PropertyService";
import { inspectionService } from "@/services/InspectionService";
import { warrantyFlowService } from "@/services/WarrantyFlowService";
import { auditLogService } from "@/services/AuditLogService";
import { financialService } from "@/services/FinancialService";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import { formatCurrency } from "@/lib/utils";


import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const properties = useMemo(() => propertyService.getAll().slice(0, 3), []);
  const inspections = useMemo(() => inspectionService.getAll().slice(0, 3), []);
  const warrantyClaims = useMemo(() => warrantyFlowService.getAllRequests().slice(0, 2), []);
  const recentActivities = useMemo(() => auditLogService.getRecentLogs(5), []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      auditLogService.log({
        entityType: 'system',
        entityId: 'dashboard',
        action: 'updated',
        performedBy: 'admin-1',
        performedByName: 'Administrador',
        performedByRole: 'admin',
        details: 'Dashboard sincronizado manualmente.'
      });
      toast({ title: "Dados atualizados", description: "O dashboard foi sincronizado com os dados mais recentes." });
    }, 800);
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <PageHeader
        icon={Home}
        title={`Olá, ${user?.name?.split(' ')[0] || 'Administrador'}`}
        description="Gestão integrada de empreendimentos, vistorias e garantias."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading} className="rounded-lg">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/design-system")} className="rounded-lg h-9">
            <Layers className="mr-2 h-4 w-4" />
            Design System
          </Button>
          <Button onClick={() => navigate("/admin/properties")} className="bg-primary hover:bg-primary/90 rounded-lg h-9">
            <Plus className="mr-2 h-4 w-4" />
            Novo Empreendimento
          </Button>
        </div>
      </PageHeader>
      
      <Stats />
      
      <DashboardCharts />
      
      <QuickActions />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-layout-gap">
        <div className="xl:col-span-2 space-y-8">
          {/* Recent Properties */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2">Empreendimentos Ativos</h2>
              <Button variant="ghost" size="sm" className="gap-1 font-bold text-primary" onClick={() => navigate("/admin/properties")}>
                Ver todos
                <ChevronRight size={16} />
              </Button>
            </div>
            <ResponsiveGrid columns={2} gap="layout">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </ResponsiveGrid>
          </section>

          {/* Inspections */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2 flex items-center gap-2">
                <ClipboardCheck size={24} className="text-primary" />
                Vistorias Agendadas
              </h2>
              <Button variant="ghost" size="sm" className="gap-1 font-bold text-primary" onClick={() => navigate("/admin/inspections")}>
                Ver todas
                <ChevronRight size={16} />
              </Button>
            </div>
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-slow">
              {inspections.length > 0 ? inspections.map((inspection) => (
                <Card key={inspection.id} className="card-standard overflow-hidden border-none bg-card/40 backdrop-blur-md card-hover-effect rounded-2xl shadow-sem-sm hover:shadow-sem-md transition-all">
                  <CardContent className="p-0">
                    <InspectionItem inspection={inspection as any} />
                  </CardContent>
                </Card>
              )) : (
                <div className="py-12 text-center bg-muted/10 rounded-2xl border border-dashed">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Nenhuma vistoria para hoje</p>
                </div>
              )}
            </div>

          </section>
        </div>

        <div className="space-y-8">
          {/* Summary Chart */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2 flex items-center gap-2 text-foreground/90">
                <Activity size={24} className="text-primary" />
                Resumo Geral
              </h2>
            </div>
            <Card className="card-standard border-none bg-card/40 backdrop-blur-md overflow-hidden p-6 rounded-3xl shadow-sem-md">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sem-body-sm font-black uppercase tracking-widest text-muted-foreground/60">Obras no prazo</span>
                    <span className="text-sem-body-sm font-black text-emerald-600">100%</span>
                  </div>
                  <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden border border-border/5 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 w-full rounded-full transition-all duration-1000" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sem-body-sm font-black uppercase tracking-widest text-muted-foreground/60">Vistorias aprovadas</span>
                    <span className="text-sem-body-sm font-black text-primary">92%</span>
                  </div>
                  <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden border border-border/5 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-primary w-[92%] rounded-full transition-all duration-1000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sem-body-sm font-black uppercase tracking-widest text-muted-foreground/60">SLA de Garantias</span>
                    <span className="text-sem-body-sm font-black text-amber-600">88%</span>
                  </div>
                  <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden border border-border/5 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 w-[88%] rounded-full transition-all duration-1000" />
                  </div>
                </div>
              </div>
            </Card>
          </section>


          {/* Warranty Claims */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2 flex items-center gap-2">
                <ShieldCheck size={24} className="text-status-critical" />
                Garantias Urgentes
              </h2>
            </div>
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-slow">
              {warrantyClaims.length > 0 ? (
                warrantyClaims.map((claim) => (
                  <div 
                    key={claim.id} 
                    className="card-standard p-5 interactive-active border-none bg-card/40 backdrop-blur-md group hover:ring-2 hover:ring-status-critical/30 rounded-2xl shadow-sem-sm transition-all" 
                    onClick={() => navigate("/admin/warranty")}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <StatusBadge 
                        status={claim.priority === 'high' || claim.priority === 'critical' ? 'critical' : 'warning'} 
                        label={claim.priority === 'high' ? 'Alta Prioridade' : claim.priority === 'critical' ? 'CRÍTICA' : 'Média'}
                        size="sm"
                      />
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/30 px-2 py-0.5 rounded-lg">{claim.id}</span>
                    </div>
                    <h4 className="text-label group-hover:text-status-critical transition-colors font-black leading-tight">{claim.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-2 font-bold uppercase tracking-tighter">{claim.propertyName} • UN. {claim.unitNumber}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-muted/10 rounded-2xl border border-dashed">
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-widest opacity-40">Sem garantias críticas</p>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest rounded-xl h-12 border-dashed border-primary/20 hover:border-primary/50 hover:bg-primary/5 mt-4 transition-all" onClick={() => navigate("/admin/warranty")}>
              Gerenciar Fluxo de Assistência
            </Button>
          </section>


          {/* Recent Activities */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2 flex items-center gap-2">
                <HistoryIcon size={24} className="text-primary" />
                Atividades Recentes
              </h2>
            </div>
            <Card className="card-standard border-none bg-card/40 backdrop-blur-md overflow-hidden rounded-[2rem] shadow-sem-lg">
              <CardContent className="p-0">
                <div className="divide-y divide-border/5">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="p-5 hover:bg-primary/5 transition-all group">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-2.5 h-2.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors flex-shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.2)]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sem-body-sm leading-relaxed">
                            <span className="font-black text-foreground">{activity.performedByName}</span>{" "}
                            <span className="text-muted-foreground font-medium">{activity.details}</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-2 flex items-center gap-1.5 font-black uppercase tracking-widest">
                            <Clock size={12} className="opacity-50" />
                            {new Date(activity.timestamp).toLocaleDateString('pt-BR')} • {new Date(activity.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-5 border-t border-border/5 text-center bg-muted/5">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full h-11 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:bg-transparent transition-all"
                    onClick={() => navigate("/admin/audit-logs")}
                  >
                    Ver Logs Completos <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
