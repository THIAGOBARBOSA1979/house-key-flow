
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  icon: Icon, 
  title, 
  description, 
  children,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
      className
    )}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          {Icon && <Icon className="h-8 w-8 text-primary" />}
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
