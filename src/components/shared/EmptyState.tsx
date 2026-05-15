
import React from 'react';
import { SearchX, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = SearchX,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 md:p-20 text-center animate-fade-in",
      "bg-card/30 backdrop-blur-sm rounded-3xl border border-dashed border-primary/20",
      "shadow-sem-inner group",
      className
    )}>
      <div className="p-6 md:p-8 bg-primary/5 rounded-2xl mb-8 shadow-sem-md group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
        <Icon className="h-12 w-12 md:h-16 md:w-16 text-primary/30 group-hover:text-primary/60 transition-colors" />
      </div>
      <h3 className="text-sem-h2 font-black text-foreground mb-3 tracking-tighter">
        {title}
      </h3>
      {description && (
        <p className="text-sem-body-base text-muted-foreground/60 mb-10 max-w-lg leading-relaxed font-medium">
          {description}
        </p>
      )}
      {action && (
        <Button 
          onClick={action.onClick} 
          className="h-12 px-8 font-black uppercase tracking-widest text-[11px] shadow-sem-lg active:scale-95 transition-all"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
