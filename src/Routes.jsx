import React from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './contexts/AuthContext';

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

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthReady, isSubscribed } = useAuth();
  const location = useLocation();

  console.log('[AuthTrace] ProtectedRoute check', {
    isAuthReady,
    hasSession: !!user,
    hasActiveSubscription: isSubscribed?.(),
    pathname: location.pathname,
    ts: new Date().toISOString()
  });

  if (!isAuthReady || loading) {
    console.log('[AuthTrace] ProtectedRoute auth not ready, waiting…', { pathname: location.pathname, ts: new Date().toISOString() });
    return null;
  }

  if (!user) {
    console.log('[AuthTrace] ProtectedRoute no session → redirect /ad-ruby-registration', { pathname: location.pathname, ts: new Date().toISOString() });
    return <Navigate to="/ad-ruby-registration" replace />;
  }

  if (!isSubscribed?.()) {
    console.log('[AuthTrace] ProtectedRoute no subscription → redirect /payment-verification', { pathname: location.pathname, ts: new Date().toISOString() });
    return <Navigate to="/payment-verification" replace />;
  }

  console.log('[AuthTrace] ProtectedRoute access granted to protected route', { pathname: location.pathname, ts: new Date().toISOString() });
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
