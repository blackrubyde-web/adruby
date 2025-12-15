import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthReady, loading, refreshSubscriptionStatus, isSubscribed } = useAuth();

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    console.log('[PaymentSuccess] render', {
      userId: user?.id,
      hasSessionId: !!sessionId,
      isSubscribed: typeof isSubscribed === 'function' ? isSubscribed() : false,
      ts: new Date().toISOString()
    });
  }, [user, sessionId, isSubscribed]);

  useEffect(() => {
    let cancelled = false;
    if (!isAuthReady || loading) return undefined;

    if (!user) {
      console.warn('[PaymentSuccess] no user session found, redirecting to signup');
      navigate('/ad-ruby-registration', { replace: true });
      return undefined;
    }

    const timer = setTimeout(() => navigate('/overview-dashboard', { replace: true }), 2500);

    (async () => {
      try {
        await refreshSubscriptionStatus(user);
      } catch (err) {
        console.warn('[PaymentSuccess] refreshSubscriptionStatus failed', err);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (cancelled && import.meta?.env?.DEV) {
        console.warn('[PaymentSuccess] cleanup after unmount');
      }
    };
  }, [isAuthReady, loading, user, refreshSubscriptionStatus, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg border border-gray-100 text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#111111]">Danke! Deine Testphase wurde gestartet.</h1>
        <p className="text-gray-600">
          Wir leiten dich gleich zum Dashboard weiter. Falls der Status noch nicht sichtbar ist, wird er nach dem Stripe-Webhook aktualisiert.
        </p>
        {sessionId && (
          <p className="text-xs text-gray-400">
            Checkout Session: {sessionId}
          </p>
        )}
        <div className="space-y-2">
          <button
            onClick={() => navigate('/overview-dashboard', { replace: true })}
            className="w-full bg-[#C80000] hover:bg-[#A00000] text-white py-3 rounded-lg font-semibold transition"
          >
            Jetzt zum Dashboard
          </button>
          <p className="text-xs text-gray-500">
            Hinweis: Der endgültige Abo-Status wird durch den Stripe-Webhook bestätigt.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
