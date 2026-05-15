
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  showBreadcrumbs?: boolean;
}

export function PageHeader({ 
  icon: Icon, 
  title, 
  description, 
  children,
  className,
  showBreadcrumbs = true
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4 mb-8", className)}>
      {showBreadcrumbs && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-300">
          <Breadcrumbs />
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 py-2">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 shadow-sem-sm animate-in zoom-in duration-500">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            )}
            <h1 className="text-sem-h1 tracking-tight font-black text-gradient leading-tight">
              {title}
            </h1>
          </div>
          {description && (
            <p className="text-body-lg text-muted-foreground animate-in slide-in-from-left-4 duration-500 max-w-xl">
              {description}
            </p>
          )}
        </div>

        {children && (
          <div className="flex flex-wrap items-center gap-3 animate-in slide-in-from-right-4 duration-500">
            {children}
          </div>
        )}
      </div>
      <div className="h-px w-full bg-gradient-to-r from-border/50 via-border to-transparent" />
    </div>
  );
}

