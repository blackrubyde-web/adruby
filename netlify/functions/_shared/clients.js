// netlify/functions/_shared/clients.js

import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';

let stripeInstance = null;
const require = createRequire(import.meta.url);
if (process.env.STRIPE_SECRET_KEY) {
  try {
    const mod = require('stripe');
    const Stripe = mod?.default ?? mod;
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  } catch (e) {
    console.error('[Init] Stripe import/init failed:', e?.message || e);
  }
} else {
  console.error('[Init] STRIPE_SECRET_KEY is missing');
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
