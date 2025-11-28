// src/utils/startStripeCheckout.js

export async function startStripeCheckout(userId, userEmail) {
  console.log('[StripeCheckout] startStripeCheckout called', {
    userId,
    userEmail
  });

  // Vorab-Check
  if (!userId || !userEmail) {
    const message = 'Benutzer ist nicht eingeloggt oder E-Mail fehlt.';
    console.warn('[StripeCheckout] missing user data BEFORE fetch', {
      userIdPresent: !!userId,
      userEmailPresent: !!userEmail
    });
    throw new Error(message);
  }

  // Netlify-Endpoint
  const endpoint = '/api/create-checkout-session'; // wird über Redirect zu /.netlify/functions/create-checkout-session

  try {
    console.log('[StripeCheckout] Sending request to Netlify Function…', {
      endpoint,
      userId,
      email: userEmail
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },

      // ❗❗ DER WICHTIGSTE FIX ❗❗
      body: JSON.stringify({
        userId,
        email: userEmail
      })
    });

    // JSON auslesen (auch bei Fehlern)
    const data = await response.json().catch(() => ({}));

    console.log('[StripeCheckout] Response received', {
      status: response.status,
      data
    });

    // Fehler abfangen
    if (!response.ok || !data?.url) {
      console.error('[StripeCheckout] API returned error', {
        status: response.status,
        data
      });

      throw new Error(
        data?.error || 'Checkout konnte nicht gestartet werden.'
      );
    }

    // ➜ Weiterleitung zu Stripe Checkout
    console.log('[StripeCheckout] Redirecting user to Stripe Checkout…', {
      checkoutUrl: data.url
    });

    window.location.href = data.url;
  } catch (error) {
    console.error('[StripeCheckout] startStripeCheckout failed', error);
    throw error;
  }
}
