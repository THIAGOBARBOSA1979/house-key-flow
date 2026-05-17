
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center">
          <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-center">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertCircle className="w-12 h-12 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-foreground">Algo deu errado</h1>
              <p className="text-muted-foreground font-medium">
                Ocorreu um erro inesperado ao processar esta página. Nossa equipe técnica já foi notificada.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="p-4 bg-muted rounded-xl text-left overflow-auto max-h-40 text-xs font-mono border border-border/50">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button 
                onClick={() => window.location.reload()} 
                className="rounded-xl h-12 px-6 font-bold gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Tentar Novamente
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'} 
                className="rounded-xl h-12 px-6 font-bold gap-2"
              >
                <Home className="w-4 h-4" /> Voltar ao Início
              </Button>
            </div>
            
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest pt-8 opacity-40">
              Sistema de Gestão A2 • ID de Erro: {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
