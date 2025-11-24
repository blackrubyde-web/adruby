import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    company: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp, signInWithGoogle, user, loading: authLoading, isSubscribed, subscriptionStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || !user) return;

    const hasActiveSub = typeof isSubscribed === 'function' ? isSubscribed() : false;
    if (hasActiveSub) {
      navigate('/overview-dashboard');
    } else {
      navigate('/payment-verification');
    }
  }, [user, authLoading, isSubscribed, subscriptionStatus, navigate]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error: signInError } = await signIn(formData?.email, formData?.password);
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await signUp(formData?.email, formData?.password, {
          firstName: formData?.firstName,
          lastName: formData?.lastName,
          companyName: formData?.company
        });
        if (signUpError) throw signUpError;
      }
      navigate('/');
    } catch (err) {
      setError(err?.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      console.log('[AuthTrace] Google login clicked', { path: window.location.pathname, ts: new Date().toISOString() });
      const { error: googleError } = await signInWithGoogle();
      if (googleError) throw googleError;
      // OAuth will handle redirect automatically, no need to manually navigate
    } catch (err) {
      console.error('[AuthTrace] Google signIn error', err, { ts: new Date().toISOString() });
      setError(err?.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {isLogin ? 'Willkommen zurück' : 'Konto erstellen'}
        </h1>
        <p className="text-muted-foreground">
          {isLogin 
            ? 'Melden Sie sich bei Ihrem Ad Builder Konto an' :'Erstellen Sie Ihr neues Ad Builder Konto'
          }
        </p>
      </div>
      {error && (
        <motion.div 
          className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} />
            <span>{error}</span>
          </div>
        </motion.div>
      )}
      {/* Google OAuth Button */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={formLoading || googleLoading}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium py-3 rounded-lg flex items-center justify-center space-x-3"
        >
          {googleLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-600 rounded-full animate-spin"></div>
              <span>Google-Anmeldung...</span>
            </div>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Mit Google {isLogin ? 'anmelden' : 'registrieren'}</span>
            </>
          )}
        </Button>
        
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <div className="px-4 text-sm text-gray-500">oder</div>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>
      </motion.div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLogin && (
          <>
            {/* First Row: First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Vorname *
                </label>
                <Input
                  type="text"
                  value={formData?.firstName}
                  onChange={(e) => handleInputChange('firstName', e?.target?.value)}
                  placeholder="Ihr Vorname"
                  disabled={formLoading || googleLoading}
                  required={!isLogin}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nachname *
                </label>
                <Input
                  type="text"
                  value={formData?.lastName}
                  onChange={(e) => handleInputChange('lastName', e?.target?.value)}
                  placeholder="Ihr Nachname"
                  disabled={formLoading || googleLoading}
                  required={!isLogin}
                  className="rounded-lg"
                />
              </div>
            </div>

            {/* Second Row: Company (full width) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Firma
              </label>
              <Input
                type="text"
                value={formData?.company}
                onChange={(e) => handleInputChange('company', e?.target?.value)}
                placeholder="Firmenname (optional)"
                disabled={formLoading || googleLoading}
                className="rounded-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional – wird im Dashboard anstelle deines Namens angezeigt.
              </p>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            E-Mail-Adresse
          </label>
          <Input
            type="email"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            placeholder="ihre-email@beispiel.de"
            disabled={formLoading || googleLoading}
            required
            className="rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Passwort
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={formData?.password}
              onChange={(e) => handleInputChange('password', e?.target?.value)}
              placeholder="Ihr Passwort"
              disabled={formLoading || googleLoading}
              required
              className="pr-10 rounded-lg"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={formLoading || googleLoading}
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#E50914] hover:bg-[#E50914]/90 text-white font-semibold py-3 rounded-lg"
          disabled={formLoading || googleLoading}
        >
          {formLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{isLogin ? 'Anmelden...' : 'Registrieren...'}</span>
            </div>
          ) : (
            isLogin ? 'Anmelden' : 'Konto erstellen'
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ email: '', password: '', firstName: '', lastName: '', company: '' });
            }}
            className="text-sm text-primary hover:text-primary/80 font-medium"
            disabled={formLoading || googleLoading}
          >
            {isLogin 
              ? 'Noch kein Konto? Hier registrieren' :'Bereits ein Konto? Hier anmelden'
            }
          </button>
        </div>
      </form>
      {/* Demo Credentials Section */}
      <motion.div 
        className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-semibold text-sm text-blue-800 mb-3 flex items-center space-x-2">
          <Icon name="User" size={16} className="text-blue-600" />
          <span>Demo-Anmeldedaten</span>
        </h3>
        <div className="space-y-2 text-xs text-blue-700">
          <div className="flex items-center justify-between bg-white/60 rounded px-2 py-1">
            <span className="font-medium">Admin:</span>
            <div className="text-right">
              <div>admin@adbuilder.com</div>
              <div className="text-blue-600">admin123</div>
            </div>
          </div>
          <div className="flex items-center justify-between bg-white/60 rounded px-2 py-1">
            <span className="font-medium">User:</span>
            <div className="text-right">
              <div>user@adbuilder.com</div>
              <div className="text-blue-600">user123</div>
            </div>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          Verwenden Sie diese Demo-Daten für einen schnellen Test des Systems
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoginForm;
