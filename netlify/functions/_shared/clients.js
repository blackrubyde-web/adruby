// netlify/functions/_shared/clients.js

import { createClient } from '@supabase/supabase-js';
let StripeLib = null;
let stripeInstance = null;
try {
  // require Stripe only when a key is present to avoid runtime errors in test/dev without secrets
  if (process.env.STRIPE_SECRET_KEY) {
    // dynamic import to avoid bundling/initializing when key is absent
    // eslint-disable-next-line global-require
    StripeLib = require('stripe');
    stripeInstance = new StripeLib(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  } else {
    console.error('[Init] STRIPE_SECRET_KEY is missing');
  }
} catch (e) {
  console.error('[Init] Stripe init failed:', e?.message || e);
}

export const stripe = stripeInstance;

// --- Supabase Admin (Service Role) ---
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[Init] Supabase env missing', {
    hasUrl: !!process.env.SUPABASE_URL,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });
}

let supabaseAdmin = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
} else {
  console.error('[Init] Supabase env missing', {
    hasUrl: !!process.env.SUPABASE_URL,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
  // lightweight stub to avoid runtime errors in tests/dev when not configured
  supabaseAdmin = {
    from: (table) => ({
      insert: async (rows) => ({ error: 'supabase not configured' }),
      select: () => ({ eq: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }) }),
    }),
  };
}

export { supabaseAdmin };

// Keep compatibility with AdRuby schema: subscription + billing state lives on user_profiles
export const SUBSCRIPTION_TABLE = 'user_profiles';

