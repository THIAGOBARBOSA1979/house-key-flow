
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
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
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <AlertTriangle size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground">Ops! Algo deu errado</h1>
              <p className="text-muted-foreground font-medium">
                Ocorreu um erro inesperado no sistema. Nossa equipe técnica já foi notificada.
              </p>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-2xl text-left border border-border/50">
               <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Detalhes técnicos:</p>
               <p className="text-xs font-mono text-red-500 break-all">{this.state.error?.message || "Erro desconhecido"}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full h-12 font-black uppercase tracking-widest text-[11px] rounded-xl"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recarregar Aplicação
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'} 
                className="w-full h-12 font-bold rounded-xl"
              >
                <Home className="mr-2 h-4 w-4" />
                Voltar para o Início
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
