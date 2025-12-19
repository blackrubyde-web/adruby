import { supabase } from './supabaseClient';
import { apiClient } from '../utils/apiClient';

type CheckoutResponse = {
  url: string;
};

type CheckoutResult = {
  url: string;
  orderId: string;
};

export async function startStripeCheckout(userId: string, email: string): Promise<CheckoutResult> {
  const { data: order, error } = await supabase
    .from('payment_orders')
    .insert({
      user_id: userId,
      status: 'created',
      provider: 'stripe',
      metadata: { email, source: 'web' }
    })
    .select('id')
    .single();

  if (error || !order?.id) {
    throw new Error(error?.message || 'Failed to create payment order');
  }

  try {
    const response = await apiClient.post<CheckoutResponse>('/api/create-checkout-session', {
      orderId: order.id
    });

    if (!response?.url) {
      throw new Error('Checkout URL missing');
    }

    return { url: response.url, orderId: order.id };
  } catch (err) {
    await supabase
      .from('payment_orders')
      .update({ status: 'failed' })
      .eq('id', order.id);
    throw err;
  }
}
