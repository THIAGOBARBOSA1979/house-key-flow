
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'pending' | 'progress' | 'complete' | 'critical' | 'brand';
  className?: string;
}

export const StatsCard = ({
  label,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
  className
}: StatsCardProps) => {
  const variantStyles = {
    default: "bg-card/40 backdrop-blur-md border-border/40",
    pending: "bg-status-pending/5 backdrop-blur-md border-status-pending/20 text-status-pending shadow-sem-sm hover:shadow-status-pending/20",
    progress: "bg-status-progress/5 backdrop-blur-md border-status-progress/20 text-status-progress shadow-sem-sm hover:shadow-status-progress/20",
    complete: "bg-status-complete/5 backdrop-blur-md border-status-complete/20 text-status-complete shadow-sem-sm hover:shadow-status-complete/20",
    critical: "bg-status-critical/5 backdrop-blur-md border-status-critical/20 text-status-critical shadow-sem-sm hover:shadow-status-critical/20",
    brand: "bg-brand/5 backdrop-blur-md border-brand/20 text-brand shadow-sem-sm hover:shadow-brand/20",
  };

  const iconStyles = {
    default: "bg-muted/50 text-muted-foreground",
    pending: "bg-status-pending/10 text-status-pending",
    progress: "bg-status-progress/10 text-status-progress",
    complete: "bg-status-complete/10 text-status-complete",
    critical: "bg-status-critical/10 text-status-critical",
    brand: "bg-brand/10 text-brand",
  };

  return (
    <Card className={cn(
      "overflow-hidden group transition-all duration-500 border border-border/40 shadow-sem-sm hover:shadow-sem-lg rounded-2xl", 
      variantStyles[variant], 
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/80 mb-2 truncate">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-sem-h2 font-black text-foreground leading-tight tracking-tight">
                {value}
              </h3>
              {trend && (
                <span className={cn(
                  "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                  trend.isPositive ? "text-emerald-600 bg-emerald-50" : "text-status-critical bg-status-critical/5"
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sem-caption text-muted-foreground mt-1 truncate">
                {description}
              </p>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "p-4 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sem-md border border-border/10",
              iconStyles[variant]
            )}>
              <Icon size={24} strokeWidth={2.5} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
