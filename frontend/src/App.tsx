import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import MapExplorer from './pages/MapExplorer';
import MyBookings from './pages/MyBookings';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import Account from './pages/Account';
import Chat from './pages/Chat';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import ChatBot from './components/ChatBot';

const ReserViaLogo: React.FC = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: '#fff' }}>
    <svg width="26" height="26" viewBox="0 0 48 48">
      <defs>
        <linearGradient id="footer-logo-grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f97415" />
          <stop offset="1" stopColor="#d95d05" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
      <path d="M24 8 C 28.5 12.5, 32 17, 28 23 C 26 19, 24 21, 24 25 C 21 21, 17 17, 24 8 Z" fill="url(#footer-logo-grad)" />
      <circle cx="24" cy="30" r="2.4" fill="rgba(255,255,255,0.7)" />
    </svg>
    <span
      style={{ fontFamily: '"Fraunces", serif', fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}
    >
      Reser<span style={{ fontStyle: 'italic', color: '#f97415' }}>Via</span>
    </span>
  </span>
);

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer style={{ background: 'var(--navy)', color: '#fff', padding: '64px 0 32px', position: 'relative' }} className="grain">
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40 }} className="footer-cols">
          <div>
            <ReserViaLogo />
            <p
              style={{
                fontFamily: '"Fraunces", serif',
                fontSize: 20, fontWeight: 300, lineHeight: 1.35,
                marginTop: 18, maxWidth: 300, letterSpacing: '-0.01em',
                opacity: 0.9,
              }}
            >
              Reservar una mesa no debería sentirse como{' '}
              <em style={{ fontStyle: 'italic', color: '#f97415' }}>rellenar un formulario</em>.
            </p>
          </div>

          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.6, marginBottom: 16 }}>
              Comensales
            </div>
            {['Explorar restaurantes', 'Mapa de mesas', 'Experiencias', 'App móvil'].map(x => (
              <div key={x} style={{ marginBottom: 10 }}>
                <a
                  href="#"
                  className="link-underline"
                  style={{ fontSize: 13, opacity: 0.8, color: '#fff' }}
                >
                  {x}
                </a>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.6, marginBottom: 16 }}>
              Restauradores
            </div>
            {['Únete a ReserVia', 'Panel de gestión', 'POS integrado', 'Precios'].map(x => (
              <div key={x} style={{ marginBottom: 10 }}>
                <a href="#" className="link-underline" style={{ fontSize: 13, opacity: 0.8, color: '#fff' }}>{x}</a>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.6, marginBottom: 16 }}>
              Compañía
            </div>
            {['Sobre nosotros', 'Prensa', 'Carreras', 'Contacto'].map(x => (
              <div key={x} style={{ marginBottom: 10 }}>
                <a href="#" className="link-underline" style={{ fontSize: 13, opacity: 0.8, color: '#fff' }}>{x}</a>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 56, paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, opacity: 0.5 }}>© 2026 ReserVia · Madrid</span>
            <a href="#" style={{ fontSize: 11, opacity: 0.5, color: '#fff' }}>{t('footer.privacy')}</a>
            <a href="#" style={{ fontSize: 11, opacity: 0.5, color: '#fff' }}>{t('footer.terms')}</a>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {['instagram', 'alternate_email', 'language'].map(icon => (
              <button
                key={icon}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'grid', placeItems: 'center',
                  color: '#fff', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .footer-cols { grid-template-columns: 1fr 1fr !important; gap: 32px !important; } }
        @media (max-width: 540px) { .footer-cols { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream)' }}>
          <Header />
          <main style={{ flex: 1 }}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/restaurant/:id" element={<RestaurantDetails />} />
                <Route path="/map" element={<MapExplorer />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/search" element={<Search />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/account" element={<Account />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/owner" element={<OwnerDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </main>
          <ChatBot />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
