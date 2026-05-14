
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
      "flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 border-b border-border/10 mb-6",
      className
    )}>
      <div className="space-y-1">
        <h1 className="text-h1 flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-primary/10 rounded-xl">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
          <span className="animate-in slide-in-from-left-2 duration-300 font-bold">{title}</span>
        </h1>
        {description && (
          <p className="text-small animate-in slide-in-from-left-4 duration-500">
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
