import { vi, describe, it, expect } from 'vitest';

vi.mock('../netlify/functions/_shared/auth.js', () => ({
  requireUserId: vi.fn(async () => ({ ok: true, userId: 'user-1' })),
}));

vi.mock('../netlify/functions/_shared/clients.js', () => ({
  supabaseAdmin: {
    from: (table) => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: async () => ({
              data: {
                id: 'g1',
                outputs: { variants: [] },
                score: 42,
                saved: false,
                created_at: '2025-01-01T00:00:00Z',
              },
            }),
          }),
        }),
      }),
    }),
  },
}));

import { handler } from '../netlify/functions/creative-status.js';

describe('creative-status', () => {
  it('returns stored generated creative', async () => {
    const event = { httpMethod: 'GET', queryStringParameters: { id: 'g1' } };
    const res = await handler(event);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body || '{}');
    expect(body.id).toBe('g1');
    expect(body.status).toBe('complete');
    expect(body.outputs).toBeDefined();
  });
});
