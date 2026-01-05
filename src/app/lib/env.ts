export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  frontendUrl: import.meta.env.VITE_FRONTEND_URL,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  googleRedirectUrl: import.meta.env.VITE_GOOGLE_REDIRECT_URL,
  demoMode: import.meta.env.VITE_DEMO_MODE === 'true'
};
