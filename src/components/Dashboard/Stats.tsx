
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Building, ShieldCheck, ClipboardCheck, Activity } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { propertyService } from "@/services/PropertyService";
import { inspectionService } from "@/services/InspectionService";
import { warrantyFlowService } from "@/services/WarrantyFlowService";

interface StatItem {
  title: string;
  value: string | number;
  description?: string;
  icon: any;
  variant: 'brand' | 'complete' | 'progress' | 'pending' | 'critical' | 'default';
  trend?: { value: string; isPositive: boolean };
}

export const Stats = ({ className }: { className?: string }) => {
  const properties = useMemo(() => propertyService.getAll(), []);
  const inspections = useMemo(() => inspectionService.getAll(), []);
  const warranties = useMemo(() => warrantyFlowService.getAllRequests(), []);

  const stats: StatItem[] = useMemo(() => [
    {
      title: "Empreendimentos",
      value: properties.length,
      icon: Building,
      description: `${properties.filter(p => p.status === 'progress').length} em execução`,
      variant: "brand",
    },
    {
      title: "Vistorias",
      value: inspections.length,
      icon: ClipboardCheck,
      description: `${inspections.filter(i => i.status === 'pending').length} pendentes`,
      variant: "complete",
      trend: { value: "12%", isPositive: true }
    },
    {
      title: "Garantias",
      value: warranties.length,
      icon: ShieldCheck,
      description: `${warranties.filter(w => w.currentStage !== 'completed' && w.currentStage !== 'rejected').length} abertas`,
      variant: "progress",
    },
    {
      title: "Eficiência",
      value: "96%",
      icon: Activity,
      description: "SLA dentro do prazo",
      variant: "pending",
      trend: { value: "3%", isPositive: true }
    },
  ], [properties, inspections, warranties]);

  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4-sem",
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
};
