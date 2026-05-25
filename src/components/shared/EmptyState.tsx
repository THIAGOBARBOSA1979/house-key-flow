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
      "flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in duration-700",
      className
    )}>
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-background to-muted flex items-center justify-center border border-border/50 shadow-sem-xl ring-1 ring-black/[0.02] dark:ring-white/[0.02] transform hover:rotate-6 transition-transform duration-slow">
          <Icon className="w-12 h-12 text-primary/40" />
        </div>
      </div>
      <h3 className="text-2xl font-black text-foreground tracking-tighter mb-3">
        {title}
      </h3>
      <p className="text-muted-foreground text-base max-w-[320px] mb-10 leading-relaxed font-medium">
        {description}
      </p>
      {action && (
        <div className="animate-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
          {action}
        </div>
      )}
    </div>
  );
};
