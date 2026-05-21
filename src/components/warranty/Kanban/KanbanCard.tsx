
import { cn } from "@/lib/utils";
import { KanbanCardData, WARRANTY_STAGES, SLAStatus } from "@/types/warrantyFlow";
import { SLABadge } from "../clientTimeline/SLAIndicator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, User, Calendar, GripVertical, AlertTriangle, Clock, DollarSign, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface KanbanCardProps {
  data: KanbanCardData;
  isDragging?: boolean;
  onClick?: () => void;
  selected?: boolean;
  onToggleSelection?: (e: React.MouseEvent) => void;
  showSelection?: boolean;
}

export function KanbanCard({ 
  data, 
  isDragging = false, 
  onClick, 
  selected = false, 
  onToggleSelection, 
  showSelection = false 
}: KanbanCardProps) {
  const { request, slaInfo, dragDisabled } = data;
  
  // Priority config
  const priorityConfig: Record<string, { className: string; label: string }> = {
    low: { className: "bg-slate-100 text-slate-600 border-slate-200", label: "Baixa" },
    medium: { className: "bg-blue-100 text-blue-600 border-blue-200", label: "Média" },
    high: { className: "bg-orange-100 text-orange-600 border-orange-200", label: "Alta" },
    critical: { className: "bg-red-100 text-red-600 border-red-200", label: "Crítica" }
  };

  // SLA border color
  const slaBorderColors: Record<SLAStatus, string> = {
    on_track: "border-l-emerald-500",
    warning: "border-l-amber-500",
    expired: "border-l-red-500"
  };

  // Check if request is stalled (not updated in > 48h)
  const isStalled = new Date().getTime() - new Date(request.updatedAt).getTime() > 48 * 60 * 60 * 1000 && !dragDisabled;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-4 cursor-pointer transition-all border-l-4 relative rounded-xl bg-card interactive-active select-none touch-manipulation",
        slaBorderColors[slaInfo.status],
        isDragging && "shadow-2xl scale-[1.02] -rotate-1 opacity-100 z-50 ring-2 ring-primary/20",
        !isDragging && "hover:shadow-md hover:-translate-y-0.5",
        dragDisabled && "opacity-75 grayscale-[0.2] cursor-not-allowed bg-muted/50",
        selected && "ring-2 ring-primary bg-primary/5 border-l-primary shadow-inner"
      )}
    >
      {showSelection && (
        <div 
          className={cn(
            "absolute top-2 right-2 w-4 h-4 rounded border transition-colors flex items-center justify-center",
            selected ? "bg-primary border-primary" : "bg-white border-muted-foreground/30"
          )}
          onClick={onToggleSelection}
        >
          {selected && <CheckSquare className="h-3 w-3 text-white" />}
        </div>
      )}
      {/* Header with drag handle and priority */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {!dragDisabled && (
            <GripVertical className="h-4 w-4 text-muted-foreground/50 flex-shrink-0 cursor-grab" />
          )}
          <h4 className="font-medium text-sm truncate">{request.title}</h4>
        </div>
        <Badge 
          variant="outline" 
          className={cn("text-xs px-1.5 py-0 flex-shrink-0", priorityConfig[request.priority].className)}
        >
          {priorityConfig[request.priority].label}
        </Badge>
      </div>
      
      {/* Client and property info */}
      <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3" />
          <span className="truncate">{request.clientName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Building2 className="h-3 w-3" />
          <span className="truncate">{request.propertyName} - {request.unitNumber}</span>
        </div>
        {request.isPaused && (
          <div className="flex items-center gap-1.5 text-amber-600 font-medium">
            <Clock className="h-3 w-3" />
            <span>Pausado: {request.pauseReason}</span>
          </div>
        )}
      </div>
      
      {/* Category and Cost badges */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {request.category}
        </Badge>
        {request.estimatedCost && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-200 text-emerald-700 bg-emerald-50">
            Est: R$ {request.estimatedCost.toLocaleString('pt-BR')}
          </Badge>
        )}
      </div>
      
      {/* Progress of items if execution started */}
      {request.problems && (request.currentStage === "in_execution" || request.currentStage === "approved") && (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
            <span>Progresso de Reparos</span>
            <span>{request.problems.filter(p => p.status === 'resolved').length}/{request.problems.length}</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${(request.problems.filter(p => p.status === 'resolved').length / (request.problems.length || 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* SLA and assignment - enhanced touch target */}
      <div className="flex flex-col gap-2 mt-2 pt-2 border-t">
        <div className="flex items-center justify-between min-h-[40px]">
          <div className="flex flex-col gap-1">
            <SLABadge 
              status={slaInfo.status} 
              hoursRemaining={slaInfo.hoursRemaining} 
            />
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{slaInfo.percentageRemaining.toFixed(0)}% do tempo restante</span>
            </div>
          </div>
          
          {request.assignedToName ? (
            <div className="flex flex-col items-end gap-1">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {request.assignedToName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                {request.assignedToName}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">Não atribuído</span>
          )}
        </div>
      </div>
      
      {/* Inspection info if applicable */}
      {request.inspectionDate && (
        <div className={cn(
          "mt-2 pt-2 border-t flex items-center gap-1.5 text-xs",
          request.currentStage === "inspection_scheduled" ? "text-primary font-bold" : "text-muted-foreground"
        )}>
          <Calendar className="h-3 w-3" />
          <span>{request.currentStage === "inspection_scheduled" ? "Vistoria agendada:" : "Vistoria realizada:"} {format(request.inspectionDate, "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
        </div>
      )}
      
      {/* SLA expired or Stalled warning */}
      {slaInfo.status === "expired" ? (
        <div className="mt-2 pt-2 border-t flex items-center gap-1.5 text-xs text-red-600 font-bold">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Prazo SLA excedido</span>
        </div>
      ) : isStalled ? (
        <div className="mt-2 pt-2 border-t flex items-center gap-1.5 text-xs text-amber-600 font-medium">
          <Clock className="h-3.5 w-3.5" />
          <span>Sem atualização há 48h+</span>
        </div>
      ) : null}
    </Card>
  );
}
