import { ReactNode } from "react";
import { Users as UsersIcon, UserCheck, UserMinus, UserCog } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { ResponsiveGrid } from "@/components/shared/ResponsiveGrid";

interface UserStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    clients: number;
    staff: number;
  };
}

export const UserStats = ({ stats }: UserStatsProps) => {
  return (
    <ResponsiveGrid columns={5} mobileCols={1} tabletCols={2} gap="layout">
      <StatsCard label="Total de Usuários" value={stats.total} icon={UsersIcon} variant="brand" className="rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-md" />
      <StatsCard label="Ativos hoje" value={stats.active} icon={UserCheck} variant="complete" className="rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-md" />
      <StatsCard label="Pendências" value={stats.inactive} icon={UserMinus} variant="critical" className="rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-md" />
      <StatsCard label="Clientes VIP" value={stats.clients} icon={UserCog} variant="progress" className="rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-md" />
      <StatsCard label="Equipe Interna" value={stats.staff} icon={UserCog} variant="default" className="rounded-[2rem] border-none bg-card/40 backdrop-blur-md shadow-sem-md" />
    </ResponsiveGrid>
  );
};
