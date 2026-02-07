
import { cn } from "@/lib/utils";
import { WarrantyStage, WarrantyStageConfig, WarrantyTimelineStep as TimelineStepType, WARRANTY_STAGES } from "@/types/warrantyFlow";
import { SLAIndicator } from "./SLAIndicator";
import { 
  CheckCircle2, 
  Clock, 
  Circle, 
  Lock,
  FileText,
  Search,
  Calendar,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Wrench
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  FileText,
  Search,
  Calendar,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Wrench,
  CheckCircle2
};

interface WarrantyTimelineStepProps {
  step: TimelineStepType;
  isLast?: boolean;
  showSLA?: boolean;
}

export function WarrantyTimelineStep({ 
  step, 
  isLast = false,
  showSLA = true 
}: WarrantyTimelineStepProps) {
  const { config, status, startedAt, completedAt, sla, notes } = step;
  
  // Get icon component
  const StageIcon = iconMap[config.icon] || Circle;
  
  // Status-based styling
  const statusConfig = {
    completed: {
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      lineColor: "bg-emerald-300",
      StatusIcon: CheckCircle2
    },
    current: {
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      lineColor: "bg-muted",
      StatusIcon: Clock
    },
    pending: {
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground",
      lineColor: "bg-muted",
      StatusIcon: Circle
    },
    blocked: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      lineColor: "bg-red-200",
      StatusIcon: Lock
    }
  };

  const currentConfig = statusConfig[status];
  const StatusIcon = currentConfig.StatusIcon;

  return (
    <div className="relative flex gap-4">
      {/* Vertical line connector */}
      {!isLast && (
        <div 
          className={cn(
            "absolute left-5 top-10 bottom-0 w-0.5 -ml-px",
            currentConfig.lineColor
          )} 
        />
      )}
      
      {/* Icon */}
      <div className={cn(
        "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background shadow-sm",
        currentConfig.iconBg
      )}>
        {status === "completed" ? (
          <CheckCircle2 className={cn("h-5 w-5", currentConfig.iconColor)} />
        ) : (
          <StageIcon className={cn("h-5 w-5", currentConfig.iconColor)} />
        )}
      </div>
      
      {/* Content */}
      <div className={cn(
        "flex-1 pb-6",
        status === "pending" && "opacity-60"
      )}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <h4 className={cn(
              "font-medium",
              status === "current" && "text-primary"
            )}>
              {config.label}
            </h4>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>
          
          {/* Status badge */}
          <div className="flex items-center gap-2">
            {status === "completed" && completedAt && (
              <span className="text-xs text-muted-foreground">
                {format(completedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            )}
            {status === "current" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                <Clock className="h-3 w-3" />
                Em andamento
              </span>
            )}
            {status === "blocked" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                <Lock className="h-3 w-3" />
                Bloqueado
              </span>
            )}
          </div>
        </div>
        
        {/* SLA Indicator for current stage */}
        {status === "current" && showSLA && sla && (
          <div className="mt-3 max-w-xs">
            <SLAIndicator slaInfo={sla} />
          </div>
        )}
        
        {/* Notes */}
        {notes && (
          <div className="mt-2 p-2 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground">{notes}</p>
          </div>
        )}
        
        {/* Start date for current */}
        {status === "current" && startedAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            Iniciado em {format(startedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        )}
      </div>
    </div>
  );
}
