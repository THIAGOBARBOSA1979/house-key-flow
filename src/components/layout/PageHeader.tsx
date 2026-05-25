
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
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 py-2 px-1">
        <div className="space-y-4 max-w-full xl:max-w-3xl">
          <div className="flex items-center gap-4 md:gap-6">
            {Icon && (
              <div className="flex items-center justify-center h-14 w-14 md:h-18 md:w-18 rounded-2xl md:rounded-[1.75rem] bg-gradient-to-br from-primary to-primary/60 shadow-sem-lg shadow-primary/20 animate-in zoom-in duration-700 shrink-0 ring-4 ring-primary/5">
                <Icon className="h-7 w-7 md:h-9 md:w-9 text-white" strokeWidth={2.5} />
              </div>
            )}
            <h1 className="text-sem-h1 tracking-tighter font-black text-gradient leading-[1.1] text-2xl sm:text-3xl md:text-4xl lg:text-5xl truncate">
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
          <div className="flex flex-wrap items-center gap-3 md:gap-4 animate-in slide-in-from-right-4 duration-700 w-full lg:w-auto">
            {children}
          </div>
        )}
      </div>

    </div>
  );
}

