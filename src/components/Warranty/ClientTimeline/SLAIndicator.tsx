
import { cn } from "@/lib/utils";
import { SLAStatus, SLADeadlineInfo } from "@/types/warrantyFlow";
import { Clock, AlertTriangle, XCircle, CheckCircle, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { warrantySLAService } from "@/services";

interface SLAIndicatorProps {
  slaInfo: SLADeadlineInfo;
  showLabel?: boolean;
  showProgress?: boolean;
  compact?: boolean;
  className?: string;
}

export function SLAIndicator({ 
  slaInfo, 
  showLabel = true, 
  showProgress = true,
  compact = false,
  className 
}: SLAIndicatorProps) {
  const { status, hoursRemaining, percentageRemaining, deadline } = slaInfo;
  
  const statusConfig = {
    on_track: {
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      progressColor: "bg-emerald-500",
      label: "No prazo"
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      progressColor: "bg-amber-500",
      label: "Prazo Crítico"
    },
    expired: {
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      progressColor: "bg-red-500",
      label: "Atrasado"
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const formattedTime = warrantySLAService.formatRemainingTime(hoursRemaining);
  const deadlineFormatted = deadline.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              config.bgColor,
              config.color,
              className
            )}>
              <Icon className="h-3 w-3" strokeWidth={3} />
              <span>{formattedTime}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="rounded-xl border-2 font-bold text-xs p-3">
            <p className="flex items-center gap-2">
              <Clock size={12} />
              Protocolo técnico até: {deadlineFormatted}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("space-y-3 p-5 rounded-[2rem] bg-card/40 border-2 border-border/5 backdrop-blur-sm shadow-inner", className)}>
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-2", config.color)}>
          <Icon className="h-5 w-5" strokeWidth={3} />
          {showLabel && (
            <span className="text-[11px] font-black uppercase tracking-widest">{config.label}</span>
          )}
        </div>
        <span className={cn("text-xs font-black uppercase tracking-widest", config.color)}>
          {formattedTime}
        </span>
      </div>
      
      {showProgress && (
        <div className="space-y-2">
          <Progress 
            value={Math.max(0, percentageRemaining)} 
            className={cn("h-3 rounded-full bg-muted/30")}
          />
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              Prazo Final: {deadlineFormatted}
            </span>
            <span className="bg-white px-2 py-0.5 rounded-lg border">{Math.round(percentageRemaining)}% do tempo restante</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Badge version for lists and cards
interface SLABadgeProps {
  status: SLAStatus;
  hoursRemaining: number;
  className?: string;
}

export function SLABadge({ status, hoursRemaining, className }: SLABadgeProps) {
  const formattedTime = warrantySLAService.formatRemainingTime(hoursRemaining);
  
  const statusConfig = {
    on_track: {
      className: "bg-emerald-100 text-emerald-700 border-emerald-200"
    },
    warning: {
      className: "bg-amber-100 text-amber-700 border-amber-200"
    },
    expired: {
      className: "bg-red-100 text-red-700 border-red-200"
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
      statusConfig[status].className,
      className
    )}>
      <Clock className="h-3 w-3" />
      {formattedTime}
    </span>
  );
}
