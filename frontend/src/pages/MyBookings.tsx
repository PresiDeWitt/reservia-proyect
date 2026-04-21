import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { reservationsApi, type Reservation } from '../api/reservations';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: 'rgba(16,185,129,0.1)', color: '#0a7c5a' },
  cancelled:  { bg: 'var(--ink-5)',         color: 'var(--ink-40)' },
  completed:  { bg: 'rgba(15,23,42,0.06)', color: 'var(--ink-55)' },
};

const MyBookings: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, token } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const loading = !!(isAuthenticated && token && loadedToken !== token);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    let isActive = true;
    reservationsApi.myReservations()
      .then(data => { if (isActive) setReservations(data); })
      .catch(console.error)
      .finally(() => { if (isActive) setLoadedToken(token); });
    return () => { isActive = false; };
  }, [isAuthenticated, token]);

  const handleCancel = async (id: number) => {
    try {
      await reservationsApi.cancel(id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  const upcoming = reservations.filter(r => r.status === 'confirmed');
  const past = reservations.filter(r => r.status === 'completed');
  const cancelled = reservations.filter(r => r.status === 'cancelled');
  const tabData = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled;

  return (
    <div style={{ minHeight: '80vh', background: 'var(--cream)', padding: '64px 24px 96px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Mis reservas</div>
          <h1 className="editorial" style={{ fontSize: 'clamp(40px,6vw,64px)', fontWeight: 300, letterSpacing: '-0.025em', margin: 0, lineHeight: 1 }}>
            {t('bookings.title')}
          </h1>
        </motion.div>

        {isAuthenticated && !loading && (
          <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 6, marginBottom: 28, width: 'fit-content' }}>
            {([['upcoming', `Próximas (${upcoming.length})`, 'event'], ['past', `Pasadas (${past.length})`, 'history'], ['cancelled', `Canceladas (${cancelled.length})`, 'event_busy']] as const).map(([id, label, icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: tab === id ? 'var(--navy)' : 'transparent',
                  color: tab === id ? '#fff' : 'var(--ink-55)',
                  fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2].map(i => (
              <div key={i} style={{ height: 110, borderRadius: 20 }} className="shimmer-bg" />
            ))}
          </div>
        ) : !isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-55)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>lock</span>
            <p className="editorial" style={{ fontSize: 24, fontWeight: 300, margin: '0 0 20px' }}>
              Inicia sesión para ver tus reservas.
            </p>
          </div>
        ) : tabData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-55)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>event_busy</span>
            <p className="editorial" style={{ fontSize: 24, fontWeight: 300, margin: '0 0 20px' }}>
              {reservations.length === 0 ? t('bookings.empty') : 'Sin reservas en esta categoría'}
            </p>
            <Link
              to="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 48, padding: '0 24px', borderRadius: 14,
                background: 'var(--navy)', color: '#fff',
                fontSize: 14, fontWeight: 700, textDecoration: 'none',
              }}
            >
              <span>Explorar restaurantes</span>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tabData.map((r, i) => {
              const status = STATUS_STYLE[r.status] || STATUS_STYLE.confirmed;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    background: '#fff', borderRadius: 20,
                    border: '1px solid var(--border)',
                    overflow: 'hidden', display: 'flex',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-md)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
                >
                  <img
                    src={r.restaurantImage}
                    alt={r.restaurantName}
                    style={{ width: 110, flexShrink: 0, objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <Link
                          to={`/restaurant/${r.restaurantId}`}
                          className="editorial"
                          style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--navy)', textDecoration: 'none' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--primary)')}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--navy)')}
                        >
                          {r.restaurantName}
                        </Link>
                        <p style={{ fontSize: 12, color: 'var(--ink-55)', margin: '3px 0 0' }}>
                          {r.restaurantCuisine} · {r.restaurantAddress}
                        </p>
                      </div>
                      <span style={{
                        padding: '4px 12px', borderRadius: 999,
                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                        background: status.bg, color: status.color,
                      }}>
                        {t(`bookings.${r.status}`)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                      {[
                        { icon: 'calendar_today', val: r.date },
                        { icon: 'schedule', val: r.time },
                        { icon: 'group', val: `${r.guests} ${t('bookings.guests')}` },
                      ].map(info => (
                        <span key={info.icon} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-55)' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--primary)' }}>{info.icon}</span>
                          {info.val}
                        </span>
                      ))}
                      {r.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          style={{
                            marginLeft: 'auto', fontSize: 12, fontWeight: 700,
                            color: 'var(--ruby)', border: 'none', background: 'transparent',
                            cursor: 'pointer',
                          }}
                        >
                          {t('bookings.cancel')}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
