
import { AppError, ErrorCode } from './AppError';
import { toast } from '@/components/ui/use-toast';

export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Centralized error handling for the entire application
   */
  public handle(error: any, context?: string): AppError {
    const appError = AppError.fromError(error, context);
    
    // Log structured error for technical tracking
    this.logError(appError);

    // Provide user feedback
    this.notifyUser(appError);

    return appError;
  }

  private logError(error: AppError) {
    const logData = {
      timestamp: error.timestamp.toISOString(),
      code: error.code,
      message: error.message,
      context: error.context,
      stack: error.stack,
      originalError: error.originalError,
    };

    // Technical structured logging
    console.group(`%c[AppError] ${error.code}`, 'color: #ff4d4f; font-weight: bold;');
    console.log(`Context: ${error.context || 'unknown'}`);
    console.log(`Message: ${error.message}`);
    console.table(logData);
    if (error.originalError) {
      console.log('Original Error:', error.originalError);
    }
    console.groupEnd();

    // In a real production environment, we would send this to Sentry, LogRocket, etc.
  }

  private notifyUser(error: AppError) {
    // Only notify if it's not a background/silent error
    // Some errors might be handled locally by components

    const title = this.getErrorTitle(error.code);
    
    toast({
      title,
      description: error.message,
      variant: error.code === ErrorCode.VALIDATION_ERROR ? "default" : "destructive",
    });
  }

  private getErrorTitle(code: ErrorCode): string {
    switch (code) {
      case ErrorCode.UNAUTHORIZED: return "Não Autenticado";
      case ErrorCode.FORBIDDEN: return "Acesso Negado";
      case ErrorCode.NOT_FOUND: return "Não Encontrado";
      case ErrorCode.VALIDATION_ERROR: return "Aviso de Validação";
      case ErrorCode.NETWORK_ERROR: return "Erro de Conexão";
      case ErrorCode.TIMEOUT: return "Tempo Esgotado";
      case ErrorCode.DATABASE_ERROR: return "Erro de Dados";
      case ErrorCode.SYNC_ERROR: return "Erro de Sincronização";
      default: return "Erro do Sistema";
    }
  }
}

export const errorHandler = ErrorHandler.getInstance();
