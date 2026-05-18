import { supabase } from '@/lib/supabase';
import { SupabaseResponse } from './types';
import { SupabaseErrorHandler } from './error-handler';
import { User, Session, AuthChangeEvent, AuthResponse } from '@supabase/supabase-js';

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

  // Simplified sign in for the abstraction
  static async signInWithPassword(email: string, password: string): Promise<SupabaseResponse<AuthResponse['data']>> {
    const result = await supabase.auth.signInWithPassword({ email, password });
    return SupabaseErrorHandler.wrap(Promise.resolve(result));
  }

  static async signUp(email: string, password: string, options?: any): Promise<SupabaseResponse<AuthResponse['data']>> {
    const result = await supabase.auth.signUp({ email, password, options });
    return SupabaseErrorHandler.wrap(Promise.resolve(result));
  }
}
