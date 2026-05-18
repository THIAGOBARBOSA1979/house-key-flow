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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="p-6 bg-primary/5 border-none shadow-none rounded-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Total de Tenants</p>
        <h3 className="text-3xl font-black">{companiesCount}</h3>
      </Card>
      <Card className="p-6 bg-emerald-500/5 border-none shadow-none rounded-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Empresas Ativas</p>
        <h3 className="text-3xl font-black">{activeCompaniesCount}</h3>
      </Card>
      <Card className="p-6 bg-blue-500/5 border-none shadow-none rounded-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Usuários Globais</p>
        <h3 className="text-3xl font-black">{totalUsers}</h3>
      </Card>
    </div>
  );
};
