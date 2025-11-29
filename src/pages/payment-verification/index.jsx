import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RedirectScreen from '../../components/RedirectScreen';

const PaymentVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');

      if (!sessionId) {
        setError('Keine Session-ID übergeben.');
        return;
      }

      try {
        const res = await fetch('/.netlify/functions/verify-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId })
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Verifizierung fehlgeschlagen.');
        }

        setTimeout(() => {
          navigate('/overview-dashboard', { replace: true });
        }, 1500);
      } catch (err) {
        setError(err?.message || 'Verifizierung fehlgeschlagen.');
      }
    };

    verify();
  }, [location.search, navigate]);

  if (error) {
    return (
      <RedirectScreen
        title="Zahlung konnte nicht bestätigt werden"
        subtitle="Bitte versuche es erneut oder kontaktiere den Support."
        details={error}
      />
    );
  }

  return (
    <RedirectScreen
      title="Zahlung wird bestätigt…"
      subtitle="Wir prüfen deine Transaktion und richten dein Konto ein."
      details="Du wirst gleich weitergeleitet."
    />
  );
};

export default PaymentVerificationPage;
