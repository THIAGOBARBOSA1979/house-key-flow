import { memo } from "react";
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";

interface InspectionStatsProps {
  stats: {
    total: number;
    pending: number;
    complete: number;
    cancelled: number;
    delayed: number;
  };
}

export const InspectionStats = memo(({ stats }: InspectionStatsProps) => {
  const complianceRate = stats.total > stats.cancelled 
    ? Math.round((stats.complete / (stats.total - stats.cancelled)) * 100) 
    : 100;

  return (
    <ResponsiveGrid columns={4} gap="layout" className="mb-layout-gap-xl">
      <StatsCard
        label="Vistorias em Aberto"
        value={stats.pending}
        icon={Clock}
        variant="progress"
        className="rounded-[2rem] border-none shadow-sem-md bg-amber-500/5 hover:bg-amber-500/10 transition-all duration-500"
      />
      <StatsCard
        label="Vistorias Finalizadas"
        value={stats.complete}
        icon={CheckCircle}
        variant="complete"
        className="rounded-[2rem] border-none shadow-sem-md bg-emerald-500/5 hover:bg-emerald-500/10 transition-all duration-500"
      />
      <StatsCard
        label="Índice de Conformidade"
        value={`${complianceRate}%`}
        icon={TrendingUp}
        variant="brand"
        className="rounded-[2rem] border-none shadow-sem-md bg-primary/5 hover:bg-primary/10 transition-all duration-500"
        description="Adesão técnica ABNT"
      />
      <StatsCard
        label="Atrasadas / Pendentes"
        value={stats.delayed}
        icon={AlertTriangle}
        variant="default"
        className={stats.delayed > 0 ? "rounded-[2rem] border-none shadow-sem-md bg-red-500/5 text-red-600 hover:bg-red-500/10 transition-all duration-500" : "rounded-[2rem] border-none shadow-sem-md bg-muted/20 opacity-60 hover:opacity-100 transition-all duration-500"}
      />
    </ResponsiveGrid>
  );
});
