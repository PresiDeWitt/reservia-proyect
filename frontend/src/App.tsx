import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import RequireRole from './components/RequireRole';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const RestaurantDetails = lazy(() => import('./pages/RestaurantDetails'));
const MapExplorer = lazy(() => import('./pages/MapExplorer'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const BookingError = lazy(() => import('./pages/BookingError'));
const FloorPlan3D = lazy(() => import('./pages/FloorPlan3D'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const StaffAccess = lazy(() => import('./pages/StaffAccess'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const HIDE_FOOTER = ['/floor', '/staff'];
const HIDE_CHAT = ['/floor', '/staff', '/owner', '/admin'];

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const AppShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const hideFooter = HIDE_FOOTER.some((p) => location.pathname.startsWith(p));
  const hideChat = HIDE_CHAT.some((p) => location.pathname.startsWith(p));

  // Owners and admins are confined to their dashboard.
  useEffect(() => {
    if (user?.role === 'owner' && location.pathname !== '/owner') {
      navigate('/owner', { replace: true });
    } else if (user?.role === 'admin' && location.pathname !== '/admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface)' }}>
      <ScrollToTop />
      <Header />
      <main style={{ flex: 1 }}>
        <ErrorBoundary key={location.pathname}>
        <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/restaurant/:id" element={<RestaurantDetails />} />
            <Route path="/floor/:id" element={<FloorPlan3D />} />
            <Route path="/map" element={<MapExplorer />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/profile" element={<AccountPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/booking-error" element={<BookingError />} />
            <Route path="/staff" element={<StaffAccess />} />
            <Route path="/owner" element={<RequireRole role="owner"><OwnerDashboard /></RequireRole>} />
            <Route path="/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
        </Suspense>
        </ErrorBoundary>
      </main>
      {!hideChat && <ChatBot />}
      {!hideFooter && <Footer />}
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <Router>
        <AppShell />
      </Router>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
