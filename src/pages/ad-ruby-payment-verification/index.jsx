// FILE: src/pages/payment-verification/index.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RedirectScreen from '../../components/RedirectScreen';

const PaymentVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 'verifying_session' | 'needs_payment' | 'error'
  const [mode, setMode] = useState('verifying_session');
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');

    // ⬅️ Fall B: Kein session_id -> allgemeiner "Zahlung erforderlich"-Fall
    if (!sessionId) {
      console.log('[PaymentVerification] no session_id – entering needs_payment mode');
      setMode('needs_payment');
      return;
    }

    // ⬅️ Fall A: Normale Stripe-Checkout-Session verifizieren
    const verify = async () => {
      try {
        setMode('verifying_session');

        const res = await fetch('/.netlify/functions/verify-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Verifizierung fehlgeschlagen.');
        }

        console.log('[PaymentVerification] session verified, redirecting to dashboard');

        setTimeout(() => {
          navigate('/overview-dashboard', { replace: true });
        }, 1500);
      } catch (err) {
        console.error('[PaymentVerification] error', err);
        setError(err?.message || 'Verifizierung fehlgeschlagen.');
        setMode('error');
      }
    };

    verify();
  }, [location.search, navigate]);

  // ❌ Fehlerfall (z.B. Stripe-Call schlägt fehl)
  if (mode === 'error' && error) {
    return (
      <RedirectScreen
        title="Zahlung konnte nicht bestätigt werden"
        subtitle="Bitte versuche es erneut oder kontaktiere den Support."
        details={error}
        showHomeButton
        showLogoutButton
      />
    );
  }

  // 💳 Fall B: Keine session_id -> User hat kein aktives Abo / Zahlungsdaten ungültig
  if (mode === 'needs_payment') {
    return (
      <RedirectScreen
        title="Zahlung erforderlich"
        subtitle="Dein Abonnement ist nicht aktiv oder deine Zahlungsdaten sind nicht mehr gültig."
        details="Bitte aktualisiere deine Zahlungsmethode oder starte ein neues Abonnement, um AdRuby weiter nutzen zu können."
        showHomeButton
        showLogoutButton
      />
    );
  }

  // ⏳ Fall A: Normale Checkout-Verifizierung
  return (
    <RedirectScreen
      title="Zahlung wird bestätigt…"
      subtitle="Wir prüfen deine Transaktion und richten dein Konto ein."
      details="Du wirst gleich weitergeleitet."
      showHomeButton={false}
      showLogoutButton={false}
    />
  );
};

export default PaymentVerificationPage;
