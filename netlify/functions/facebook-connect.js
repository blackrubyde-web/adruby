const { getSupabaseClient } = require('./_shared/supabaseClient');

exports.handler = async (event, context) => {
  console.log('[FacebookConnection] CONNECT', { body: event.body });

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const supabase = getSupabaseClient();
    const payload = JSON.parse(event.body || '{}');

    const {
      userId,
      facebookId,
      accessToken,
      profilePicture,
      fullName,
    } = payload;

    if (!userId || !facebookId || !accessToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Deactivate previous connections
    await supabase
      .from('meta_facebook_connections')
      .update({ is_active: false })
      .eq('user_id', userId);

    const { data, error } = await supabase
      .from('meta_facebook_connections')
      .insert({
        user_id: userId,
        facebook_id: facebookId,
        access_token: accessToken,
        profile_picture: profilePicture || null,
        full_name: fullName || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('[FacebookConnection] insert error', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to store connection' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('[FacebookConnection] exception', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || String(err) }),
    };
  }
};
