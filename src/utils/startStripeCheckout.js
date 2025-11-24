export async function startStripeCheckout(userId, userEmail) {
  console.log('[StripeCheckout] startStripeCheckout called', { userId, userEmail });

  if (!userId || !userEmail) {
    const message = 'Benutzer ist nicht eingeloggt oder E-Mail fehlt.';
    console.warn('[StripeCheckout] missing user data', { userIdPresent: !!userId, userEmailPresent: !!userEmail });
    throw new Error(message);
  }

  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userEmail })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.url) {
      console.error('[StripeCheckout] API returned error', { status: response.status, data });
      throw new Error(data?.error || 'Zahlung konnte nicht gestartet werden. Bitte später erneut versuchen.');
    }

    console.log('[StripeCheckout] redirecting to Stripe Checkout', { checkoutUrl: data.url });
    window.location.href = data.url;
  } catch (error) {
    console.error('[StripeCheckout] startStripeCheckout failed', error);
    throw error;
  }
}
