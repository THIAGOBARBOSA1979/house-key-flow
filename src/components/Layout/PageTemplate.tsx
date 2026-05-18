import { ReactNode } from "react";
import { AppLayout } from "./AppLayout";
import { PageHeader } from "./PageHeader";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageTemplateProps {
  children: ReactNode;
  title: string;
  description?: string;
  className?: string;
  actions?: ReactNode;
  icon?: LucideIcon;
}

export function PageTemplate({
  children,
  title,
  description,
  className,
  actions,
  icon
}: PageTemplateProps) {
  return (
    <AppLayout>
      <div className={cn("space-y-8 pb-10", className)}>
        <PageHeader 
          title={title} 
          description={description}
          icon={icon}
        >
          {actions}
        </PageHeader>
        {children}
      </div>
    </AppLayout>
  );
}

