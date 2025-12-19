import { useEffect, useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, Check, AlertCircle } from 'lucide-react';

const DRAFT_KEY = 'ad_ruby_registration_draft';
const AUTH_HOLD_KEY = 'adruby_hold_auth_redirect';

type RegistrationDraft = {
  name?: string;
  email?: string;
  acceptTerms?: boolean;
  updatedAt?: string;
};

interface RegisterPageProps {
  onGoogleRegister: () => void;
  onEmailRegister: (
    name: string,
    email: string,
    password: string
  ) => Promise<'signed_in' | 'needs_confirmation'>;
  onNavigateToLogin: () => void;
  onProceedToPayment: () => void;
}

export function RegisterPage({
  onGoogleRegister,
  onEmailRegister,
  onNavigateToLogin,
  onProceedToPayment,
}: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<RegistrationDraft | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [submissionState, setSubmissionState] = useState<'idle' | 'success' | 'needs_confirmation'>(
    'idle'
  );
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [redirectCancelled, setRedirectCancelled] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as RegistrationDraft;
      if (parsed?.name || parsed?.email) {
        setDraft(parsed);
        setShowResumePrompt(true);
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    if (!name && !email) {
      localStorage.removeItem(DRAFT_KEY);
      return;
    }

    const nextDraft: RegistrationDraft = {
      name,
      email,
      acceptTerms,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(nextDraft));
  }, [acceptTerms, email, name]);

  useEffect(() => {
    if (submissionState !== 'success' || redirectCancelled) return;
    if (redirectCountdown <= 0) {
      onProceedToPayment();
      return;
    }
    const timer = window.setTimeout(() => {
      setRedirectCountdown((prev) => prev - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [onProceedToPayment, redirectCancelled, redirectCountdown, submissionState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      setIsLoading(false);
      return;
    }

    try {
      const result = await onEmailRegister(name, email, password);
      if (result === 'signed_in') {
        setSubmissionState('success');
        setRedirectCountdown(5);
        setRedirectCancelled(false);
        localStorage.removeItem(DRAFT_KEY);
        try {
          sessionStorage.setItem(AUTH_HOLD_KEY, '1');
        } catch {
          // ignore
        }
      } else {
        setSubmissionState('needs_confirmation');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    'Unlimited AI ad creatives',
    '1,000 credits to start',
    'Real-time analytics',
    'Multi-platform support',
    'Advanced targeting',
    'Priority support',
  ];

  const resumeDraft = () => {
    if (!draft) return;
    setName(draft.name || '');
    setEmail(draft.email || '');
    setAcceptTerms(Boolean(draft.acceptTerms));
    setShowResumePrompt(false);
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraft(null);
    setShowResumePrompt(false);
  };

  const steps = [
    { id: 1, label: 'Account' },
    { id: 2, label: 'Business' },
    { id: 3, label: 'Checkout' }
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Benefits Panel */}
          <div className="hidden lg:block">
            <div className="max-w-md">
              {/* Logo */}
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-2xl">AdRuby</span>
              </div>

              <h1 className="text-4xl font-bold mb-4">
                Start your
                <br />
                <span className="text-primary">7-day free trial</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Join 50,000+ marketing professionals creating high-converting Facebook Ads with AI.
              </p>

              {/* Benefits List */}
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Trust Badge */}
              <div className="mt-8 p-4 bg-muted/50 border border-border rounded-xl">
                <p className="text-sm text-muted-foreground">
                  💳 No credit card required for trial
                  <br />
                  🔒 Enterprise-grade security
                  <br />
                  ✨ Cancel anytime, no questions asked
                </p>
              </div>
            </div>
          </div>

          {/* Right: Registration Form */}
          <div>
            <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-2xl">AdRuby</span>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Create your account</h2>
                <p className="text-muted-foreground">Start your free trial today</p>
              </div>

              {/* Progress Cluster */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-3">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${
                          step.id === 1
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        {step.id}
                      </div>
                      <div className="text-xs text-muted-foreground">{step.label}</div>
                      {index < steps.length - 1 && <div className="w-8 h-px bg-border" />}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground text-center">Step 1 of 3</p>
              </div>

              {submissionState === 'success' && (
                <div className="mb-6 p-5 border border-green-500/20 bg-green-500/10 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Account created</h3>
                      <p className="text-sm text-muted-foreground">
                        Your account is ready. Continue to checkout to activate your plan.
                      </p>
                      <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={onProceedToPayment}
                          className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold"
                        >
                          Continue to payment
                        </button>
                        <button
                          onClick={() => setRedirectCancelled(true)}
                          className="px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-xl font-semibold"
                        >
                          {redirectCancelled ? 'Auto-redirect cancelled' : 'Cancel auto-redirect'}
                        </button>
                      </div>
                      {!redirectCancelled && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Redirecting in {redirectCountdown}s...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {submissionState === 'needs_confirmation' && (
                <div className="mb-6 p-5 border border-border bg-muted/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Confirm your email</h3>
                      <p className="text-sm text-muted-foreground">
                        We sent a confirmation link to {email || 'your email'}. Please verify, then
                        sign in.
                      </p>
                      <button
                        onClick={onNavigateToLogin}
                        className="mt-4 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold"
                      >
                        Go to login
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && submissionState === 'idle' && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-600">Error</p>
                    <p className="text-sm text-red-600/80">{error}</p>
                  </div>
                </div>
              )}

              {showResumePrompt && submissionState === 'idle' && (
                <div className="mb-6 p-4 bg-muted/40 border border-border rounded-xl flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">Resume your draft?</div>
                    <p className="text-sm text-muted-foreground">
                      We found an unfinished signup. Pick up where you left off.
                    </p>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={resumeDraft}
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
                      >
                        Resume draft
                      </button>
                      <button
                        onClick={discardDraft}
                        className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-semibold"
                      >
                        Start fresh
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Google Register */}
              {submissionState === 'idle' && (
                <button
                  onClick={onGoogleRegister}
                  disabled={isLoading}
                  className="w-full py-3 border-2 border-border rounded-xl font-medium hover:bg-accent transition-colors flex items-center justify-center gap-3 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </button>
              )}

              {/* Divider */}
              {submissionState === 'idle' && (
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-card text-muted-foreground">Or sign up with email</span>
                  </div>
                </div>
              )}

              {/* Email Registration Form */}
              {submissionState === 'idle' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={isLoading}
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      disabled={isLoading}
                      className="w-full pl-11 pr-12 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Start Free Trial
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                </form>
              )}

              {/* Login Link */}
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button onClick={onNavigateToLogin} className="text-primary font-medium hover:underline">
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
