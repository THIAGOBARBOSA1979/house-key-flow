import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Stats } from "@/components/Dashboard/Stats";
import { DashboardCharts } from "@/components/Dashboard/DashboardCharts";
import { PropertyCard } from "@/components/Properties/PropertyCard";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { InspectionItem } from "@/components/Inspection/InspectionItem";
import { WarrantyClaim } from "@/components/Warranty/WarrantyClaim";
import { Calendar, ClipboardCheck, ShieldCheck, ChevronRight, Home, Plus, Activity, RefreshCw, Layers, Clock, History as HistoryIcon } from "lucide-react";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { propertyService } from "@/services/PropertyService";
import { inspectionService } from "@/services/InspectionService";
import { warrantyFlowService } from "@/services/WarrantyFlowService";
import { auditLogService } from "@/services/AuditLogService";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";

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
            <div className="space-y-4-sem animate-in fade-in slide-in-from-left-4 duration-slow">
              {inspections.map((inspection) => (
                <Card key={inspection.id} className="card-standard overflow-hidden border-none bg-card/50 backdrop-blur-sm card-hover-effect">
                  <CardContent className="p-0">
                    <InspectionItem inspection={inspection as any} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Summary Chart */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2 flex items-center gap-2">
                <Activity size={24} className="text-primary" />
                Resumo Geral
              </h2>
            </div>
            <Card className="card-standard border-none bg-card/50 backdrop-blur-sm overflow-hidden p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sem-body-sm font-medium text-muted-foreground">Obras no prazo</span>
                  <span className="text-sem-body-sm font-bold">100%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-status-complete w-full" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sem-body-sm font-medium text-muted-foreground">Vistorias aprovadas</span>
                  <span className="text-sem-body-sm font-bold">92%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-status-progress w-[92%]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sem-body-sm font-medium text-muted-foreground">SLA de Garantias</span>
                  <span className="text-sem-body-sm font-bold">88%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-status-pending w-[88%]" />
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
            <ResponsiveGrid columns={1} gap="sm-sem" className="animate-in fade-in slide-in-from-right-4 duration-slow">
              {warrantyClaims.length > 0 ? (
                warrantyClaims.map((claim) => (
                  <div 
                    key={claim.id} 
                    className="card-standard p-5 interactive-active border-none bg-card/50 backdrop-blur-sm group hover:ring-2 hover:ring-status-critical/30" 
                    onClick={() => navigate("/admin/warranty")}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <StatusBadge 
                        status={claim.priority === 'high' || claim.priority === 'critical' ? 'critical' : 'warning'} 
                        label={claim.priority === 'high' ? 'Alta' : claim.priority === 'critical' ? 'Crítica' : 'Média'}
                        size="sm"
                      />
                      <span className="text-sem-tiny font-bold text-muted-foreground uppercase tracking-tighter">{claim.id}</span>
                    </div>
                    <h4 className="text-label group-hover:text-status-critical transition-colors">{claim.title}</h4>
                    <p className="text-sem-body-sm text-muted-foreground mt-1 font-medium">{claim.propertyName} • Un. {claim.unitNumber}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-muted/20 rounded-lg border border-dashed border-border">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Sem garantias urgentes</p>
                </div>
              )}
            </ResponsiveGrid>
            <Button variant="outline" className="w-full text-xs font-bold rounded-lg h-10 border-dashed mt-4" onClick={() => navigate("/admin/warranty")}>
              Gerenciar todas as garantias
            </Button>
          </section>

          {/* Recent Activities */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h2 flex items-center gap-2">
                <HistoryIcon size={24} className="text-primary" />
                Logs de Auditoria
              </h2>
            </div>
            <Card className="card-standard border-none bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-border/10">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-primary/5 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-primary/40 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sem-body-sm leading-tight">
                            <span className="font-bold text-primary">{activity.performedByName}</span>{" "}
                            <span className="text-muted-foreground font-medium">{activity.details}</span>
                          </p>
                          <p className="text-sem-tiny text-muted-foreground mt-2 flex items-center gap-1.5 font-bold uppercase tracking-tighter">
                            <Clock size={10} />
                            {new Date(activity.timestamp).toLocaleDateString('pt-BR')} {new Date(activity.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-border/10 text-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-tiny font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
                    onClick={() => navigate("/admin/audit-logs")}
                  >
                    Ver logs completos
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
