import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { Loader2 } from 'lucide-react';

// Auth Pages
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import TwoFactorPage from '@/features/auth/pages/TwoFactorPage';
import OAuthCallbackPage from '@/features/auth/pages/OAuthCallbackPage';

// Lazy loaded pages
const ChatPage = lazy(() => import('@/features/chat/pages/ChatPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));
const SearchPage = () => <div>Search Feature</div>;

const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="echosphere-theme">
      <AuthProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <OfflineBanner />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/auth/2fa" element={<TwoFactorPage />} />
                <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
                
                {/* Protected Routes */}
                <Route element={<AuthGuard />}>
                  <Route element={<MainLayout />}>
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/search" element={<SearchPage />} />
                  </Route>
                </Route>

                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/chat" replace />} />
              </Routes>
            </Suspense>
            <Toaster />
          </BrowserRouter>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
