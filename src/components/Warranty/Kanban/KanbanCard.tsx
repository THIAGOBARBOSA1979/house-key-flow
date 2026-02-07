
import { cn } from "@/lib/utils";
import { KanbanCardData, WARRANTY_STAGES, SLAStatus } from "@/types/warrantyFlow";
import { SLABadge } from "../ClientTimeline/SLAIndicator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, User, Calendar, GripVertical, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface KanbanCardProps {
  data: KanbanCardData;
  isDragging?: boolean;
  onClick?: () => void;
}

export function KanbanCard({ data, isDragging = false, onClick }: KanbanCardProps) {
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

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-3 cursor-pointer transition-all border-l-4",
        slaBorderColors[slaInfo.status],
        isDragging && "shadow-lg scale-105 rotate-2 opacity-90",
        !isDragging && "hover:shadow-md",
        dragDisabled && "opacity-70 cursor-not-allowed"
      )}
    >
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
      </div>
      
      {/* Category badge */}
      <Badge variant="secondary" className="text-xs mb-2">
        {request.category}
      </Badge>
      
      {/* SLA and assignment */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t">
        <SLABadge 
          status={slaInfo.status} 
          hoursRemaining={slaInfo.hoursRemaining} 
        />
        
        {request.assignedToName ? (
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {request.assignedToName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <span className="text-xs text-muted-foreground italic">Não atribuído</span>
        )}
      </div>
      
      {/* Inspection date if scheduled */}
      {request.currentStage === "inspection_scheduled" && request.inspectionDate && (
        <div className="mt-2 pt-2 border-t flex items-center gap-1.5 text-xs text-primary">
          <Calendar className="h-3 w-3" />
          <span>Vistoria: {format(request.inspectionDate, "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
        </div>
      )}
      
      {/* SLA expired warning */}
      {slaInfo.status === "expired" && (
        <div className="mt-2 pt-2 border-t flex items-center gap-1.5 text-xs text-red-600">
          <AlertTriangle className="h-3 w-3" />
          <span>Prazo SLA excedido</span>
        </div>
      )}
    </Card>
  );
}
