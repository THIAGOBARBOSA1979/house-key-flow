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
    <ResponsiveGrid columns={4} gap="layout">
      <StatsCard
        label="Vistorias em Aberto"
        value={stats.pending}
        icon={Clock}
        variant="progress"
        className="rounded-3xl border-none shadow-sem-sm bg-amber-500/5"
      />
      <StatsCard
        label="Vistorias Finalizadas"
        value={stats.complete}
        icon={CheckCircle}
        variant="complete"
        className="rounded-3xl border-none shadow-sem-sm bg-emerald-500/5"
      />
      <StatsCard
        label="Índice de Conformidade"
        value={`${complianceRate}%`}
        icon={TrendingUp}
        variant="brand"
        className="rounded-3xl border-none shadow-sem-sm bg-primary/5"
        description="Adesão técnica ABNT"
      />
      <StatsCard
        label="Atrasadas / Pendentes"
        value={stats.delayed}
        icon={AlertTriangle}
        variant="default"
        className={stats.delayed > 0 ? "rounded-3xl border-none shadow-sem-sm bg-red-500/5 text-red-600" : "rounded-3xl border-none shadow-sem-sm bg-muted/20 opacity-60"}
      />
    </ResponsiveGrid>
  );
});
