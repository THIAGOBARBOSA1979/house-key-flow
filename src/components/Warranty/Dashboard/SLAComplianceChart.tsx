
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WarrantyMetrics } from "@/types/warrantyFlow";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SLAComplianceChartProps {
  metrics: WarrantyMetrics;
  previousPeriodRate?: number; // For trend comparison
}

export function SLAComplianceChart({ metrics, previousPeriodRate }: SLAComplianceChartProps) {
  const { slaComplianceRate, onTrackCount, warningCount, expiredCount } = metrics;
  const total = onTrackCount + warningCount + expiredCount;
  
  // Determine trend
  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  let trendValue = 0;
  
  if (previousPeriodRate !== undefined) {
    trendValue = slaComplianceRate - previousPeriodRate;
    if (trendValue > 2) trend = 'up';
    else if (trendValue < -2) trend = 'down';
  }

  // Performance level
  let performanceLevel: 'excellent' | 'good' | 'warning' | 'critical';
  if (slaComplianceRate >= 90) performanceLevel = 'excellent';
  else if (slaComplianceRate >= 75) performanceLevel = 'good';
  else if (slaComplianceRate >= 50) performanceLevel = 'warning';
  else performanceLevel = 'critical';

  const performanceConfig = {
    excellent: {
      label: 'Excelente',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500',
      description: 'Parabéns! A equipe está mantendo um ótimo desempenho.'
    },
    good: {
      label: 'Bom',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      description: 'Desempenho dentro do esperado. Continue assim!'
    },
    warning: {
      label: 'Atenção',
      color: 'text-amber-600',
      bgColor: 'bg-amber-500',
      description: 'O desempenho precisa de atenção. Analise os gargalos.'
    },
    critical: {
      label: 'Crítico',
      color: 'text-red-600',
      bgColor: 'bg-red-500',
      description: 'Ação imediata necessária para melhorar o desempenho.'
    }
  };

  const config = performanceConfig[performanceLevel];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Cumprimento do SLA</span>
          {trend !== 'neutral' && (
            <span className={cn(
              "flex items-center gap-1 text-sm font-normal",
              trend === 'up' ? 'text-emerald-600' : 'text-red-600'
            )}>
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {Math.abs(trendValue).toFixed(1)}%
            </span>
          )}
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main gauge */}
        <div className="relative">
          <div className="text-center mb-2">
            <span className={cn("text-4xl font-bold", config.color)}>
              {slaComplianceRate}%
            </span>
            <span className={cn("ml-2 text-sm font-medium", config.color)}>
              {config.label}
            </span>
          </div>
          
          <Progress 
            value={slaComplianceRate} 
            className="h-3"
          />
          
          {/* Scale markers */}
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>75%</span>
            <span>90%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-emerald-50">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-lg font-semibold text-emerald-700">{onTrackCount}</p>
            <p className="text-xs text-emerald-600">No prazo</p>
            <p className="text-xs text-muted-foreground mt-1">
              {total > 0 ? Math.round((onTrackCount / total) * 100) : 0}%
            </p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-600 mx-auto mb-1" />
            <p className="text-lg font-semibold text-amber-700">{warningCount}</p>
            <p className="text-xs text-amber-600">Em alerta</p>
            <p className="text-xs text-muted-foreground mt-1">
              {total > 0 ? Math.round((warningCount / total) * 100) : 0}%
            </p>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-red-50">
            <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-semibold text-red-700">{expiredCount}</p>
            <p className="text-xs text-red-600">Atrasados</p>
            <p className="text-xs text-muted-foreground mt-1">
              {total > 0 ? Math.round((expiredCount / total) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Targets */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-2">Metas de SLA</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Meta mínima (75%)</span>
              <span className={cn(
                "font-medium",
                slaComplianceRate >= 75 ? "text-emerald-600" : "text-red-600"
              )}>
                {slaComplianceRate >= 75 ? "✓ Atingida" : "✗ Não atingida"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Meta ideal (90%)</span>
              <span className={cn(
                "font-medium",
                slaComplianceRate >= 90 ? "text-emerald-600" : "text-amber-600"
              )}>
                {slaComplianceRate >= 90 ? "✓ Atingida" : `${90 - slaComplianceRate}% para meta`}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
