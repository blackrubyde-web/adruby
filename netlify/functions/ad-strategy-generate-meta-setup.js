// netlify/functions/ad-strategy-generate-meta-setup.js

const { getSupabaseClient } = require('./_shared/supabaseClient');

exports.handler = async (event) => {
  console.log('[MetaAdsSetup] Incoming request:', {
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
    console.error('[MetaAdsSetup] Failed to init Supabase client:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Supabase client init failed' }),
    };
  }

  try {
    const { adVariantId } = JSON.parse(event.body || '{}');
    console.log('[MetaAdsSetup] Parsed payload:', { adVariantId });

    if (!adVariantId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing adVariantId' }),
      };
    }

    const { data: strategyRow, error: strategyError } = await supabase
      .from('ad_strategies')
      .select('*')
      .eq('ad_variant_id', adVariantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('[MetaAdsSetup] Loaded strategyRow:', {
      found: !!strategyRow,
      ad_variant_id: strategyRow?.ad_variant_id,
      user_id: strategyRow?.user_id,
      error: strategyError || null,
    });

    if (strategyError) {
      console.error('[MetaAdsSetup] Supabase error:', strategyError);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to load strategy for Meta Ads setup',
          details: strategyError.message || strategyError,
        }),
      };
    }

    if (!strategyRow) {
      console.error('[MetaAdsSetup] No strategy found for this adVariantId');
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Keine Strategie für diese Anzeige gefunden',
        }),
      };
    }

    // Placeholder: return the strategy row as setup source. Extend with real generation if needed.
    return {
      statusCode: 200,
      body: JSON.stringify({ setup: strategyRow }),
    };
  } catch (err) {
    console.error('[MetaAdsSetup] Handler error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Unexpected Meta Ads setup error',
        details: err.message || String(err),
      }),
    };
  }
};
