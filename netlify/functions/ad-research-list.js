import { withCors } from './utils/response.js';
import { supabaseAdmin } from './_shared/clients.js';

export async function handler(event) {
  const headers = { ...withCors().headers, 'Content-Type': 'application/json' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const limit = parseInt((event.queryStringParameters && event.queryStringParameters.limit) || '10', 10);
    const { data, error } = await supabaseAdmin
      .from('ad_research_ads')
      .select('id,job_id,ad_library_id,page_id,page_name,primary_text,headline,description,image_url,video_url,created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[ad-research-list] supabase error', error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to fetch ads' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ count: Array.isArray(data) ? data.length : 0, items: data || [] }) };
  } catch (err) {
    console.error('[ad-research-list] error', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
  }
}

export default { handler };
