import { useMemo, memo } from "react";
import { cn } from "@/lib/utils";
import { Building, ShieldCheck, ClipboardCheck, Activity } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { useProperties, useInspections, useWarranty, useDashboardData } from "@/hooks";

interface StatItem {
  title: string;
  value: string | number;
  description?: string;
  icon: any;
  variant: 'brand' | 'complete' | 'progress' | 'pending' | 'critical' | 'default';
  trend?: { value: string; isPositive: boolean };
}

export const Stats = memo(({ className }: { className?: string }) => {
  const { properties } = useProperties();
  const { inspections } = useInspections();
  const { requests: warranties } = useWarranty();
  const { technicalConformity } = useDashboardData();

  const stats: StatItem[] = useMemo(() => [
    {
      title: "Portfólio Técnico",
      value: properties.length,
      icon: Building,
      description: `${properties.filter(p => p.status === 'progress').length} ativos em execução`,
      variant: "brand",
    },
    {
      title: "Vistorias & Entregas",
      value: inspections.length,
      icon: ClipboardCheck,
      description: `${inspections.filter(i => i.status === 'pending' || i.status === 'confirmed').length} em cronograma`,
      variant: "complete",
      trend: { value: "8%", isPositive: true }
    },
    {
      title: "Garantia & Assistência",
      value: warranties.length,
      icon: ShieldCheck,
      description: `${warranties.filter(w => w.currentStage !== 'completed' && w.currentStage !== 'rejected').length} incidentes ativos`,
      variant: "progress",
    },
    {
      title: "Conformidade ABNT",
      value: `${technicalConformity}%`,
      icon: Activity,
      description: "SLA de integridade técnica",
      variant: "pending",
      trend: { value: "2.4%", isPositive: true }
    },
  ], [properties, inspections, warranties, technicalConformity]);


  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
      className
    )}>
      {stats.map((stat) => (
        <StatsCard 
          key={stat.title}
          label={stat.title}
          value={stat.value}
          icon={stat.icon}
          description={stat.description}
          variant={stat.variant}
          trend={stat.trend}
          className="animate-in fade-in slide-in-from-bottom-2 duration-normal"
        />
      ))}
    </div>
  );
});
