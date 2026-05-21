import React from "react";
import { Badge } from "@/components/ui/badge";
import { ClientStage, STAGE_CONFIG } from "@/types/clientFlow";
import { cn } from "@/lib/utils";
import { 
  UserCheck, 
  ClipboardCheck, 
  ShieldCheck,
  ChevronRight,
  Zap,
  HardHat
} from "lucide-react";

interface StageIndicatorProps {
  currentStage: ClientStage;
  showDescription?: boolean;
  variant?: 'badge' | 'steps' | 'compact';
}

const stageIcons: Record<ClientStage, any> = {
  lead: Zap,
  registered: UserCheck,
  inspection_enabled: HardHat,
  warranty_enabled: ShieldCheck
};


const stageColors: Record<ClientStage, { bg: string; text: string; border: string }> = {
  lead: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600',
    border: 'border-amber-200'
  },
  registered: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600',
    border: 'border-blue-200'
  },
  inspection_enabled: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    border: 'border-emerald-200'
  },
  warranty_enabled: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20'
  }
};


export function StageIndicator({ 
  currentStage, 
  showDescription = false,
  variant = 'badge'
}: StageIndicatorProps) {
  const Icon = stageIcons[currentStage];
  const colors = stageColors[currentStage];
  const config = STAGE_CONFIG[currentStage];

  if (variant === 'badge') {
    return (
      <div className="flex flex-col gap-1">
        <Badge 
          variant="outline" 
          className={cn(
            "px-4 py-2 font-black uppercase tracking-widest text-[10px] border shadow-sm rounded-xl transition-all hover:scale-105",
            colors.bg,
            colors.text,
            colors.border
          )}
        >
          <Icon className="h-3.5 w-3.5 mr-2" />
          {config.label}
        </Badge>
        {showDescription && (
          <p className="text-xs text-muted-foreground max-w-xs">
            {config.description}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        colors.bg,
        colors.text
      )}>
        <Icon className="h-3 w-3" />
        {config.label}
      </div>
    );
  }

  // Steps variant
  const stages: ClientStage[] = ['lead', 'registered', 'inspection_enabled', 'warranty_enabled'];
  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, index) => {
        const StageIcon = stageIcons[stage];
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const stageConfig = STAGE_CONFIG[stage];

        return (
          <div key={stage} className="flex items-center">
            <div 
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                isCompleted && "bg-status-complete/10 text-status-complete",
                isCurrent && cn(stageColors[stage].bg, stageColors[stage].text),
                !isCompleted && !isCurrent && "bg-muted/50 text-muted-foreground"
              )}
            >
              <StageIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{stageConfig.label}</span>
            </div>
            {index < stages.length - 1 && (
              <ChevronRight className={cn(
                "h-4 w-4 mx-1",
                isCompleted ? "text-green-600" : "text-muted-foreground/50"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
