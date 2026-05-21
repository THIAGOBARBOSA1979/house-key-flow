import React from "react";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  date?: string;
  status: "completed" | "current" | "pending" | "error";
}

interface ClientTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function ClientTimeline({ steps, className }: ClientTimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        return (
          <div key={step.id} className="relative flex gap-6 group/step">
            {!isLast && (
              <div 
                className={cn(
                  "absolute left-[13px] top-8 bottom-0 w-[2px] transition-all duration-700",
                  step.status === "completed" ? "bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]" : "bg-muted"
                )} 
              />
            )}
            
            <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center mt-1">
              {step.status === "completed" ? (
                <div className="rounded-full bg-primary p-1.5 text-primary-foreground shadow-lg shadow-primary/20 group-hover/step:scale-110 transition-transform">
                  <CheckCircle2 className="h-4 w-4" strokeWidth={3} />
                </div>
              ) : step.status === "current" ? (
                <div className="rounded-full bg-primary/20 p-1.5 text-primary ring-2 ring-primary ring-offset-2 animate-pulse group-hover/step:scale-110 transition-transform">
                  <Clock className="h-4 w-4" strokeWidth={3} />
                </div>
              ) : step.status === "error" ? (
                <div className="rounded-full bg-destructive p-1.5 text-destructive-foreground shadow-lg shadow-destructive/30">
                  <AlertCircle className="h-4 w-4" strokeWidth={3} />
                </div>
              ) : (
                <div className="rounded-full bg-muted p-1.5 text-muted-foreground border-2 border-background shadow-sm">
                  <Circle className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="flex flex-col pb-10 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <h4 className={cn(
                  "text-sm font-black uppercase tracking-[0.1em]",
                  step.status === "completed" ? "text-primary" : 
                  step.status === "current" ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.title}
                </h4>
                {step.date && (
                  <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest bg-muted px-2 py-0.5 rounded-full w-fit">
                    {step.date}
                  </span>
                )}
              </div>
              <p className={cn(
                "text-xs leading-relaxed transition-colors duration-300",
                step.status === "pending" ? "text-muted-foreground/50" : "text-muted-foreground"
              )}>
                {step.description}
              </p>
              
              {step.status === "current" && (
                <div className="mt-4 flex gap-2 w-full max-w-[200px]">
                   <div className="h-1.5 flex-1 bg-primary/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-1/3 animate-[progress-pulse_3s_infinite_linear]" />
                   </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
