import { SupabaseAuth } from './auth';
import { SupabaseDatabase } from './database';
import { SupabaseStorage } from './storage';
import { SupabaseFunctions } from './functions';
import { SupabaseErrorHandler } from './error-handler';

export * from './types';

/**
 * Main abstraction layer for Supabase integration.
 * Decouples the application from the Supabase SDK and provides
 * a unified interface for Auth, Database, Storage, and Edge Functions.
 */
export const Supabase = {
  auth: SupabaseAuth,
  db: SupabaseDatabase,
  storage: SupabaseStorage,
  functions: SupabaseFunctions,
  error: SupabaseErrorHandler,
};

export default Supabase;
