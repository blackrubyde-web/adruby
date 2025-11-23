import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import LogoutLoader from './components/LogoutLoader';
import LogoutConfirmation from './components/LogoutConfirmation';
import LogoutError from './components/LogoutError';

const SecureLogoutProcess = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [logoutStatus, setLogoutStatus] = useState('processing'); // processing, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const preventBackButton = () => {
    window.history?.pushState(null, null, window.location?.href);
  };

  useEffect(() => {
    // Prevent back button access after logout initiation
    window.history?.pushState(null, null, window.location?.href);
    window.addEventListener('popstate', preventBackButton);

    // Start logout process
    initiateSecureLogout();

    return () => {
      window.removeEventListener('popstate', preventBackButton);
    };
  }, []);

  const clearLocalStorage = () => {
    try {
      // Clear all cached data
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('user-preferences');
      localStorage.removeItem('dashboard-cache');
      localStorage.removeItem('campaign-drafts');
      localStorage.removeItem('analytics-cache');
      
      // Clear session storage
      sessionStorage.clear();
      
      // Clear any other cached data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.includes('blackruby') || key?.includes('supabase')) {
          keysToRemove?.push(key);
        }
      }
      keysToRemove?.forEach(key => localStorage.removeItem(key));
      
      return true;
    } catch (error) {
      console.error('Error clearing local storage:', error);
      return false;
    }
  };

  const initiateSecureLogout = async () => {
    try {
      setLogoutStatus('processing');
      
      // Step 1: Sign out from Supabase
      const { error } = await signOut();
      
      if (error) {
        throw new Error(`Logout failed: ${error.message}`);
      }

      // Step 2: Clear local storage and cached data
      const storageCleared = clearLocalStorage();
      
      if (!storageCleared) {
        console.warn('Some cached data may not have been cleared');
      }

      // Step 3: Clear authentication tokens
      document.cookie?.split(";")?.forEach(cookie => {
        const eqPos = cookie?.indexOf("=");
        const name = eqPos > -1 ? cookie?.substr(0, eqPos)?.trim() : cookie?.trim();
        if (name?.includes('supabase') || name?.includes('auth')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });

      // Step 4: Wait for cleanup completion
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 5: Set success status
      setLogoutStatus('success');
      
      // Step 6: Redirect after showing confirmation
      setTimeout(() => {
        navigate('/public-landing-home', { 
          replace: true,
          state: { logoutSuccess: true }
        });
      }, 2000);
      
    } catch (error) {
      console.error('Secure logout error:', error);
      setErrorMessage(error?.message);
      setLogoutStatus('error');
    }
  };

  const handleRetry = async () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setErrorMessage('');
      await initiateSecureLogout();
    } else {
      // Force navigation if too many retries
      navigate('/public-landing-home', { 
        replace: true,
        state: { logoutForced: true }
      });
    }
  };

  const handleForceLogout = () => {
    clearLocalStorage();
    navigate('/public-landing-home', { 
      replace: true,
      state: { logoutForced: true }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div 
        className="max-w-md w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            >
              <h1 className="text-2xl font-bold text-white mb-2">BlackRuby</h1>
              <p className="text-red-100 text-sm">Sichere Abmeldung</p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-8">
            {logoutStatus === 'processing' && (
              <LogoutLoader 
                user={user}
                message="Beende Session sicher..."
              />
            )}
            
            {logoutStatus === 'success' && (
              <LogoutConfirmation 
                message="Abmeldung erfolgreich"
                redirectMessage="Weiterleitung zur Startseite..."
              />
            )}
            
            {logoutStatus === 'error' && (
              <LogoutError 
                error={errorMessage}
                onRetry={handleRetry}
                onForceLogout={handleForceLogout}
                retryCount={retryCount}
                maxRetries={3}
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SecureLogoutProcess;