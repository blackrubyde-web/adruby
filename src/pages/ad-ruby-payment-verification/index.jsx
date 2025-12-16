import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RedirectScreen from '../../components/RedirectScreen';
import { useAuth } from '../../contexts/AuthContext';
import PaymentBenefits from './components/PaymentBenefits';
import PaymentVerificationForm from './components/PaymentVerificationForm';
import { apiClient } from '../../utils/apiClient';
import { emitToast } from '../../utils/toastBus';
import { supabase } from '../../lib/supabaseClient';

const PaymentVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthReady } = useAuth();

  const [mode, setMode] = useState('verifying_session'); // 'verifying_session' | 'needs_payment' | 'error'
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');

    if (!isAuthReady) return;

    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    const checkDbFlag = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('user_profiles')
          .select('payment_verified,onboarding_completed')
          .eq('id', user.id)
          .single();
        if (dbError) return false;
        return Boolean(data?.payment_verified || data?.onboarding_completed);
      } catch {
        return false;
      }
    };

    const verify = async () => {
      try {
        setMode('verifying_session');

        if (!sessionId) {
          const ok = await checkDbFlag();
          if (ok) {
            navigate('/overview-dashboard', { replace: true });
          } else {
            setMode('needs_payment');
          }
          return;
        }

        const data = await apiClient.post('/api/verify-checkout-session', { sessionId });

        console.log('[PaymentVerification] session verified, redirecting to dashboard');

        setTimeout(() => {
          navigate('/overview-dashboard', { replace: true });
        }, 800);
      } catch (err) {
        console.error('[PaymentVerification] error', err);
        const message = err?.message || 'Verifizierung fehlgeschlagen.';
        emitToast({
          type: 'error',
          title: 'Verifizierung fehlgeschlagen',
          description: message
        });
        const ok = await checkDbFlag();
        if (ok) {
          if (!cancelled) navigate('/overview-dashboard', { replace: true });
          return;
        }
        if (!cancelled) {
          setError(message);
          setMode('error');
        } else if (import.meta?.env?.DEV) {
          console.warn('[PaymentVerification] aborted update after unmount');
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [location.search, navigate, user, isAuthReady]);

  if (!isAuthReady) {
    return (
      <RedirectScreen
        title="Anmeldung wird geprueft..."
        subtitle="Bitte einen Moment Geduld."
        details="Wir stellen sicher, dass dein Konto korrekt geladen ist."
        showHomeButton={false}
        showLogoutButton={false}
      />
    );
  }

  if (mode === 'error' && error) {
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

  if (mode === 'needs_payment') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="hidden md:block">
            <PaymentBenefits />
          </div>
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6 md:p-8">
            <PaymentVerificationForm
              user={user}
              isAuthReady={isAuthReady}
              onSuccess={() => {
                console.log('[Payment] checkout started');
              }}
              onError={(err) => {
                console.error('[Payment] checkout error in page', err);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <RedirectScreen
      title="Zahlung wird bestaetigt..."
      subtitle="Wir pruefen deine Transaktion und richten dein Konto ein."
      details="Du wirst gleich weitergeleitet."
      showHomeButton={false}
      showLogoutButton={false}
    />
  );
};

export default PaymentVerificationPage;
