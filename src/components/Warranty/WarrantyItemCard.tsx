
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WarrantyItem, WarrantyEligibilityResult, CATEGORY_ICONS } from "@/types/warranty";
import { WarrantyEligibilityBadge } from "./WarrantyEligibilityBadge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Droplets, Shield, Grid3x3, DoorOpen, Building, Zap, 
  PaintBucket, Settings, CheckCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WarrantyItemCardProps {
  item: WarrantyItem;
  eligibility: WarrantyEligibilityResult;
  isSelected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  "droplets": Droplets,
  "shield": Shield,
  "grid": Grid3x3,
  "door-open": DoorOpen,
  "building": Building,
  "zap": Zap,
  "paint-bucket": PaintBucket,
  "settings": Settings,
};

export function WarrantyItemCard({
  item,
  eligibility,
  isSelected = false,
  onSelect,
  disabled = false,
}: WarrantyItemCardProps) {
  const iconName = CATEGORY_ICONS[item.category] || "settings";
  const Icon = iconMap[iconName] || Settings;
  
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all relative overflow-hidden",
        isSelected && "ring-2 ring-primary",
        disabled && "opacity-60 cursor-not-allowed",
        !disabled && !isSelected && "hover:border-primary/50"
      )}
      onClick={() => !disabled && onSelect?.()}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <CheckCircle className="h-5 w-5 text-primary fill-primary/20" />
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Icon */}
          <div className={cn(
            "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center",
            eligibility.isEligible ? "bg-primary/10" : "bg-muted"
          )}>
            <Icon className={cn(
              "h-6 w-6",
              eligibility.isEligible ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={cn(
                "font-medium truncate",
                disabled && "text-muted-foreground"
              )}>
                {item.name}
              </h3>
              <WarrantyEligibilityBadge eligibility={eligibility} />
            </div>
            
            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
              {item.description}
            </p>
            
            <div className="text-xs text-muted-foreground mb-2">
              <span>{item.propertyName} • Unidade {item.unitNumber}</span>
            </div>
            
            {/* Progress bar for active warranties */}
            {eligibility.isEligible && eligibility.percentageRemaining !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Garantia restante</span>
                  <span className="font-medium">{eligibility.percentageRemaining}%</span>
                </div>
                <Progress 
                  value={eligibility.percentageRemaining} 
                  className="h-1.5"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Início: {format(item.dataInicioGarantia, "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                  <span>
                    Fim: {format(item.dataFimGarantia, "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
            )}
            
            {/* Expiry info for inactive warranties */}
            {!eligibility.isEligible && (
              <div className="text-xs text-muted-foreground">
                {eligibility.reason === "expired" && (
                  <span>Expirou em {format(item.dataFimGarantia, "dd/MM/yyyy", { locale: ptBR })}</span>
                )}
                {eligibility.reason === "cancelled" && (
                  <span>Garantia cancelada</span>
                )}
                {eligibility.reason === "not_started" && (
                  <span>Inicia em {format(item.dataInicioGarantia, "dd/MM/yyyy", { locale: ptBR })}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
