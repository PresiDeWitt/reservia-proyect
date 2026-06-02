import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { adminApi, type AdminStats, type TopRestaurant, type CityData } from '../api/admin';
import { STORAGE_KEYS, storage } from '../api/storage';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants'>('overview');
  const [apiStats, setApiStats] = useState<AdminStats | null>(null);
  const [topRestaurants, setTopRestaurants] = useState<TopRestaurant[]>([]);
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    storage.remove(STORAGE_KEYS.STAFF_ROLE);
    storage.remove(STORAGE_KEYS.STAFF_TOKEN);
    navigate('/staff', { replace: true });
  };

  useEffect(() => {
    const role = storage.get(STORAGE_KEYS.STAFF_ROLE);
    const token = storage.get(STORAGE_KEYS.STAFF_TOKEN);
    if (role !== 'admin' || !token) {
      navigate('/staff', { replace: true });
      return;
    }
    Promise.all([
      adminApi.stats(),
      adminApi.topRestaurants(),
      adminApi.cityDistribution(),
    ])
      .then(([stats, top, cityDist]) => {
        setApiStats(stats);
        setTopRestaurants(top.restaurants);
        setCities(cityDist.cities);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const platformStats = apiStats ? [
    { label: t('admin.stats.activeRestaurants'), value: apiStats.totalRestaurants.toLocaleString('es-ES'), icon: 'storefront' },
    { label: t('admin.stats.totalBookings'), value: apiStats.totalReservations.toLocaleString('es-ES'), icon: 'event' },
    { label: t('admin.stats.registeredUsers'), value: apiStats.totalUsers.toLocaleString('es-ES'), icon: 'group' },
    { label: t('admin.stats.netRevenue'), value: `${apiStats.estimatedRevenue.toLocaleString('es-ES')}€`, icon: 'payments' },
  ] : [];

  return (
    <div className="admin-page">
      <div className="admin-container">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="eyebrow admin-eyebrow">{t('admin.eyebrow')}</div>
          <div className="admin-header">
            <h1 className="editorial admin-title">
              {t('admin.title')} <span className="italic-accent">ReserVia</span>
            </h1>
            <div className="admin-header-actions">
              <div className="admin-badge">
                <span className="admin-badge-dot" />
                {t('admin.systemsOk')}
              </div>
              <button onClick={handleLogout} className="admin-button-danger">
                <span className="material-symbols-outlined">logout</span>
                {t('profile.logout')}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="admin-kpi-grid">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="admin-kpi-skeleton" />
              ))
            : platformStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`admin-kpi-card${i === 0 ? ' is-primary' : ''}`}
                >
                  <span className="material-symbols-outlined admin-kpi-icon">{s.icon}</span>
                  <div className="admin-kpi-value">{s.value}</div>
                  <div className="admin-kpi-label">{s.label}</div>
                </motion.div>
              ))}
        </div>

        <div className="admin-tabs">
          {([['overview', t('admin.tabs.overview'), 'analytics'], ['restaurants', t('admin.tabs.topRestaurants'), 'workspace_premium']] as const).map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`admin-tab${activeTab === id ? ' is-active' : ''}`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="admin-overview-grid">
              <div className="admin-card">
                <div className="eyebrow admin-card-eyebrow">{t('admin.monthlyRevenue')}</div>
                <div className="admin-revenue-row">
                  <div className="admin-revenue-value">
                    {apiStats ? `${apiStats.estimatedRevenue.toLocaleString('es-ES')}€` : '—'}
                  </div>
                  <span className="admin-badge">
                    {apiStats ? t('admin.confirmedBadge', { count: apiStats.confirmedReservations }) : ''}
                  </span>
                </div>
                <div className="admin-mini-stats">
                  {apiStats && [
                    [t('admin.overview.cancellations'), `${apiStats.cancellationRate}%`],
                    [t('admin.overview.totalGuests'), apiStats.totalGuests.toLocaleString()],
                  ].map(([l, v]) => (
                    <div key={l as string} className="admin-mini-stat">
                      <div className="admin-mini-stat-label">{l}</div>
                      <div className="admin-mini-stat-value">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-card is-compact">
                <div className="eyebrow admin-cities-eyebrow">{t('admin.cityDistribution')}</div>
                {cities.slice(0, 6).map(c => (
                  <div key={c.name} className="admin-city">
                    <div className="admin-city-row">
                      <span className="admin-city-name">{c.name}</span>
                      <span className="admin-city-count">{c.restaurants} {t('admin.restaurantsLabel')}</span>
                    </div>
                    <div className="admin-city-bar">
                      <div className="admin-city-bar-fill" style={{ '--fill': `${c.pct}%` } as React.CSSProperties} />
                    </div>
                    <div className="admin-city-meta">{c.totalReservations.toLocaleString()} {t('admin.bookingsLabel')} · {c.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'restaurants' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    {['#', t('admin.table.restaurant'), t('admin.table.city'), t('admin.table.bookings'), t('admin.table.revenue'), t('admin.table.rating')].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr className="admin-loading-row"><td colSpan={6}>{t('admin.loading')}</td></tr>
                  ) : topRestaurants.map((r, i) => (
                    <tr key={r.id}>
                      <td>
                        <span className={`admin-rank-badge${i === 0 ? ' is-top' : ''}`}>{i + 1}</span>
                      </td>
                      <td>{r.name}</td>
                      <td className="is-muted">{r.location}</td>
                      <td className="is-bold">{r.totalReservations.toLocaleString()}</td>
                      <td className="is-numeric">{r.estimatedRevenue.toLocaleString('es-ES')}€</td>
                      <td className="is-rating">
                        <span className="admin-rating">
                          <span className="material-symbols-outlined">star</span>
                          {r.rating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
