import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import ProfileMenu from './ProfileMenu';
import LanguageMenu from './LanguageMenu';
import MobileDrawer from './MobileDrawer';
import Logo from './Logo';

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
          style={{ padding: scrolled ? '12px 24px' : '20px 24px', transition: 'padding 0.3s' }}
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

        {/* Search overlay strip */}
        {searchOpen && (
          <div
            className="absolute left-0 right-0 top-full px-4 py-4"
            style={{
              background: 'var(--surface-2)',
              borderBottom: '1px solid var(--border)',
              boxShadow: 'var(--sh-md)',
            }}
          >
            <form
              className="container flex items-center gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (headerSearch.trim()) {
                  navigate(`/?search=${encodeURIComponent(headerSearch.trim())}`);
                  setSearchOpen(false);
                }
              }}
            >
              <span className="mat" style={{ fontSize: 24, color: 'var(--primary)' }}>search</span>
              <input
                autoFocus
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder={t('header.searchPlaceholder')}
                className="flex-1 bg-transparent outline-none editorial italic"
                style={{ fontSize: 20, color: 'var(--ink)', letterSpacing: '-0.01em' }}
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="grid place-items-center"
                style={{ width: 36, height: 36, borderRadius: '50%', color: 'var(--ink-55)' }}
                aria-label="Cerrar"
              >
                <span className="mat" style={{ fontSize: 20 }}>close</span>
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
