const { getSupabaseClient } = require('./_shared/supabaseClient');

exports.handler = async (event, context) => {
  console.log('[FacebookGetConnection] Incoming request:', {
    method: event.httpMethod,
    query: event.queryStringParameters,
  });

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const userId = event.queryStringParameters?.userId;
  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing userId' }),
    };
  }

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    console.error('[FacebookGetConnection] Supabase init failed:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Supabase init failed', details: String(err) }),
    };
  }

  try {
    const { data, error } = await supabase
      .from('facebook_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'facebook')
      .maybeSingle();

    if (error) {
      console.error('[FacebookGetConnection] Query error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to load connection', details: error.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, connection: data }),
    };
  } catch (err) {
    console.error('[FacebookGetConnection] Unexpected error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unexpected error', details: String(err) }),
    };
  }
};
