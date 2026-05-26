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
  HardHat,
  CheckCircle2,
  Building2
} from "lucide-react";

interface StageIndicatorProps {
  currentStage: ClientStage;
  showDescription?: boolean;
  variant?: 'badge' | 'steps' | 'compact' | 'full';
  className?: string;
}

const stageIcons: Record<ClientStage, any> = {
  lead: Building2,
  registered: UserCheck,
  inspection_enabled: ClipboardCheck,
  warranty_enabled: ShieldCheck
};

const stageColors: Record<ClientStage, { bg: string; text: string; border: string; solid: string }> = {
  lead: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600',
    border: 'border-blue-200',
    solid: 'bg-blue-500'
  },
  registered: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    solid: 'bg-emerald-500'
  },
  inspection_enabled: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600',
    border: 'border-amber-200',
    solid: 'bg-amber-500'
  },
  warranty_enabled: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20',
    solid: 'bg-primary'
  }
};

export function StageIndicator({ 
  currentStage, 
  showDescription = false,
  variant = 'badge',
  className
}: StageIndicatorProps) {
  const Icon = stageIcons[currentStage] || Building2;
  const colors = stageColors[currentStage] || stageColors.lead;
  const config = STAGE_CONFIG[currentStage] || { label: 'Status', description: 'Em análise' };

  if (variant === 'badge') {
    return (
      <div className={cn("flex flex-col items-end gap-1", className)}>
        <Badge 
          className={cn(
            "px-4 py-1.5 font-black uppercase tracking-widest text-[10px] border-none shadow-lg shadow-black/5 rounded-xl transition-all hover:scale-105 flex items-center gap-2",
            colors.solid,
            "text-white"
          )}
        >
          <Icon className="h-3 w-3" strokeWidth={3} />
          {config.label}
        </Badge>
        {showDescription && (
          <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Etapa Atual da Jornada</span>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        colors.bg,
        colors.text,
        className
      )}>
        <Icon className="h-3 w-3" />
        {config.label}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn("p-6 rounded-[2rem] bg-white border border-border/10 shadow-xl flex items-center gap-6", className)}>
        <div className={cn("p-4 rounded-2xl text-white shadow-lg", colors.solid)}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-black tracking-tight leading-none text-foreground">{config.label}</h4>
          <p className="text-xs text-muted-foreground font-medium">{config.description}</p>
        </div>
      </div>
    );
  }

  // Steps variant
  const stages: ClientStage[] = ['lead', 'registered', 'inspection_enabled', 'warranty_enabled'];
  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className={cn("flex items-center gap-1", className)}>
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