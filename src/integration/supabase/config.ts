/**
 * Configuration manager for Supabase integration.
 * Handles environment variables and client initialization.
 */
export const SupabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  environment: import.meta.env.MODE || 'development',
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  
  // Storage settings
  storage: {
    maxFileSize: 10 * 1024 * 1024, // 10MB default
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedDocTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  }
};

if (!SupabaseConfig.url || !SupabaseConfig.anonKey) {
  console.warn('[Supabase] Missing environment variables. Integration may not work correctly.');
}
