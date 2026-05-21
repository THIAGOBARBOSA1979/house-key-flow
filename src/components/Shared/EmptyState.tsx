
import React from 'react';
import { Inbox, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'error' | 'success';
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  className,
  action,
  variant = 'default',
  actionLabel,
  onAction
}) => {
  const isError = variant === 'error';

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center space-y-4 border-2 border-dashed rounded-[2rem] bg-muted/5 animate-in fade-in duration-500",
      isError ? "border-destructive/20 bg-destructive/5" : "border-border/40",
      className
    )}>
      <div className={cn(
        "w-20 h-20 rounded-3xl flex items-center justify-center mb-2",
        isError ? "bg-destructive/10 text-destructive/40" : "bg-muted/30 text-muted-foreground/40"
      )}>
        {icon || (isError ? <AlertCircle size={32} /> : <Inbox size={32} />)}
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h3 className={cn(
          "text-xl font-black tracking-tight uppercase tracking-widest text-[11px]",
          isError ? "text-destructive/80" : "text-foreground/80 opacity-60"
        )}>
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action ? (
        <div className="pt-2">{action}</div>
      ) : actionLabel && onAction ? (
        <div className="pt-2">
          <Button 
            onClick={onAction}
            variant={isError ? "destructive" : "default"}
            className="rounded-xl font-bold uppercase tracking-widest text-[10px]"
          >
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

