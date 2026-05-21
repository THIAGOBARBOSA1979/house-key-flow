
import React from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PropertyMilestone } from "@/services";
import { safeFormat } from "@/lib/utils";

interface PropertyMilestonesProps {
  milestones: PropertyMilestone[];
  onToggleMilestone?: (id: string, completed: boolean) => void;
}

export function PropertyMilestones({ milestones, onToggleMilestone }: PropertyMilestonesProps) {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed">
        <p className="text-sm text-muted-foreground">Nenhum marco cronológico definido.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-border">
      {milestones.map((milestone, index) => (
        <div key={milestone.id} className="relative pl-10">
          <div 
            className={cn(
              "absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors duration-300",
              milestone.completed 
                ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]" 
                : "bg-background border-2 border-muted-foreground/30 text-muted-foreground"
            )}
            onClick={() => onToggleMilestone?.(milestone.id, !milestone.completed)}
            style={{ cursor: onToggleMilestone ? 'pointer' : 'default' }}
          >
            {milestone.completed ? (
              <CheckCircle2 size={18} />
            ) : (
              <Circle size={16} className="opacity-50" />
            )}
          </div>
          
          <div className={cn(
            "p-4 rounded-xl border transition-all duration-300",
            milestone.completed 
              ? "bg-emerald-50/30 border-emerald-100" 
              : "bg-muted/10 border-border/50 opacity-80"
          )}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className={cn(
                  "font-bold text-sm uppercase tracking-tight",
                  milestone.completed ? "text-emerald-900" : "text-foreground/80"
                )}>
                  {milestone.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <Clock size={12} />
                  <span>Previsão: {safeFormat(milestone.targetDate, "dd/MM/yyyy")}</span>
                </div>
              </div>
              {milestone.completed && milestone.completedAt && (
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                  Concluído em {safeFormat(milestone.completedAt, "dd/MM/yyyy")}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
