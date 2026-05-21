
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
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 py-2 px-1">
        <div className="space-y-3 max-w-full xl:max-w-2xl">
          <div className="flex items-center gap-3 md:gap-5">
            {Icon && (
              <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-sem-sm animate-in zoom-in duration-700 shrink-0">
                <Icon className="h-5 w-5 md:h-7 md:w-7 text-primary" strokeWidth={2.5} />
              </div>
            )}
            <h1 className="text-sem-h1 tracking-tight font-black text-gradient leading-[1.1] text-xl sm:text-2xl md:text-3xl lg:text-4xl truncate">
              {title}
            </h1>

          </div>
          {description && (
            <p className="text-sem-body-sm md:text-sem-body-base text-muted-foreground/60 animate-in slide-in-from-left-4 duration-700 max-w-2xl font-medium leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {children && (
          <div className="flex flex-wrap items-center gap-2 md:gap-4 animate-in slide-in-from-right-4 duration-700 w-full lg:w-auto">
            {children}
          </div>
        )}
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-primary/20 via-primary/5 to-transparent rounded-full opacity-30" />
    </div>
  );
}

