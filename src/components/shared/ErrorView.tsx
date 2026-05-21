import React from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorCode } from "@/utils/errors/AppError";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface ErrorViewProps {
  code?: ErrorCode;
  title?: string;
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
  className?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ 
  code, 
  title,
  message, 
  onRetry, 
  fullScreen = false,
  className
}) => {
  const { t } = useTranslation();

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500",
      className
    )}>
      <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-3xl flex items-center justify-center mb-2 shadow-lg shadow-destructive/5 animate-pulse">
        <AlertCircle size={40} />
      </div>
      
      <div className="space-y-3 max-w-sm">
        <h3 className="text-xs font-black tracking-widest text-destructive/60 uppercase">
          {title || t('common.error_protocol', 'Protocolo de Instabilidade')} {code && `[${code}]`}
        </h3>
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          {t('common.error_title', 'Sincronização Interrompida')}
        </h2>
        <p className="text-muted-foreground font-medium leading-relaxed">
          {message || t('common.error_description', 'Detectamos uma instabilidade no protocolo de carregamento. Verifique sua conexão estratégica e tente novamente.')}
        </p>
      </div>

      <div className="flex flex-col w-full gap-3 max-w-[280px]">
        {onRetry && (
          <Button 
            onClick={onRetry} 
            variant="default"
            className="h-12 w-full rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
          >
            <RefreshCcw className="w-4 h-4" />
            {t('common.retry', 'Reiniciar Protocolo')}
          </Button>
        )}
        
        <Button 
          onClick={handleGoHome} 
          variant="outline"
          className="h-12 w-full rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2 border-border/40 hover:bg-muted active:scale-95 transition-all"
        >
          <Home className="w-4 h-4" />
          {t('common.home', 'Retornar ao Início')}
        </Button>
      </div>

      {code && (
        <div className="pt-4 opacity-30">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em]">Diagnostic Code: {code}</p>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[500px] w-full flex items-center justify-center bg-background/40 backdrop-blur-xl rounded-[2.5rem] border border-border/10 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-destructive/5 to-transparent pointer-events-none" />
        {content}
      </div>
    );
  }

  return content;
};
