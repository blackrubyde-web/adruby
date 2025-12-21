import { vi, describe, it, expect } from 'vitest';

vi.mock('../netlify/functions/_shared/apifyClientShim.js', () => ({
  runAdResearchActor: vi.fn(async () => ({
    runId: 'run-123',
    status: 'SUCCEEDED',
    defaultDatasetId: 'ds-1',
    items: [
      {
        id: 'ad-1',
        page_id: 'p1',
        page_name: 'Demo Page',
        primary_text: 'Great product',
        headline: 'Buy now',
        imageUrl: 'https://example.com/img.jpg',
      },
    ],
  })),
}));

vi.mock('../netlify/functions/_shared/clients.js', () => ({
  supabaseAdmin: {
    from: (table) => ({ insert: vi.fn(async (rows) => ({ error: null })) }),
  },
}));

import { handler } from '../netlify/functions/ad-research-start.js';

describe('ad-research-start', () => {
  it('starts apify actor and stores items', async () => {
    const previousToken = process.env.APIFY_API_TOKEN;
    const previousActor = process.env.APIFY_FACEBOOK_ADS_ACTOR_ID;
    process.env.APIFY_API_TOKEN = 'test-token';
    process.env.APIFY_FACEBOOK_ADS_ACTOR_ID = 'actor-123';

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ searchUrl: 'https://www.facebook.com/ads/library/?id=123' }),
    };

    const res = await handler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body || '{}');
    expect(body.jobId).toBe('run-123');
    expect(body.itemCount).toBe(1);

    process.env.APIFY_API_TOKEN = previousToken;
    process.env.APIFY_FACEBOOK_ADS_ACTOR_ID = previousActor;
  });
});
