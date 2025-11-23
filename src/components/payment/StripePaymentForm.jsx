import React, { useState, useEffect } from 'react';
import { 
  useStripe, 
  useElements, 
  PaymentElement,
  Elements 
} from '@stripe/react-stripe-js';
import { useStripeContext } from '../../contexts/StripeContext';
import { stripeService } from '../../services/stripeService';
import Icon from '../AppIcon';
import Button from '../ui/Button';

// Inner form component that uses Stripe hooks
const StripePaymentFormInner = ({
  clientSecret,
  amount,
  currency = 'EUR',
  orderData,
  customerInfo,
  onSuccess,
  onError,
  confirmButtonText = 'Zahlung abschließen',
  className = ''
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentReady, setPaymentReady] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Reset error when clientSecret changes
  useEffect(() => {
    setErrorMessage('');
    setPaymentReady(false);
  }, [clientSecret]);

  // Check if payment element is ready
  useEffect(() => {
    if (elements) {
      const paymentElement = elements?.getElement(PaymentElement);
      if (paymentElement) {
        paymentElement?.on('ready', () => {
          setPaymentReady(true);
        });
      }
    }
  }, [elements]);

  const handleSubmit = async (event) => {
    event?.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setErrorMessage('Zahlungssystem nicht bereit. Bitte versuchen Sie es erneut.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Extract order info for confirmation
      const { orderId, orderNumber } = orderData || {};

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe?.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location?.origin}/credits?success=true`,
        },
        redirect: 'if_required'
      });

      if (stripeError) {
        // Payment failed
        setErrorMessage(stripeError?.message || 'Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.');
        onError?.(stripeError);
      } else if (paymentIntent) {
        // Payment succeeded
        if (paymentIntent?.status === 'succeeded') {
          // Confirm payment on our backend
          try {
            const result = await stripeService?.confirmPayment(paymentIntent?.id);
            
            const successResult = {
              paymentIntent,
              orderId,
              orderNumber,
              orderData: result,
              warning: !result?.success ? 'Zahlung verarbeitet, aber Bestätigung fehlgeschlagen. Bitte kontaktieren Sie den Support.' : undefined
            };

            // Store success data and show animation
            setSuccessData(successResult);
            setShowSuccessAnimation(true);

            // After animation completes, call onSuccess
            setTimeout(() => {
              setShowSuccessAnimation(false);
              onSuccess?.(successResult);
            }, 3000); // Show animation for 3 seconds
          } catch (confirmError) {
            console.error('Payment confirmation error:', confirmError);
            // Payment succeeded but confirmation failed
            const successResult = {
              paymentIntent,
              orderId,
              orderNumber,
              warning: 'Zahlung erfolgreich, aber Bestätigung fehlgeschlagen. Bitte kontaktieren Sie den Support.'
            };
            onSuccess?.(successResult);
          }
        } else if (paymentIntent?.status === 'requires_action') {
          // Additional authentication required
          setErrorMessage('Zusätzliche Authentifizierung erforderlich. Bitte schließen Sie die Verifizierung ab.');
        } else {
          setErrorMessage('Zahlungsverarbeitung unvollständig. Bitte versuchen Sie es erneut.');
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setErrorMessage('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      onError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while payment system initializes
  if (!stripe || !elements || !clientSecret) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Zahlungssystem wird geladen...
        </p>
      </div>
    );
  }

  return (
    <div className={`relative bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Element */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">
              Zahlungsdetails
            </label>
            <PaymentElement 
              options={{
                fields: {
                  billingDetails: 'auto'
                },
                layout: 'tabs'
              }}
            />
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!paymentReady || isProcessing || !stripe || !elements}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          size="lg"
        >
          <div className="flex items-center justify-center space-x-2">
            {isProcessing ? (
              <Icon name="Loader2" size={18} className="animate-spin" />
            ) : (
              <Icon name="CreditCard" size={18} />
            )}
            <span>
              {isProcessing ? 'Zahlung wird verarbeitet...' : confirmButtonText}
            </span>
          </div>
        </Button>

        {/* Security Notice */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Icon name="Shield" size={14} />
          <span>Gesichert durch Stripe • Ihre Zahlungsinformationen sind verschlüsselt</span>
        </div>
      </form>
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center z-50">
          <div className="text-center space-y-6 p-8">
            {/* Animated Success Icon */}
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <Icon name="Check" size={32} className="text-white animate-pulse" />
                </div>
              </div>
              {/* Ripple Effect */}
              <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-green-300 rounded-full animate-ping opacity-30"></div>
              <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-green-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-green-600 animate-fade-in">
                Zahlung erfolgreich! 🎉
              </h3>
              <p className="text-green-700 font-medium animate-fade-in" style={{ animationDelay: '0.3s' }}>
                Ihre Bestellung wurde bestätigt
              </p>
              {successData?.orderNumber && (
                <p className="text-sm text-green-600 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  Bestellung #{successData?.orderNumber}
                </p>
              )}
            </div>

            {/* Amount Display */}
            <div className="bg-green-50 rounded-lg p-4 animate-fade-in" style={{ animationDelay: '0.9s' }}>
              <p className="text-lg font-semibold text-green-800">
                {stripeService?.formatPrice(amount, currency)} bezahlt
              </p>
              <p className="text-xs text-green-600 mt-1">
                Credits werden hinzugefügt...
              </p>
            </div>

            {/* Loading Dots */}
            <div className="flex justify-center space-x-1 animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper component that provides Elements context
const StripePaymentForm = (props) => {
  const { stripePromise, stripeOptions } = useStripeContext();

  if (!props?.clientSecret) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-center text-gray-500">
          Zahlungssystem wird vorbereitet...
        </p>
      </div>
    );
  }

  // Elements options with client secret and customer info
  const elementsOptions = {
    clientSecret: props?.clientSecret,
    ...stripeOptions,
    defaultValues: props?.customerInfo ? {
      billingDetails: {
        name: `${props?.customerInfo?.firstName || ''} ${props?.customerInfo?.lastName || ''}`?.trim(),
        email: props?.customerInfo?.email || '',
        phone: props?.customerInfo?.phone || '',
        address: {
          line1: props?.customerInfo?.billing?.address_line_1 || '',
          line2: props?.customerInfo?.billing?.address_line_2 || '',
          city: props?.customerInfo?.billing?.city || '',
          state: props?.customerInfo?.billing?.state || '',
          postal_code: props?.customerInfo?.billing?.postal_code || '',
          country: props?.customerInfo?.billing?.country || 'DE',
        }
      }
    } : undefined
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <StripePaymentFormInner {...props} />
    </Elements>
  );
};

export default StripePaymentForm;