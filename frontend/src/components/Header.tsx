import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-navy px-4 md:px-10 py-4 shadow-md">
        <Link to="/" className="flex items-center gap-4 text-white hover:opacity-80 transition-opacity" onClick={closeMobileMenu}>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-3xl">restaurant</span>
          </div>
          <h2 className="text-white text-xl font-bold leading-tight tracking-tight">ReserVia</h2>
        </Link>

        <form
          className="hidden lg:flex flex-1 max-w-lg mx-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (headerSearch.trim()) navigate(`/?search=${encodeURIComponent(headerSearch.trim())}`);
          }}
        >
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-indigo-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              placeholder={t('header.searchPlaceholder')}
              type="text"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
            />
          </div>
        </form>

        <div className="flex items-center gap-3">
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-slate-300 hover:text-white transition-colors text-sm font-medium" to="/">{t('header.home')}</Link>
            <Link className="text-slate-300 hover:text-white transition-colors text-sm font-medium" to="/map">{t('header.map')}</Link>
            {isAuthenticated && (
              <Link className="text-slate-300 hover:text-white transition-colors text-sm font-medium" to="/my-bookings">{t('header.myBookings')}</Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4 border-l border-slate-700 pl-6 ml-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700 hover:border-primary"
            >
              <span className="material-symbols-outlined text-base">language</span>
              {i18n.language.split('-')[0]}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-slate-300 text-sm font-medium hidden sm:block">{user?.name}</span>
                <button
                  onClick={logout}
                  className="flex items-center justify-center rounded-lg h-10 px-4 bg-slate-700 hover:bg-slate-600 transition-colors text-white text-sm font-bold"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-6 bg-primary hover:bg-orange-600 transition-colors text-white text-sm font-bold shadow-sm"
              >
                {t('header.signIn')}
              </button>
            )}
          </div>

          {/* Mobile: sign in / logout + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="flex items-center justify-center rounded-lg h-9 px-3 bg-slate-700 hover:bg-slate-600 transition-colors text-white text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="flex items-center justify-center rounded-lg h-9 px-4 bg-primary hover:bg-orange-600 transition-colors text-white text-sm font-bold"
              >
                {t('header.signIn')}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800/50 border border-slate-700 text-white"
              aria-label="Menu"
            >
              <span className="material-symbols-outlined text-[22px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={closeMobileMenu}>
          <nav
            className="absolute top-[65px] left-0 right-0 bg-navy border-b border-slate-700 flex flex-col px-4 py-3 gap-1 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (headerSearch.trim()) {
                  navigate(`/?search=${encodeURIComponent(headerSearch.trim())}`);
                  closeMobileMenu();
                }
              }}
              className="relative mb-2"
            >
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-indigo-400">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                placeholder={t('header.searchPlaceholder')}
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
              />
            </form>
            <Link
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium py-3 border-b border-slate-800 flex items-center gap-2"
              to="/"
              onClick={closeMobileMenu}
            >
              <span className="material-symbols-outlined text-base">home</span>
              {t('header.home')}
            </Link>
            <Link
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium py-3 border-b border-slate-800 flex items-center gap-2"
              to="/map"
              onClick={closeMobileMenu}
            >
              <span className="material-symbols-outlined text-base">map</span>
              {t('header.map')}
            </Link>
            {isAuthenticated && (
              <Link
                className="text-slate-300 hover:text-white transition-colors text-sm font-medium py-3 border-b border-slate-800 flex items-center gap-2"
                to="/my-bookings"
                onClick={closeMobileMenu}
              >
                <span className="material-symbols-outlined text-base">book_online</span>
                {t('header.myBookings')}
              </Link>
            )}
            <button
              onClick={() => { toggleLanguage(); closeMobileMenu(); }}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-all text-sm font-medium py-3"
            >
              <span className="material-symbols-outlined text-base">language</span>
              {i18n.language.split('-')[0].toUpperCase()}
            </button>
          </nav>
        </div>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Header;
