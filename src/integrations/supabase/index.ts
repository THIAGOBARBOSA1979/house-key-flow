import { supabase } from './client';
import { Database } from './types';
import { User, Session, AuthChangeEvent, AuthResponse } from '@supabase/supabase-js';

export type SupabaseResponse<T> = {
  data: T | null;
  error: SupabaseError | null;
};

export type SupabaseError = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
};

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface FilterParams {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'is' | 'in';
  value: any;
}

export interface UploadOptions {
  bucket: string;
  path: string;
  file: File | Blob;
  maxSizeInBytes?: number;
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
  upsert?: boolean;
}

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

export class SupabaseAuth {
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  static async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  static onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  }

  static async signOut(): Promise<SupabaseResponse<void>> {
    const result = await supabase.auth.signOut();
    return SupabaseErrorHandler.wrap(Promise.resolve({ data: null, error: result.error }));
  }

  static async signInWithPassword(email: string, password: string): Promise<SupabaseResponse<AuthResponse['data']>> {
    const result = await supabase.auth.signInWithPassword({ email, password });
    return SupabaseErrorHandler.wrap(Promise.resolve(result));
  }

  static async signUp(email: string, password: string, options?: any): Promise<SupabaseResponse<AuthResponse['data']>> {
    const result = await supabase.auth.signUp({ email, password, options });
    return SupabaseErrorHandler.wrap(Promise.resolve(result));
  }
}

export class SupabaseDatabase {
  static async findMany<T>(
    table: string,
    params?: {
      filters?: FilterParams[];
      pagination?: PaginationParams;
      select?: string;
    }
  ): Promise<SupabaseResponse<T[]>> {
    let query = supabase.from(table as any).select(params?.select || '*');

    if (params?.filters) {
      params.filters.forEach(filter => {
        const op = filter.operator as any;
        if (typeof (query as any)[op] === 'function') {
          query = (query as any)[op](filter.column, filter.value);
        }
      });
    }

    if (params?.pagination) {
      const { page = 1, pageSize = 10, orderBy, orderDirection = 'asc' } = params.pagination;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query.range(from, to);
      if (orderBy) {
        query = query.order(orderBy as any, { ascending: orderDirection === 'asc' });
      }
    }

    const result = await query;
    return SupabaseErrorHandler.wrap(Promise.resolve(result as any));
  }

  static async findOne<T>(
    table: string, 
    id: string, 
    idColumn: string = 'id'
  ): Promise<SupabaseResponse<T>> {
    const result = await supabase.from(table as any).select('*').eq(idColumn as any, id).single();
    return SupabaseErrorHandler.wrap(Promise.resolve(result as any));
  }

  static async create<T>(
    table: string, 
    data: any
  ): Promise<SupabaseResponse<T>> {
    const result = await supabase.from(table as any).insert(data).select().single();
    return SupabaseErrorHandler.wrap(Promise.resolve(result as any));
  }

  static async update<T>(
    table: string, 
    id: string, 
    data: any, 
    idColumn: string = 'id'
  ): Promise<SupabaseResponse<T>> {
    const result = await supabase.from(table as any).update(data).eq(idColumn as any, id).select().single();
    return SupabaseErrorHandler.wrap(Promise.resolve(result as any));
  }

  static async delete(
    table: string, 
    id: string, 
    idColumn: string = 'id'
  ): Promise<SupabaseResponse<void>> {
    const result = await supabase.from(table as any).delete().eq(idColumn as any, id);
    return SupabaseErrorHandler.wrap(Promise.resolve({ data: null, error: result.error }));
  }

  static async rpc<T>(name: string, params?: any): Promise<SupabaseResponse<T>> {
    const result = await supabase.rpc(name as any, params);
    return SupabaseErrorHandler.wrap(Promise.resolve(result as any));
  }
  
  static async count(table: string, filters?: FilterParams[]): Promise<SupabaseResponse<number>> {
    let query = supabase.from(table as any).select('*', { count: 'exact', head: true });

    if (filters) {
      filters.forEach(filter => {
        const op = filter.operator as any;
        if (typeof (query as any)[op] === 'function') {
          query = (query as any)[op](filter.column, filter.value);
        }
      });
    }

    const { count, error } = await query;
    return { data: count || 0, error: error ? SupabaseErrorHandler.handle(error) : null };
  }
}

export class SupabaseStorage {
  private static async validatePath(path: string): Promise<boolean> {
    const user = await SupabaseAuth.getCurrentUser();
    if (!user) return false;

    const companyId = user.user_metadata?.company_id;
    const isSuperAdmin = user.user_metadata?.role === 'super_admin';

    if (isSuperAdmin) return true;
    if (!companyId) return false;

    return path.startsWith(`${companyId}/`);
  }

  static async uploadFile(options: UploadOptions): Promise<SupabaseResponse<{ path: string }>> {
    const { bucket, path, file, maxSizeInBytes, allowedTypes, onProgress, upsert = false } = options;

    if (!(await this.validatePath(path))) {
      return {
        data: null,
        error: SupabaseErrorHandler.handle({
          message: 'Acesso negado: Isolamento de tenant violado no Storage.',
          code: 'TENANT_VIOLATION',
          status: 403
        })
      };
    }

    if (maxSizeInBytes && file.size > maxSizeInBytes) {
      return {
        data: null,
        error: SupabaseErrorHandler.handle({
          message: `O arquivo excede o limite de ${Math.round(maxSizeInBytes / 1024 / 1024)}MB.`,
          code: 'FILE_TOO_LARGE',
          status: 400
        })
      };
    }

    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return {
        data: null,
        error: SupabaseErrorHandler.handle({
          message: 'Tipo de arquivo não permitido.',
          code: 'INVALID_FILE_TYPE',
          status: 400
        })
      };
    }

    try {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert,
        cacheControl: '3600',
      });

      if (error) throw error;
      if (onProgress) onProgress(100);
      return { data: { path: (data as any).path }, error: null };
    } catch (error: any) {
      return { data: null, error: SupabaseErrorHandler.handle(error) };
    }
  }

  static async getPublicUrl(bucket: string, path: string): Promise<string> {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  static async downloadFile(bucket: string, path: string): Promise<SupabaseResponse<Blob>> {
    if (!(await this.validatePath(path))) {
      return {
        data: null,
        error: SupabaseErrorHandler.handle({ message: 'Acesso negado ao arquivo.', code: 'TENANT_VIOLATION', status: 403 })
      };
    }

    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error) return { data: null, error: SupabaseErrorHandler.handle(error) };
    return { data, error: null };
  }

  static async deleteFile(bucket: string, path: string): Promise<SupabaseResponse<void>> {
    if (!(await this.validatePath(path))) {
      return {
        data: null,
        error: SupabaseErrorHandler.handle({ message: 'Acesso negado para exclusão.', code: 'TENANT_VIOLATION', status: 403 })
      };
    }

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) return { data: null, error: SupabaseErrorHandler.handle(error) };
    return { data: null, error: null };
  }
}

export class SupabaseRealtime {
  static subscribeToTable(table: string, callback: (payload: any) => void) {
    return supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  }
}

export const Supabase = {
  auth: SupabaseAuth,
  db: SupabaseDatabase,
  storage: SupabaseStorage,
  realtime: SupabaseRealtime,
  error: SupabaseErrorHandler,
};

export default Supabase;
