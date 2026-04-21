import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import ProfileMenu from './ProfileMenu';
import LanguageMenu from './LanguageMenu';

const SearchOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(16px)' }}
      className="fade-in"
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 720, margin: '80px auto', padding: '0 20px' }}>
        <div className="scale-in" style={{ background: 'var(--surface-3)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-lg)', overflow: 'hidden' }}>
          <div style={{ padding: 22, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--primary)' }}>search</span>
            <input
              ref={inputRef}
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && q.trim()) { navigate(`/search?q=${encodeURIComponent(q.trim())}`); onClose(); } }}
              placeholder="Busca una cocina, un barrio, un ambiente…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em' }}
            />
            <button onClick={onClose} style={{ padding: 8, borderRadius: '50%' }}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div style={{ padding: '14px 22px', fontSize: 13, color: 'var(--ink-55)' }}>
            Prueba:{' '}
            <em style={{ color: 'var(--primary)', fontFamily: '"Fraunces", serif' }}>"cena romántica"</em> ·{' '}
            <em style={{ color: 'var(--primary)', fontFamily: '"Fraunces", serif' }}>"terraza Madrid"</em> ·{' '}
            <em style={{ color: 'var(--primary)', fontFamily: '"Fraunces", serif' }}>"aniversario"</em>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const onLanding = location.pathname === '/';

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', on, { passive: true });
    on();
    return () => window.removeEventListener('scroll', on);
  }, []);

  const solidHeader = scrolled || !onLanding;

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: solidHeader ? 'rgba(15,23,42,0.97)' : 'transparent',
        backdropFilter: solidHeader ? 'blur(14px) saturate(1.2)' : 'none',
        borderBottom: solidHeader ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        transition: 'all 0.35s cubic-bezier(0.2,0.8,0.2,1)',
        color: '#fff',
      }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto',
          padding: scrolled ? '14px 24px' : '20px 24px',
          transition: 'padding 0.3s',
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          {/* Logo */}
          <Link to="/" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 10, color: '#fff', textDecoration: 'none' }}>
            <svg width="28" height="28" viewBox="0 0 48 48">
              <defs>
                <linearGradient id="hdr-logo-g" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#f97415" />
                  <stop offset="1" stopColor="#d95d05" />
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
              <path d="M24 8 C 28.5 12.5, 32 17, 28 23 C 26 19, 24 21, 24 25 C 21 21, 17 17, 24 8 Z" fill="url(#hdr-logo-g)" />
              <circle cx="24" cy="30" r="2.4" fill="rgba(255,255,255,0.55)" />
            </svg>
            <span style={{ fontFamily: '"Fraunces", serif', fontSize: 19, fontWeight: 500, letterSpacing: '-0.02em' }}>
              Reser<em style={{ fontStyle: 'italic', color: '#f97415' }}>Via</em>
            </span>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: 2, marginLeft: 12 }} className="hide-sm">
            {[
              { to: '/', label: t('header.home') },
              { to: '/search', label: 'Explorar' },
              { to: '/map', label: t('header.map') },
              ...(isAuthenticated ? [
                { to: '/my-bookings', label: t('header.myBookings') },
                { to: '/favorites', label: 'Favoritos' },
              ] : []),
            ].map(item => (
              <Link key={item.to} to={item.to} style={{
                padding: '8px 14px', borderRadius: 'var(--r-pill)',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
                background: location.pathname === item.to ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: location.pathname === item.to ? '#fff' : 'rgba(255,255,255,0.7)',
                transition: 'background 0.2s, color 0.2s',
              }}
                onMouseEnter={e => { if (location.pathname !== item.to) (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { if (location.pathname !== item.to) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
              >{item.label}</Link>
            ))}
          </nav>

          {/* Right side */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setSearchOpen(true)}
              style={{ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.8)', transition: 'background 0.2s' }}
              aria-label="Buscar"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>search</span>
            </button>

            <LanguageMenu />

            {isAuthenticated ? (
              <ProfileMenu />
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="btn btn-primary"
                style={{ height: 38, padding: '0 18px', fontSize: 13 }}
              >
                <span>{t('header.signIn')}</span>
                <span className="material-symbols-outlined" style={{ fontSize: 15, position: 'relative', zIndex: 1 }}>arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Header;
