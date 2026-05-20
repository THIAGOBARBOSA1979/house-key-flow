import { useNavigate } from "react-router-dom";
import { 
  Home, 
  RefreshCw, 
  Layers, 
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/Layout/PageHeader";
import { Stats } from "@/components/Dashboard/Stats";
import { DashboardCharts } from "@/components/Dashboard/DashboardCharts";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { ActiveProperties } from "@/components/Dashboard/ActiveProperties";
import { ScheduledInspections } from "@/components/Dashboard/ScheduledInspections";
import { SystemHealth } from "@/components/Dashboard/SystemHealth";
import { CriticalWarranties } from "@/components/Dashboard/CriticalWarranties";
import { RecentTickets } from "@/components/Dashboard/RecentTickets";
import { SystemAuditTimeline } from "@/components/Dashboard/SystemAuditTimeline";
import { GeneralSummary } from "@/components/Dashboard/GeneralSummary";
import { PendingDocuments } from "@/components/Dashboard/PendingDocuments";
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
      />
      
      <QuickActions />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-layout-gap">
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          <ActiveProperties />
          <ScheduledInspections inspections={inspections} />
          
          <section className="animate-in fade-in slide-up duration-slow delay-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-h2 flex items-center gap-2 font-black uppercase tracking-tighter">
                <Layers className="text-primary h-5 w-5" />
                Matriz de Não Conformidades (NCs)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">NCs Estruturais</p>
                <p className="text-2xl font-black text-red-700">0</p>
                <p className="text-[10px] text-red-600/60 font-medium mt-2">Nenhuma patologia de alto risco detectada</p>
              </div>
              <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">NCs de Acabamento</p>
                <p className="text-2xl font-black text-amber-700">14</p>
                <p className="text-[10px] text-amber-600/60 font-medium mt-2">8 em processo de correção imediata</p>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 space-y-8">
          <SystemHealth metrics={healthMetrics} />
          
          <GeneralSummary 
            averageProgress={propertyMetrics?.averageProgress || 0}
            inspectionsCompletedPercent={inspections.length > 0 ? Math.round((inspections.filter(i => i.status === 'completed' || i.status === 'complete').length / inspections.length) * 100) : 0}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
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