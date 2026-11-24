import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { HeritageDetailPage } from './pages/HeritageDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { StoriesPage } from './pages/StoriesPage';
import { StoryDetailPage } from './pages/StoryDetailPage';
import { ContributePage } from './pages/ContributePage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginPage } from './pages/LoginPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { HeritageDashboardPage } from './pages/HeritageDashboardPage';
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/legal/TermsOfServicePage';
import { RefundPolicyPage } from './pages/legal/RefundPolicyPage';
import { CookiePolicyPage } from './pages/legal/CookiePolicyPage';
import { DataDeletionPage } from './pages/legal/DataDeletionPage';
import { UnsubscribePage } from './pages/legal/UnsubscribePage';
import { AttributionPage } from './pages/legal/AttributionPage';
import { CursorEffect } from './components/cursor/CursorEffect';
import { CookieConsentBanner } from './components/common/CookieConsentBanner';

// Helper to scroll to top on page navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

// Router that selectively presents the opening slideshow gateway or the full digital museum
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isGuest } = useAuth();
  const showOpeningGateway = !isAuthenticated && !isGuest;

  return (
    <Routes>
      {/* Dedicated Login Gateway */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Legal & Compliance Routes (Available to all visitors) */}
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      <Route path="/refund-policy" element={<RefundPolicyPage />} />
      <Route path="/cookie-policy" element={<CookiePolicyPage />} />
      <Route path="/cookies" element={<CookiePolicyPage />} />
      <Route path="/data-deletion" element={<DataDeletionPage />} />
      <Route path="/unsubscribe" element={<UnsubscribePage />} />
      <Route path="/attribution" element={<AttributionPage />} />

      {/* Opening Gateway on Initial Visit, or Main Platform Home once logged in / guest */}
      {showOpeningGateway ? (
        <Route path="/" element={<LoginPage />} />
      ) : (
        <Route path="/" element={<HeritageDashboardPage />} />
      )}

      {/* Heritage Social Community Feed Dashboard routes */}
      <Route path="/feed" element={<HeritageDashboardPage />} />
      <Route path="/home" element={<HeritageDashboardPage />} />
      <Route path="/explore" element={<HeritageDashboardPage />} />
      <Route path="/map" element={<HeritageDashboardPage />} />
      <Route path="/profile" element={<HeritageDashboardPage />} />
      <Route path="/reels" element={<HeritageDashboardPage />} />
      <Route path="/communities" element={<HeritageDashboardPage />} />
      <Route path="/messages" element={<HeritageDashboardPage />} />
      <Route path="/notifications" element={<HeritageDashboardPage />} />

      {/* Full Platform Layout Routes */}
      <Route element={<Layout />}>
        <Route path="/portal" element={<HomePage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/heritage/:slug" element={<HeritageDetailPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/stories/:slug" element={<StoryDetailPage />} />
        <Route path="/contribute" element={<ContributePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CursorEffect />
        <CookieConsentBanner />
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
