// netlify/functions/_shared/apifyClient.js (ESM)
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_FACEBOOK_ADS_ACTOR_ID = process.env.APIFY_FACEBOOK_ADS_ACTOR_ID;

function normalizeActorId(id) {
  if (!id) return id;
  if (id.includes('/')) {
    return id.replace('/', '~');
  }
  return id;
}

export async function runAdResearchActor(params = {}) {
  if (!APIFY_API_TOKEN) {
    console.error('[ApifyClient] Missing APIFY_API_TOKEN');
    throw new Error('APIFY_API_TOKEN is not set in environment');
  }

  if (!APIFY_FACEBOOK_ADS_ACTOR_ID) {
    console.error('[ApifyClient] Missing APIFY_FACEBOOK_ADS_ACTOR_ID');
    throw new Error('APIFY_FACEBOOK_ADS_ACTOR_ID is not set in environment');
  }

  const { searchUrl, maxAds } = params;

  console.log('[ApifyClient] Incoming params for runAdResearchActor', {
    searchUrl,
    maxAds,
    typeOfSearchUrl: typeof searchUrl,
  });

  if (!searchUrl) {
    console.error('[ApifyClient] searchUrl fehlt – ohne Facebook Ad Library URL kann der Actor nicht laufen.', { searchUrl });
    throw new Error('searchUrl fehlt – ohne Facebook Ad Library URL kann der Actor nicht laufen.');
  }

  let finalUrl;
  try {
    const urlObj = new URL(searchUrl);
    finalUrl = urlObj.toString();
  } catch (e) {
    console.error('[ApifyClient] Ungültige searchUrl, keine valide URL:', { searchUrl, typeOfSearchUrl: typeof searchUrl, error: e.message });
    throw new Error(`searchUrl ist keine gültige URL: "${searchUrl}".`);
  }

  const actorId = normalizeActorId(APIFY_FACEBOOK_ADS_ACTOR_ID);

  const input = {
    urls: [{ url: finalUrl }],
    count: typeof maxAds === 'number' ? maxAds : 200,
  };

  console.log('[ApifyClient] Starting actor run', { actorId, input });

  let ApifyClient;
  try {
    ({ ApifyClient } = require('apify-client'));
  } catch (error) {
    console.error('[ApifyClient] Failed to load apify-client (CJS)', error?.message || error);
    throw new Error('Failed to load apify-client');
  }
  const client = new ApifyClient({ token: APIFY_API_TOKEN });

  try {
    const run = await client.actor(actorId).call(input);

    console.log('[ApifyClient] Actor run response', { runId: run?.id, status: run?.status, defaultDatasetId: run?.defaultDatasetId });

    const defaultDatasetId = run?.defaultDatasetId;

    if (!defaultDatasetId) {
      console.warn('[ApifyClient] Kein defaultDatasetId im Run – keine Dataset-Ergebnisse verfügbar.');
      return { runId: run?.id, status: run?.status, defaultDatasetId: null, items: [] };
    }

    const datasetClient = client.dataset(defaultDatasetId);
    const { items } = await datasetClient.listItems({ limit: input.count || 200 });

    console.log('[ApifyClient] Dataset items fetched', { defaultDatasetId, itemCount: items?.length || 0 });

    return { runId: run?.id, status: run?.status, defaultDatasetId, items: items || [] };
  } catch (error) {
    console.error('[ApifyClient] Failed to run actor or load dataset', { status: error?.status, message: error?.message, body: error?.body });
    throw new Error(`Failed to run Apify actor or fetch dataset: ${(error?.body && error.body.error && error.body.error.message) || error?.message || String(error)}`);
  }
}

export default { runAdResearchActor };
