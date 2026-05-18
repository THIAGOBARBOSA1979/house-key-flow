import { supabase } from '@/lib/supabase';
import { SupabaseResponse } from './types';
import { SupabaseErrorHandler } from './error-handler';

export class SupabaseStorage {
  static async uploadFile(
    bucket: string,
    path: string,
    file: File | Blob,
    options?: { upsert?: boolean; cacheControl?: string }
  ): Promise<SupabaseResponse<{ path: string }>> {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: options?.upsert || false,
      cacheControl: options?.cacheControl || '3600',
    });

    if (error) {
      return { data: null, error: SupabaseErrorHandler.handle(error) };
    }

    return { data: { path: data.path }, error: null };
  }

  static async getPublicUrl(bucket: string, path: string): Promise<string> {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  static async downloadFile(bucket: string, path: string): Promise<SupabaseResponse<Blob>> {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error) {
      return { data: null, error: SupabaseErrorHandler.handle(error) };
    }
    return { data, error: null };
  }

  static async deleteFile(bucket: string, path: string): Promise<SupabaseResponse<void>> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      return { data: null, error: SupabaseErrorHandler.handle(error) };
    }
    return { data: null, error: null };
  }
}
