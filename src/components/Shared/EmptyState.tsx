
import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  className,
  action
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center space-y-4 border-2 border-dashed border-border/40 rounded-[2rem] bg-muted/5 animate-in fade-in duration-500",
      className
    )}>
      <div className="w-20 h-20 bg-muted/30 text-muted-foreground/40 rounded-3xl flex items-center justify-center mb-2">
        {icon || <Inbox size={32} />}
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-xl font-black tracking-tight text-foreground/80 uppercase tracking-widest text-[11px] opacity-60">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
