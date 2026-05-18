import { supabase } from '@/lib/supabase';
import { SupabaseResponse } from './types';
import { SupabaseErrorHandler } from './error-handler';

export class SupabaseFunctions {
  static async invoke<T = any>(
    functionName: string,
    options?: {
      body?: any;
      headers?: Record<string, string>;
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    }
  ): Promise<SupabaseResponse<T>> {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: options?.body,
      headers: options?.headers,
      method: options?.method as any,
    });

    if (error) {
      return { data: null, error: SupabaseErrorHandler.handle(error) };
    }

    return { data, error: null };
  }
}
