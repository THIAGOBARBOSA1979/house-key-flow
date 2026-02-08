
import { cn } from "@/lib/utils";
import { Clock, Loader2, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";

export type StatusType = "pending" | "progress" | "complete" | "critical" | "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  size?: "sm" | "default";
  className?: string;
}

const statusConfig: Record<StatusType, { 
  class: string; 
  defaultLabel: string;
  icon: typeof Clock;
}> = {
  pending: {
    class: "status-pending",
    defaultLabel: "Pendente",
    icon: Clock,
  },
  progress: {
    class: "status-progress",
    defaultLabel: "Em Andamento",
    icon: Loader2,
  },
  complete: {
    class: "status-complete",
    defaultLabel: "Concluído",
    icon: CheckCircle2,
  },
  critical: {
    class: "status-critical",
    defaultLabel: "Crítico",
    icon: AlertTriangle,
  },
  success: {
    class: "status-success",
    defaultLabel: "Sucesso",
    icon: CheckCircle2,
  },
  warning: {
    class: "status-warning",
    defaultLabel: "Atenção",
    icon: AlertTriangle,
  },
  error: {
    class: "status-error",
    defaultLabel: "Erro",
    icon: XCircle,
  },
  info: {
    class: "status-info",
    defaultLabel: "Info",
    icon: Info,
  },
  neutral: {
    class: "status-neutral",
    defaultLabel: "Neutro",
    icon: Info,
  },
};

export const StatusBadge = ({ 
  status, 
  label, 
  showIcon = false,
  size = "default",
  className 
}: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <span className={cn(
      "status-badge",
      config.class,
      size === "sm" && "text-[10px] px-2 py-0.5",
      className
    )}>
      {showIcon && <Icon className={cn("mr-1", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />}
      {label || config.defaultLabel}
    </span>
  );
};
