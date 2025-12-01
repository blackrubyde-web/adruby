const { createClient } = require("@supabase/supabase-js");

let cachedClient = null;

function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("[Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    throw new Error("Supabase environment variables not set");
  }

  cachedClient = createClient(url, key, { auth: { persistSession: false } });
  return cachedClient;
}

module.exports = { getSupabaseClient };
