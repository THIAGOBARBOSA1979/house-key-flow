
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SYNC_ERROR = 'SYNC_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppErrorOptions {
  code?: ErrorCode;
  message: string;
  originalError?: any;
  context?: string;
  retryable?: boolean;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly originalError?: any;
  public readonly context?: string;
  public readonly retryable: boolean;
  public readonly timestamp: Date;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code || ErrorCode.UNKNOWN_ERROR;
    this.originalError = options.originalError;
    this.context = options.context;
    this.retryable = options.retryable ?? false;
    this.timestamp = new Date();

    // Maintain proper stack trace in supporting environments
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, AppError);
    }

  }

  static fromError(error: any, context?: string): AppError {
    if (error instanceof AppError) return error;

    let code = ErrorCode.UNKNOWN_ERROR;
    let message = error?.message || 'Ocorreu um erro inesperado.';
    let retryable = false;

    // Supabase / Postgrest errors
    if (error?.code) {
      code = ErrorCode.DATABASE_ERROR;
      // Common Postgres error codes
      if (error.code === '42P01') message = 'Tabela não encontrada no banco de dados.';
      if (error.code === '23505') message = 'Este registro já existe (duplicado).';
      if (error.code === 'PGRST116') code = ErrorCode.NOT_FOUND;
    }

    // Network errors
    if (error?.name === 'TypeError' && message.includes('fetch')) {
      code = ErrorCode.NETWORK_ERROR;
      message = 'Falha na conexão com o servidor. Verifique sua internet.';
      retryable = true;
    }

    if (error?.name === 'AbortError') {
      code = ErrorCode.TIMEOUT;
      message = 'A requisição demorou demais e foi cancelada.';
      retryable = true;
    }

    return new AppError({
      code,
      message,
      originalError: error,
      context,
      retryable
    });
  }
}
