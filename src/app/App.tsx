import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TrialBanner } from './components/TrialBanner';
import { TrialExpiredPaywall } from './components/TrialExpiredPaywall';
import { DashboardPageContent } from './components/DashboardRouter';
import { FullScreenLoader, FullScreenError } from './components/ui/FullScreenStates';
import { useStripeCheckout } from './hooks/useStripeCheckout';
import {
  type PageType,
  PAGE_PATHS,
  PUBLIC_PAGES,
  AUTH_HOLD_KEY,
  pageFromPathname,
  safeRedirectPath,
  allowRedirect,
} from './lib/routing';

// Re-export PageType for downstream consumers
export type { PageType } from './lib/routing';

// Lazy-load public / auth pages
const LandingPage = lazy(() => import('./components/LandingPage').then((mod) => ({ default: mod.LandingPage })));
const FeaturesPage = lazy(() => import('./components/FeaturesPage').then((mod) => ({ default: mod.FeaturesPage })));
const PricingPage = lazy(() => import('./components/PricingPage').then((mod) => ({ default: mod.PricingPage })));

const FeatureAIGenerator = lazy(() => import('./components/features/FeatureAIGenerator').then((mod) => ({ default: mod.FeatureAIGenerator })));
const FeatureCreativeLibrary = lazy(() => import('./components/features/FeatureCreativeLibrary').then((mod) => ({ default: mod.FeatureCreativeLibrary })));
const FeatureCampaignBuilder = lazy(() => import('./components/features/FeatureCampaignBuilder').then((mod) => ({ default: mod.FeatureCampaignBuilder })));
const FeatureAnalytics = lazy(() => import('./components/features/FeatureAnalytics').then((mod) => ({ default: mod.FeatureAnalytics })));
const FeatureAIAnalysis = lazy(() => import('./components/features/FeatureAIAnalysis').then((mod) => ({ default: mod.FeatureAIAnalysis })));

const LoginPage = lazy(() => import('./components/auth').then((mod) => ({ default: mod.LoginPage })));
const RegisterPage = lazy(() => import('./components/auth').then((mod) => ({ default: mod.RegisterPage })));
const AuthProcessingPage = lazy(() => import('./components/auth').then((mod) => ({ default: mod.AuthProcessingPage })));
const PaymentVerificationPage = lazy(() => import('./components/auth').then((mod) => ({ default: mod.PaymentVerificationPage })));
const PaymentSuccessPage = lazy(() => import('./components/auth').then((mod) => ({ default: mod.PaymentSuccessPage })));
const PaymentCancelledPage = lazy(() => import('./components/auth').then((mod) => ({ default: mod.PaymentCancelledPage })));
const AffiliatePage = lazy(() => import('./components/AffiliatePage').then((mod) => ({ default: mod.AffiliatePage })));
const ImpressumPage = lazy(() => import('./components/legal/ImpressumPage').then((mod) => ({ default: mod.ImpressumPage })));
const AGBPage = lazy(() => import('./components/legal/AGBPage').then((mod) => ({ default: mod.AGBPage })));
const DatenschutzPage = lazy(() => import('./components/legal/DatenschutzPage').then((mod) => ({ default: mod.DatenschutzPage })));
const WiderrufPage = lazy(() => import('./components/legal/WiderrufPage').then((mod) => ({ default: mod.WiderrufPage })));

import { ThemeProvider } from './components/ThemeProvider';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuthActions, useAuthState } from './contexts/AuthContext';
import { AffiliateProvider } from './contexts/AffiliateContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

