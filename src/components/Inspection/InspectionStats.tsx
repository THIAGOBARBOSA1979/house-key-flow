
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { StatsCard } from "@/components/Shared/StatsCard";
import { ResponsiveGrid } from "@/components/Shared/ResponsiveGrid";

interface InspectionStatsProps {
  stats: {
    pending: number;
    completed: number;
    delayed: number;
  };
}

export const InspectionStats = ({ stats }: InspectionStatsProps) => {
  return (
    <ResponsiveGrid columns={3} gap="layout">
      <StatsCard 
        label="Vistorias Pendentes" 
        value={stats.pending} 
        icon={Clock} 
        variant="pending" 
        description="Aguardando atendimento" 
        className="rounded-3xl" 
      />
      <StatsCard 
        label="Vistorias Concluídas" 
        value={stats.completed} 
        icon={CheckCircle2} 
        variant="complete" 
        description="Total de unidades entregues" 
        className="rounded-3xl" 
      />
      <StatsCard 
        label="Atrasadas / Urgentes" 
        value={stats.delayed} 
        icon={AlertCircle} 
        variant="critical" 
        description="Fora do prazo acordado" 
        className="rounded-3xl" 
      />
    </ResponsiveGrid>
  );
};
