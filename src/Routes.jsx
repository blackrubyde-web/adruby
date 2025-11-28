import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

// Import all existing pages
import PublicLandingHome from './pages/public-landing-home';
import PublicServiceOverview from './pages/public-service-overview';
import PublicPricingPlans from './pages/public-pricing-plans';
import LoginAuthentication from './pages/login-authentication';
import OverviewDashboard from './pages/overview-dashboard';
import AppBuilderInterface from './pages/app-builder-interface';
import AiAnalysisPanel from './pages/ai-analysis-panel';
import AdStrategy from './pages/ad-strategy';
import CampaignsManagement from './pages/campaigns-management';
import ProfileManagement from './pages/profile-management';
import SettingsConfiguration from './pages/settings-configuration';
import HelpSupportCenter from './pages/help-support-center';
import SecureLogoutProcess from './pages/secure-logout-process';
import NotFound from './pages/NotFound';

// Import new Credits page
import CreditsPage from './pages/credits';
import AdRubyAdBuilder from './pages/ad-ruby-ad-builder';
import AdRubyAdStrategies from './pages/ad-ruby-ad-strategies';
import AdRubyAiAnalysis from './pages/ad-ruby-ai-analysis';
import AdRubyCreativeInsights from './pages/ad-ruby-creative-insights';
import AffiliatePage from './pages/affiliate';

// Import new AdRuby Onboarding pages
import AdRubyRegistration from './pages/ad-ruby-registration';
import AdRubyPaymentVerification from './pages/ad-ruby-payment-verification';
import PaymentSuccess from './pages/payment-success';
import AdminDashboard from './pages/admin-dashboard';

const ADMIN_ALLOWED_USER_ROUTES = [
  '/admin-dashboard',
  '/profile-management',
  '/settings-configuration',
  '/help-support-center',
  '/affiliate',
  '/credits'
];

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthReady, isSubscribed, isAdmin } = useAuth();
  const location = useLocation();

  console.log('[AuthTrace] ProtectedRoute check', {
    isAuthReady,
    hasSession: !!user,
    hasActiveSubscription: isSubscribed?.(),
    pathname: location.pathname,
    ts: new Date().toISOString()
  });

  if (!isAuthReady || loading) {
    console.log('[AuthTrace] ProtectedRoute auth not ready, waiting…', {
      pathname: location.pathname,
      ts: new Date().toISOString()
    });
    return null;
  }

  if (!user) {
    console.log('[AuthTrace] ProtectedRoute no session → redirect /ad-ruby-registration', {
      pathname: location.pathname,
      ts: new Date().toISOString()
    });
    return <Navigate to="/ad-ruby-registration" replace />;
  }

  if (isAdmin && location?.pathname && !ADMIN_ALLOWED_USER_ROUTES.includes(location.pathname)) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (!isSubscribed?.()) {
    console.log('[AuthTrace] ProtectedRoute no subscription → redirect /payment-verification', {
      pathname: location.pathname,
      ts: new Date().toISOString()
    });
    return <Navigate to="/payment-verification" replace />;
  }

  console.log('[AuthTrace] ProtectedRoute access granted to protected route', {
    pathname: location.pathname,
    ts: new Date().toISOString()
  });
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { user, userProfile, loading, isAuthReady } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isVerifiedAdmin, setIsVerifiedAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      if (!isAuthReady || loading) return;
      if (!user) {
        setIsVerifiedAdmin(false);
        setChecking(false);
        return;
      }

      if (userProfile?.role === 'admin') {
        setIsVerifiedAdmin(true);
        setChecking(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin', {
          token_user_id: user.id
        });
        if (error) throw error;
        if (!cancelled) {
          setIsVerifiedAdmin(!!data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[AdminRoute] is_admin rpc failed', err);
          setIsVerifiedAdmin(false);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [isAuthReady, loading, user, userProfile?.role]);

  if (!isAuthReady || loading || checking) {
    return null;
  }

  if (!user) {
    return <Navigate to="/ad-ruby-registration" replace />;
  }

  if (!isVerifiedAdmin) {
    return <Navigate to="/overview-dashboard" replace />;
  }

  return children;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <ScrollToTop />
          <RouterRoutes>
            {/* Home Page - First page users see when visiting the domain */}
            <Route path="/" element={<PublicLandingHome />} />
            <Route path="/services" element={<PublicServiceOverview />} />
            <Route path="/pricing" element={<PublicPricingPlans />} />
            <Route path="/login-authentication" element={<LoginAuthentication />} />

            {/* AdRuby Onboarding Flow */}
            <Route path="/signup" element={<AdRubyRegistration />} />
            <Route path="/payment-verification" element={<AdRubyPaymentVerification />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/ad-ruby-registration" element={<AdRubyRegistration />} />

            {/* New AdRuby Feature Pages */}
            <Route path="/ad-ruby-ad-builder" element={<AdRubyAdBuilder />} />
            <Route path="/ad-ruby-ad-strategies" element={<AdRubyAdStrategies />} />
            <Route path="/ad-ruby-ai-analysis" element={<AdRubyAiAnalysis />} />
            <Route path="/ad-ruby-creative-insights" element={<AdRubyCreativeInsights />} />

            {/* Protected Dashboard Routes */}
            <Route path="/overview-dashboard" element={<ProtectedRoute><OverviewDashboard /></ProtectedRoute>} />
            <Route path="/app-builder-interface" element={<ProtectedRoute><AppBuilderInterface /></ProtectedRoute>} />
            <Route path="/ai-analysis-panel" element={<ProtectedRoute><AiAnalysisPanel /></ProtectedRoute>} />
            <Route path="/strategy" element={<ProtectedRoute><AdStrategy /></ProtectedRoute>} />
            <Route path="/campaigns-management" element={<ProtectedRoute><CampaignsManagement /></ProtectedRoute>} />
            <Route path="/affiliate" element={<ProtectedRoute><AffiliatePage /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />

            {/* User Management Routes */}
            <Route path="/profile-management" element={<ProtectedRoute><ProfileManagement /></ProtectedRoute>} />
            <Route path="/settings-configuration" element={<ProtectedRoute><SettingsConfiguration /></ProtectedRoute>} />
            <Route path="/help-support-center" element={<ProtectedRoute><HelpSupportCenter /></ProtectedRoute>} />
            <Route path="/secure-logout-process" element={<SecureLogoutProcess />} />

            {/* Credits Management Route */}
            <Route path="/credits" element={<ProtectedRoute><CreditsPage /></ProtectedRoute>} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
