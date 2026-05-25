
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
        <div className="animate-in fade-in slide-in-from-top-1 duration-300 mb-2">
          <Breadcrumbs />
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-layout-gap-xl py-layout-gap-lg px-layout-gap-lg bg-card/60 backdrop-blur-3xl rounded-[2rem] border border-border/40 shadow-sem-lg hover:shadow-sem-xl transition-all duration-700 relative overflow-hidden group/header">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-1000"></div>
        <div className="layout-stack max-w-full xl:max-w-4xl px-2 relative z-10">
          <div className="flex items-center gap-6 md:gap-8 mb-4">
            {Icon && (
              <div className="flex items-center justify-center h-16 w-16 md:h-20 md:w-20 rounded-3xl bg-gradient-to-br from-primary to-sidebar-primary/80 shadow-sem-xl shadow-primary/30 animate-in zoom-in duration-1000 shrink-0 ring-8 ring-primary/5 group-hover/header:rotate-6 transition-transform duration-slow">
                <Icon className="h-8 w-8 md:h-10 md:w-10 text-white" strokeWidth={3} />
              </div>
            )}
            <h1 className="text-sem-display tracking-tighter font-black text-gradient leading-[1] text-4xl sm:text-5xl md:text-6xl lg:text-7xl truncate pb-2">
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

