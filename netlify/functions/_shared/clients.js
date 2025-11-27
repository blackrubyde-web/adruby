// netlify/functions/_shared/clients.js

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Stripe (Server)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Supabase Admin (Service Role)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

// WICHTIG: Hier gibst du an, in welche Tabelle der Webhook schreibt.
// Diese Tabelle MUSS in Supabase existieren.
export const SUBSCRIPTION_TABLE = 'user_profiles';
