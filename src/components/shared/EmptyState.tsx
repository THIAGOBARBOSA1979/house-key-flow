
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
      "flex flex-col items-center justify-center p-8 md:p-12 text-center animate-fade-in",
      "bg-muted/10 rounded-xl border-2 border-dashed border-muted-foreground/10",
      "shadow-sem-inner",
      className
    )}>
      <div className="p-4 md:p-6 bg-muted/30 rounded-lg mb-6 shadow-sem-sm">
        <Icon className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground/40" />
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-sem-body-base text-muted-foreground mb-8 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button 
          onClick={action.onClick} 
          className="h-11 px-6 font-bold"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
