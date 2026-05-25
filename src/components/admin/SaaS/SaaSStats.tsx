import React from "react";
import { Card } from "@/components/ui/card";

interface SaaSStatsProps {
  companiesCount: number;
  activeCompaniesCount: number;
  totalUsers: number;
}

export const SaaSStats: React.FC<SaaSStatsProps> = ({ 
  companiesCount, 
  activeCompaniesCount, 
  totalUsers 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <Card className="p-8 bg-card/40 backdrop-blur-md border-none shadow-sem-md rounded-[2.5rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Infraestrutura Tenants</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-5xl font-black tracking-tighter text-primary">{companiesCount}</h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Ativos</span>
        </div>
      </Card>
      
      <Card className="p-8 bg-card/40 backdrop-blur-md border-none shadow-sem-md rounded-[2.5rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Taxa de Operação</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-5xl font-black tracking-tighter text-emerald-600">{activeCompaniesCount}</h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/40">Empresas</span>
        </div>
      </Card>

      <Card className="p-8 bg-card/40 backdrop-blur-md border-none shadow-sem-md rounded-[2.5rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Ecossistema Global</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-5xl font-black tracking-tighter text-blue-600">{totalUsers}</h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600/40">Usuários</span>
        </div>
      </Card>
    </div>
  );
};