/* ------------------------------------------------------------------ */
/*  Feature page definitions to reduce JSX repetition                  */
/* ------------------------------------------------------------------ */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FEATURE_PAGES: Array<{ page: PageType; Component: React.LazyExoticComponent<React.ComponentType<any>> }> = [
  { page: 'features', Component: FeaturesPage },
  { page: 'feature-ai-generator', Component: FeatureAIGenerator },
  { page: 'feature-creative-library', Component: FeatureCreativeLibrary },
  { page: 'feature-campaign-builder', Component: FeatureCampaignBuilder },
  { page: 'feature-analytics', Component: FeatureAnalytics },
  { page: 'feature-ai-analysis', Component: FeatureAIAnalysis },
  { page: 'pricing', Component: PricingPage },
];

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
  const { isAdmin, isCheckingRole } = useAdmin();

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

  const handleToggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  const handleSidebarNavigate = useCallback((page: PageType) => {
    go(page);
    setIsMobileSidebarOpen(false);
  }, [go]);

  useEffect(() => {
    const onPopState = () => setCurrentPage(pageFromPathname(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (currentPage === 'dashboard') localStorage.setItem('hasVisitedDashboard', 'true');
  }, [currentPage]);

  // ── Auth + subscription guards ──────────────────────────────────
  useEffect(() => {
    if (!isAuthReady) return;
    if (user && isLoading) return;
    if (user && profile == null) return;
    if (profileError) return;

    let holdAuthRedirect = false;
    try { holdAuthRedirect = sessionStorage.getItem(AUTH_HOLD_KEY) === '1'; } catch { holdAuthRedirect = false; }

    if (user && PUBLIC_PAGES.has(currentPage)) {
      let oauthRedirect = null;
      try { oauthRedirect = sessionStorage.getItem('adruby_oauth_redirect'); } catch { oauthRedirect = null; }
      const safePath = safeRedirectPath(oauthRedirect);
      if (safePath) {
        const targetPage = pageFromPathname(new URL(safePath, window.location.origin).pathname);
        if (allowRedirect(PAGE_PATHS[targetPage])) {
          try { sessionStorage.removeItem('adruby_oauth_redirect'); } catch { /* ignore */ }
          go(targetPage, { replace: true });
          return;
        }
      }
      // Logged-in user on the homepage → redirect to dashboard instantly
      if (currentPage === 'landing') {
        go('dashboard', { replace: true });
        return;
      }
    }

    if (user && (currentPage === 'login' || currentPage === 'register' || currentPage === 'auth-processing')) {
      if (holdAuthRedirect && currentPage === 'register') return;
      const params = new URLSearchParams(window.location.search);
      const redirectPath = safeRedirectPath(params.get('redirect')) || PAGE_PATHS.dashboard;
      const targetPage = pageFromPathname(new URL(redirectPath, window.location.origin).pathname);
      if (!billing.isSubscribed && targetPage !== 'settings') {
        if (allowRedirect(PAGE_PATHS.settings)) go('settings', { replace: true, query: { tab: 'billing' } });
      } else if (allowRedirect(PAGE_PATHS[targetPage])) {
        go(targetPage, { replace: true });
      }
      return;
    }

    const isProtected = !PUBLIC_PAGES.has(currentPage);
    if (!isProtected) return;

    if (!user) {
      if (allowRedirect(PAGE_PATHS.login)) go('login', { replace: true, query: { redirect: PAGE_PATHS[currentPage] } });
      return;
    }

    if (!billing.isSubscribed && currentPage !== 'settings') {
      if (allowRedirect(PAGE_PATHS.settings)) go('settings', { replace: true, query: { tab: 'billing' } });
    }
  }, [billing.isSubscribed, currentPage, go, isAuthReady, isLoading, profile, profileError, user]);

  const handleNavigate = useCallback(
    (page: PageType, query?: Record<string, string | undefined | null>) => go(page, { query }),
    [go]
  );

  const handleGoogleLogin = useCallback(
    async (redirectOverride?: string) => {
      const redirectPath =
        safeRedirectPath(redirectOverride ?? null) ||
        safeRedirectPath(new URLSearchParams(window.location.search).get('redirect')) ||
        PAGE_PATHS.dashboard;
      try { await signInWithGoogle(redirectPath); } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Google-Anmeldung fehlgeschlagen');
      }
    },
    [signInWithGoogle]
  );

  const handleAuthComplete = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectPath = safeRedirectPath(params.get('redirect')) || PAGE_PATHS.dashboard;
    go(pageFromPathname(new URL(redirectPath, window.location.origin).pathname), { replace: true });
  }, [go]);

  const isProtectedPage = !PUBLIC_PAGES.has(currentPage);
  const { startCheckout } = useStripeCheckout();

  useEffect(() => {
    const root = document.documentElement;
    if (isProtectedPage) root.classList.add('perf-lite');
    else root.classList.remove('perf-lite');
  }, [isProtectedPage]);

  // ── Detect OAuth callback hash — show dark screen instead of homepage flash
  const hasOAuthHash = window.location.hash.includes('access_token=');
  if (hasOAuthHash && !isAuthReady) {
    return <div className="min-h-screen bg-[#050507]" />;
  }

  // ── Full-screen guards ──────────────────────────────────────────
  if (!isAuthReady && isProtectedPage) {
    return <div className="min-h-screen bg-[#050507]" />;
  }
  if (user && isLoading && isProtectedPage) {
    return <div className="min-h-screen bg-[#050507]" />;
  }
  if (profileError && user) {
    return (
      <FullScreenError
        title="Profil nicht verfügbar"
        message={profileError}
        onRetry={() => refreshProfile().catch(() => undefined)}
        onSignOut={() => signOut().catch(() => undefined)}
      />
    );
  }

  // ── Determine if we're on a public page ─────────────────────────
  const isPublicView =
    PUBLIC_PAGES.has(currentPage) && !(currentPage === 'affiliate' && !!user);

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden">
      {/* Public / Auth Pages */}
      {isPublicView && (
        <Suspense fallback={<div className="min-h-screen bg-[#050507]" />}>
          {currentPage === 'landing' && (
            <LandingPage
              onGetStarted={() => go('register')}
              onLogin={() => go('login')}
              onNavigate={(page) => go(page as PageType)}
            />
          )}

          {FEATURE_PAGES.map(({ page, Component }) =>
            currentPage === page ? (
              <Component
                key={page}
                onNavigate={(p: string) => go(p as PageType)}
                onSignIn={() => go('login')}
                onGetStarted={() => go('register')}
              />
            ) : null
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
                  go(pageFromPathname(new URL(redirectPath, window.location.origin).pathname), { replace: true });
                } catch (err: unknown) {
                  toast.error(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen');
                }
              }}
              onNavigateToRegister={() => {
                const redirectPath = safeRedirectPath(new URLSearchParams(window.location.search).get('redirect'));
                go('register', { query: { redirect: redirectPath || undefined } });
              }}
              onForgotPassword={async (email) => {
                if (!email) { toast.info('Bitte gib zuerst deine E-Mail-Adresse ein'); return; }
                try { await resetPassword(email); toast.success('E-Mail zum Zurücksetzen des Passworts wurde gesendet'); } catch (err: unknown) {
                  toast.error(err instanceof Error ? err.message : 'Fehler beim Senden der E-Mail');
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
                try { await signInWithGoogle(redirectPath); } catch (err: unknown) {
                  toast.error(err instanceof Error ? err.message : 'Google-Anmeldung fehlgeschlagen');
                }
              }}
              onEmailRegister={async (name, email, password) => {
                try {
                  const result = await signUpWithEmail(name, email, password);
                  if (result === 'needs_confirmation') toast.success('Account erstellt. Bitte bestätige deine E-Mail, dann melde dich an.');
                  return result;
                } catch (err: unknown) {
                  toast.error(err instanceof Error ? err.message : 'Registrierung fehlgeschlagen');
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
            <AuthProcessingPage message="Du wirst angemeldet…" onComplete={handleAuthComplete} />
          )}

          {currentPage === 'payment-verification' && (
            <PaymentVerificationPage
              sessionId={new URLSearchParams(window.location.search).get('session_id') ?? undefined}
              onVerificationSuccess={() => go('payment-success', { replace: true })}
              onVerificationError={() => go('payment-cancelled', { replace: true })}
              onGoHome={() => go('landing', { replace: true })}
              onLogout={async () => { await signOut().catch(() => undefined); go('login', { replace: true }); }}
            />
          )}

          {currentPage === 'payment-success' && (
            <PaymentSuccessPage onGoToDashboard={() => go('dashboard', { replace: true })} />
          )}

          {currentPage === 'payment-cancelled' && (
            <PaymentCancelledPage
              onRetryCheckout={() => go('settings', { query: { tab: 'billing' } })}
              onViewPricing={() => go('pricing')}
              onGoHome={() => go('landing')}
            />
          )}

          {currentPage === 'affiliate' && !user && (
            <AffiliatePage
              onNavigate={(page) => go(page as PageType)}
              onSignIn={() => go('login')}
              onGetStarted={() => go('register')}
            />
          )}

          {currentPage === 'impressum' && (
            <ImpressumPage onNavigate={(p) => go(p as PageType)} />
          )}
          {currentPage === 'agb' && (
            <AGBPage onNavigate={(p) => go(p as PageType)} />
          )}
          {currentPage === 'datenschutz' && (
            <DatenschutzPage onNavigate={(p) => go(p as PageType)} />
          )}
          {currentPage === 'widerruf' && (
            <WiderrufPage onNavigate={(p) => go(p as PageType)} />
          )}
        </Suspense>
      )}

      {/* Dashboard Pages - With Sidebar/Header */}
      {!isPublicView && (
        <div className="flex min-h-screen" style={{ background: 'var(--background-gradient)' }}>
          {billing.statusLabel === 'Trial expired' && !profile?.payment_verified && (
            <TrialExpiredPaywall
              userEmail={user?.email}
              onUpgrade={() => user?.id && user?.email ? startCheckout(user.id, user.email) : toast.error('Bitte melde dich an, um fortzufahren')}
              onBackToLanding={() => go('landing', { replace: true })}
            />
          )}

          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={setIsSidebarCollapsed}
            currentPage={currentPage}
            onNavigate={handleSidebarNavigate}
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
            onLogout={async () => { await signOut().catch(() => undefined); go('landing', { replace: true }); }}
            displayName={profile?.full_name ?? null}
            planLabel={billing.statusLabel || null}
          />

          <div
            className={`flex-1 transition-[margin-left] duration-300 md:ml-0 w-full max-w-full overflow-x-hidden ${isMobileSidebarOpen ? 'pointer-events-none' : ''}`}
            style={{ marginLeft: isDesktop ? `${sidebarWidth}px` : '0' }}
          >
            <TrialBanner
              trialEndsAt={billing.trialEndsAt}
              statusLabel={billing.statusLabel}
              isPaid={Boolean(profile?.payment_verified)}
              onUpgrade={() => user?.id && user?.email ? startCheckout(user.id, user.email) : toast.error('Bitte melde dich an, um fortzufahren')}
            />
            <Header
              sidebarWidth={isDesktop ? sidebarWidth : 0}
              onToggleMobileSidebar={handleToggleMobileSidebar}
              onNavigate={go}
              currentPage={currentPage}
              currentCredits={profile?.credits ?? undefined}
              avatarUrl={profile?.avatar_url ?? null}
              displayName={profile?.full_name ?? null}
              email={profile?.email ?? user?.email ?? null}
              isTrialUser={!isCheckingRole && !isAdmin && (billing.statusLabel === 'Trial' || billing.statusLabel === 'Trial expired')}
              onUpgrade={() => user?.id && user?.email ? startCheckout(user.id, user.email) : toast.error('Bitte melde dich an, um fortzufahren')}
            />
            <DashboardPageContent currentPage={currentPage} onNavigate={handleNavigate} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <AffiliateProvider>
            <AdminProvider>
              <Toaster />
              <AppContent />
            </AdminProvider>
          </AffiliateProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
