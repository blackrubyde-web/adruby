import { describe, expect, it, vi } from 'vitest';
import { startStripeCheckout } from '../app/lib/stripeService';

const fromMock = vi.fn();

vi.mock('../app/lib/supabaseClient', () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args)
  }
}));

const apiPostMock = vi.fn();

vi.mock('../app/utils/apiClient', () => ({
  apiClient: {
    post: (...args: unknown[]) => apiPostMock(...args)
  }
}));

describe('stripeService', () => {
  it('creates an order and returns checkout url', async () => {
    fromMock.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: 'order_123' }, error: null })
        })
      }),
      update: () => ({})
    });
    apiPostMock.mockResolvedValue({ url: 'https://checkout.stripe.test/session' });

    const result = await startStripeCheckout('user_1', 'user@example.com');

    expect(result.orderId).toBe('order_123');
    expect(result.url).toBe('https://checkout.stripe.test/session');
    expect(apiPostMock).toHaveBeenCalledWith('/api/create-checkout-session', { orderId: 'order_123' });
  });

  it('marks the order as failed on checkout error', async () => {
    const eqMock = vi.fn(() => Promise.resolve({ error: null }));
    fromMock.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: 'order_999' }, error: null })
        })
      }),
      update: () => ({ eq: eqMock })
    });
    apiPostMock.mockRejectedValue(new Error('Checkout error'));

    await expect(startStripeCheckout('user_1', 'user@example.com')).rejects.toThrow('Checkout error');
    expect(eqMock).toHaveBeenCalledWith('id', 'order_999');
  });
});
