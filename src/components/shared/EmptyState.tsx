
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
  children
}: EmptyStateProps) {
  const displayActionLabel = actionLabel || action?.label;
  const handleAction = onAction || action?.onClick;

  return (
    <div className="flex flex-col items-center justify-center py-20-sem px-6-sem text-center bg-muted/5 rounded-[2.5rem] border-2 border-dashed border-border/40 group hover:border-primary/20 transition-all duration-500">
      <div className="p-6-sem rounded-2xl bg-background shadow-sem-sm border border-border/10 mb-6-sem group-hover:scale-110 group-hover:bg-primary/5 transition-all duration-500">
        {Icon && <Icon className="h-12 w-12 text-muted-foreground/30 group-hover:text-primary transition-colors" />}
      </div>
      <h3 className="text-2xl font-black tracking-tight text-foreground/90 mb-3-sem">{title}</h3>
      <p className="text-sem-body-base text-muted-foreground/60 max-w-md mb-10-sem font-medium leading-relaxed">
        {description}
      </p>
      {displayActionLabel && handleAction && (
        <Button onClick={handleAction} className="font-black uppercase tracking-widest text-[10px] px-10 h-12 shadow-sem-md hover:shadow-sem-lg rounded-xl">
          {displayActionLabel}
        </Button>
      )}
      {children}
    </div>
  );
}
