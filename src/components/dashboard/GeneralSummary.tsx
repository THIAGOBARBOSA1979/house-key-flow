import React, { memo } from "react";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface GeneralSummaryProps {
  averageProgress: number;
  inspectionsCompletedPercent: number;
}

export const GeneralSummary = memo(({ 
  averageProgress, 
  inspectionsCompletedPercent 
}: GeneralSummaryProps) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-h2 flex items-center gap-2.5 font-black uppercase tracking-tighter">
          <Activity className="text-primary h-5 w-5" />
          Indicadores Técnicos
        </h2>
      </div>
      <Card className="card-standard border border-border/20 bg-card/30 backdrop-blur-md overflow-hidden p-8 rounded-[2rem] shadow-sem-sm">

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Evolução Física Global</span>
              <span className="text-xs font-black text-emerald-600">
                {averageProgress || 0}%
              </span>
            </div>
            <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden border border-border/5 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000" 
                style={{ width: `${averageProgress || 0}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Vistorias Homologadas (ABNT)</span>
              <span className="text-xs font-black text-primary">
                {inspectionsCompletedPercent || 0}%
              </span>
            </div>
            <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden border border-border/5 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-primary rounded-full transition-all duration-1000" 
                style={{ width: `${inspectionsCompletedPercent || 0}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border/10">
            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter italic">
              * Dados sincronizados com a Matriz de Qualidade A2
            </p>
          </div>
        </div>
      </Card>

    </section>
  );
});
