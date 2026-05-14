
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Building, ShieldCheck, ClipboardCheck, AlertTriangle, LucideIcon, Activity } from "lucide-react";

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
    description: "3 em lançamento",
    color: "text-blue-600 bg-blue-100/50",
  },
  {
    title: "Vistorias",
    value: "148",
    icon: ClipboardCheck,
    description: "24 para esta semana",
    color: "text-emerald-600 bg-emerald-100/50",
  },
  {
    title: "Garantias",
    value: "57",
    icon: ShieldCheck,
    description: "12 em atendimento",
    color: "text-violet-600 bg-violet-100/50",
  },
  {
    title: "Taxa de Satisfação",
    value: "94%",
    icon: Activity,
    description: "+2% desde o mês passado",
    color: "text-amber-600 bg-amber-100/50",
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
