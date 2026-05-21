import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { LucideIcon, Ghost } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Ghost,
  title,
  description,
  action,
  className
}) => {
  const { t } = useTranslation();

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in zoom-in duration-500",
      className
    )}>
      <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-6 ring-8 ring-primary/2">
        <Icon className="w-10 h-10 text-primary/40" />
      </div>
      <h3 className="text-xl font-black text-foreground tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm max-w-[280px] mb-8 leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="animate-in slide-in-from-bottom-2 duration-700 delay-200 fill-mode-both">
          {action}
        </div>
      )}
    </div>
  );
};
