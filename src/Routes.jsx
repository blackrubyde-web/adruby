import React from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import PublicLandingHome from './pages/public-landing-home';
import PublicServiceOverview from './pages/public-service-overview';
import PublicPricingPlans from './pages/public-pricing-plans';
import LoginPage from './pages/login';
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
import CreditsPage from './pages/credits';
import AdRubyAdBuilder from './pages/ad-ruby-ad-builder';
import AdRubyAdStrategies from './pages/ad-ruby-ad-strategies';
import AdRubyAiAnalysis from './pages/ad-ruby-ai-analysis';
import AdRubyCreativeInsights from './pages/ad-ruby-creative-insights';
import AffiliatePage from './pages/affiliate';
import AdRubyRegistration from './pages/ad-ruby-registration';
import PaymentVerificationPage from './pages/payment-verification';
import PaymentSuccess from './pages/payment-success';
import AdminDashboard from './pages/admin-dashboard';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <ScrollToTop />
          <RouterRoutes>
            <Route path="/" element={<PublicLandingHome />} />
            <Route path="/services" element={<PublicServiceOverview />} />
            <Route path="/pricing" element={<PublicPricingPlans />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login-authentication" element={<LoginAuthentication />} />

            <Route path="/signup" element={<AdRubyRegistration />} />
            <Route path="/payment-verification" element={<PaymentVerificationPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/ad-ruby-registration" element={<AdRubyRegistration />} />

            <Route path="/ad-ruby-ad-builder" element={<AdRubyAdBuilder />} />
            <Route path="/ad-ruby-ad-strategies" element={<AdRubyAdStrategies />} />
            <Route path="/ad-ruby-ai-analysis" element={<AdRubyAiAnalysis />} />
            <Route path="/ad-ruby-creative-insights" element={<AdRubyCreativeInsights />} />

            <Route
              path="/overview-dashboard"
              element={
                <ProtectedRoute>
                  <OverviewDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app-builder-interface"
              element={
                <ProtectedRoute>
                  <AppBuilderInterface />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-analysis-panel"
              element={
                <ProtectedRoute>
                  <AiAnalysisPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ad-strategy"
              element={
                <ProtectedRoute>
                  <AdStrategy />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns-management"
              element={
                <ProtectedRoute>
                  <CampaignsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/affiliate"
              element={
                <ProtectedRoute>
                  <AffiliatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            <Route
              path="/profile-management"
              element={
                <ProtectedRoute>
                  <ProfileManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings-configuration"
              element={
                <ProtectedRoute>
                  <SettingsConfiguration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help-support-center"
              element={
                <ProtectedRoute>
                  <HelpSupportCenter />
                </ProtectedRoute>
              }
            />
            <Route path="/secure-logout-process" element={<SecureLogoutProcess />} />

            <Route
              path="/credits"
              element={
                <ProtectedRoute>
                  <CreditsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
