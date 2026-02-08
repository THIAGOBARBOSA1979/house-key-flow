
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Building, ShieldCheck, ClipboardCheck, AlertTriangle, LucideIcon } from "lucide-react";

interface StatItem {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: string;
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
    description: "3 em andamento",
    color: "text-blue-600 bg-blue-100",
  },
  {
    title: "Vistorias",
    value: "148",
    icon: ClipboardCheck,
    description: "24 pendentes",
    color: "text-emerald-600 bg-emerald-100",
  },
  {
    title: "Garantias",
    value: "57",
    icon: ShieldCheck,
    description: "18 em andamento",
    color: "text-violet-600 bg-violet-100",
  },
  {
    title: "Chamados Críticos",
    value: "5",
    icon: AlertTriangle,
    description: "Prioridade alta",
    color: "text-red-600 bg-red-100",
  },
];

export const Stats = ({ stats = defaultStats, className }: StatsProps) => {
  return (
    <div className={cn(
      "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4",
      className
    )}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.description && (
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  )}
                </div>
                <div className={cn(
                  "p-2 rounded-lg",
                  stat.color || "text-primary bg-primary/10"
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
