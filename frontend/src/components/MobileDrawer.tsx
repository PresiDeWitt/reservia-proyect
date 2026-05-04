import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onClose, onOpenAuth }) => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const navItems: Array<{ to: string; icon: string; label: string }> = [
    { to: '/', icon: 'home', label: t('header.home') },
    { to: '/map', icon: 'map', label: t('header.map') },
    ...(isAuthenticated
      ? [
          { to: '/my-bookings', icon: 'event', label: t('header.myBookings') },
          { to: '/favorites', icon: 'favorite', label: t('profile.favorites') },
          { to: '/profile', icon: 'person', label: t('profile.account') },
        ]
      : []),
  ];

  const initials = user
    ? (user.name || user.email)
        .split(' ')
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const handleOpenAuth = () => {
    onClose();
    onOpenAuth();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[110]"
            style={{
              background: 'rgba(15,23,42,0.6)',
              backdropFilter: 'blur(4px)',
            }}
          />
          <motion.aside
            key="drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[111] flex flex-col overflow-y-auto"
            style={{
              width: 'min(340px, 88vw)',
              background: 'var(--surface-3)',
              boxShadow: '-20px 0 60px rgba(15,23,42,0.25)',
            }}
          >
            <div className="grain relative" style={{ background: 'var(--navy)', color: 'var(--cream)', padding: '20px 20px 16px' }}>
              <div className="relative z-10 flex justify-between items-center">
                <Logo size={28} color="var(--cream)" />
                <button
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="grid place-items-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'var(--cream)',
                  }}
                >
                  <span className="mat" style={{ fontSize: 18 }}>close</span>
                </button>
              </div>
              {isAuthenticated && user && (
                <div className="relative z-10 mt-4 flex items-center gap-3">
                  <div
                    className="grid place-items-center text-white font-bold"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary), var(--primary-700))',
                      fontSize: 14,
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{user.name || user.email}</div>
                    <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>{user.email}</div>
                  </div>
                </div>
              )}
            </div>

            <nav className="flex-1 p-3">
              {navItems.map((item, i) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className="flex items-center gap-3.5 mb-1 transition-colors"
                  style={{
                    padding: '13px 14px',
                    borderRadius: 'var(--r-md)',
                    color: 'var(--ink)',
                    fontSize: 15,
                    fontWeight: 600,
                    animationDelay: `${i * 0.04}s`,
                    animation: open ? 'rise 0.4s both' : 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ink-5)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span
                    className="grid place-items-center shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--ink-5)',
                    }}
                  >
                    <span className="mat" style={{ fontSize: 18, color: 'var(--primary)' }}>{item.icon}</span>
                  </span>
                  {item.label}
                </Link>
              ))}

              <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0 8px' }} />

              {!isAuthenticated ? (
                <button
                  onClick={handleOpenAuth}
                  className="btn btn-primary w-full mt-2"
                  style={{ height: 48 }}
                >
                  <span className="mat" style={{ fontSize: 16 }}>login</span>
                  <span>{t('header.signIn')}</span>
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3.5 w-full"
                  style={{
                    padding: '13px 14px',
                    borderRadius: 'var(--r-md)',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--ruby)',
                  }}
                >
                  <span
                    className="grid place-items-center shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--r-sm)',
                      background: 'rgba(225,29,72,0.08)',
                    }}
                  >
                    <span className="mat" style={{ fontSize: 18, color: 'var(--ruby)' }}>logout</span>
                  </span>
                  {t('profile.logout')}
                </button>
              )}
            </nav>

            <div
              className="flex justify-between items-center"
              style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: 10, color: 'var(--ink-55)', letterSpacing: '0.1em' }}>© 2026 ReserVia</div>
              <div className="flex gap-2">
                <a
                  href="#"
                  aria-label="Instagram"
                  className="grid place-items-center"
                  style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--ink-5)', color: 'var(--ink)' }}
                >
                  <span className="mat" style={{ fontSize: 14 }}>instagram</span>
                </a>
                <a
                  href="#"
                  aria-label="Email"
                  className="grid place-items-center"
                  style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--ink-5)', color: 'var(--ink)' }}
                >
                  <span className="mat" style={{ fontSize: 14 }}>alternate_email</span>
                </a>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
