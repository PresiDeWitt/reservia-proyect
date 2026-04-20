import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { reservationsApi, type Reservation } from '../api/reservations';
import { useAuth } from '../context/AuthContext';

const MyBookings: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, token } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const loading = !!(isAuthenticated && token && loadedToken !== token);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    let isActive = true;

    reservationsApi
      .myReservations()
      .then((data) => {
        if (!isActive) return;
        setReservations(data);
      })
      .catch(console.error)
      .finally(() => {
        if (!isActive) return;
        setLoadedToken(token);
      });

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, token]);

  const handleCancel = async (id: number) => {
    try {
      await reservationsApi.cancel(id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background-light py-12 px-4 md:px-10 lg:px-40">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-navy mb-8"
        >
          {t('bookings.title')}
        </motion.h1>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map(i => <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />)}
          </div>
        ) : !isAuthenticated ? (
          <div className="text-center py-20 text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-4 block">lock</span>
            <p className="text-lg font-medium">Sign in to see your bookings.</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-4 block">event_busy</span>
            <p className="text-lg font-medium">{t('bookings.empty')}</p>
            <Link to="/" className="mt-6 inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
              Find restaurants
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reservations.map(r => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex"
              >
                <img src={r.restaurantImage} alt={r.restaurantName} className="w-28 h-full object-cover hidden sm:block" />
                <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <Link to={`/restaurant/${r.restaurantId}`} className="text-lg font-bold text-navy hover:text-primary transition-colors">
                      {r.restaurantName}
                    </Link>
                    <p className="text-sm text-slate-500 mt-0.5">{r.restaurantCuisine} • {r.restaurantAddress}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-700">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base text-primary">calendar_today</span>
                        {r.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base text-primary">schedule</span>
                        {r.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base text-primary">group</span>
                        {r.guests} {t('bookings.guests')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {t(`bookings.${r.status}`)}
                    </span>
                    {r.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancel(r.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        {t('bookings.cancel')}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
