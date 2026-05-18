import { useNavigate } from "react-router-dom";
import { 
  Home, 
  RefreshCw, 
  Layers, 
  Plus, 
  Activity, 
  FileText,
  Clock,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Stats } from "@/components/Dashboard/Stats";
import { DashboardCharts } from "@/components/Dashboard/DashboardCharts";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { ActiveProperties } from "@/components/Dashboard/ActiveProperties";
import { ScheduledInspections } from "@/components/Dashboard/ScheduledInspections";
import { SystemHealth } from "@/components/Dashboard/SystemHealth";
import { FinancialHealth } from "@/components/Dashboard/FinancialHealth";
import { CriticalWarranties } from "@/components/Dashboard/CriticalWarranties";
import { RecentTickets } from "@/components/Dashboard/RecentTickets";
import { SystemAuditTimeline } from "@/components/Dashboard/SystemAuditTimeline";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Refactored Admin Dashboard.
 * Logic extracted to useDashboardData hook.
 * UI sections moved to individual components.
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    loading, 
    properties, 
    inspections, 
    warrantyClaims, 
    recentActivities, 
    recentTickets, 
    financialMetrics, 
    healthMetrics,
    refreshData 
  } = useDashboardData();

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <PageHeader
        icon={Home}
        title={`Bem-vindo, ${user?.name?.split(' ')[0] || 'Administrador'}`}
        description="Acompanhe a saúde operacional, o progresso das obras e os indicadores de performance da sua incorporadora."

      >
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={refreshData} 
            disabled={loading} 
            className="rounded-lg"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin/design-system")} 
            className="rounded-lg h-9"
          >
            <Layers className="mr-2 h-4 w-4" />
            Brand Book
          </Button>
          <Button 
            onClick={() => navigate("/admin/properties")} 
            className="bg-primary hover:bg-primary/90 rounded-lg h-9"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Empreendimento
          </Button>
        </div>
      </PageHeader>
      
      <Stats />
      
      <DashboardCharts 
        inspections={inspections} 
        warranties={warrantyClaims} 
        financialData={financialMetrics} 
      />
      
      <QuickActions />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-layout-gap">
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          <ActiveProperties properties={properties} />
          <ScheduledInspections inspections={inspections} />
        </div>

        <div className="lg:col-span-5 xl:col-span-4 space-y-8">
          <SystemHealth metrics={healthMetrics} />
          
          {/* Summary Progress Section */}
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
              </div>
            </Card>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            <FinancialHealth metrics={financialMetrics} />
            
            {/* Pending Documents Mini-Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h2 flex items-center gap-2">
                  <FileText size={24} className="text-amber-500" />
                  Pendências de Documentos
                </h2>
              </div>
              <Card className="card-standard border-none bg-amber-500/5 backdrop-blur-md overflow-hidden p-6 rounded-3xl border border-amber-500/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-amber-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-amber-800/80 leading-none">Contratos</p>
                        <p className="text-sm font-bold text-amber-900">8 aguardando assinatura</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => navigate("/admin/documents")} className="text-amber-600 hover:bg-amber-100">
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-amber-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-red-800/80 leading-none">Vencidos</p>
                        <p className="text-sm font-bold text-red-900">3 documentos expirados</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => navigate("/admin/documents")} className="text-red-600 hover:bg-red-100">
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            </section>
          </div>

          <CriticalWarranties claims={warrantyClaims} />
          <RecentTickets tickets={recentTickets} />
          <SystemAuditTimeline activities={recentActivities} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
