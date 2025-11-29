import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import RegistrationForm from './components/RegistrationForm';
import RegistrationBenefits from './components/RegistrationBenefits';
import ProgressIndicator from './components/ProgressIndicator';

const AdRubyRegistration = () => {
  const navigate = useNavigate();
  const { session, isAuthReady, isSubscribed } = useAuth();
  const [registrationStep] = useState(1);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    if (!isAuthReady) return;

    if (session) {
      const hasSub = typeof isSubscribed === 'function' ? isSubscribed() : false;
      if (hasSub) {
        console.log('[Registration] session + subscription -> redirect dashboard');
        navigate('/overview-dashboard', { replace: true });
      } else {
        console.log('[Registration] session found -> redirect to payment verification');
        navigate('/payment-verification', { replace: true });
      }
    } else {
      setFormVisible(true);
    }
  }, [session, isAuthReady, isSubscribed, navigate]);

  if (!isAuthReady || (session && !formVisible)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C80000]"></div>
      </div>
    );
  }

  const handleRegistrationSuccess = () => {
    navigate('/payment-verification');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#C80000]/5 via-transparent to-[#C80000]/10" />
      <div className="relative min-h-screen">
        <div className="pt-8 pb-4">
          <div className="max-w-6xl mx-auto px-6">
            <ProgressIndicator currentStep={registrationStep} totalSteps={2} />
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-120px)]">
          <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 bg-white border-r border-gray-200">
            <div className="flex items-center justify-center w-full p-12">
              <div className="max-w-md w-full">
                <RegistrationBenefits />
              </div>
            </div>
          </div>

          <div className="flex-1 lg:w-3/5 xl:w-1/2">
            <div className="flex items-center justify-center min-h-full p-6 lg:p-12">
              <div className="w-full max-w-md">
                <RegistrationForm onSuccess={handleRegistrationSuccess} />
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:hidden bg-white border-t border-gray-200 p-6"
        >
          <div className="max-w-md mx-auto">
            <RegistrationBenefits compact={true} />
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-center bg-gradient-to-t from-white/80 to-transparent">
          <p className="text-xs text-gray-500">
            © {new Date()?.getFullYear()} AdRuby. Alle Rechte vorbehalten. • 
            <span className="ml-2">Sicher verschlüsselt durch SSL</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdRubyRegistration;
