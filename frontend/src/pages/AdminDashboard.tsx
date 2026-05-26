import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { adminApi, type AdminStats, type TopRestaurant, type CityData } from '../api/admin';
import { STORAGE_KEYS, storage } from '../api/storage';

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
    <div style={{ background: 'var(--surface)', minHeight: '100vh', padding: '48px 24px 96px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{t('admin.eyebrow')}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <h1 className="editorial" style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 300, letterSpacing: '-0.02em', margin: 0 }}>
              {t('admin.title')} <span className="italic-accent">ReserVia</span>
            </h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                padding: '8px 16px', borderRadius: 999,
                background: '#ecfdf5', color: '#10b981',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                {t('admin.systemsOk')}
              </div>
              <button onClick={handleLogout} style={{
                height: 36, padding: '0 16px', borderRadius: 999,
                background: '#fef2f2', color: '#ef4444',
                border: '1px solid #fecaca', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>
                {t('profile.logout')}
              </button>
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }} className="admin-kpi">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: 120, borderRadius: 20, background: 'var(--surface-3)', border: '1px solid var(--border)', animation: 'pulse 1.5s infinite' }} />
              ))
            : platformStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{
                    padding: '22px 20px', borderRadius: 20,
                    background: i === 0 ? 'var(--navy)' : '#fff',
                    border: '1px solid var(--border)',
                    color: i === 0 ? '#fff' : 'var(--navy)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: i === 0 ? 'rgba(255,255,255,0.7)' : 'var(--primary)', marginBottom: 12, display: 'block' }}>{s.icon}</span>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', fontFamily: '"Fraunces", serif' }}>{s.value}</div>
                  <div style={{ fontSize: 12, opacity: i === 0 ? 0.7 : undefined, color: i === 0 ? '#fff' : 'var(--ink-55)', marginTop: 4 }}>{s.label}</div>
                </motion.div>
              ))
          }
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 16, padding: 6, marginBottom: 24, width: 'fit-content' }}>
          {([['overview', t('admin.tabs.overview'), 'analytics'], ['restaurants', t('admin.tabs.topRestaurants'), 'workspace_premium']] as const).map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: '8px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: activeTab === id ? 'var(--navy)' : 'transparent',
                color: activeTab === id ? '#fff' : 'var(--ink-55)',
                fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
              {/* Revenue summary */}
              <div style={{ background: 'var(--surface-3)', borderRadius: 20, border: '1px solid var(--border)', padding: 28 }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}>{t('admin.monthlyRevenue')}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
                  <div style={{ fontSize: 32, fontWeight: 700, fontFamily: '"Fraunces", serif', letterSpacing: '-0.03em', color: 'var(--ink)' }}>
                    {apiStats ? `${apiStats.estimatedRevenue.toLocaleString('es-ES')}€` : '—'}
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: 999, background: '#ecfdf5', color: '#10b981', fontSize: 12, fontWeight: 700 }}>
                    {apiStats ? t('admin.confirmedBadge', { count: apiStats.confirmedReservations }) : ''}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {apiStats && [
                    [t('admin.overview.cancellations'), `${apiStats.cancellationRate}%`],
                    [t('admin.overview.totalGuests'), apiStats.totalGuests.toLocaleString()],
                  ].map(([l, v]) => (
                    <div key={l as string} style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-40)', fontWeight: 700 }}>{l}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, fontFamily: '"Fraunces", serif' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cities */}
              <div style={{ background: 'var(--surface-3)', borderRadius: 20, border: '1px solid var(--border)', padding: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 16 }}>{t('admin.cityDistribution')}</div>
                {cities.slice(0, 6).map(c => (
                  <div key={c.name} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{c.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--ink-55)' }}>{c.restaurants} {t('admin.restaurantsLabel')}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--ink-10)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${c.pct}%`, background: 'var(--primary)', borderRadius: 999 }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-40)', marginTop: 3 }}>{c.totalReservations.toLocaleString()} {t('admin.bookingsLabel')} · {c.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Top restaurants tab */}
        {activeTab === 'restaurants' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ background: 'var(--surface-3)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['#', t('admin.table.restaurant'), t('admin.table.city'), t('admin.table.bookings'), t('admin.table.revenue'), t('admin.table.rating')].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-40)', fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--ink-55)' }}>{t('admin.loading')}</td></tr>
                  ) : topRestaurants.map((r, i) => (
                    <tr key={r.id}
                      style={{ borderBottom: i < topRestaurants.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: i === 0 ? 'var(--primary)' : 'var(--ink-5)',
                          color: i === 0 ? '#fff' : 'var(--navy)',
                          display: 'grid', placeItems: 'center',
                          fontSize: 12, fontWeight: 700,
                        }}>{i + 1}</span>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{r.name}</td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--ink-55)' }}>{r.location}</td>
                      <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600 }}>{r.totalReservations.toLocaleString()}</td>
                      <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{r.estimatedRevenue.toLocaleString('es-ES')}€</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontWeight: 700, fontSize: 13 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>star</span>
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

      <style>{`
        @media (max-width: 900px) { .admin-kpi { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 540px) { .admin-kpi { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
