import { memo, useState, useEffect } from "react";
import { AppLayout as DashboardLayout } from "@/components/layout/AppLayout";
import { Stats } from "@/components/dashboard/Stats";
import { ActiveProperties } from "@/components/dashboard/ActiveProperties";
import { ScheduledInspections } from "@/components/dashboard/ScheduledInspections";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { LayoutGrid, Layers } from "lucide-react";
import { inspectionService, warrantyFlowService } from "@/services";
import { cn } from "@/lib/utils";

const Index = () => {
  const [inspections, setInspections] = useState<any[]>([]);
  const [warranties, setWarranties] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const inspData = await inspectionService.getAll();
      setInspections(inspData);
      const warData = await warrantyFlowService.getAll();
      setWarranties(warData);
    };
    loadData();
  }, []);

  return (
    <DashboardLayout>
      <PageHeader 
        title="Painel Estratégico" 
        subtitle="Gestão de Ativos & Conformidade Técnica"
        icon={LayoutGrid}
      />
      
      <Stats className="mb-layout-gap-lg" />
      
      <div className="grid-dashboard gap-layout-gap-lg">
        <div className="lg:col-span-7 xl:col-span-8 layout-stack gap-layout-gap-lg">
          <ActiveProperties />
          <ScheduledInspections inspections={inspections} />
          
          <section className="animate-in fade-in slide-up duration-slow delay-100 p-card-padding-lg bg-card/40 backdrop-blur-md rounded-[2.5rem] border border-border/10 shadow-sem-sm">
            <div className="flex items-center justify-between mb-layout-gap">
              <h2 className="text-xl md:text-h4 flex items-center gap-3 font-black uppercase tracking-tighter">
                <Layers className="text-primary h-6 w-6" />
                Matriz de Não Conformidades (NCs)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-layout-gap">
              <div className="p-card-padding-lg bg-gradient-to-br from-red-500/[0.04] to-transparent border border-red-500/10 rounded-3xl transition-all hover:bg-red-500/[0.08] hover:border-red-500/30 group/nc cursor-default">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-component-gap-md flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  NCs Estruturais
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-black text-red-700 tracking-tighter group-hover/nc:scale-105 transition-transform origin-left">0</p>
                  <span className="text-xs font-bold text-red-600/40 uppercase tracking-widest">Patologias</span>
                </div>
                <p className="text-[11px] text-red-600/70 font-semibold mt-card-gap leading-relaxed">Nenhuma patologia de alto risco detectada no ciclo técnico atual.</p>
              </div>
              <div className="p-card-padding-lg bg-gradient-to-br from-amber-500/[0.04] to-transparent border border-amber-500/10 rounded-3xl transition-all hover:bg-amber-500/[0.08] hover:border-amber-500/30 group/nc cursor-default">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-component-gap-md flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  NCs de Acabamento
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-black text-amber-700 tracking-tighter group-hover/nc:scale-105 transition-transform origin-left">14</p>
                  <span className="text-xs font-bold text-amber-600/40 uppercase tracking-widest">Ocorrências</span>
                </div>
                <p className="text-[11px] text-amber-600/70 font-semibold mt-card-gap leading-relaxed">08 protocolos em processo de homologação e correção imediata.</p>
              </div>
            </div>
          </section>
        </div>
        
        <div className="lg:col-span-5 xl:col-span-4">
          <DashboardCharts inspections={inspections} warranties={warranties} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default memo(Index);
