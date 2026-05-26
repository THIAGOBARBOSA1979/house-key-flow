import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Building, ClipboardCheck, MessageSquare, ShieldAlert } from "lucide-react";

export const GlobalOperationalMetrics = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['global-saas-metrics'],
    queryFn: async () => {
      const [
        { count: totalProperties },
        { count: totalInspections },
        { count: totalTickets },
        { count: totalNonConformities }
      ] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('inspections').select('*', { count: 'exact', head: true }),
        supabase.from('warranty_requests').select('*', { count: 'exact', head: true }),
        supabase.from('non_conformities').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalProperties: totalProperties || 0,
        totalInspections: totalInspections || 0,
        totalTickets: totalTickets || 0,
        totalNonConformities: totalNonConformities || 0
      };
    }
  });

  const cards = [
    { title: "Total de Empreendimentos", value: stats?.totalProperties, icon: Building, color: "text-blue-500" },
    { title: "Vistorias Realizadas", value: stats?.totalInspections, icon: ClipboardCheck, color: "text-emerald-500" },
    { title: "Chamados de Assistência", value: stats?.totalTickets, icon: MessageSquare, color: "text-brand" },
    { title: "Não Conformidades", value: stats?.totalNonConformities, icon: ShieldAlert, color: "text-orange-500" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <Card key={i} className="border-none shadow-sem-md bg-white/50 dark:bg-black/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tighter mb-1">
                {isLoading ? "..." : card.value}
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Across all tenants</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sem-md bg-white/50 dark:bg-black/20 overflow-hidden">
        <CardHeader className="border-b border-border/10 bg-muted/20">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Integridade Global de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm shrink-0">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground mb-1">Rastreabilidade SaaS Consolidada</p>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Este dashboard centraliza a visão operacional de todos os tenants ativos. 
                Cada transação registrada nestes indicadores possui um registro de auditoria (Audit Trail) imutável 
                vinculado ao seu respectivo tenant, garantindo o isolamento exigido pelas normas ABNT e ISO 9001.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};