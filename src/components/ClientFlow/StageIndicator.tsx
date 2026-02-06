
import { Badge } from "@/components/ui/badge";
import { ClientStage, STAGE_CONFIG } from "@/types/clientFlow";
import { cn } from "@/lib/utils";
import { 
  UserCheck, 
  ClipboardCheck, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";

interface StageIndicatorProps {
  currentStage: ClientStage;
  showDescription?: boolean;
  variant?: 'badge' | 'steps' | 'compact';
}

const stageIcons: Record<ClientStage, typeof UserCheck> = {
  registered: UserCheck,
  inspection_enabled: ClipboardCheck,
  warranty_enabled: ShieldCheck
};

const stageColors: Record<ClientStage, { bg: string; text: string; border: string }> = {
  registered: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300'
  },
  inspection_enabled: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300'
  },
  warranty_enabled: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300'
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
            "px-3 py-1.5 font-medium border",
            colors.bg,
            colors.text,
            colors.border
          )}
        >
          <Icon className="h-4 w-4 mr-1.5" />
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
  const stages: ClientStage[] = ['registered', 'inspection_enabled', 'warranty_enabled'];
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
                isCompleted && "bg-green-100 text-green-800",
                isCurrent && cn(stageColors[stage].bg, stageColors[stage].text),
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
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
