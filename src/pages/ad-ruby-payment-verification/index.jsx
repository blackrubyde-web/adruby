import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PaymentVerificationForm from './components/PaymentVerificationForm';
import PaymentBenefits from './components/PaymentBenefits';
import ProgressIndicator from '../ad-ruby-registration/components/ProgressIndicator';

const AdRubyPaymentVerification = () => {
  const navigate = useNavigate();
  const { user, loading, subscriptionStatus, isSubscribed, refreshSubscriptionStatus, isAuthReady, signOut } = useAuth();
  const [verificationStep, setVerificationStep] = useState(2);

  useEffect(() => {
    console.log('[AuthTrace] PaymentVerification render', {
      isAuthReady,
      hasSession: !!user,
      hasActiveSubscription: isSubscribed?.(),
      subscriptionStatus,
      pathname: window.location.pathname,
      search: window.location.search,
      ts: new Date().toISOString()
    });

    if (!isAuthReady) {
      console.log('[AuthTrace] PaymentVerification waiting for auth…', { path: window.location.pathname, ts: new Date().toISOString() });
      return;
    }

    if (!user) {
      console.log('[AuthTrace] PaymentVerification no session → redirect /ad-ruby-registration', { path: window.location.pathname, ts: new Date().toISOString() });
      navigate('/ad-ruby-registration', { replace: true });
      return;
    }

    if (isSubscribed?.()) {
      console.log('[AuthTrace] PaymentVerification already subscribed → redirect /dashboard', { subscriptionStatus, ts: new Date().toISOString() });
      navigate('/overview-dashboard', { replace: true });
      return;
    }

    console.log('[AuthTrace] PaymentVerification show payment UI (no active subscription)', { subscriptionStatus, ts: new Date().toISOString() });
  }, [user, isAuthReady, isSubscribed, subscriptionStatus, navigate]);

  // Show loading state while checking authentication
  if (!isAuthReady || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C80000]"></div>
      </div>
    );
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const handleVerificationSuccess = async () => {
    // Stripe redirect will take over; keep hook for future use (e.g., if we add polling)
    console.log('[AuthTrace] PaymentVerification success callback triggered', { userId: user?.id });
    await refreshSubscriptionStatus(user);
  };

  const handleVerificationError = (error) => {
    console.error('Payment verification error:', error);
    // Error is handled within the form component
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#C80000]/5 via-transparent to-[#C80000]/10" />
      
      <div className="relative min-h-screen">
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm font-medium text-[#C80000] bg-white border border-[#C80000] rounded-lg hover:bg-[#C80000] hover:text-white transition"
          >
            ← Zurück zur Homepage
          </button>
        </div>
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={async () => {
              await signOut();
              navigate('/ad-ruby-registration');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Account wechseln
          </button>
        </div>
        {/* Progress Indicator */}
        <div className="pt-8 pb-4">
          <div className="max-w-6xl mx-auto px-6">
            <ProgressIndicator currentStep={verificationStep} totalSteps={2} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex min-h-[calc(100vh-120px)]">
          {/* Left Column - Benefits & Timeline */}
          <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 bg-white border-r border-gray-200">
            <div className="flex items-center justify-center w-full p-12">
              <div className="max-w-md w-full">
                <PaymentBenefits />
              </div>
            </div>
          </div>

          {/* Right Column - Payment Verification Form */}
          <div className="flex-1 lg:w-3/5 xl:w-1/2">
            <div className="flex items-center justify-center min-h-full p-6 lg:p-12">
              <div className="w-full max-w-md">
                <PaymentVerificationForm 
                  user={user}
                  onSuccess={handleVerificationSuccess}
                  onError={handleVerificationError}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:hidden bg-white border-t border-gray-200 p-6"
        >
          <div className="max-w-md mx-auto">
            <PaymentBenefits compact={true} />
          </div>
        </motion.div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-center bg-gradient-to-t from-white/80 to-transparent">
          <p className="text-xs text-gray-500">
            © {new Date()?.getFullYear()} AdRuby. Alle Rechte vorbehalten. • 
            <span className="ml-2">Zahlungen sicher verarbeitet durch Stripe & PayPal</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdRubyPaymentVerification;
