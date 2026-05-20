
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/Shared/StatsCard";
import { ResponsiveGrid } from "@/components/Shared/ResponsiveGrid";

interface InspectionStatsProps {
  stats: {
    pending: number;
    confirmed: number;
    complete: number;
    cancelled: number;
  };
}

export const InspectionStats = ({ stats }: InspectionStatsProps) => {
  const total = stats.pending + stats.confirmed + stats.complete + stats.cancelled;
  const complianceRate = total > 0 ? Math.round((stats.complete / (total - stats.cancelled)) * 100) : 100;

  return (
    <ResponsiveGrid columns={4} gap="layout">
      <StatsCard
        label="Vistorias em Aberto"
        value={stats.pending + stats.confirmed}
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
        label="Protocolos Cancelados"
        value={stats.cancelled}
        icon={AlertTriangle}
        variant="default"
        className="rounded-3xl border-none shadow-sem-sm bg-muted/20 opacity-60"
      />
    </ResponsiveGrid>
  );
};
