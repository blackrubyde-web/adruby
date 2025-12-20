import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
// Lazy-load most full pages to reduce initial bundle size
const LandingPage = lazy(() => import('./components/LandingPage').then((mod) => ({ default: mod.LandingPage })));
const FeaturesPage = lazy(() => import('./components/FeaturesPage').then((mod) => ({ default: mod.FeaturesPage })));
const PricingPage = lazy(() => import('./components/PricingPage').then((mod) => ({ default: mod.PricingPage })));
const AdsStrategiesPage = lazy(() => import('./components/AdsStrategiesPage').then((mod) => ({ default: mod.AdsStrategiesPage })));
const CampaignsPage = lazy(() => import('./components/CampaignsPage').then((mod) => ({ default: mod.CampaignsPage })));
const SettingsPage = lazy(() => import('./components/SettingsPage').then((mod) => ({ default: mod.SettingsPage })));
const AffiliatePage = lazy(() => import('./components/AffiliatePage').then((mod) => ({ default: mod.AffiliatePage })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then((mod) => ({ default: mod.ProfilePage })));
const HelpSupportPage = lazy(() => import('./components/HelpSupportPage').then((mod) => ({ default: mod.HelpSupportPage })));
const OverviewPage = lazy(() => import('./components/OverviewPage').then((mod) => ({ default: mod.OverviewPage })));
const LoginPage = lazy(() =>
  import('./components/auth').then((mod) => ({ default: mod.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('./components/auth').then((mod) => ({ default: mod.RegisterPage }))
);
const AuthProcessingPage = lazy(() =>
  import('./components/auth').then((mod) => ({ default: mod.AuthProcessingPage }))
);
const PaymentVerificationPage = lazy(() =>
  import('./components/auth').then((mod) => ({ default: mod.PaymentVerificationPage }))
);
const PaymentSuccessPage = lazy(() =>
  import('./components/auth').then((mod) => ({ default: mod.PaymentSuccessPage }))
);
const PaymentCancelledPage = lazy(() =>
  import('./components/auth').then((mod) => ({ default: mod.PaymentCancelledPage }))
);
import { ThemeProvider } from './components/ThemeProvider';
import { QuickActionsButton } from './components/QuickActionsButton';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuthActions, useAuthState } from './contexts/AuthContext';

const REDIRECT_GUARD_KEY = 'adruby_last_redirect';
const AUTH_HOLD_KEY = 'adruby_hold_auth_redirect';
const REDIRECT_COOLDOWN_MS = 1500;

function allowRedirect(pathname: string) {
  try {
    const raw = sessionStorage.getItem(REDIRECT_GUARD_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.path === pathname && Date.now() - parsed?.ts < REDIRECT_COOLDOWN_MS) {
        return false;
      }
    }
    sessionStorage.setItem(
      REDIRECT_GUARD_KEY,
      JSON.stringify({ path: pathname, ts: Date.now() })
    );
  } catch {
    return true;
  }
  return true;
}

// Page type - Extended with auth pages
export type PageType = 
  | 'landing' 
  | 'features'
  | 'pricing'
  | 'login' 
  | 'register' 
  | 'auth-processing' 
  | 'payment-verification' 
  | 'payment-success' 
  | 'payment-cancelled'
  | 'dashboard' 
  | 'analytics' 
  | 'adbuilder' 
  | 'creative-builder'
  | 'strategies' 
  | 'campaigns' 
  | 'aianalysis' 
  | 'settings' 
  | 'affiliate' 
  | 'profile' 
  | 'help';

const PAGE_PATHS: Record<PageType, string> = {
  landing: '/',
  features: '/features',
  pricing: '/pricing',
  login: '/login',
  register: '/register',
  'auth-processing': '/auth/callback',
  'payment-verification': '/payment-verification',
  'payment-success': '/payment-success',
  'payment-cancelled': '/payment-cancelled',
  dashboard: '/dashboard',
  analytics: '/analytics',
  adbuilder: '/adbuilder',
  'creative-builder': '/dashboard/creative-builder/new',
  strategies: '/strategies',
  campaigns: '/campaigns',
  aianalysis: '/aianalysis',
  settings: '/settings',
  affiliate: '/affiliate',
  profile: '/profile',
  help: '/help',
};

const PUBLIC_PAGES = new Set<PageType>([
  'landing',
  'features',
  'pricing',
  'login',
  'register',
  'auth-processing',
  'payment-verification',
  'payment-success',
  'payment-cancelled',
]);

function normalizePathname(pathname: string) {
  if (!pathname) return '/';
  if (pathname === '/') return '/';
  return pathname.replace(/\/+$/, '');
}

function pageFromPathname(pathname: string): PageType {
  const normalized = normalizePathname(pathname);
  const match = (Object.entries(PAGE_PATHS) as Array<[PageType, string]>).find(
    ([, p]) => p === normalized
  );
  return match?.[0] ?? 'landing';
}

function safeRedirectPath(raw: string | null) {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    if (!decoded.startsWith('/')) return null;
    return decoded;
  } catch {
    return null;
  }
}

function FullScreenLoader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <span className="font-bold text-2xl">AdRuby</span>
        </div>

        <div className="mb-6 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>

        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function FullScreenError({
  title,
  message,
  onRetry,
  onSignOut
}: {
  title: string;
  message: string;
  onRetry: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <span className="font-bold text-2xl">AdRuby</span>
        </div>

        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <p className="text-muted-foreground mb-6">{message}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold"
          >
            Retry profile load
          </button>
          <button
            onClick={onSignOut}
            className="px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-xl font-semibold"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

const LazyAdBuilderPage = lazy(() =>
  import('./components/AdBuilderPage').then((mod) => ({ default: mod.AdBuilderPage }))
);
const LazyCreativeBuilderPage = lazy(() =>
  import('./components/CreativeBuilderPage').then((mod) => ({ default: mod.CreativeBuilderPage }))
);
const LazyAnalyticsPage = lazy(() =>
  import('./components/AnalyticsPage').then((mod) => ({ default: mod.AnalyticsPage }))
);
const LazyAIAnalysisPage = lazy(() =>
  import('./components/AIAnalysisPage').then((mod) => ({ default: mod.AIAnalysisPage }))
);

function AppContent() {
  const { user, profile, billing, isAuthReady, isLoading, profileError, authError } = useAuthState();
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,
    refreshProfile,
  } = useAuthActions();

  const [currentPage, setCurrentPage] = useState<PageType>(() =>
    pageFromPathname(window.location.pathname)
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const sidebarWidth = isSidebarCollapsed ? 80 : 256;
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);

  const go = useCallback(
    (
      page: PageType,
      opts?: { replace?: boolean; query?: Record<string, string | undefined | null> }
    ) => {
      const pathname = PAGE_PATHS[page];
      const params = new URLSearchParams();
      const query = opts?.query || {};
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null || v === '') continue;
        params.set(k, String(v));
      }

      const url = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      if (opts?.replace) window.history.replaceState({}, document.title, url);
      else window.history.pushState({}, document.title, url);
      setCurrentPage(page);
    },
    []
  );

  useEffect(() => {
    const onPopState = () => {
      setCurrentPage(pageFromPathname(window.location.pathname));
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Mark as visited on mount
  useEffect(() => {
    if (currentPage === 'dashboard') {
      localStorage.setItem('hasVisitedDashboard', 'true');
    }
  }, [currentPage]);

  // Auth + subscription guards
  useEffect(() => {
  // Wait until auth init is completed and profile is available before redirecting.
  if (!isAuthReady) return;
  if (user && isLoading) return;
  if (user && profile == null) return; // ensure profile loaded so onboarding flag is respected
  if (profileError) return;

    let holdAuthRedirect = false;
    try {
      holdAuthRedirect = sessionStorage.getItem(AUTH_HOLD_KEY) === '1';
    } catch {
      holdAuthRedirect = false;
    }

    // Redirect signed-in users away from auth pages
    if (user && (currentPage === 'login' || currentPage === 'register' || currentPage === 'auth-processing')) {
      if (holdAuthRedirect && currentPage === 'register') return;
      const params = new URLSearchParams(window.location.search);
      const redirectPath = safeRedirectPath(params.get('redirect')) || PAGE_PATHS.dashboard;
      const targetPage = pageFromPathname(new URL(redirectPath, window.location.origin).pathname);

      if (!billing.isSubscribed && targetPage !== 'settings') {
        if (allowRedirect(PAGE_PATHS.settings)) {
          go('settings', { replace: true, query: { tab: 'billing' } });
        }
      } else if (allowRedirect(PAGE_PATHS[targetPage])) {
        go(targetPage, { replace: true });
      }
      return;
    }

    const isProtected = !PUBLIC_PAGES.has(currentPage);
    if (!isProtected) return;

    if (!user) {
      if (allowRedirect(PAGE_PATHS.login)) {
        go('login', { replace: true, query: { redirect: PAGE_PATHS[currentPage] } });
      }
      return;
    }

    if (!billing.isSubscribed && currentPage !== 'settings') {
      if (allowRedirect(PAGE_PATHS.settings)) {
        go('settings', { replace: true, query: { tab: 'billing' } });
      }
    }
  }, [billing.isSubscribed, currentPage, go, isAuthReady, isLoading, profileError, user]);

  const handleCreateAd = () => {
    go('adbuilder');
  };

  const handleGoogleLogin = useCallback(
    async (redirectOverride?: string) => {
      const redirectPath =
        safeRedirectPath(redirectOverride ?? null) ||
        safeRedirectPath(new URLSearchParams(window.location.search).get('redirect')) ||
        PAGE_PATHS.dashboard;
      try {
        await signInWithGoogle(redirectPath);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Google login failed';
        toast.error(message);
      }
    },
    [signInWithGoogle]
  );

  const handleAuthComplete = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectPath = safeRedirectPath(params.get('redirect')) || PAGE_PATHS.dashboard;
    const targetPage = pageFromPathname(new URL(redirectPath, window.location.origin).pathname);
    go(targetPage, { replace: true });
  }, [go]);

  const isProtectedPage = !PUBLIC_PAGES.has(currentPage);
  const pageFallback = (
    <FullScreenLoader title="Loading page..." subtitle="Preparing your workspace" />
  );

  if (!isAuthReady && isProtectedPage) {
    return <FullScreenLoader title="Loading session..." subtitle="Checking your login state" />;
  }

  if (user && isLoading && isProtectedPage) {
    return <FullScreenLoader title="Loading your account..." subtitle="Fetching your billing status" />;
  }

  if (profileError && user) {
    return (
      <FullScreenError
        title="Profile unavailable"
        message={profileError}
        onRetry={() => refreshProfile().catch(() => undefined)}
        onSignOut={() => signOut().catch(() => undefined)}
      />
    );
  }

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      {/* Auth Pages - Full Screen, No Sidebar/Header */}
      {(currentPage === 'landing' || 
        currentPage === 'features' ||
        currentPage === 'pricing' ||
        currentPage === 'login' || 
        currentPage === 'register' || 
        currentPage === 'auth-processing' || 
        currentPage === 'payment-verification' || 
        currentPage === 'payment-success' || 
        currentPage === 'payment-cancelled') && (
        <Suspense fallback={pageFallback}>
          <>
            {currentPage === 'landing' && (
              <LandingPage 
                onGetStarted={() => go('register')}
                onLogin={() => go('login')}
              />
            )}

            {currentPage === 'features' && (
              <FeaturesPage
                onNavigate={(page) => go(page as PageType)}
                onSignIn={() => go('login')}
                onGetStarted={() => go('register')}
              />
            )}

            {currentPage === 'pricing' && (
              <PricingPage
                onNavigate={(page) => go(page as PageType)}
                onSignIn={() => go('login')}
                onGetStarted={() => go('register')}
              />
            )}

            {currentPage === 'login' && (
              <LoginPage
                authError={authError}
                isAuthReady={isAuthReady}
                onGoogleLogin={() => handleGoogleLogin()}
                onEmailLogin={async (email, password) => {
                  const redirectPath =
                    safeRedirectPath(new URLSearchParams(window.location.search).get('redirect')) ||
                    PAGE_PATHS.dashboard;
                  try {
                    await signInWithEmail(email, password);
                    go(pageFromPathname(new URL(redirectPath, window.location.origin).pathname), {
                      replace: true
                    });
                  } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : 'Login failed';
                    toast.error(message);
                  }
                }}
                onNavigateToRegister={() => {
                  const redirectPath = safeRedirectPath(new URLSearchParams(window.location.search).get('redirect'));
                  go('register', { query: { redirect: redirectPath || undefined } });
                }}
                onForgotPassword={async (email) => {
                  if (!email) {
                    toast.info('Enter your email address first');
                    return;
                  }
                  try {
                    await resetPassword(email);
                    toast.success('Password reset email sent');
                  } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : 'Failed to send reset email';
                    toast.error(message);
                  }
                }}
              />
            )}

            {currentPage === 'register' && (
              <RegisterPage
                onGoogleRegister={async () => {
                  const redirectPath =
                    safeRedirectPath(new URLSearchParams(window.location.search).get('redirect')) ||
                    PAGE_PATHS.dashboard;
                  try {
                    await signInWithGoogle(redirectPath);
                  } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : 'Google login failed';
                    toast.error(message);
                  }
                }}
                onEmailRegister={async (name, email, password) => {
                  try {
                    const result = await signUpWithEmail(name, email, password);
                    if (result === 'needs_confirmation') {
                      toast.success('Account created. Please confirm your email, then sign in.');
                    }
                    return result;
                  } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : 'Registration failed';
                    toast.error(message);
                    throw err;
                  }
                }}
                onNavigateToLogin={() => {
                  sessionStorage.removeItem(AUTH_HOLD_KEY);
                  const redirectPath = safeRedirectPath(new URLSearchParams(window.location.search).get('redirect'));
                  go('login', { query: { redirect: redirectPath || undefined } });
                }}
                onProceedToPayment={() => {
                  sessionStorage.removeItem(AUTH_HOLD_KEY);
                  go('settings', { query: { tab: 'billing' } });
                }}
              />
            )}

            {currentPage === 'auth-processing' && (
              <AuthProcessingPage
                message="Logging you in..."
                onComplete={handleAuthComplete}
              />
            )}

            {currentPage === 'payment-verification' && (
              <PaymentVerificationPage
                sessionId={new URLSearchParams(window.location.search).get('session_id') ?? undefined}
                onVerificationSuccess={() => go('payment-success', { replace: true })}
                onVerificationError={() => go('payment-cancelled', { replace: true })}
                onGoHome={() => go('landing', { replace: true })}
                onLogout={async () => {
                  await signOut().catch(() => undefined);
                  go('login', { replace: true });
                }}
              />
            )}

            {currentPage === 'payment-success' && (
              <PaymentSuccessPage
                onGoToDashboard={() => go('dashboard', { replace: true })}
              />
            )}

            {currentPage === 'payment-cancelled' && (
              <PaymentCancelledPage
                onRetryCheckout={() => go('settings', { query: { tab: 'billing' } })}
                onViewPricing={() => go('pricing')}
                onGoHome={() => go('landing')}
              />
            )}
          </>
        </Suspense>
      )}

      {/* Dashboard Pages - With Sidebar/Header */}
      {currentPage !== 'landing' && 
       currentPage !== 'features' &&
       currentPage !== 'pricing' &&
       currentPage !== 'login' && 
       currentPage !== 'register' && 
       currentPage !== 'auth-processing' && 
       currentPage !== 'payment-verification' && 
       currentPage !== 'payment-success' && 
       currentPage !== 'payment-cancelled' && (
      <div className="flex min-h-screen" style={{ background: 'var(--background-gradient)' }}>
        {/* Sidebar */}
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={setIsSidebarCollapsed}
          currentPage={currentPage}
          onNavigate={(page) => {
            go(page);
            setIsMobileSidebarOpen(false); // Close sidebar when navigating
          }}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
          onLogout={async () => {
            await signOut().catch(() => undefined);
            go('landing', { replace: true });
          }}
        />

          {/* Main Content - Blurred when mobile sidebar is open */}
        <div 
          className={`flex-1 transition-all duration-300 md:ml-0 ${isMobileSidebarOpen ? 'blur-sm pointer-events-none' : ''}`}
          style={{ marginLeft: isDesktop ? `${sidebarWidth}px` : '0' }}
        >
          {/* Header */}
          <Header 
            sidebarWidth={isDesktop ? sidebarWidth : 0} 
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            onNavigate={(page) => go(page)}
          />

          {/* Page Content */}
          {currentPage === 'dashboard' && (
            <div className="pt-16 min-h-screen">
              <Suspense fallback={pageFallback}>
                <OverviewPage onNavigate={(page, query) => go(page as PageType, { query })} />
              </Suspense>
            </div>
          )}

          {currentPage === 'analytics' && (
            <div className="pt-16 min-h-screen">
              <Suspense fallback={pageFallback}>
                <LazyAnalyticsPage />
              </Suspense>
              <Footer />
            </div>
          )}

          {currentPage === 'strategies' && (
            <div className="pt-16 min-h-screen">
              <Suspense fallback={pageFallback}>
                <AdsStrategiesPage />
              </Suspense>
              <Footer />
            </div>
          )}

          {currentPage === 'campaigns' && (
            <div className="pt-16 min-h-screen">
              <Suspense fallback={pageFallback}>
                <CampaignsPage />
              </Suspense>
              <Footer />
            </div>
          )}

          {currentPage === 'aianalysis' && (
            <div className="pt-16 min-h-screen">
              <Suspense fallback={pageFallback}>
                <LazyAIAnalysisPage />
              </Suspense>
              <Footer />
            </div>
          )}

          {currentPage === 'settings' && (
            <div className="pt-16 min-h-screen">
              <Suspense fallback={pageFallback}>
                <SettingsPage />
              </Suspense>
              <Footer />
            </div>
          )}

          {currentPage === 'affiliate' && (
            <div className="pt-16 min-h-screen">
              <Suspense fallback={pageFallback}>
                <AffiliatePage />
              </Suspense>
              <Footer />
            </div>
          )}

          {currentPage === 'profile' && (
            <div className="pt-16 min-h-screen">
              <Suspense fallback={pageFallback}>
                <ProfilePage />
              </Suspense>
              <Footer />
            </div>
          )}

          {currentPage === 'help' && (
            <div className="pt-16 min-h-screen">
              <Suspense fallback={pageFallback}>
                <HelpSupportPage />
              </Suspense>
              <Footer />
            </div>
          )}

          {currentPage === 'adbuilder' && (
            <div className="pt-16 min-h-screen">
              <Suspense fallback={pageFallback}>
                <LazyAdBuilderPage />
              </Suspense>
              <Footer />
            </div>
          )}

          {currentPage === 'creative-builder' && (
            <div className="pt-16 min-h-screen">
              <Suspense fallback={pageFallback}>
                <LazyCreativeBuilderPage />
              </Suspense>
              <Footer />
            </div>
          )}
          
          {/* Quick Actions Button */}
          {currentPage === 'dashboard' && (
            <QuickActionsButton onCreateCampaign={handleCreateAd} />
          )}
        </div>
      </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster />
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
