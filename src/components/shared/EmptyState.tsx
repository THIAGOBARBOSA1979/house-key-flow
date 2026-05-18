
import { ReactNode } from "react";
import { LucideIcon, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'error';
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
  variant = 'default',
  children
}: EmptyStateProps) {
  const displayActionLabel = actionLabel || action?.label;
  const handleAction = onAction || action?.onClick;
  
  const isError = variant === 'error';
  const EffectiveIcon = Icon || (isError ? AlertCircle : null);

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-10 md:py-20 px-4 md:px-6 text-center rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-dashed transition-all duration-500 group",
      isError 
        ? "bg-destructive/5 border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30" 
        : "bg-muted/5 border-border/40 hover:bg-muted/10 hover:border-primary/20"
    )}>
      <div className={cn(
        "p-4 md:p-6 rounded-2xl bg-background shadow-sm border border-border/10 mb-4 md:mb-6 group-hover:scale-110 transition-all duration-500 group-hover:shadow-md",
        isError ? "group-hover:bg-destructive/5 group-hover:border-destructive/20" : "group-hover:bg-primary/5 group-hover:border-primary/20"
      )}>
        {EffectiveIcon && (
          <EffectiveIcon className={cn(
            "h-8 w-8 md:h-12 md:w-12 transition-colors",
            isError ? "text-destructive/40 group-hover:text-destructive" : "text-muted-foreground/30 group-hover:text-primary"
          )} />
        )}
      </div>
      
      <h3 className={cn(
        "text-xl md:text-2xl font-black tracking-tight mb-2 md:mb-3 transition-colors",
        isError ? "text-destructive group-hover:text-destructive/80" : "text-foreground/90 group-hover:text-primary"
      )}>
        {title}
      </h3>
      
      <p className="text-sm md:text-base text-muted-foreground/60 max-w-md mb-6 md:mb-10 font-medium leading-relaxed group-hover:text-muted-foreground/80 transition-colors">
        {description}
      </p>
      
      {displayActionLabel && handleAction && (
        <Button 
          onClick={handleAction} 
          className={cn(
            "font-black uppercase tracking-widest text-[10px] px-10 h-12 shadow-md hover:shadow-lg rounded-xl transition-all duration-300 hover:scale-105 active:scale-95",
            isError ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
          )}
        >
          {isError && !actionLabel && <RefreshCw className="mr-2 h-3 w-3 animate-spin-slow" />}
          {displayActionLabel || (isError ? "Sincronizar Dados" : "Recomeçar")}

        </Button>
      )}
      
      {children}
    </div>
  );
}

