import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});
export const supabasePublic = supabase;

// Sicherheits-Helper (beibehalten für bestehende Aufrufe)
export const securityHelpers = {
  // Überprüft ob User Admin ist
  async isAdmin() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('role')
        ?.eq('id', user?.id)
        ?.single();

      if (error) return false;
      return data?.role === 'admin';
    } catch {
      return false;
    }
  },

  // GDPR-konforme User-Daten abrufen
  async getUserData() {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      ?.from('user_profiles')
      ?.select(`
        *,
        ad_campaigns(*),
        products(*),
        generated_ads(*),
        saved_ad_variants(*)
      `)
      ?.eq('id', user?.id)
      ?.single();

    if (error) throw error;
    return data;
  }
};

export default supabasePublic;
