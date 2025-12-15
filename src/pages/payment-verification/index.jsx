import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RedirectScreen from '../../components/RedirectScreen';
import { apiClient } from '../../utils/apiClient';
import { emitToast } from '../../utils/toastBus';

const PaymentVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');

      if (!sessionId) {
        navigate('/', { replace: true });
        return;
      }

      try {
        const data = await apiClient.post('/api/verify-checkout-session', { sessionId });

        setTimeout(() => {
          navigate('/overview-dashboard', { replace: true });
        }, 1500);
      } catch (err) {
        const message = err?.message || 'Verifizierung fehlgeschlagen.';
        emitToast({
          type: 'error',
          title: 'Verifizierung fehlgeschlagen',
          description: message
        });
        if (!cancelled) {
          setError(message);
        } else if (import.meta?.env?.DEV) {
          console.warn('[PaymentVerification] update aborted after unmount');
        }
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [location.search, navigate]);

  if (error) {
    return (
      <RedirectScreen
        title="Zahlung konnte nicht bestaetigt werden"
        subtitle="Bitte versuche es erneut oder kontaktiere den Support."
        details={error}
        showHomeButton
        showLogoutButton
      />
    );
  }

  return (
    <RedirectScreen
      title="Zahlung wird bestaetigt..."
      subtitle="Wir pruefen deine Transaktion und richten dein Konto ein."
      details="Du wirst gleich weitergeleitet."
    />
  );
};

export default PaymentVerificationPage;
