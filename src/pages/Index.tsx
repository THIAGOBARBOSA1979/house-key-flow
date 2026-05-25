import { useNavigate } from "react-router-dom";
import { 
  Home, 
  RefreshCw, 
  Layers, 
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { Stats } from "@/components/dashboard/Stats";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActiveProperties } from "@/components/dashboard/ActiveProperties";
import { ScheduledInspections } from "@/components/dashboard/ScheduledInspections";
import { SystemHealth } from "@/components/dashboard/SystemHealth";
import { CriticalWarranties } from "@/components/dashboard/CriticalWarranties";
import { RecentTickets } from "@/components/dashboard/RecentTickets";
import { SystemAuditTimeline } from "@/components/dashboard/SystemAuditTimeline";
import { GeneralSummary } from "@/components/dashboard/GeneralSummary";
import { PendingDocuments } from "@/components/dashboard/PendingDocuments";
import { useDashboardData } from "@/hooks";
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
    inspections, 
    warrantyClaims, 
    recentActivities, 
    recentTickets, 
    healthMetrics,
    propertyMetrics,
    refreshData 
  } = useDashboardData();


  return (
    <div className="layout-stack pb-layout-gap-xl animate-in fade-in duration-1000">
      <PageHeader
        icon={Home}
        title={`Bem-vindo, ${user?.name?.split(' ')[0] || 'Administrador'}`}
        description="Acompanhe a saúde operacional, o progresso das obras e os indicadores de performance da sua incorporadora."
        className="mb-layout-gap-lg"
      >
        <div className="flex items-center gap-component-gap-md">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={refreshData} 
            disabled={loading} 
            className="rounded-xl border-border/40 hover:border-primary/30"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin/design-system")} 
            className="rounded-xl h-11 px-6 border-border/40 hover:border-primary/30"
          >
            <Layers className="mr-2 h-4 w-4" />
            Brand Book
          </Button>
          <Button 
            onClick={() => navigate("/admin/properties")} 
            className="bg-primary hover:bg-primary/90 rounded-xl h-11 px-6 font-bold shadow-sem-md shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
            Novo Empreendimento
          </Button>
        </div>

      </PageHeader>
      
      <Stats />
      
      <DashboardCharts 
        inspections={inspections} 
        warranties={warrantyClaims} 
      />
      
      <QuickActions />
      
      <div className="grid-dashboard">
        <div className="lg:col-span-7 xl:col-span-8 layout-stack">
          <ActiveProperties />
          <ScheduledInspections inspections={inspections} />
          
          <section className="animate-in fade-in slide-up duration-slow delay-100">
            <div className="flex items-center justify-between mb-layout-gap">
              <h2 className="text-xl md:text-h2 flex items-center gap-2 font-black uppercase tracking-tighter">
                <Layers className="text-primary h-5 w-5" />
                Matriz de Não Conformidades (NCs)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-layout-gap">
              <div className="p-card-padding-lg bg-gradient-to-br from-red-500/[0.04] to-transparent border border-red-500/10 rounded-[2.5rem] transition-all hover:bg-red-500/[0.06] hover:border-red-500/20 group/nc">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-component-gap-md flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  NCs Estruturais
                </p>
                <p className="text-5xl font-black text-red-700 tracking-tighter group-hover/nc:scale-110 transition-transform origin-left">0</p>
                <p className="text-[11px] text-red-600/60 font-semibold mt-card-gap">Nenhuma patologia de alto risco detectada no ciclo atual</p>
              </div>
              <div className="p-card-padding-lg bg-gradient-to-br from-amber-500/[0.04] to-transparent border border-amber-500/10 rounded-[2.5rem] transition-all hover:bg-amber-500/[0.06] hover:border-amber-500/20 group/nc">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-component-gap-md flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  NCs de Acabamento
                </p>
                <p className="text-5xl font-black text-amber-700 tracking-tighter group-hover/nc:scale-110 transition-transform origin-left">14</p>
                <p className="text-[11px] text-amber-600/60 font-semibold mt-card-gap">8 em processo de homologação e correção imediata</p>
              </div>


            </div>
          </section>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 layout-stack">
          <SystemHealth metrics={healthMetrics} />
          
          <GeneralSummary 
            averageProgress={propertyMetrics?.averageProgress || 0}
            inspectionsCompletedPercent={inspections.length > 0 ? Math.round((inspections.filter(i => i.status === 'completed' || i.status === 'complete').length / inspections.length) * 100) : 0}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-layout-gap">
            <PendingDocuments />
          </div>

          <CriticalWarranties />
          <RecentTickets tickets={recentTickets} />
          <SystemAuditTimeline activities={recentActivities} />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;