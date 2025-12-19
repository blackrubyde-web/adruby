import { describe, it, expect, vi } from 'vitest';

const createClientMock = vi.hoisted(() => vi.fn(() => ({ auth: {} })));

vi.mock('../app/lib/env', () => ({
  env: {
    supabaseUrl: 'https://example.supabase.co',
    supabaseAnonKey: 'public-anon-key'
  }
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock
}));

import '../app/lib/supabaseClient';

describe('supabaseClient', () => {
  it('creates a client with env vars', () => {
    expect(createClientMock).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'public-anon-key',
      expect.objectContaining({
        auth: expect.any(Object)
      })
    );
  });
});
