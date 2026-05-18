import { ReactNode } from "react";
import { AppLayout } from "./AppLayout";
import { PageHeader } from "./PageHeader";
import { cn } from "@/lib/utils";

interface PageTemplateProps {
  children: ReactNode;
  title: string;
  description?: string;
  className?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PageTemplate({
  children,
  title,
  description,
  className,
  actions,
  breadcrumbs
}: PageTemplateProps) {
  return (
    <AppLayout>
      <div className={cn("space-y-8 pb-10", className)}>
        <PageHeader 
          title={title} 
          description={description}
          actions={actions}
          breadcrumbs={breadcrumbs}
        />
        {children}
      </div>
    </AppLayout>
  );
}
