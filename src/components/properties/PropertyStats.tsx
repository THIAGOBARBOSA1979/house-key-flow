import { Building, TrendingUp, PieChart, BarChart3 } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { PropertyMetrics } from "@/types/property";

interface PropertyStatsProps {
  metrics: PropertyMetrics;
}

export const PropertyStats = ({ metrics }: PropertyStatsProps) => {
  if (!metrics) return null;
  
  return (
    <div className="mb-layout-gap-lg animate-in fade-in slide-in-from-bottom-2 duration-700">
      <ResponsiveGrid columns={4} mobileCols={1} tabletCols={2} gap="layout" className="mb-layout-gap-xl">
        <StatsCard 
          label="Total de Projetos" 
          value={metrics.total || 0} 
          icon={Building} 
          description="Ativos no portfólio" 
          trend={{ value: "12%", isPositive: true }}
          className="rounded-[2rem] border-none shadow-sem-md bg-primary/5 hover:bg-primary/10 transition-all duration-500"
        />
        <StatsCard 
          label="Em Andamento" 
          value={metrics.byStatus?.progress || 0} 
          icon={TrendingUp} 
          variant="progress" 
          description="Obras em execução"
          className="rounded-[2rem] border-none shadow-sem-md bg-amber-500/5 hover:bg-amber-500/10 transition-all duration-500"
        />
        <StatsCard 
          label="Total de Unidades" 
          value={metrics.totalUnits || 0} 
          icon={PieChart} 
          variant="brand" 
          description="Unidades cadastradas"
          className="rounded-[2rem] border-none shadow-sem-md bg-primary/5 hover:bg-primary/10 transition-all duration-500"
        />
        <StatsCard 
          label="Eficiência Média" 
          value={`${metrics.averageProgress || 0}%`} 
          icon={BarChart3} 
          variant="complete" 
          description="Progresso consolidado"
          className="rounded-[2rem] border-none shadow-sem-md bg-emerald-500/5 hover:bg-emerald-500/10 transition-all duration-500"
        />
      </ResponsiveGrid>
    </div>
  );
};

