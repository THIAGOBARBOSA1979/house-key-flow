
import { Card, CardContent } from "@/components/ui/card";
import { WarrantyMetrics } from "@/types/warrantyFlow";
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Timer,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsCardsProps {
  metrics: WarrantyMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: "Abertas",
      value: metrics.totalOpen,
      subtitle: `${metrics.openedToday} hoje`,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Em Atraso",
      value: metrics.expiredCount,
      subtitle: `${metrics.warningCount} em alerta`,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      alert: metrics.expiredCount > 0
    },
    {
      title: "Tempo Médio",
      value: `${Math.round(metrics.averageResolutionTime / 24)}d`,
      subtitle: "para resolução",
      icon: Timer,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "SLA Cumprido",
      value: `${metrics.slaComplianceRate}%`,
      subtitle: `${metrics.onTrackCount} no prazo`,
      icon: Target,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100"
    },
    {
      title: "Concluídas (Mês)",
      value: metrics.completedThisMonth,
      subtitle: `${metrics.openedThisMonth} abertas`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card 
            key={index} 
            className={cn(
              "relative overflow-hidden",
              card.alert && "border-red-200 bg-red-50/50"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                </div>
                <div className={cn("p-2 rounded-lg", card.bgColor)}>
                  <Icon className={cn("h-5 w-5", card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
