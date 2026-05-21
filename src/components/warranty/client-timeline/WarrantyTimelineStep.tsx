
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
import { format, isValid } from "date-fns";
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
    <div className={cn("relative flex gap-6 group/step transition-all duration-500", status === "pending" && "opacity-40")}>
      {/* Vertical line connector */}
      {!isLast && (
        <div 
          className={cn(
            "absolute left-[19px] top-10 bottom-0 w-[2px] transition-all duration-700",
            status === "completed" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-muted"
          )} 
        />
      )}
      
      {/* Icon */}
      <div className={cn(
        "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border-2 border-background shadow-sem-md transition-all duration-500 group-hover/step:scale-110",
        currentConfig.iconBg,
        status === 'current' && 'animate-pulse ring-2 ring-primary/20 ring-offset-2'
      )}>
        {status === "completed" ? (
          <CheckCircle2 className={cn("h-5 w-5", currentConfig.iconColor)} strokeWidth={3} />
        ) : (
          <StageIcon className={cn("h-5 w-5", currentConfig.iconColor)} strokeWidth={2.5} />
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-1">
            <h4 className={cn(
              "text-sm font-black uppercase tracking-widest",
              status === "current" ? "text-primary" : (status === "completed" ? "text-emerald-700" : "text-muted-foreground")
            )}>
              {config.label}
            </h4>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-lg">
              {config.description}
            </p>
          </div>
          
          {/* Status badge */}
          <div className="flex items-center gap-2 shrink-0">
            {status === "completed" && completedAt && (
              <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60 bg-muted/30 px-2 py-1 rounded-lg">
                {isValid(new Date(completedAt)) ? format(new Date(completedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "—"}
              </span>
            )}
            {status === "current" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary animate-pulse">
                <Clock className="h-3 w-3" strokeWidth={3} />
                Etapa Ativa
              </span>
            )}
            {status === "blocked" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700">
                <Lock className="h-3 w-3" strokeWidth={3} />
                Suspenso
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
          <div className="mt-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/30" />
            <p className="text-sm text-foreground/90 font-medium leading-relaxed italic">"{notes}"</p>
            <div className="mt-2 flex items-center gap-2 opacity-60">
               <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                 <Search size={10} className="text-muted-foreground" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest">Nota Técnica</span>
            </div>
          </div>
        )}
        
        {/* Start date for current */}
        {status === "current" && startedAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            Iniciado em {isValid(new Date(startedAt)) ? format(new Date(startedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "—"}
          </p>
        )}
      </div>
    </div>
  );
}
