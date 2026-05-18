import { SupabaseError } from './types';

export class SupabaseErrorHandler {
  private static errorMap: Record<string, string> = {
    '23505': 'Já existe um registro com estes dados.',
    '23503': 'Este registro não pode ser removido pois está em uso.',
    '42501': 'Você não tem permissão para realizar esta ação.',
    'auth/invalid-email': 'E-mail inválido.',
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/email-already-in-use': 'Este e-mail já está sendo utilizado.',
    'PGRST116': 'Nenhum resultado encontrado.',
  };

  static handle(error: any): SupabaseError {
    console.error('[Supabase Integration Error]:', error);

    const code = error?.code || error?.status?.toString() || 'UNKNOWN_ERROR';
    const message = this.errorMap[code] || error?.message || 'Ocorreu um erro inesperado. Tente novamente.';

    return {
      message,
      code,
      details: error.details || '',
      hint: error.hint || '',
      status: error.status || 500,
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
