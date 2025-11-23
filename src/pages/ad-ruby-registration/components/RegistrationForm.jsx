import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';

const RegistrationForm = ({ onSuccess }) => {
  const { signUp, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const validateForm = () => {
    if (!formData?.firstName?.trim()) return 'Vorname ist erforderlich';
    if (!formData?.lastName?.trim()) return 'Nachname ist erforderlich';
    if (!formData?.email?.trim()) return 'E-Mail ist erforderlich';
    if (formData?.password?.length < 8) return 'Passwort muss mindestens 8 Zeichen haben';
    if (formData?.password !== formData?.confirmPassword) return 'Passwörter stimmen nicht überein';
    if (!formData?.agreeToTerms) return 'Bitte akzeptieren Sie die Nutzungsbedingungen';
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleManualRegistration = async (e) => {
    e?.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await signUp(
        formData?.email,
        formData?.password,
        {
          firstName: formData?.firstName,
          lastName: formData?.lastName,
          fullName: `${formData?.firstName} ${formData?.lastName}`
        }
      );

      if (signUpError) throw signUpError;

      // If email confirmation is required, show message
      if (data?.user && !data?.user?.email_confirmed_at) {
        setError('Bitte überprüfen Sie Ihre E-Mail und klicken Sie auf den Bestätigungslink, bevor Sie fortfahren.');
        setIsLoading(false);
        return;
      }

      // Success - navigate to payment verification
      onSuccess?.();
    } catch (err) {
      console.error('Registration error:', err);
      setError(err?.message || 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Check if Google OAuth is properly configured
      const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
      
      if (!googleClientId) {
        throw new Error('Google OAuth ist nicht konfiguriert. Bitte wenden Sie sich an den Support.');
      }

      const { data, error: googleError } = await signInWithGoogle();
      
      if (googleError) {
        throw googleError;
      }

      // Google OAuth will handle the redirect automatically
      // The user will be redirected to /payment-verification after successful authentication
      console.log('Google OAuth initiated successfully', data);
      
    } catch (err) {
      console.error('Google signup error:', err);
      setError(err?.message || 'Google-Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-[#C80000] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">AR</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-[#111111] mb-2">
          Willkommen bei AdRuby
        </h1>
        <p className="text-gray-600">
          Starten Sie Ihre kostenlose 7-Tage-Testversion – heute keine Zahlung
        </p>
      </div>
      {/* Google Registration Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full mb-6 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-[#111111] shadow-sm transition-all duration-200"
        onClick={handleGoogleSignup}
        disabled={isLoading}
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#111111] mr-2"></div>
            Anmeldung läuft...
          </div>
        ) : (
          'Mit Google anmelden'
        )}
      </Button>
      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">oder</span>
        </div>
      </div>
      {/* Manual Registration Form */}
      <form onSubmit={handleManualRegistration} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              Vorname *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData?.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C80000] focus:border-transparent transition-colors"
              placeholder="Max"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Nachname *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData?.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C80000] focus:border-transparent transition-colors"
              placeholder="Mustermann"
              required
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-Mail-Adresse *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData?.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C80000] focus:border-transparent transition-colors"
            placeholder="max@example.com"
            required
          />
        </div>

        {/* Password Fields */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Passwort *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData?.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C80000] focus:border-transparent transition-colors"
            placeholder="Mindestens 8 Zeichen"
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Passwort bestätigen *
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData?.confirmPassword}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C80000] focus:border-transparent transition-colors"
            placeholder="Passwort wiederholen"
            required
          />
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData?.agreeToTerms}
            onChange={handleInputChange}
            className="mt-1 w-4 h-4 text-[#C80000] border-gray-300 rounded focus:ring-[#C80000]"
          />
          <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
            Ich stimme den{' '}
            <a href="/terms" className="text-[#C80000] hover:underline">
              Nutzungsbedingungen
            </a>{' '}
            und der{' '}
            <a href="/privacy" className="text-[#C80000] hover:underline">
              Datenschutzerklärung
            </a>{' '}
            zu. *
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-[#C80000] hover:bg-[#A00000] text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Registrierung läuft...
            </div>
          ) : (
            'Kostenlose Testversion starten'
          )}
        </Button>
      </form>
      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Bereits ein Konto?{' '}
          <a href="/login-authentication" className="text-[#C80000] hover:underline font-medium">
            Hier anmelden
          </a>
        </p>
      </div>
    </motion.div>
  );
};

export default RegistrationForm;
