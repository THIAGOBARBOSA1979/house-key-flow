
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
    <div className={cn("layout-stack mb-layout-gap-lg", className)}>
      {showBreadcrumbs && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-300">
          <Breadcrumbs />
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-layout-gap-lg py-header-padding-y px-card-padding bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-card-radius border border-border/10 shadow-sem-sm">
        <div className="layout-stack max-w-full xl:max-w-4xl px-2">
          <div className="flex items-center gap-stack-gap md:gap-layout-gap">
            {Icon && (
              <div className="flex items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-sem-xl shadow-primary/20 animate-in zoom-in duration-700 shrink-0 ring-8 ring-primary/5">
                <Icon className="h-8 w-8 md:h-10 md:w-10 text-white" strokeWidth={2.5} />
              </div>
            )}
            <h1 className="text-sem-h1 tracking-tighter font-black text-gradient leading-[1] text-3xl sm:text-4xl md:text-5xl lg:text-6xl truncate pb-1">
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
          <div className="flex flex-wrap items-center gap-component-gap-md md:gap-card-gap animate-in slide-in-from-right-4 duration-700 w-full lg:w-auto">
            {children}
          </div>
        )}
      </div>

    </div>
  );
}

