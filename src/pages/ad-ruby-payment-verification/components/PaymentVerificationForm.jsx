import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/ui/Button';
import { startStripeCheckout } from '../../../utils/startStripeCheckout';

const PaymentVerificationForm = ({ user, onSuccess, onError }) => {
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    console.log('[Payment] PaymentVerificationForm render', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      ts: new Date().toISOString()
    });
  }, [user]);

  const handleStartTrial = async () => {
    if (!user?.id || !user?.email) {
      const message = 'Bitte zuerst anmelden, um die Testphase zu starten.';
      console.warn('[Payment] missing user when starting checkout');
      setError(message);
      onError?.(new Error(message));
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      await startStripeCheckout(user?.id, user?.email);
      onSuccess?.();
    } catch (err) {
      console.error('[Payment] checkout start failed', err);
      setError(err?.message || 'Zahlung konnte nicht gestartet werden. Bitte später erneut versuchen.');
      onError?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-[#C80000] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">AR</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-[#111111]">7 Tage kostenlos testen</h1>
        <p className="text-gray-600">
          Sofort Zugang, heute keine Zahlung. Nach der Testphase läuft das Monatsabo automatisch weiter.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">AdRuby Pro</span>
          <span className="text-xl font-bold text-[#111111]">XX €/Monat</span>
        </div>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>7 Tage Testphase, jederzeit kündbar</li>
          <li>Kompletter Zugriff auf Dashboard & KI-Tools</li>
          <li>Stripe Checkout – sichere Zahlungsabwicklung</li>
        </ul>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
          {error}
        </div>
      )}

      <Button
        type="button"
        className="w-full bg-[#C80000] hover:bg-[#A00000] text-white py-3 text-base sm:text-lg"
        disabled={isProcessing || !user}
        onClick={handleStartTrial}
      >
        {isProcessing ? 'Weiterleitung…' : '7 Tage kostenlos testen'}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Wir leiten dich zu Stripe weiter. Die endgültige Abo-Aktivierung erfolgt nach der Zahlung – Status wird per Webhook aktualisiert.
      </p>
    </motion.div>
  );
};

export default PaymentVerificationForm;
