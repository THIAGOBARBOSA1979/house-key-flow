
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  WarrantyRequestFlow, 
  WarrantyTimelineStep, 
  WarrantyStage,
  WARRANTY_STAGES,
  STAGE_ORDER,
  isFinalStage
} from "@/types/warrantyFlow";
import { warrantySLAService } from "@/services";
import { WarrantyTimelineStep as TimelineStepComponent } from "./WarrantyTimelineStep";
import { SLAIndicator } from "./SLAIndicator";
import { History, AlertTriangle, ShieldCheck, Clock, XCircle, Building, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatDateTime } from "@/utils/formatters";

interface WarrantyRequestTimelineProps {
  request: WarrantyRequestFlow;
  compact?: boolean;
}

export function WarrantyRequestTimeline({ request, compact = false }: WarrantyRequestTimelineProps) {
  // Build timeline steps from request history
  const buildTimelineSteps = (): WarrantyTimelineStep[] => {
    const steps: WarrantyTimelineStep[] = [];
    const currentStageOrder = WARRANTY_STAGES[request.currentStage].order;
    
    // Generate steps based on stage order
    STAGE_ORDER.forEach(stageKey => {
      const stageConfig = WARRANTY_STAGES[stageKey];
      
      // Find history entry for this stage
      const historyEntry = request.history.find(h => h.toStatus === stageKey);
      
      // Determine step status
      let status: "completed" | "current" | "pending" | "blocked";
      
      if (stageConfig.order < currentStageOrder) {
        status = "completed";
      } else if (stageKey === request.currentStage) {
        status = "current";
      } else if (request.currentStage === "rejected") {
        // If rejected, remaining stages are blocked
        status = "blocked";
      } else {
        status = "pending";
      }
      
      // Calculate SLA for current stage
      let sla = undefined;
      if (status === "current") {
        sla = warrantySLAService.calculateSLADeadlineInfo(request, stageKey);
      }
      
      steps.push({
        stage: stageKey,
        config: stageConfig,
        status,
        startedAt: historyEntry?.changedAt,
        completedAt: status === "completed" 
          ? request.history.find(h => h.fromStatus === stageKey)?.changedAt 
          : undefined,
        sla,
        notes: historyEntry?.notes
      });
    });
    
    // If rejected, add rejection step
    if (request.currentStage === "rejected") {
      const rejectionEntry = request.history.find(h => h.toStatus === "rejected");
      steps.push({
        stage: "rejected",
        config: WARRANTY_STAGES["rejected"],
        status: "current",
        startedAt: rejectionEntry?.changedAt,
        notes: request.rejectionReason
      });
    }
    
    return steps;
  };

  const timelineSteps = buildTimelineSteps();
  const currentSLA = warrantySLAService.calculateSLADeadlineInfo(request);
  const isFinal = isFinalStage(request.currentStage);

  // Priority colors
  const priorityConfig = {
    low: { label: "Baixa", className: "bg-slate-100 text-slate-700" },
    medium: { label: "Média", className: "bg-blue-100 text-blue-700" },
    high: { label: "Alta", className: "bg-orange-100 text-orange-700" },
    critical: { label: "Crítica", className: "bg-red-100 text-red-700" }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Status summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isFinal ? (
              request.currentStage === "completed" ? (
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )
            ) : (
              <Clock className="h-5 w-5 text-primary" />
            )}
            <span className="font-medium">
              {WARRANTY_STAGES[request.currentStage].label}
            </span>
          </div>
          {!isFinal && (
            <SLAIndicator slaInfo={currentSLA} compact showProgress={false} />
          )}
        </div>
        
        {/* Compact timeline */}
        <div className="flex items-center gap-1">
          {timelineSteps.slice(0, -1).map((step, index) => (
            <div 
              key={step.stage}
              className="flex items-center"
            >
              <div 
                className={`h-2 w-2 rounded-full ${
                  step.status === "completed" ? "bg-emerald-500" :
                  step.status === "current" ? "bg-primary" :
                  step.status === "blocked" ? "bg-red-300" :
                  "bg-muted"
                }`}
              />
              {index < timelineSteps.length - 2 && (
                <div className={`h-0.5 w-4 ${
                  step.status === "completed" ? "bg-emerald-300" :
                  step.status === "blocked" ? "bg-red-200" :
                  "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-sem-lg rounded-[2.5rem] overflow-hidden bg-white/60 backdrop-blur-md transition-all duration-500 hover:shadow-sem-xl">
      <div className="h-2 w-full bg-gradient-to-r from-primary to-transparent" />
      <CardHeader className="p-8 sm:p-10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
               <History className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <div>
              <CardTitle className="text-2xl font-black tracking-tight leading-none">
                Ciclo de Atendimento Técnico
              </CardTitle>
              <CardDescription className="font-bold text-[10px] uppercase tracking-[0.2em] mt-2 text-muted-foreground/60">
                Protocolo #{request.id} • Aberta em {formatDate(request.createdAt)}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge className={cn("px-3 py-1 font-black uppercase text-[10px] border-none rounded-full", priorityConfig[request.priority].className)}>
              Prioridade {priorityConfig[request.priority].label}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 font-black uppercase text-[10px] rounded-full border-2">{request.category}</Badge>
          </div>
        </div>
        
        {/* Current status banner */}
        {!isFinal && (
          <div className="mt-4">
            <SLAIndicator slaInfo={currentSLA} />
          </div>
        )}
        
        {/* Completed banner */}
        {request.currentStage === "completed" && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-medium">Garantia Concluída</span>
            </div>
            {request.completionDate && (
              <p className="text-sm text-emerald-600 mt-1">
                Finalizada em {formatDateTime(request.completionDate)}
              </p>
            )}
            {request.completionNotes && (
              <p className="text-sm text-muted-foreground mt-2">
                {request.completionNotes}
              </p>
            )}
          </div>
        )}
        
        {/* Rejected banner */}
        {request.currentStage === "rejected" && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Solicitação Não Aprovada</span>
            </div>
            {request.rejectionReason && (
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Motivo:</strong> {request.rejectionReason}
              </p>
            )}
          </div>
        )}
      </CardHeader>
      
      <Separator />
      
      <CardContent className="px-8 sm:px-10 pb-10 pt-8">
        {/* Request details summary card */}
        <div className="mb-10 p-6 bg-muted/20 rounded-[2rem] border-2 border-dashed border-border/10 group/details transition-all">
          <h3 className="font-black text-xl tracking-tight mb-2 group-hover/details:text-primary transition-colors">{request.title}</h3>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6">{request.description}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-border/10">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Ativo Imobiliário</span>
              <p className="text-xs font-black flex items-center gap-2">
                <Building className="h-3.5 w-3.5 text-primary" />
                {request.propertyName} <span className="text-primary">•</span> Unidade {request.unitNumber}
              </p>
            </div>
            {request.assignedToName && (
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Responsável Técnico</span>
                <p className="text-xs font-black flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-primary" />
                  {request.assignedToName}
                </p>
              </div>
            )}
            {request.currentStage !== 'completed' && !isFinal && (
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Previsão Próxima Etapa</span>
                <p className="text-xs font-black text-primary animate-pulse">Analista A2 em triagem</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-10">
           <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 whitespace-nowrap px-4">Timeline Estratégica</span>
           <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        </div>
        
        {/* Timeline */}
        <div className="space-y-0 px-4">
          {timelineSteps.map((step, index) => (
            <TimelineStepComponent
              key={step.stage}
              step={step}
              isLast={index === timelineSteps.length - 1}
              showSLA={true}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// List view for multiple requests
interface WarrantyRequestListProps {
  requests: WarrantyRequestFlow[];
  onSelectRequest: (requestId: string) => void;
  selectedRequestId?: string;
}

export function WarrantyRequestList({ 
  requests, 
  onSelectRequest, 
  selectedRequestId 
}: WarrantyRequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>Nenhuma solicitação de garantia encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map(request => {
        const slaInfo = warrantySLAService.calculateSLADeadlineInfo(request);
        const isFinal = isFinalStage(request.currentStage);
        
        return (
          <div
            key={request.id}
            onClick={() => onSelectRequest(request.id)}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedRequestId === request.id
                ? "border-primary bg-primary/5"
                : "hover:border-muted-foreground/30"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{request.title}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  {request.propertyName} - Unidade {request.unitNumber}
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <Badge variant={isFinal ? "secondary" : "outline"} className="text-xs">
                  {WARRANTY_STAGES[request.currentStage].label}
                </Badge>
                {!isFinal && (
                  <SLAIndicator slaInfo={slaInfo} compact showProgress={false} />
                )}
              </div>
            </div>
            
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDate(request.createdAt)}</span>
              <span>•</span>
              <span>{request.category}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
