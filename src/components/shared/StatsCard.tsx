
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
    default: "bg-card/60 backdrop-blur-xl border-border/40 hover:bg-card/80 shadow-sem-md",
    pending: "bg-status-pending/[0.04] backdrop-blur-xl border-status-pending/40 text-status-pending shadow-sem-sm hover:bg-status-pending/[0.08]",
    progress: "bg-status-progress/[0.04] backdrop-blur-xl border-status-progress/40 text-status-progress shadow-sem-sm hover:bg-status-progress/[0.08]",
    complete: "bg-status-complete/[0.04] backdrop-blur-xl border-status-complete/40 text-status-complete shadow-sem-sm hover:bg-status-complete/[0.08]",
    critical: "bg-status-critical/[0.04] backdrop-blur-xl border-status-critical/40 text-status-critical shadow-sem-sm hover:bg-status-critical/[0.08]",
    brand: "bg-brand/[0.04] backdrop-blur-xl border-brand/40 text-brand shadow-sem-sm hover:bg-brand/[0.08]",
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
      "card-standard card-hover-effect relative group", 
      variantStyles[variant], 
      className
    )}>
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
      
      <CardContent className="p-card-padding lg:p-layout-gap-lg cursor-pointer relative z-10">
        <div className="flex items-start justify-between gap-layout-gap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-component-gap-md mb-6">
              <p className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground/40 leading-none">
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
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tighter leading-none group-hover:scale-105 transition-transform duration-700 origin-left">
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
