import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RedirectScreen from '../../components/RedirectScreen';
import { apiClient } from '../../utils/apiClient';
import { emitToast } from '../../utils/toastBus';
import { supabase } from '../../lib/supabaseClient';

const PaymentVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const checkDbFlag = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        if (!userId) return false;
        const { data, error: dbError } = await supabase
          .from('user_profiles')
          .select('payment_verified,onboarding_completed')
          .eq('id', userId)
          .single();
        if (dbError) return false;
        return Boolean(data?.payment_verified || data?.onboarding_completed);
      } catch {
        return false;
      }
    };

    const verify = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');

      try {
        // Wenn keine session_id: direkt DB-Flag prüfen
        if (!sessionId) {
          const ok = await checkDbFlag();
          if (ok) {
            navigate('/overview-dashboard', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
          return;
        }

        const data = await apiClient.post('/api/verify-checkout-session', { sessionId });

        if (!data?.ok) {
          throw new Error(data?.error || data?.message || 'Verifizierung fehlgeschlagen.');
        }

        setTimeout(() => {
          if (!cancelled) navigate('/overview-dashboard', { replace: true });
        }, 800);
      } catch (err) {
        const message = err?.message || 'Verifizierung fehlgeschlagen.';
        emitToast({
          type: 'error',
          title: 'Verifizierung fehlgeschlagen',
          description: message
        });
        // Fallback: DB-Flag prüfen
        const ok = await checkDbFlag();
        if (ok) {
          if (!cancelled) navigate('/overview-dashboard', { replace: true });
          return;
        }
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
