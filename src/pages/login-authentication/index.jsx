import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './components/LoginForm';
import SecurityFeatures from './components/SecurityFeatures';

const LoginAuthentication = () => {
  const navigate = useNavigate();
  const { user, loading, onboardingStatus, isOnboardingComplete, isAuthReady } = useAuth();

  useEffect(() => {
    if (loading || !isAuthReady) {
      console.log('[LoginAuth] waiting', { loading, isAuthReady });
      return;
    }

    if (!user) {
      console.log('[LoginAuth] no user -> stay on login/registration page');
      return;
    }

    if (isOnboardingComplete(onboardingStatus)) {
      console.log('[LoginAuth] redirect to dashboard', { path: window.location.pathname });
      navigate('/overview-dashboard');
    } else {
      console.log('[LoginAuth] redirect to payment verification', { path: window.location.pathname });
      navigate('/payment-verification');
    }
  }, [user, loading, onboardingStatus, isOnboardingComplete, navigate, isAuthReady]);

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="relative min-h-screen flex">
        {/* Left Side - Security Features (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-card border-r border-border">
          <div className="flex items-center justify-center w-full p-12">
            <div className="max-w-md">
              <SecurityFeatures />
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 lg:w-1/2 xl:w-3/5">
          <div className="flex items-center justify-center min-h-screen p-6 lg:p-12">
            <div className="w-full max-w-md">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Security Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="lg:hidden bg-card border-t border-border p-6"
      >
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center space-x-6 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary text-xs font-medium">SSL</span>
              </div>
              <span className="text-sm text-muted-foreground">Verschlüsselt</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                <span className="text-success text-xs font-medium">✓</span>
              </div>
              <span className="text-sm text-muted-foreground">DSGVO</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Ihre Daten sind sicher und werden gemäß den europäischen Datenschutzbestimmungen verarbeitet.
          </p>
        </div>
      </motion.div>
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date()?.getFullYear()} BlackRuby Dashboard. Alle Rechte vorbehalten.
        </p>
      </div>
    </div>
  );
};

export default LoginAuthentication;
