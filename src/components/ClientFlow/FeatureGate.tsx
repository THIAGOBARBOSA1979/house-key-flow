
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ClientStage, STAGE_CONFIG } from "@/types/clientFlow";
import { cn } from "@/lib/utils";

interface FeatureGateProps {
  children: ReactNode;
  isAllowed: boolean;
  requiredStage?: ClientStage;
  featureName?: string;
  message?: string;
  redirectTo?: string;
  redirectLabel?: string;
  variant?: 'block' | 'overlay' | 'inline';
}

export function FeatureGate({
  children,
  isAllowed,
  requiredStage,
  featureName = 'Esta funcionalidade',
  message,
  redirectTo,
  redirectLabel = 'Ver opções disponíveis',
  variant = 'block'
}: FeatureGateProps) {
  if (isAllowed) {
    return <>{children}</>;
  }

  const defaultMessage = requiredStage 
    ? `${featureName} será liberada quando você atingir a etapa "${STAGE_CONFIG[requiredStage].label}".`
    : `${featureName} não está disponível no momento.`;

  const displayMessage = message || defaultMessage;

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-muted-foreground p-2 bg-muted/50 rounded-md">
        <Lock className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm">{displayMessage}</span>
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className="relative">
        <div className="opacity-30 pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="text-center p-6 max-w-md">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Funcionalidade Bloqueada</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {displayMessage}
            </p>
            {redirectTo && (
              <Link to={redirectTo}>
                <Button variant="outline" size="sm">
                  {redirectLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Block variant (default)
  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardHeader className="text-center pt-8">
        <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mx-auto mb-4 shadow-sm border">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold">Funcionalidade Bloqueada</CardTitle>
        <CardDescription className="text-base font-medium max-w-sm mx-auto">
          {displayMessage}
        </CardDescription>
      </CardHeader>
      {(redirectTo || requiredStage) && (
        <CardContent className="text-center pb-8">
          {requiredStage && (
            <div className="inline-flex items-center gap-2 bg-background px-4 py-2 rounded-full border mb-6 text-sm">
              <span className="text-muted-foreground">Etapa necessária:</span>
              <span className="font-bold text-primary">{STAGE_CONFIG[requiredStage].label}</span>
            </div>
          )}
          {redirectTo && (
            <div>
              <Link to={redirectTo}>
                <Button className="font-bold">
                  {redirectLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// Utility component for disabled buttons
interface GatedButtonProps {
  children: ReactNode;
  isAllowed: boolean;
  tooltipMessage?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function GatedButton({
  children,
  isAllowed,
  tooltipMessage = 'Esta ação não está disponível no momento',
  onClick,
  className,
  variant = 'default',
  size = 'default'
}: GatedButtonProps) {
  if (isAllowed) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        onClick={onClick}
        className={className}
      >
        {children}
      </Button>
    );
  }

  return (
    <div className="relative group inline-block">
      <Button 
        variant={variant} 
        size={size} 
        disabled
        className={cn("cursor-not-allowed", className)}
      >
        <Lock className="h-4 w-4 mr-2" />
        {children}
      </Button>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border">
        {tooltipMessage}
      </div>
    </div>
  );
}
