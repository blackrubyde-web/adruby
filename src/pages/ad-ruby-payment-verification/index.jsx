import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RedirectScreen from '../../components/RedirectScreen';
import { useAuth } from '../../contexts/AuthContext';
import PaymentBenefits from './components/PaymentBenefits';
import PaymentVerificationForm from './components/PaymentVerificationForm';

const PaymentVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthReady } = useAuth();

  const [mode, setMode] = useState('verifying_session'); // 'verifying_session' | 'needs_payment' | 'error'
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');

    if (!isAuthReady) return;

    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (!sessionId) {
      console.log('[PaymentVerification] no session_id – show checkout form');
      setMode('needs_payment');
      return;
    }

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
  }, [location.search, navigate, user, isAuthReady]);

  if (!isAuthReady) {
    return (
      <RedirectScreen
        title="Anmeldung wird geprüft…"
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
        title="Zahlung konnte nicht bestätigt werden"
        subtitle="Bitte versuche es erneut oder kontaktiere den Support."
        details={error}
        showHomeButton
        showLogoutButton
      />
    );
  }

  if (mode === 'needs_payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="hidden md:block">
            <PaymentBenefits />
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
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
      title="Zahlung wird bestätigt…"
      subtitle="Wir prüfen deine Transaktion und richten dein Konto ein."
      details="Du wirst gleich weitergeleitet."
      showHomeButton={false}
      showLogoutButton={false}
    />
  );
};

export default PaymentVerificationPage;
