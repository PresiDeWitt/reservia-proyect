import React from 'react';
import { useTranslation } from 'react-i18next';
import heroImg from '../assets/images/reservia_hero_dining_1769099684622.png';

const Hero: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section 
      className="relative flex min-h-[600px] flex-col items-center justify-center bg-cover bg-center bg-no-repeat p-4 md:p-10"
      style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.4) 100%), url(${heroImg})` }}
    >
      <div className="flex flex-col gap-6 text-center max-w-5xl z-10 mb-10">
        <h1 className="text-white text-5xl md:text-7xl font-black leading-tight tracking-[-0.033em] drop-shadow-2xl">
          {t('hero.title')}
        </h1>
        <h2 className="text-slate-200 text-lg md:text-2xl font-light leading-relaxed max-w-3xl mx-auto drop-shadow-md">
          {t('hero.subtitle')}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <button className="px-8 py-3.5 bg-primary hover:bg-orange-600 text-white rounded-full font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">table_restaurant</span>
            {t('hero.bookTable')}
          </button>
          <button className="px-8 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">shopping_bag</span>
            {t('hero.preorderFood')}
          </button>
        </div>
      </div>

      <div className="w-full max-w-[960px] bg-white rounded-2xl shadow-2xl p-6 md:p-8 z-20 transform translate-y-12 border border-slate-100/50">
        <div className="flex flex-col gap-5">
          <div className="flex gap-6 border-b border-slate-100 pb-4">
            <button className="text-primary font-bold border-b-2 border-primary pb-4 -mb-4 px-2">{t('hero.tabs.bookTable')}</button>
            <button className="text-slate-500 font-medium hover:text-slate-800 transition-colors pb-4 -mb-4 px-2">{t('hero.tabs.orderPickup')}</button>
          </div>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-2xl">search</span>
            </div>
            <input 
              className="w-full h-16 pl-14 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg font-medium" 
              placeholder={t('hero.searchPlaceholder')}
              type="text"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
             <div className="flex gap-3 flex-wrap">
                {['cuisine', 'distance', 'ratings'].map(filter => (
                   <button key={filter} className="flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors">
                      <span>{t(`hero.filters.${filter}`)}</span>
                      <span className="material-symbols-outlined">keyboard_arrow_down</span>
                   </button>
                ))}
             </div>
             <button className="w-full md:w-auto h-14 px-10 bg-navy hover:bg-slate-800 text-white text-lg font-bold rounded-xl shadow-lg transition-all">
                {t('hero.search')}
             </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
