const required = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ID',
  'FRONTEND_URL'
];

const optional = [
  'OPENAI_API_KEY',
  'META_APP_ID',
  'META_APP_SECRET',
  'META_ACCESS_TOKEN'
];

const isCi = process.env.CI === 'true' || process.env.NODE_ENV === 'production';

if (!isCi) {
  console.log('[validate-env] Skipping env validation (not CI/production).');
  process.exit(0);
}

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error('[validate-env] Missing required env vars:', missing);
  process.exit(1);
}

const optionalMissing = optional.filter((key) => !process.env[key]);
if (optionalMissing.length) {
  console.warn('[validate-env] Optional env vars missing:', optionalMissing);
}

console.log('[validate-env] Environment OK.');
