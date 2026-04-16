import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import ProfileMenu from './ProfileMenu';
import LanguageMenu from './LanguageMenu';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-navy px-4 md:px-10 py-4 shadow-md">
        <Link to="/" className="flex items-center gap-4 text-white hover:opacity-80 transition-opacity">
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

        <div className="flex justify-end gap-6 items-center">
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-slate-300 hover:text-white transition-colors text-sm font-medium" to="/">{t('header.home')}</Link>
            <Link className="text-slate-300 hover:text-white transition-colors text-sm font-medium" to="/map">{t('header.map')}</Link>
            {isAuthenticated && (
              <Link className="text-slate-300 hover:text-white transition-colors text-sm font-medium" to="/my-bookings">{t('header.myBookings')}</Link>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-700 pl-3 sm:pl-6 ml-1 sm:ml-2">
            <LanguageMenu />
            {isAuthenticated ? (
              <ProfileMenu />
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="flex items-center justify-center rounded-lg h-9 sm:h-10 px-3 sm:px-6 bg-primary hover:bg-orange-600 transition-colors text-white text-xs sm:text-sm font-bold shadow-sm whitespace-nowrap"
              >
                {t('header.signIn')}
              </button>
            )}
          </div>
        </div>
      </header>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Header;


