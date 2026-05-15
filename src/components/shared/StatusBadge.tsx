

import { cn } from "@/lib/utils";
import { Clock, Loader2, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";

/**
 * Status Types supported by the Design System
 */
export type StatusType = 
  | "pending" 
  | "progress" 
  | "complete" 
  | "critical" 
  | "success" 
  | "warning" 
  | "error" 
  | "info" 
  | "neutral";

interface StatusBadgeProps {
  /** The current status to display */
  status: StatusType;
  /** Optional custom label (defaults to standard status name) */
  label?: string;
  /** Whether to show the status icon */
  showIcon?: boolean;
  /** The size variation of the badge */
  size?: "sm" | "default" | "lg";
  /** Additional CSS classes */
  className?: string;
}

const statusConfig: Record<StatusType, { 
  badgeClass: string; 
  defaultLabel: string;
  icon: typeof Clock;
}> = {
  pending: {
    badgeClass: "badge-pending",
    defaultLabel: "Pendente",
    icon: Clock,
  },
  progress: {
    badgeClass: "badge-progress",
    defaultLabel: "Em Andamento",
    icon: Loader2,
  },
  complete: {
    badgeClass: "badge-complete",
    defaultLabel: "Concluído",
    icon: CheckCircle2,
  },
  critical: {
    badgeClass: "badge-critical",
    defaultLabel: "Crítico",
    icon: AlertTriangle,
  },
  success: {
    badgeClass: "badge-complete", // Map semantic success to complete
    defaultLabel: "Sucesso",
    icon: CheckCircle2,
  },
  warning: {
    badgeClass: "badge-pending", // Map semantic warning to pending style
    defaultLabel: "Atenção",
    icon: AlertTriangle,
  },
  error: {
    badgeClass: "badge-critical", // Map semantic error to critical
    defaultLabel: "Erro",
    icon: XCircle,
  },
  info: {
    badgeClass: "badge-progress", // Map semantic info to progress style
    defaultLabel: "Info",
    icon: Info,
  },
  neutral: {
    badgeClass: "bg-muted text-muted-foreground border-muted-foreground/20",
    defaultLabel: "Neutro",
    icon: Info,
  },
};

/**
 * Reusable StatusBadge component following the Design System guidelines.
 */
export const StatusBadge = ({ 
  status, 
  label, 
  showIcon = true,
  size = "default",
  className 
}: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.neutral;
  const Icon = config.icon;
  
  return (
    <span 
      role="status"
      aria-label={`${config.defaultLabel}: ${label || config.defaultLabel}`}
      className={cn(
        "badge-status transition-all duration-300",
        config.badgeClass,
        "shadow-sem-sm hover:shadow-sem-md hover:scale-[1.02] cursor-default",
        size === "sm" && "px-2.5 py-1 text-[10px] gap-1 font-black uppercase tracking-widest",
        size === "lg" && "px-4 py-2 text-sem-body-sm gap-2 font-bold rounded-xl",
        className
      )}
    >
      {showIcon && (
        <Icon 
          className={cn(
            "shrink-0",
            size === "sm" ? "h-3 w-3" : (size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"),
            status === "progress" && "animate-spin"
          )} 
          aria-hidden="true"
        />
      )}
      <span className="truncate whitespace-nowrap">{label || config.defaultLabel}</span>
    </span>
  );
};

