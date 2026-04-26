import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import ProfileMenu from './ProfileMenu';
import LanguageMenu from './LanguageMenu';
import MobileDrawer from './MobileDrawer';
import Logo from './Logo';
import NotificationsMenu from './NotificationsMenu';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authOpen, setAuthOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');

  const onLanding = location.pathname === '/';
  const transparent = onLanding && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false); };
    if (searchOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  const variant = transparent ? 'dark' : 'light';

  const headerStyle: React.CSSProperties = {
    background: transparent ? 'transparent' : 'color-mix(in srgb, var(--surface) 82%, transparent)',
    backdropFilter: transparent ? 'blur(0)' : 'blur(14px) saturate(1.2)',
    WebkitBackdropFilter: transparent ? 'blur(0)' : 'blur(14px) saturate(1.2)',
    borderBottom: transparent ? '1px solid transparent' : '1px solid var(--border)',
    color: transparent ? '#fff' : 'var(--ink)',
    transition: 'all 0.35s cubic-bezier(0.2,0.8,0.2,1)',
  };

  const navLinkClass = (to: string) => {
    const active = location.pathname === to;
    return [
      'px-3.5 py-2 rounded-full text-[13px] font-semibold transition-colors',
      active ? 'bg-white/10 dark-active' : 'opacity-85 hover:opacity-100',
    ].join(' ');
  };

  return (
    <>
      <header className="sticky top-0 z-[100]" style={headerStyle}>
        <div
          className="container flex items-center gap-5"
          style={{ padding: scrolled ? '6px 24px' : '10px 24px', transition: 'padding 0.3s' }}
        >
          <Link to="/" className="shrink-0" aria-label="ReserVia">
            <Logo size={180} color={transparent ? '#fff' : 'var(--ink)'} />
          </Link>

          <nav className="hide-sm flex gap-1 ml-3">
            <Link to="/" className={navLinkClass('/')} style={{ background: location.pathname === '/' ? (transparent ? 'rgba(255,255,255,0.1)' : 'var(--ink-10)') : 'transparent' }}>
              {t('header.home')}
            </Link>
            <Link
              to="/map"
              className={navLinkClass('/map')}
              style={{ background: location.pathname === '/map' ? (transparent ? 'rgba(255,255,255,0.1)' : 'var(--ink-10)') : 'transparent' }}
            >
              {t('header.map')}
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-bookings"
                className={navLinkClass('/my-bookings')}
                style={{ background: location.pathname === '/my-bookings' ? (transparent ? 'rgba(255,255,255,0.1)' : 'var(--ink-10)') : 'transparent' }}
              >
                {t('header.myBookings')}
              </Link>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Buscar"
              className="grid place-items-center rounded-full transition-colors"
              style={{
                width: 40,
                height: 40,
                color: 'inherit',
                background: searchOpen ? (transparent ? 'rgba(255,255,255,0.12)' : 'var(--ink-5)') : 'transparent',
              }}
            >
              <span className="mat" style={{ fontSize: 20 }}>search</span>
            </button>

            <div className="hide-sm flex items-center gap-2">
              <NotificationsMenu variant={variant} />
              <LanguageMenu variant={variant} />
              {isAuthenticated ? (
                <ProfileMenu variant={variant} />
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="btn btn-primary"
                  style={{ height: 40, padding: '0 18px' }}
                >
                  <span>{t('header.signIn')}</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Menú"
              className="show-mobile items-center justify-center"
              style={{
                display: 'none',
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'transparent',
                color: 'inherit',
                padding: 0,
                border: transparent ? '2px solid rgba(255,255,255,0.25)' : '2px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              {isAuthenticated && user ? (
                <span
                  className="grid place-items-center text-white font-black"
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-700))',
                    fontSize: 13,
                  }}
                >
                  {(user.name || user.email)
                    .split(' ')
                    .map((w) => w[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </span>
              ) : (
                <span className="mat" style={{ fontSize: 22 }}>person</span>
              )}
            </button>
          </div>
        </div>

        {/* Search bar — compact pill */}
        {searchOpen && (
          <div
            className="absolute left-0 right-0 top-full flex justify-center"
            style={{ padding: '10px 24px' }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (headerSearch.trim()) {
                  navigate(`/?search=${encodeURIComponent(headerSearch.trim())}`);
                  setSearchOpen(false);
                }
              }}
              className="flex items-center gap-2"
              style={{
                width: '100%',
                maxWidth: 560,
                background: 'rgba(15,23,42,0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 999,
                padding: '8px 8px 8px 18px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
              }}
            >
              <span className="mat" style={{ fontSize: 18, color: 'var(--primary)', flexShrink: 0 }}>search</span>
              <input
                autoFocus
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder={t('header.searchPlaceholder')}
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: 14, color: '#fff', minWidth: 0 }}
              />
              <button
                type="submit"
                style={{
                  height: 34, padding: '0 16px', borderRadius: 999,
                  background: 'var(--primary)', color: '#fff',
                  fontWeight: 700, fontSize: 13, border: 'none',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                Buscar
              </button>
            </form>
          </div>
        )}
      </header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onOpenAuth={() => setAuthOpen(true)}
      />
    </>
  );
};

export default Header;
