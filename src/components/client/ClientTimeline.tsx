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
    <div className={cn("space-y-6", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        return (
          <div key={step.id} className="relative flex gap-4">
            {!isLast && (
              <div 
                className={cn(
                  "absolute left-[11px] top-6 bottom-[-24px] w-[2px]",
                  step.status === "completed" ? "bg-primary" : "bg-muted"
                )} 
              />
            )}
            
            <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
              {step.status === "completed" ? (
                <div className="rounded-full bg-primary p-1 text-primary-foreground shadow-lg shadow-primary/20">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              ) : step.status === "current" ? (
                <div className="rounded-full bg-primary/10 p-1 text-primary ring-2 ring-primary ring-offset-2 animate-pulse">
                  <Clock className="h-4 w-4" />
                </div>
              ) : step.status === "error" ? (
                <div className="rounded-full bg-destructive p-1 text-destructive-foreground">
                  <AlertCircle className="h-4 w-4" />
                </div>
              ) : (
                <div className="rounded-full bg-muted p-1 text-muted-foreground">
                  <Circle className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="flex flex-col pb-6">
              <div className="flex items-center gap-2">
                <h4 className={cn(
                  "text-sm font-black uppercase tracking-widest",
                  step.status === "completed" ? "text-primary" : 
                  step.status === "current" ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.title}
                </h4>
                {step.date && (
                  <span className="text-[10px] font-medium text-muted-foreground italic">
                    {step.date}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
