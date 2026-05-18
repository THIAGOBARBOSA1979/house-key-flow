import { ReactNode } from "react";
import { Building, TrendingUp, PieChart, BarChart3 } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";
import { PropertyMetrics } from "@/types/property";

interface PropertyStatsProps {
  metrics: PropertyMetrics;
}

export const PropertyStats = ({ metrics }: PropertyStatsProps) => {
  return (
    <ResponsiveGrid columns={4} mobileCols={1} tabletCols={2} gap="layout">
      <StatsCard 
        label="Total de Projetos" 
        value={metrics.total} 
        icon={Building} 
        description="Ativos no portfólio" 
        trend={{ value: "12%", isPositive: true }} 
        className="rounded-3xl" 
      />
      <StatsCard 
        label="Em Andamento" 
        value={metrics.byStatus.progress || 0} 
        icon={TrendingUp} 
        variant="progress" 
        description="Obras em execução" 
        className="rounded-3xl" 
      />
      <StatsCard 
        label="Total de Unidades" 
        value={metrics.totalUnits} 
        icon={PieChart} 
        variant="brand" 
        description="Apartamentos cadastrados" 
        className="rounded-3xl" 
      />
      <StatsCard 
        label="Eficiência Média" 
        value={`${metrics.averageProgress}%`} 
        icon={BarChart3} 
        variant="complete" 
        description="Progresso consolidado" 
        className="rounded-3xl" 
      />
    </ResponsiveGrid>
  );
};
