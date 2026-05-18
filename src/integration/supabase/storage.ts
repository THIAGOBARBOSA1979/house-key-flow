import { supabase } from '@/lib/supabase';
import { SupabaseResponse, UploadOptions } from './types';
import { SupabaseErrorHandler } from './error-handler';
import { SupabaseAuth } from './auth';

export class SupabaseStorage {
  private static async validatePath(path: string): Promise<boolean> {
    const user = await SupabaseAuth.getCurrentUser();
    if (!user) return false;

    const companyId = user.user_metadata?.company_id;
    const isSuperAdmin = user.user_metadata?.role === 'super_admin';

    if (isSuperAdmin) return true;
    if (!companyId) return false;

    // Ensure the path starts with company_id/ to enforce tenant isolation in storage
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

    // Client-side validations
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

    // Retries logic
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
          upsert,
          cacheControl: '3600',
        });

        if (error) {
          if (attempts + 1 === maxAttempts) throw error;
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          continue;
        }

        if (onProgress) onProgress(100); // Simple progress simulation for small files/native API
        return { data: { path: data.path }, error: null };
      } catch (error: any) {
        if (attempts + 1 === maxAttempts) {
          return { data: null, error: SupabaseErrorHandler.handle(error) };
        }
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    return { data: null, error: SupabaseErrorHandler.handle({ message: 'Falha no upload após várias tentativas.' }) };
  }

  static async getPublicUrl(bucket: string, path: string): Promise<string> {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  static async downloadFile(bucket: string, path: string): Promise<SupabaseResponse<Blob>> {
    if (!(await this.validatePath(path))) {
      return {
        data: null,
        error: SupabaseErrorHandler.handle({
          message: 'Acesso negado ao arquivo.',
          code: 'TENANT_VIOLATION',
          status: 403
        })
      };
    }

    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error) {
      return { data: null, error: SupabaseErrorHandler.handle(error) };
    }
    return { data, error: null };
  }

  static async deleteFile(bucket: string, path: string): Promise<SupabaseResponse<void>> {
    if (!(await this.validatePath(path))) {
      return {
        data: null,
        error: SupabaseErrorHandler.handle({
          message: 'Acesso negado para exclusão.',
          code: 'TENANT_VIOLATION',
          status: 403
        })
      };
    }

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      return { data: null, error: SupabaseErrorHandler.handle(error) };
    }
    return { data: null, error: null };
  }
}
