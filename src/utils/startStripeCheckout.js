// src/utils/startStripeCheckout.js
import { apiClient } from './apiClient';
import { logger } from './logger';

export async function startStripeCheckout(userId, userEmail) {
  logger.log('[StripeCheckout] startStripeCheckout called', { userId, userEmail });

  if (!userId || !userEmail) {
    const message = 'Benutzer ist nicht eingeloggt oder E-Mail fehlt.';
    logger.warn('[StripeCheckout] missing user data BEFORE fetch', {
      userIdPresent: !!userId,
      userEmailPresent: !!userEmail
    });
    throw new Error(message);
  }

  const endpoint = '/api/create-checkout-session';

  try {
    logger.log('[StripeCheckout] Sending request to Netlify Function', {
      endpoint,
      userId,
      email: userEmail
    });

    const data = await apiClient.post(endpoint, {
      userId,
      email: userEmail
    });

    if (!data?.url) {
      throw new Error(data?.error || 'Checkout konnte nicht gestartet werden.');
    }

    logger.log('[StripeCheckout] Redirecting user to Stripe Checkout', { checkoutUrl: data.url });
    window.location.href = data.url;
  } catch (error) {
    logger.error('[StripeCheckout] startStripeCheckout failed', error);
    throw error;
  }
}
