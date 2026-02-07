
import { cn } from "@/lib/utils";
import { SLAStatus, SLADeadlineInfo } from "@/types/warrantyFlow";
import { Clock, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { warrantySLAService } from "@/services/WarrantySLAService";

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
      bgColor: "bg-emerald-100",
      progressColor: "bg-emerald-500",
      label: "No prazo"
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      progressColor: "bg-amber-500",
      label: "Atenção"
    },
    expired: {
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
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
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
              config.bgColor,
              config.color,
              className
            )}>
              <Icon className="h-3 w-3" />
              <span>{formattedTime}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Prazo: {deadlineFormatted}</p>
            <p>{config.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-1.5", config.color)}>
          <Icon className="h-4 w-4" />
          {showLabel && (
            <span className="text-sm font-medium">{config.label}</span>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {formattedTime}
        </span>
      </div>
      
      {showProgress && (
        <div className="space-y-1">
          <Progress 
            value={Math.max(0, percentageRemaining)} 
            className={cn("h-2", config.bgColor)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Prazo: {deadlineFormatted}</span>
            <span>{Math.round(percentageRemaining)}% restante</span>
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
