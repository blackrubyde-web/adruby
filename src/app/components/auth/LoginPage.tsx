import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, Star, Shield, Zap } from 'lucide-react';
import { useParticles } from '../../hooks/useParticles';
import { stagger, fadeUp } from '../../lib/motion';

interface LoginPageProps {
  onGoogleLogin: () => void;
  onEmailLogin: (email: string, password: string) => void;
  onNavigateToRegister: () => void;
  onForgotPassword: (email: string) => void;
  authError?: string | null;
  isAuthReady?: boolean;
}



export function LoginPage({
  onGoogleLogin,
  onEmailLogin,
  onNavigateToRegister,
  onForgotPassword,
  authError,
  isAuthReady = true,
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const displayError = error || authError || '';
  const isDisabled = isLoading || !isAuthReady;

  // Shared particle hook
  const particles = useParticles(12);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Bitte gib E-Mail und Passwort ein');
      setIsLoading(false);
      return;
    }

    try {
      await onEmailLogin(email, password);
    } catch {
      setError('E-Mail oder Passwort ungültig');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-black overflow-hidden">
      {/* Left Side - Premium Visual */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(230,57,70,0.2),transparent_60%)] blur-[80px] animate-pulse-slow" />
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(60,60,255,0.08),transparent_60%)] blur-[100px] animate-float-delayed" />
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg">
          {/* Logo */}
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E63946] to-rose-600 flex items-center justify-center shadow-2xl glow-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <span className="font-black text-3xl text-white font-display">AdRuby</span>
          </motion.div>

          {/* Hero Text */}
          <motion.h1 variants={fadeUp} className="text-4xl xl:text-5xl font-black text-white leading-tight mb-6 font-display">
            Willkommen zurück,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] to-rose-500">
              Werbeheld.
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-white/60 mb-12">
            Deine KI-Ads warten auf dich. Melde dich an und erstelle weiter High-Performance Creatives.
          </motion.p>

          {/* Stats */}
          <motion.div variants={fadeUp} className="flex gap-8 mb-12">
            <div>
              <div className="text-3xl font-black text-white font-display">2.500+</div>
              <div className="text-sm text-white/40">Aktive Nutzer</div>
            </div>
            <div>
              <div className="text-3xl font-black text-[#E63946] font-display">14x</div>
              <div className="text-sm text-white/40">Ø ROAS</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white font-display">50K+</div>
              <div className="text-sm text-white/40">Ads erstellt</div>
            </div>
          </motion.div>

          {/* Testimonial */}
          <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <p className="text-white/80 italic mb-4">
              "Die KI-Varianten schlagen unsere Best-Performer um 22% CTR. Absolut game-changing."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                JS
              </div>
              <div>
                <div className="font-semibold text-white text-sm">Julia Schmidt</div>
                <div className="text-xs text-white/40">Performance Marketerin</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-zinc-950 to-black">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E63946] to-rose-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-white font-display">AdRuby</span>
          </div>

          {/* Card */}
          <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-white mb-2 font-display">Anmelden</h1>
              <p className="text-white/60">Melde dich an, um fortzufahren</p>
            </div>

            {/* Error Message — animated */}
            <AnimatePresence>
              {displayError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-500">Fehler</p>
                      <p className="text-sm text-red-500/80">{displayError}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Login — hover lift + shadow */}
            <motion.button
              onClick={onGoogleLogin}
              disabled={isDisabled}
              className="w-full py-4 bg-white text-black rounded-xl font-semibold transition-all flex items-center justify-center gap-3 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Mit Google anmelden
            </motion.button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-zinc-900/80 text-white/40">Oder mit E-Mail</span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  E-Mail Adresse
                </label>
                <div className="relative group">
                  <Mail className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#E63946] transition-colors" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="du@beispiel.de"
                    disabled={isDisabled}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#E63946]/50 focus:border-[#E63946]/50 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                  Passwort
                </label>
                <div className="relative group">
                  <Lock className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#E63946] transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isDisabled}
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#E63946]/50 focus:border-[#E63946]/50 transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onForgotPassword(email)}
                  className="text-sm text-[#E63946] hover:underline"
                >
                  Passwort vergessen?
                </button>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isDisabled}
                className="w-full py-4 bg-gradient-to-r from-[#c01830] via-rose-600 to-red-600 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                whileHover={!isDisabled ? { scale: 1.02, boxShadow: '0 0 30px rgba(230,57,70,0.35)' } : {}}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
              >
                {/* Shimmer */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />
                <span className="relative z-10 flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Anmelden...
                    </>
                  ) : (
                    <>
                      Anmelden
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center text-sm text-white/60">
              Noch kein Account?{' '}
              <button onClick={onNavigateToRegister} className="text-[#E63946] font-semibold hover:underline">
                7 Tage kostenlos testen
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <motion.div
            className="mt-8 flex items-center justify-center gap-6 text-xs text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              SSL verschlüsselt
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              DSGVO konform
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
