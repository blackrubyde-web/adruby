// netlify/functions/_shared/clients.js

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// --- Stripe (Server) ---
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('[Init] STRIPE_SECRET_KEY is missing');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// --- Supabase Admin (Service Role) ---
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[Init] Supabase env missing', {
    hasUrl: !!process.env.SUPABASE_URL,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });
}

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

// Hier definierst du die Tabelle, in die Webhook & Checkout schreiben
export const SUBSCRIPTION_TABLE = 'user_profiles';
