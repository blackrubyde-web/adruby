import { vi, describe, it, expect } from 'vitest';

// Mock auth, entitlements, credits
vi.mock('../netlify/functions/_shared/auth.js', () => ({ requireUserId: vi.fn(async () => ({ ok: true, userId: 'user-x' })) }));
vi.mock('../netlify/functions/_shared/entitlements.js', () => ({ requireActiveSubscription: vi.fn(async () => ({ ok: true })) }));
vi.mock('../netlify/functions/_shared/credits.js', () => ({ assertAndConsumeCredits: vi.fn(async () => 1) }));

// Mock OpenAI and repair/quality helpers
vi.mock('../netlify/functions/_shared/openai.js', () => ({
  getOpenAiClient: () => ({ responses: { create: async () => ({ output_text: JSON.stringify({ variants: [{ id: 'v1', headline: 'h1' }] }) }) } }),
  getOpenAiModel: () => 'gpt-test',
}));

vi.mock('../netlify/functions/_shared/repair.js', () => ({
  parseWithRepair: vi.fn(async ({ initial }) => ({ data: JSON.parse(initial) || { variants: [] }, attempts: 1 })),
}));

vi.mock('../netlify/functions/_shared/creativeQuality.js', () => ({ applySanityFilter: (x) => x }));

// Mock schemas to accept inputs
vi.mock('../netlify/functions/_shared/creativeSchemas.js', () => ({
  CreativeOutputSchema: { safeParse: (v) => ({ success: true, data: v }) },
  NormalizedBriefSchema: { safeParse: (b) => ({ success: true, data: b }) },
  QualityEvalSchema: {},
}));

// Mock supabaseAdmin for the query shapes used in creative-generate
const makeSelectQuery = (result) => {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    in: vi.fn(() => query),
    order: vi.fn(() => query),
    limit: vi.fn(() => query),
    maybeSingle: vi.fn(async () => result),
    single: vi.fn(async () => result),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return query;
};

const insertMock = {
  select: () => ({ single: async () => ({ data: { id: 'g-1' } }) }),
};

const updateMock = {
  eq: async () => ({ data: null, error: null }),
};

vi.mock('../netlify/functions/_shared/clients.js', () => ({
  supabaseAdmin: {
    from: (table) => {
      if (table === 'strategy_blueprints') {
        return makeSelectQuery({ data: { raw_content_markdown: 'Blueprint' } });
      }
      if (table === 'ad_research_ads') {
        return makeSelectQuery({ data: [] });
      }
      if (table === 'generated_creatives') {
        return {
          insert: () => insertMock,
          update: () => updateMock,
          select: () => makeSelectQuery({ data: [] }),
        };
      }
      if (table === 'ai_action_logs') {
        return {
          insert: async () => ({ error: null }),
        };
      }
      return makeSelectQuery({ data: [] });
    },
  },
}));

import { handler } from '../netlify/functions/creative-generate.js';

describe('creative-generate', () => {
  it('returns jobId after generation and storage', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ brief: { brandName: 'Demo' }, hasImage: false }),
    };

    const res = await handler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body || '{}');
    expect(body.jobId).toBe('g-1');
    expect(body.output).toBeDefined();
  });
});
