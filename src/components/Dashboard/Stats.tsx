
import { cn } from "@/lib/utils";
import { Building, ShieldCheck, ClipboardCheck, Activity } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";

interface StatItem {
  title: string;
  value: string | number;
  description?: string;
  icon: any;
  variant: 'brand' | 'complete' | 'progress' | 'pending' | 'critical' | 'default';
  trend?: { value: string; isPositive: boolean };
}

const defaultStats: StatItem[] = [
  {
    title: "Empreendimentos",
    value: "12",
    icon: Building,
    description: "3 em lançamento",
    variant: "brand",
  },
  {
    title: "Vistorias",
    value: "148",
    icon: ClipboardCheck,
    description: "24 para esta semana",
    variant: "complete",
    trend: { value: "5%", isPositive: true }
  },
  {
    title: "Garantias",
    value: "57",
    icon: ShieldCheck,
    description: "12 em atendimento",
    variant: "progress",
  },
  {
    title: "Satisfação",
    value: "94%",
    icon: Activity,
    description: "Feedback dos clientes",
    variant: "pending",
    trend: { value: "2%", isPositive: true }
  },
];

export const Stats = ({ stats = defaultStats, className }: { stats?: StatItem[], className?: string }) => {
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
