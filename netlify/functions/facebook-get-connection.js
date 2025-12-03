const { getSupabaseClient } = require('./_shared/supabaseClient');

exports.handler = async (event, context) => {
  console.log('[FacebookConnection] GET connection');

  try {
    const supabase = getSupabaseClient();

    // Simplified user resolution (can be replaced with Netlify Identity / Supabase auth)
    const userId = event.headers['x-user-id'];

    if (!userId) {
      return {
        statusCode: 200,
        body: JSON.stringify({ connection: null }),
      };
    }

    const { data, error } = await supabase
      .from('meta_facebook_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('[FacebookConnection] select error', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'DB error loading connection' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data || null),
    };
  } catch (err) {
    console.error('[FacebookConnection] exception', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || String(err) }),
    };
  }
};
