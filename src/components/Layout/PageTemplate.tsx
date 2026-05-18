import { ReactNode } from "react";
import { PageHeader } from "./PageHeader";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { SubscriptionBanner } from "../Shared/SubscriptionBanner";

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
    <div className="animate-in fade-in duration-500">
      <div className={cn("space-y-4 md:space-y-8 pb-10 px-4 md:px-0", className)}>
        <SubscriptionBanner />
        <PageHeader 
          title={title} 
          description={description}
          icon={icon}
        >
          {actions}
        </PageHeader>
        {children}
      </div>
    </div>
  );
}

