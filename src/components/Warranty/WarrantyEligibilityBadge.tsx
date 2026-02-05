
import { Badge } from "@/components/ui/badge";
import { WarrantyEligibilityResult } from "@/types/warranty";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WarrantyEligibilityBadgeProps {
  eligibility: WarrantyEligibilityResult;
  showDetails?: boolean;
  className?: string;
}

export function WarrantyEligibilityBadge({ 
  eligibility, 
  showDetails = false,
  className 
}: WarrantyEligibilityBadgeProps) {
  if (eligibility.isEligible) {
    const isNearExpiry = eligibility.daysRemaining && eligibility.daysRemaining < 90;
    
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <Badge 
          variant={isNearExpiry ? "secondary" : "default"}
          className={cn(
            "gap-1",
            isNearExpiry 
              ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400" 
              : "bg-primary text-primary-foreground"
          )}
        >
          {isNearExpiry ? (
            <AlertTriangle className="h-3 w-3" />
          ) : (
            <CheckCircle className="h-3 w-3" />
          )}
          {isNearExpiry ? "Próximo do vencimento" : "Garantia ativa"}
        </Badge>
        {showDetails && eligibility.daysRemaining && (
          <span className="text-xs text-muted-foreground">
            {eligibility.daysRemaining} dias restantes
          </span>
        )}
      </div>
    );
  }

  const config = {
    expired: {
      icon: XCircle,
      text: "Garantia expirada",
      className: "bg-destructive hover:bg-destructive/90",
    },
    cancelled: {
      icon: XCircle,
      text: "Garantia cancelada",
      className: "bg-muted text-muted-foreground hover:bg-muted",
    },
    not_started: {
      icon: Clock,
      text: "Ainda não iniciou",
      className: "bg-muted text-muted-foreground hover:bg-muted",
    },
    not_owned: {
      icon: XCircle,
      text: "Não vinculado",
      className: "bg-destructive hover:bg-destructive/90",
    },
  };

  const { icon: Icon, text, className: badgeClass } = config[eligibility.reason || "expired"];

  return (
    <Badge variant="secondary" className={cn(badgeClass, "gap-1", className)}>
      <Icon className="h-3 w-3" />
      {text}
    </Badge>
  );
}
