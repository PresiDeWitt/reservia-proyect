import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import MapExplorer from './pages/MapExplorer';
import MyBookings from './pages/MyBookings';
import AccountPage from './pages/AccountPage';
import FavoritesPage from './pages/FavoritesPage';
import Confirmation from './pages/Confirmation';
import BookingError from './pages/BookingError';
import FloorPlan3D from './pages/FloorPlan3D';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffAccess from './pages/StaffAccess';
import NotFound from './pages/NotFound';
import RequireRole from './components/RequireRole';

const HIDE_FOOTER = ['/floor', '/staff'];
const HIDE_CHAT = ['/floor', '/staff', '/owner', '/admin'];

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
      <Header />
      <main style={{ flex: 1 }}>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
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
