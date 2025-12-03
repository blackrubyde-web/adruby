const { getSupabaseClient } = require('./_shared/supabaseClient');

exports.handler = async (event, context) => {
  console.log('[FacebookConnection] DISCONNECT', { body: event.body });

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const supabase = getSupabaseClient();
    const payload = JSON.parse(event.body || '{}');
    const userId = payload.userId;

    if (!userId) {
      console.error('[FacebookConnection] Missing userId in payload');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId' }),
      };
    }

    const { error } = await supabase
      .from('meta_facebook_connections')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (error) {
      console.error('[FacebookConnection] disconnect error', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to disconnect' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('[FacebookConnection] exception', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || String(err) }),
    };
  }
};
