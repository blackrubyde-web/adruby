import { methodNotAllowed, ok, badRequest, withCors } from './utils/response.js';
import { requireUserId } from './_shared/auth.js';
import { supabaseAdmin } from './_shared/clients.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return withCors({ statusCode: 200 });
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') return methodNotAllowed('GET,POST,OPTIONS');

  const auth = await requireUserId(event);
  if (!auth.ok) return auth.response;
  const userId = auth.userId;

  try {
    if (event.httpMethod === 'GET') {
      // list selections for user
      const { data, error } = await supabaseAdmin
        .from('ad_research_selections')
        .select('id,name,selection_ids,created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) return badRequest(error.message);
      return ok({ items: data || [] });
    }

    // POST — save a selection
    let body;
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch (e) {
      return badRequest('Invalid JSON body');
    }

    const name = typeof body.name === 'string' ? body.name.trim() : null;
    const ids = Array.isArray(body.selectionIds) ? body.selectionIds.filter(Boolean) : [];

    if (!ids.length) return badRequest('No selectionIds provided');

    const { data, error } = await supabaseAdmin
      .from('ad_research_selections')
      .insert({ user_id: userId, name, selection_ids: ids })
      .select('id')
      .single();

    if (error) return badRequest(error.message);
    return ok({ id: data?.id || null });
  } catch (err) {
    console.error('[ad-research-save] error', err);
    return badRequest('Save failed');
  }
}
