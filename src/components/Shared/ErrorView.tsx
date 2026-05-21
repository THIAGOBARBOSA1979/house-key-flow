
import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorCode } from '@/utils/errors/AppError';

interface ErrorViewProps {
  code?: ErrorCode;
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ 
  code, 
  message, 
  onRetry, 
  fullScreen = false 
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
      <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-2">
        <AlertCircle size={32} />
      </div>
      <div className="space-y-2 max-w-sm">
        <h3 className="text-lg font-black tracking-tight text-foreground uppercase tracking-widest text-xs opacity-50">
          {code || 'Erro de Sistema'}
        </h3>
        <p className="text-muted-foreground font-medium leading-relaxed">
          {message || 'Ocorreu um erro ao carregar as informações. Por favor, tente novamente.'}
        </p>
      </div>
      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="outline"
          className="h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2 border-border/50 hover:bg-muted"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Tentar Novamente
        </h3>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[400px] w-full flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-3xl border border-border/50">
        {content}
      </div>
    );
  }

  return content;
};
