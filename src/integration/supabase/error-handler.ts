import { SupabaseError } from './types';

export class SupabaseErrorHandler {
  static handle(error: any): SupabaseError {
    console.error('[Supabase Integration Error]:', error);

    if (error?.message) {
      return {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        details: error.details || '',
        hint: error.hint || '',
        status: error.status || 500,
      };
    }

    return {
      message: 'An unexpected error occurred',
      code: 'UNEXPECTED_ERROR',
      status: 500,
    };
  }

  static wrap<T>(promise: Promise<{ data: T | null; error: any }>): Promise<{ data: T | null; error: SupabaseError | null }> {
    return promise.then(({ data, error }) => {
      if (error) {
        return { data: null, error: this.handle(error) };
      }
      return { data, error: null };
    });
  }
}
