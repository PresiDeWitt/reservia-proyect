import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import ProfileMenu from './ProfileMenu';
import LanguageMenu from './LanguageMenu';

const ReserViaLogo: React.FC<{ white?: boolean }> = ({ white }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: white ? '#fff' : 'var(--navy)' }}>
    <svg width="28" height="28" viewBox="0 0 48 48">
      <defs>
        <linearGradient id="logo-grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f97415" />
          <stop offset="1" stopColor="#d95d05" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M24 8 C 28.5 12.5, 32 17, 28 23 C 26 19, 24 21, 24 25 C 21 21, 17 17, 24 8 Z" fill="url(#logo-grad)" />
      <circle cx="24" cy="30" r="2.4" fill="currentColor" />
    </svg>
    <span
      className="editorial"
      style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}
    >
      Reser<span className="italic-accent">Via</span>
    </span>
  </span>
);

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const onLanding = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isTransparent = onLanding && !scrolled;
  const textColor = isTransparent ? '#fff' : 'var(--navy)';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/?search=${encodeURIComponent(searchQ.trim())}`);
    setSearchOpen(false);
    setSearchQ('');
  };

  return (
    <>
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: isTransparent ? 'transparent' : 'rgba(248,247,245,0.92)',
          backdropFilter: isTransparent ? 'none' : 'blur(14px) saturate(1.2)',
          borderBottom: isTransparent ? '1px solid transparent' : '1px solid var(--border)',
          transition: 'all 0.35s cubic-bezier(0.2,0.8,0.2,1)',
          color: textColor,
        }}
      >
        <div
          style={{
            maxWidth: 1320, margin: '0 auto',
            display: 'flex', alignItems: 'center', gap: 20,
            padding: scrolled ? '14px 24px' : '20px 24px',
            transition: 'padding 0.3s',
          }}
        >
          <Link to="/" style={{ flexShrink: 0, textDecoration: 'none' }}>
            <ReserViaLogo white={isTransparent} />
          </Link>

          <nav style={{ display: 'flex', gap: 2, marginLeft: 16 }} className="hidden md:flex">
            {[
              { to: '/', label: t('header.home') },
              { to: '/search', label: 'Explorar' },
              { to: '/map', label: t('header.map') },
              ...(isAuthenticated ? [
                { to: '/my-bookings', label: t('header.myBookings') },
                { to: '/favorites', label: 'Favoritos' },
                { to: '/chat', label: 'Mensajes' },
              ] : []),
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  color: isTransparent ? 'rgba(255,255,255,0.9)' : 'var(--navy)',
                  background: location.pathname === item.to
                    ? (isTransparent ? 'rgba(255,255,255,0.15)' : 'var(--ink-10)')
                    : 'transparent',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                display: 'grid', placeItems: 'center',
                background: 'transparent', border: 'none',
                color: textColor, cursor: 'pointer',
              }}
              aria-label="Buscar"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>search</span>
            </button>

            <LanguageMenu />

            {isAuthenticated ? (
              <ProfileMenu />
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="btn-entrar"
                style={{
                  height: 40, padding: '0 22px',
                  borderRadius: 999,
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#fff',
                  fontSize: 13, fontWeight: 700,
                  cursor: 'pointer',
                  position: 'relative', overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 14px rgba(249,116,21,0.35)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(249,116,21,0.5)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(249,116,21,0.35)';
                }}
              >
                <span>Entrar</span>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(16px)',
            animation: 'fade-in 0.25s',
          }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 720, margin: '80px auto', padding: '0 20px' }}
          >
            <div
              className="scale-in"
              style={{
                background: '#fff',
                borderRadius: 28,
                boxShadow: 'var(--sh-lg)',
                overflow: 'hidden',
              }}
            >
              <form
                onSubmit={handleSearchSubmit}
                style={{
                  padding: 24,
                  display: 'flex', alignItems: 'center', gap: 14,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--primary)' }}>search</span>
                <input
                  autoFocus
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Busca una cocina, un barrio, un ambiente…"
                  style={{
                    flex: 1, border: 'none', outline: 'none', background: 'transparent',
                    fontFamily: '"Fraunces", serif', fontSize: 24, fontWeight: 400,
                    color: 'var(--navy)', letterSpacing: '-0.02em',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  style={{ padding: 8, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </form>
              <div style={{ padding: '12px 20px 20px' }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Búsquedas populares</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Romántico', 'Terraza', 'Italiano', 'Japonés', 'Brunch', 'Parrilla'].map(s => (
                    <button
                      key={s}
                      onClick={() => { navigate(`/?search=${s}`); setSearchOpen(false); }}
                      style={{
                        padding: '8px 16px', borderRadius: 999,
                        border: '1px solid var(--border)',
                        background: 'var(--ink-5)',
                        fontSize: 13, fontWeight: 600,
                        color: 'var(--navy)', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Header;
