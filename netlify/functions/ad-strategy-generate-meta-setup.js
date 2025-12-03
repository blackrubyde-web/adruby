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

    // 1) Passende Strategie für diesen adVariant holen
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
      console.error('[MetaAdsSetup] Supabase error (strategy):', strategyError);
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

    // 2) Prüfen, ob es bereits ein Meta Setup für diese Strategie gibt
    const { data: existingSetup, error: setupError } = await supabase
      .from('ad_meta_setup')
      .select('*')
      .eq('ad_strategy_id', strategyRow.id)
      .maybeSingle();

    if (setupError && setupError.code !== 'PGRST116') {
      console.error('[MetaAdsSetup] Supabase error (meta_setup):', setupError);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to load Meta Ads setup',
          details: setupError.message || setupError,
        }),
      };
    }

    if (!existingSetup) {
      console.warn('[MetaAdsSetup] No Meta Ads setup found for strategy – you may want to trigger AI generation separately.', {
        ad_strategy_id: strategyRow.id,
      });

      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Noch kein Meta Ads Setup für diese Strategie vorhanden.',
          ad_strategy_id: strategyRow.id,
        }),
      };
    }

    console.log('[MetaAdsSetup] Returning existing Meta Ads setup:', {
      id: existingSetup.id,
      ad_strategy_id: existingSetup.ad_strategy_id,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ setup: existingSetup }),
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
