const { getSupabaseClient } = require('./_shared/supabaseClient');

exports.handler = async (event, context) => {
  console.log('[FacebookConnect] Incoming request:', {
    method: event.httpMethod,
    body: event.body,
  });

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  let supabase;
  try {
    supabase = getSupabaseClient();
  } catch (err) {
    console.error('[FacebookConnect] Supabase init failed:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Supabase init failed', details: String(err) }),
    };
  }

  try {
    const { userId, adAccountId, pageId, meta } = JSON.parse(event.body || '{}');

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId' }),
      };
    }

    const { data, error } = await supabase
      .from('facebook_connections')
      .upsert(
        {
          user_id: userId,
          provider: 'facebook',
          ad_account_id: adAccountId || null,
          page_id: pageId || null,
          is_active: true,
          meta: meta || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('[FacebookConnect] Upsert error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save facebook connection', details: error.message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, connection: data }),
    };
  } catch (err) {
    console.error('[FacebookConnect] Unexpected error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unexpected error', details: String(err) }),
    };
  }
};
