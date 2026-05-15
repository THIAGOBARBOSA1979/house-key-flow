
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  children
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-muted/10 rounded-2xl border-2 border-dashed border-muted">
      <div className="p-4 rounded-full bg-background shadow-sm border mb-4">
        <Icon className="h-10 w-10 text-muted-foreground/40" />
      </div>
      <h3 className="text-xl font-bold tracking-tight text-foreground/80 mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-8 font-medium">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="font-bold uppercase tracking-widest text-xs px-8">
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  );
}
