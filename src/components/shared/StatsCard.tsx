
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
    default: "bg-card border-border",
    pending: "bg-status-pending/5 border-status-pending/20 text-status-pending",
    progress: "bg-status-progress/5 border-status-progress/20 text-status-progress",
    complete: "bg-status-complete/5 border-status-complete/20 text-status-complete",
    critical: "bg-status-critical/5 border-status-critical/20 text-status-critical",
    brand: "bg-brand/5 border-brand/20 text-brand",
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
    <Card className={cn("card-standard overflow-hidden group transition-all duration-300", variantStyles[variant], className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sem-tiny uppercase font-bold tracking-widest text-muted-foreground/80 mb-1 truncate">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-sem-h3 font-bold text-foreground leading-tight">
                {value}
              </h3>
              {trend && (
                <span className={cn(
                  "text-sem-tiny font-bold",
                  trend.isPositive ? "text-status-complete" : "text-status-critical"
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
              "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
              iconStyles[variant]
            )}>
              <Icon size={22} strokeWidth={2.5} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
