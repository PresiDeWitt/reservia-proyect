import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import MapExplorer from './pages/MapExplorer';
import MyBookings from './pages/MyBookings';
import NotFound from './pages/NotFound';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AuthProvider>
    <Router>
      <div className="bg-background-light min-h-screen font-display flex flex-col">
        <Header />
        <main className="grow">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/restaurant/:id" element={<RestaurantDetails />} />
              <Route path="/map" element={<MapExplorer />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

          </AnimatePresence>
        </main>
        
        <ChatBot />
        <footer className="bg-navy text-white py-12 px-4 md:px-10 lg:px-40">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">restaurant</span>
               <span className="text-xl font-bold">ReserVia</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-400">
               <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
               <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
               <a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a>
            </div>
            <div className="text-xs text-slate-500">
              {t('footer.rights')}
            </div>
          </div>
        </footer>
      </div>
    </Router>
    </AuthProvider>
  );
};


export default App;

