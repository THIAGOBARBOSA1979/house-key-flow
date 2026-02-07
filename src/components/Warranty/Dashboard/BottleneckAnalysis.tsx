
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WarrantyMetrics, WARRANTY_STAGES, STAGE_ORDER, WarrantyStage } from "@/types/warrantyFlow";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottleneckAnalysisProps {
  metrics: WarrantyMetrics;
}

export function BottleneckAnalysis({ metrics }: BottleneckAnalysisProps) {
  const { stageDistribution, bottleneckStage, averageTimeByStage } = metrics;
  
  // Calculate total in non-final stages
  const totalActive = STAGE_ORDER.slice(0, -1).reduce(
    (acc, stage) => acc + (stageDistribution[stage] || 0), 
    0
  );
  
  // Build analysis data
  const analysisData = STAGE_ORDER.slice(0, -1).map(stage => {
    const count = stageDistribution[stage] || 0;
    const percentage = totalActive > 0 ? (count / totalActive) * 100 : 0;
    const avgTime = averageTimeByStage[stage] || 0;
    const isBottleneck = stage === bottleneckStage;
    
    return {
      stage,
      label: WARRANTY_STAGES[stage].label,
      count,
      percentage,
      avgTime,
      isBottleneck,
      color: WARRANTY_STAGES[stage].color
    };
  });

  // Get recommendations based on bottleneck
  const getRecommendations = (bottleneck: WarrantyStage | null): string[] => {
    if (!bottleneck) return ["Sistema operando normalmente"];
    
    const recommendations: Record<WarrantyStage, string[]> = {
      opened: [
        "Aumentar capacidade de triagem inicial",
        "Automatizar atribuição de solicitações",
        "Revisar processo de entrada"
      ],
      in_analysis: [
        "Distribuir melhor a carga entre analistas",
        "Criar templates de análise padrão",
        "Definir SLAs internos mais rígidos"
      ],
      inspection_scheduled: [
        "Aumentar equipe de vistoriadores",
        "Otimizar rotas de visita",
        "Reduzir tempo entre agendamento e visita"
      ],
      inspection_completed: [
        "Acelerar processo de aprovação",
        "Delegar autoridade de aprovação",
        "Criar critérios claros de aprovação"
      ],
      approved: [
        "Iniciar execução mais rapidamente",
        "Pré-alocar recursos para reparos comuns"
      ],
      in_execution: [
        "Aumentar equipe de execução",
        "Melhorar gestão de materiais",
        "Priorizar por complexidade"
      ],
      rejected: [],
      completed: []
    };
    
    return recommendations[bottleneck] || [];
  };

  const recommendations = getRecommendations(bottleneckStage);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Análise de Gargalos
        </CardTitle>
        <CardDescription>
          Identifique onde as solicitações estão acumulando
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bottleneck Alert */}
        {bottleneckStage && stageDistribution[bottleneckStage] > 2 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">
                Gargalo identificado: {WARRANTY_STAGES[bottleneckStage].label}
              </p>
              <p className="text-sm text-amber-700 mt-1">
                {stageDistribution[bottleneckStage]} solicitações acumuladas nesta etapa
              </p>
            </div>
          </div>
        )}
        
        {/* Stage Distribution Bars */}
        <div className="space-y-3">
          {analysisData.map((data, index) => (
            <div key={data.stage}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{data.label}</span>
                  {data.isBottleneck && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                      Gargalo
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {data.count} ({data.percentage.toFixed(0)}%)
                </span>
              </div>
              <Progress 
                value={data.percentage} 
                className={cn(
                  "h-2",
                  data.isBottleneck && "bg-amber-100"
                )}
              />
              {index < analysisData.length - 1 && (
                <div className="flex justify-center my-1">
                  <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Recomendações</p>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Flow visualization */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-3">Fluxo de Processamento</p>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {analysisData.map((data, index) => (
              <div key={data.stage} className="flex items-center">
                <div 
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[60px] p-2 rounded",
                    data.isBottleneck 
                      ? "bg-amber-100 border border-amber-300" 
                      : "bg-muted/50"
                  )}
                >
                  <span className="text-lg font-bold">{data.count}</span>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">
                    {data.label.split(' ')[0]}
                  </span>
                </div>
                {index < analysisData.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
