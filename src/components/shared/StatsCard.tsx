
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

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
    default: "bg-card/40 backdrop-blur-2xl border-border/20 hover:bg-card/60 shadow-sem-lg",
    pending: "bg-status-pending/[0.04] backdrop-blur-2xl border-status-pending/30 text-status-pending shadow-sem-md hover:shadow-status-pending/30 hover:bg-status-pending/[0.08] ring-1 ring-status-pending/10",
    progress: "bg-status-progress/[0.04] backdrop-blur-2xl border-status-progress/30 text-status-progress shadow-sem-md hover:shadow-status-progress/30 hover:bg-status-progress/[0.08] ring-1 ring-status-progress/10",
    complete: "bg-status-complete/[0.04] backdrop-blur-2xl border-status-complete/30 text-status-complete shadow-sem-md hover:shadow-status-complete/30 hover:bg-status-complete/[0.08] ring-1 ring-status-complete/10",
    critical: "bg-status-critical/[0.04] backdrop-blur-2xl border-status-critical/30 text-status-critical shadow-sem-md hover:shadow-status-critical/30 hover:bg-status-critical/[0.08] ring-1 ring-status-critical/10",
    brand: "bg-brand/[0.04] backdrop-blur-2xl border-brand/30 text-brand shadow-sem-md hover:shadow-brand/30 hover:bg-brand/[0.08] ring-1 ring-brand/10",
  };

  const iconStyles = {
    default: "bg-muted/50 text-muted-foreground",
    pending: "bg-status-pending/20 text-status-pending border-status-pending/20",
    progress: "bg-status-progress/20 text-status-progress border-status-progress/20",
    complete: "bg-status-complete/20 text-status-complete border-status-complete/20",
    critical: "bg-status-critical/20 text-status-critical border-status-critical/20",
    brand: "bg-brand/20 text-brand border-brand/20",
  };

  return (
    <Card className={cn(
      "overflow-hidden group transition-all duration-700 border border-border/40 shadow-sem-sm hover:shadow-sem-2xl rounded-card-radius hover:-translate-y-2 active:scale-[0.98] relative", 
      variantStyles[variant], 
      className
    )}>
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
      
      <CardContent className="p-card-padding md:p-card-padding-lg cursor-pointer relative z-10">
        <div className="flex items-start justify-between gap-layout-gap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-component-gap-md mb-card-gap">
              <p className="text-[10px] uppercase font-black tracking-[0.25em] text-muted-foreground/60 leading-none">
                {label}
              </p>
              {trend && (
                <div className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                  trend.isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                )}>
                  {trend.isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {trend.value}
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-none group-hover:scale-105 transition-transform duration-700 origin-left">
                {value}
              </h3>
              {description && (
                <p className="text-sem-body-sm font-medium text-muted-foreground/60 mt-3 line-clamp-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          {Icon && (
            <div className={cn(
              "p-4 md:p-5 rounded-2xl transition-all duration-700 group-hover:rotate-12 shadow-sem-lg border",
              iconStyles[variant]
            )}>
              <Icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={2.5} />
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Bottom Progress Indicator Decor */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-1 group-hover:translate-y-0"></div>
    </Card>
  );
};
