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
      <ResponsiveGrid columns={4} mobileCols={1} tabletCols={2} gap="layout">
        <StatsCard 
          label="Total de Projetos" 
          value={metrics.total || 0} 
          icon={Building} 
          description="Ativos no portfólio" 
          trend={{ value: "12%", isPositive: true }} 
        />
        <StatsCard 
          label="Em Andamento" 
          value={metrics.byStatus?.progress || 0} 
          icon={TrendingUp} 
          variant="progress" 
          description="Obras em execução" 
        />
        <StatsCard 
          label="Total de Unidades" 
          value={metrics.totalUnits || 0} 
          icon={PieChart} 
          variant="brand" 
          description="Unidades cadastradas" 
        />
        <StatsCard 
          label="Eficiência Média" 
          value={`${metrics.averageProgress || 0}%`} 
          icon={BarChart3} 
          variant="complete" 
          description="Progresso consolidado" 
        />
      </ResponsiveGrid>
    </div>
  );
};

