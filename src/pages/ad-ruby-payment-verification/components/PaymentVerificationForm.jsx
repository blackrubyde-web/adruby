import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useStripeContext } from '../../../contexts/StripeContext';
import Button from '../../../components/ui/Button';

const PaymentVerificationFormInner = ({ user, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [country, setCountry] = useState('DE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSetupIntent = async () => {
      try {
        console.log('[Payment] fetching setup intent');
        const res = await fetch('/api/stripe/create-setup-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id, email: user?.email, name })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'SetupIntent failed');
        }
        setClientSecret(data?.clientSecret);
        console.log('[Payment] setup intent received');
      } catch (err) {
        console.error('[Payment] setup intent error', err);
        setError(err?.message || 'Fehler beim Laden des Zahlungssystems');
      }
    };

    if (user?.id) {
      loadSetupIntent();
    }
  }, [user?.id, user?.email, name]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!stripe || !elements || !clientSecret) {
      setError('Stripe ist nicht bereit. Bitte lade die Seite neu.');
      return;
    }
    setIsProcessing(true);
    setError('');

    try {
      console.log('[Payment] start trial clicked');
      const cardElement = elements.getElement(CardElement);
      const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: name || user?.email,
            email: user?.email,
            address: country ? { country } : undefined
          }
        }
      });

      if (stripeError) {
        throw stripeError;
      }

      const paymentMethodId = setupIntent?.payment_method;
      console.log('[Payment] card saved, creating subscription');

      const res = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          paymentMethodId,
          name,
          country,
          email: user?.email
        })
      });

      const subData = await res.json();
      if (!res.ok) {
        throw new Error(subData?.error || 'Subscription failed');
      }

      console.log('[Payment] subscription created', subData);
      onSuccess?.(subData);
    } catch (err) {
      console.error('[Payment] error', err);
      setError(err?.message || 'Fehler bei der Zahlungsprüfung');
      onError?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!clientSecret && !error) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-10 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        <div className="h-10 bg-gray-300 rounded"></div>
        <p className="text-sm text-gray-500 text-center">
          Zahlungssystem wird geladen...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full"
    >
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-[#C80000] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">AR</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-[#111111] mb-2">
          Zahlungs-Verifizierung
        </h1>
        <p className="text-gray-600">
          Starte deine 5-Tage-Testphase. Heute keine Zahlung.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Karteninhaber (vollständiger Name)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C80000]"
            placeholder="Max Mustermann"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Land</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C80000]"
          >
            <option value="DE">Germany</option>
            <option value="AT">Austria</option>
            <option value="CH">Switzerland</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kartendaten</label>
          <div className="border border-gray-300 rounded-lg p-3">
            <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-[#C80000] hover:bg-[#A00000] text-white"
          disabled={isProcessing}
        >
          {isProcessing ? 'Verarbeite…' : 'Kostenlose Testphase (5 Tage) starten'}
        </Button>
      </form>
    </motion.div>
  );
};

const PaymentVerificationForm = ({ user, onSuccess, onError }) => {
  const { stripePromise, stripeOptions } = useStripeContext();

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <PaymentVerificationFormInner user={user} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
};

export default PaymentVerificationForm;
