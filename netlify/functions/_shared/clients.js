import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Stripe client (server-side only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Supabase service role client for backend mutations
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

export const SUBSCRIPTION_TABLE = 'user_profiles'; // adjust here if profile table differs
