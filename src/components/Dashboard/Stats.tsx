

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Building, ShieldCheck, ClipboardCheck, LucideIcon, Activity } from "lucide-react";

interface StatItem {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  colorClass?: string;
}

interface StatsProps {
  stats?: StatItem[];
  className?: string;
}

const defaultStats: StatItem[] = [
  {
    title: "Empreendimentos",
    value: "12",
    icon: Building,
    description: "3 em lançamento",
    colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    title: "Vistorias",
    value: "148",
    icon: ClipboardCheck,
    description: "24 para esta semana",
    colorClass: "bg-status-complete/10 text-status-complete dark:text-emerald-400",
  },
  {
    title: "Garantias",
    value: "57",
    icon: ShieldCheck,
    description: "12 em atendimento",
    colorClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    title: "Taxa de Satisfação",
    value: "94%",
    icon: Activity,
    description: "+2% desde o mês passado",
    colorClass: "bg-status-pending/10 text-status-pending dark:text-amber-400",
  },
];

/**
 * Reusable Stats component following Design System tokens.
 */
export const Stats = ({ stats = defaultStats, className }: StatsProps) => {
  return (
    <div className={cn(
      "grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6",
      className
    )}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.title} 
            className="card-standard border-none bg-background/50 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-tiny">{stat.title}</p>
                  <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                  {stat.description && (
                    <p className="text-[10px] font-bold text-muted-foreground/80 mt-1">{stat.description}</p>
                  )}
                </div>
                <div className={cn(
                  "p-2.5 rounded-xl shadow-inner",
                  stat.colorClass || "bg-primary/10 text-primary"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

