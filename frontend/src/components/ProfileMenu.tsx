import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const ProfileMenu: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
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
        className="group flex items-center gap-2.5 h-11 pl-1.5 pr-3 rounded-full bg-slate-800/50 border border-slate-700 hover:border-primary/60 hover:bg-slate-800 transition-all"
      >
        <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-600 text-white text-[13px] font-black shadow-[0_4px_14px_-3px_rgba(249,116,21,0.6)]">
          {initials}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald border-2 border-navy" />
        </span>
        <span className="hidden sm:block max-w-[120px] truncate text-sm font-semibold text-white">
          {user.name || user.email.split('@')[0]}
        </span>
        <span
          className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${
            open ? 'rotate-180 text-primary' : ''
          }`}
          style={{ fontSize: 18 }}
          aria-hidden="true"
        >
          expand_more
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
            className="absolute right-0 top-[calc(100%+10px)] w-[280px] sm:w-[300px] max-w-[calc(100vw-2rem)] origin-top-right bg-background-light rounded-2xl shadow-[0_30px_80px_-20px_rgba(15,23,42,0.5)] ring-1 ring-navy/10 overflow-hidden"
            style={{ transformOrigin: 'top right' }}
          >
            {/* Header */}
            <div className="relative p-5 pb-4 bg-navy text-background-light overflow-hidden">
              <div
                className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-50"
                style={{ background: 'radial-gradient(circle, #f97415 0%, transparent 70%)' }}
                aria-hidden="true"
              />
              <div className="relative flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-orange-600 text-white font-black text-base shadow-lg shadow-primary/30">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[15px] truncate">
                      {user.name || 'Invitado'}
                    </span>
                    <span
                      className="material-symbols-outlined text-primary"
                      style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}
                      aria-label={t('profile.verified')}
                      title={t('profile.verified')}
                    >
                      verified
                    </span>
                  </div>
                  <div className="text-[11px] text-background-light/60 truncate">{user.email}</div>
                </div>
              </div>
              <div className="relative mt-4 flex gap-2">
                <button
                  onClick={() => go('/my-bookings')}
                  className="flex-1 h-8 rounded-full bg-background-light/10 hover:bg-background-light/20 border border-background-light/10 text-[11px] font-semibold text-background-light transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>bookmark</span>
                  {t('profile.bookings')}
                </button>
                <button
                  onClick={() => go('/')}
                  className="flex-1 h-8 rounded-full bg-primary hover:bg-orange-600 text-[11px] font-bold text-white transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                  {t('profile.newBooking')}
                </button>
              </div>
            </div>

            {/* Menu items */}
            <nav className="p-2">
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

            <div className="mx-4 border-t border-navy/8" />

            <nav className="p-2">
              <MenuItem
                icon="help_outline"
                label={t('profile.help')}
                to="/help"
                onClick={() => setOpen(false)}
              />
            </nav>

            <div className="mx-4 border-t border-navy/8" />

            <div className="p-2 pb-3">
              <button
                role="menuitem"
                onClick={handleLogout}
                className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-red-600 hover:bg-red-50 transition-colors"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    logout
                  </span>
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold">{t('profile.logout')}</span>
                  <span className="block text-[11px] text-red-500/80">
                    {t('profile.logoutHint')}
                  </span>
                </span>
                <span
                  className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ fontSize: 18 }}
                >
                  arrow_forward
                </span>
              </button>
            </div>

            <div className="px-5 py-3 bg-navy/[0.03] border-t border-navy/5 flex items-center justify-between text-[10px] tracking-[0.2em] uppercase text-navy/45 font-bold">
              <span>ReserVia · v1.0</span>
              <span className="auth-editorial italic normal-case tracking-normal text-navy/60" style={{ fontWeight: 500 }}>
                {t('profile.tagline')}
              </span>
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
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-navy hover:bg-navy/5 transition-colors focus:outline-none focus:bg-navy/5"
    >
      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-navy/5 group-hover:bg-primary/10 group-hover:text-primary text-navy/70 transition-colors">
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          {icon}
        </span>
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold leading-tight">{label}</span>
        {hint && <span className="block text-[11px] text-navy/50 truncate">{hint}</span>}
      </span>
      <span
        className="material-symbols-outlined text-navy/25 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
        style={{ fontSize: 18 }}
      >
        chevron_right
      </span>
    </Link>
  )
);
MenuItem.displayName = 'MenuItem';

export default ProfileMenu;
