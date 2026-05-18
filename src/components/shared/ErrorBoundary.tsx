import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = import.meta.env.MODE === 'development';

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
          <Card className="w-full max-w-lg border-none shadow-sem-xl rounded-[2.5rem] overflow-hidden bg-card/80 backdrop-blur-xl animate-in zoom-in-95 duration-500">
            <CardHeader className="text-center pt-10">
              <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tight text-foreground">
                Algo não correu bem
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-10 pb-6">
              <p className="text-muted-foreground font-bold leading-relaxed">
                Ocorreu um erro inesperado na aplicação. Nossa equipe técnica já foi notificada.
              </p>
              
              {isDev && this.state.error && (
                <div className="mt-6 p-4 bg-muted rounded-2xl text-left overflow-auto max-h-40">
                  <p className="text-xs font-mono font-bold text-destructive mb-2 uppercase tracking-widest">Debug Info (Dev Only):</p>
                  <code className="text-[10px] font-mono leading-tight block">
                    {this.state.error.toString()}
                  </code>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4 px-10 pb-10">
              <Button 
                onClick={this.handleReset}
                variant="default"
                className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2 shadow-lg shadow-primary/20"
              >
                <RotateCcw className="w-4 h-4" />
                Recarregar Sistema
              </Button>
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2 border-border/40"
              >
                <Home className="w-4 h-4" />
                Voltar ao Início
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
