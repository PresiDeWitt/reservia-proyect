import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface ProfileMenuProps {
  variant?: 'light' | 'dark';
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ variant = 'dark' }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    const focusTimer = setTimeout(() => firstItemRef.current?.focus(), 120);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
      clearTimeout(focusTimer);
    };
  }, [open]);

  if (!user) return null;

  const initials = (user.name || user.email || '?')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/');
  };

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('profile.menu')}
        className={`relative flex items-center justify-center rounded-full transition-all ${
          variant === 'dark'
            ? 'ring-2 ring-white/20 hover:ring-white/40'
            : 'ring-2 ring-[var(--border)] hover:ring-[var(--primary)]'
        }`}
        style={{ width: 40, height: 40, padding: 0 }}
      >
        <span
          className="flex items-center justify-center rounded-full text-white font-black"
          style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-700))',
            fontSize: 13,
            boxShadow: '0 4px 14px -3px rgba(249,116,21,0.6)',
          }}
        >
          {initials}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute right-0 top-[calc(100%+10px)] origin-top-right overflow-hidden"
            style={{
              width: 300,
              maxWidth: 'calc(100vw - 2rem)',
              background: 'var(--surface-3)',
              color: 'var(--ink)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--sh-lg)',
              border: '1px solid var(--border)',
              transformOrigin: 'top right',
            }}
          >
            {/* Header */}
            <div
              className="grain relative overflow-hidden"
              style={{ padding: '20px', background: 'var(--navy)', color: 'var(--cream)' }}
            >
              <div
                className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-50"
                style={{ background: 'radial-gradient(circle, #f97415 0%, transparent 70%)' }}
                aria-hidden="true"
              />
              <div className="relative flex items-center gap-3 z-10">
                <div
                  className="flex items-center justify-center rounded-full text-white font-black"
                  style={{
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-700))',
                    fontSize: 16,
                    boxShadow: '0 8px 20px -6px rgba(249,116,21,0.5)',
                  }}
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[15px] truncate">{user.name || 'Invitado'}</span>
                    <span
                      className="mat mat-fill"
                      style={{ fontSize: 14, color: 'var(--primary)' }}
                      aria-label={t('profile.verified')}
                      title={t('profile.verified')}
                    >
                      verified
                    </span>
                  </div>
                  <div className="text-[11px] truncate" style={{ opacity: 0.65 }}>
                    {user.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <nav style={{ padding: 8 }}>
              <MenuItem
                ref={firstItemRef}
                icon="person"
                label={t('profile.account')}
                hint={t('profile.accountHint')}
                to="/profile"
                onClick={() => setOpen(false)}
              />
              <MenuItem
                icon="event"
                label={t('profile.bookings')}
                hint={t('profile.bookingsHint')}
                to="/my-bookings"
                onClick={() => setOpen(false)}
              />
              <MenuItem
                icon="favorite"
                label={t('profile.favorites')}
                hint={t('profile.favoritesHint')}
                to="/favorites"
                onClick={() => setOpen(false)}
              />
              <MenuItem
                icon="map"
                label={t('profile.explore')}
                hint={t('profile.exploreHint')}
                to="/map"
                onClick={() => setOpen(false)}
              />
            </nav>

            <div style={{ borderTop: '1px solid var(--border)', margin: '0 16px' }} />

            {/* Dark mode toggle */}
            <div style={{ padding: 8 }}>
              <button
                role="menuitem"
                onClick={toggleTheme}
                className="w-full flex items-center gap-3"
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--r-md)',
                  background: 'transparent',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ink-5)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span
                  className="grid place-items-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--ink-5)',
                  }}
                >
                  <span
                    className="mat"
                    style={{ fontSize: 20, color: theme === 'dark' ? 'var(--primary)' : 'var(--ink-55)' }}
                  >
                    {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                  </span>
                </span>
                <span className="flex-1 text-left">
                  <span className="block text-sm font-semibold">
                    {theme === 'dark' ? 'Modo oscuro' : 'Modo claro'}
                  </span>
                  <span className="block text-[11px]" style={{ color: 'var(--ink-55)' }}>
                    Cambia el aspecto de la app
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 999,
                    background: theme === 'dark' ? 'var(--primary)' : 'var(--ink-10)',
                    position: 'relative',
                    transition: 'background 0.25s',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: theme === 'dark' ? 18 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 0.25s cubic-bezier(0.2,0.8,0.2,1)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  />
                </span>
              </button>

              <MenuItem
                icon="help_outline"
                label={t('profile.help')}
                to="/help"
                onClick={() => setOpen(false)}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', margin: '0 16px' }} />

            <div style={{ padding: '8px 8px 12px' }}>
              <button
                role="menuitem"
                onClick={handleLogout}
                className="w-full flex items-center gap-3"
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--r-md)',
                  background: 'transparent',
                  color: 'var(--ruby)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(225,29,72,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span
                  className="grid place-items-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--r-sm)',
                    background: 'rgba(225,29,72,0.08)',
                  }}
                >
                  <span className="mat" style={{ fontSize: 20, color: 'var(--ruby)' }}>logout</span>
                </span>
                <span className="flex-1 text-left">
                  <span className="block text-sm font-bold">{t('profile.logout')}</span>
                  <span className="block text-[11px]" style={{ color: 'rgba(225,29,72,0.7)' }}>
                    {t('profile.logoutHint')}
                  </span>
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ──────────────────────────────────────────── */

interface MenuItemProps {
  icon: string;
  label: string;
  hint?: string;
  to: string;
  onClick: () => void;
}

const MenuItem = React.forwardRef<HTMLAnchorElement, MenuItemProps>(
  ({ icon, label, hint, to, onClick }, ref) => (
    <Link
      ref={ref}
      role="menuitem"
      to={to}
      onClick={onClick}
      className="group flex items-center gap-3"
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--r-md)',
        color: 'var(--ink)',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--ink-5)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span
        className="grid place-items-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--r-sm)',
          background: 'var(--ink-5)',
        }}
      >
        <span className="mat" style={{ fontSize: 20, color: 'var(--primary)' }}>
          {icon}
        </span>
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold leading-tight">{label}</span>
        {hint && (
          <span className="block text-[11px] truncate" style={{ color: 'var(--ink-55)' }}>
            {hint}
          </span>
        )}
      </span>
      <span className="mat" style={{ fontSize: 18, color: 'var(--ink-40)' }}>
        chevron_right
      </span>
    </Link>
  ),
);
MenuItem.displayName = 'MenuItem';

export default ProfileMenu;
