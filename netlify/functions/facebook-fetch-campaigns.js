const { getSupabaseClient } = require('./_shared/supabaseClient');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';

exports.handler = async (event, context) => {
  console.log('[FacebookFetchCampaigns] Incoming request', {
    method: event.httpMethod,
    body: event.body,
  });

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
      console.error('[FacebookFetchCampaigns] Missing userId in payload');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId' }),
      };
    }

    // 1) Aktive Facebook-Verbindung für diesen User holen
    const { data: connection, error: connError } = await supabase
      .from('meta_facebook_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (connError) {
      console.error('[FacebookFetchCampaigns] DB error', connError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'DB error loading connection' }),
      };
    }

    if (!connection) {
      console.warn('[FacebookFetchCampaigns] No active connection for user', userId);
      return {
        statusCode: 200,
        body: JSON.stringify([]),
      };
    }

    const accessToken = connection.access_token;
    if (!accessToken) {
      console.error('[FacebookFetchCampaigns] No access_token in connection');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No access token found for user connection' }),
      };
    }

    // 2) AdAccounts des Users auslesen
    const adAccountsUrl = `${GRAPH_API_BASE}/me/adaccounts?fields=id,account_id,name,account_status&access_token=${encodeURIComponent(
      accessToken
    )}`;

    console.log('[FacebookFetchCampaigns] Fetching ad accounts', { adAccountsUrl });

    const adAccRes = await fetch(adAccountsUrl);
    const adAccJson = await adAccRes.json();

    if (!adAccRes.ok) {
      console.error('[FacebookFetchCampaigns] AdAccounts API error', adAccJson);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to load ad accounts from Meta',
          details: adAccJson,
        }),
      };
    }

    const adAccounts = adAccJson.data || [];
    if (adAccounts.length === 0) {
      console.warn('[FacebookFetchCampaigns] User has no ad accounts');
      return {
        statusCode: 200,
        body: JSON.stringify([]),
      };
    }

    // Fürs MVP: Nimm den ersten aktiven Ad-Account
    const primaryAdAccount = adAccounts[0];
    const adAccountId = primaryAdAccount.id; // id ist i.d.R. "act_<ID>"

    // 3) Kampagnen-Insights der letzten 7 Tage auf Kampagnen-Level ziehen
    const insightsUrl = `${GRAPH_API_BASE}/${adAccountId}/insights?` +
      [
        'level=campaign',
        'time_range={"since":"' +
          getDateNDaysAgo(7) +
          '","until":"' +
          getDateNDaysAgo(0) +
          '"}',
        'fields=campaign_id,campaign_name,impressions,clicks,spend,ctr,cpm,frequency,actions,action_values',
        'limit=100',
      ].join('&') +
      `&access_token=${encodeURIComponent(accessToken)}`;

    console.log('[FacebookFetchCampaigns] Fetching campaign insights', {
      insightsUrl,
    });

    const insightsRes = await fetch(insightsUrl);
    const insightsJson = await insightsRes.json();

    if (!insightsRes.ok) {
      console.error('[FacebookFetchCampaigns] Insights API error', insightsJson);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to load campaign insights from Meta',
          details: insightsJson,
        }),
      };
    }

    const insights = insightsJson.data || [];

    // 4) Transformiere Insights in das Format, das dein Frontend erwartet
    const campaigns = insights.map((row) => {
      const impressions = Number(row.impressions || 0);
      const clicks = Number(row.clicks || 0);
      const spend = Number(row.spend || 0);
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
      const frequency = Number(row.frequency || 1.0);

      // ROAS-Hilfskonstruktion aus action_values, falls vorhanden (z.B. purchase)
      const actionValues = Array.isArray(row.action_values)
        ? row.action_values
        : [];
      const purchaseValueEntry = actionValues.find(
        (v) => v.action_type === 'purchase'
      );
      const purchaseValue = purchaseValueEntry
        ? Number(purchaseValueEntry.value || 0)
        : 0;
      const roas = spend > 0 ? purchaseValue / spend : 0;

      // Conversions approximieren aus actions (z.B. purchase)
      const actions = Array.isArray(row.actions) ? row.actions : [];
      const purchaseAction = actions.find(
        (a) => a.action_type === 'purchase'
      );
      const conversions = purchaseAction ? Number(purchaseAction.value || 0) : 0;

      return {
        id: row.campaign_id,
        name: row.campaign_name,
        status: 'active',
        spend,
        impressions,
        clicks,
        conversions,
        ctr: Number(ctr.toFixed(2)),
        cpm: Number(cpm.toFixed(2)),
        roas: Number(roas.toFixed(2)),
        frequency: Number(frequency.toFixed(2)),
        meta_ad_sets: [],
      };
    });

    // 5) Kampagnen in Supabase speichern (Sync)
    try {
      console.log('[FacebookFetchCampaigns] Syncing campaigns to Supabase… userId=', userId);

      // Optional: Alte Kampagnen dieses Users löschen (für einfachen Full-Refresh)
      const { error: deleteError } = await supabase
        .from('meta_campaigns')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('[FacebookFetchCampaigns] Failed to delete old campaigns', deleteError);
      }

      // Upsert neue Kampagnen
      const upsertPayload = campaigns.map((c) => ({
        id: c.id,
        user_id: userId,
        name: c.name,
        status: c.status,
        spend: c.spend,
        impressions: c.impressions,
        clicks: c.clicks,
        conversions: c.conversions,
        ctr: c.ctr,
        cpm: c.cpm,
        roas: c.roas,
        frequency: c.frequency,
        raw_payload: null,
      }));

      const insightsByCampaignId = {};
      (insights || []).forEach((row) => {
        insightsByCampaignId[row.campaign_id] = row;
      });

      upsertPayload.forEach((row) => {
        if (insightsByCampaignId[row.id]) {
          row.raw_payload = insightsByCampaignId[row.id];
        }
      });

      const { error: upsertError } = await supabase
        .from('meta_campaigns')
        .upsert(upsertPayload, { onConflict: 'id' });

      if (upsertError) {
        console.error('[FacebookFetchCampaigns] Failed to upsert campaigns', upsertError);
      } else {
        console.log('[FacebookFetchCampaigns] Successfully synced campaigns to Supabase:', upsertPayload.length);
      }
    } catch (syncError) {
      console.error('[FacebookFetchCampaigns] Exception while syncing campaigns to Supabase', syncError);
    }

    console.log('[FacebookFetchCampaigns] Returning campaigns count', campaigns.length);

    return {
      statusCode: 200,
      body: JSON.stringify(campaigns),
    };
  } catch (err) {
    console.error('[FacebookFetchCampaigns] exception', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message || String(err),
      }),
    };
  }
};

function getDateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
