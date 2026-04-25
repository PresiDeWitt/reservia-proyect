import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { reservationsApi, type Reservation } from '../api/reservations';
import { useAuth } from '../context/AuthContext';

const MyBookings: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    reservationsApi
      .myReservations()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const cancel = async (id: number) => {
    await reservationsApi.cancel(id);
    setBookings((b) => b.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)));
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '120px 24px', textAlign: 'center' }}>
        <h1 className="editorial" style={{ fontSize: 56, fontWeight: 300 }}>
          Identifícate para ver tus <span className="italic-accent">reservas</span>
        </h1>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 28 }}>
          <span>Volver al inicio</span>
        </Link>
      </div>
    );
  }

  const now = new Date();
  const filtered = bookings.filter((b) => {
    if (b.status === 'cancelled') return filter === 'cancelled';
    const dt = new Date(`${b.date}T${b.time || '00:00'}`);
    return filter === 'upcoming' ? dt >= now : dt < now;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container"
      style={{ padding: '120px 24px 80px' }}
    >
      <div className="eyebrow">Tu agenda</div>
      <h1
        className="editorial"
        style={{ fontSize: 'clamp(48px,6vw,88px)', fontWeight: 300, letterSpacing: '-0.03em', marginTop: 8 }}
      >
        Mis <span className="italic-accent">reservas</span>
      </h1>

      <div style={{ display: 'flex', gap: 8, marginTop: 32, flexWrap: 'wrap' }}>
        {(['upcoming', 'past', 'cancelled'] as const).map((k) => (
          <button key={k} onClick={() => setFilter(k)} className={`chip ${filter === k ? 'active' : ''}`}>
            {k === 'upcoming' ? 'Próximas' : k === 'past' ? 'Pasadas' : 'Canceladas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer" style={{ height: 140, borderRadius: 'var(--r-xl)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-40)' }}>
          <span className="mat" style={{ fontSize: 48, marginBottom: 12, display: 'block' }}>event_busy</span>
          <p style={{ fontSize: 16 }}>{t('bookings.empty')}</p>
        </div>
      ) : (
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((b) => (
            <div
              key={b.id}
              className="card booking-row"
              style={{
                background: 'var(--surface-3)',
                borderRadius: 'var(--r-xl)',
                padding: 20,
                display: 'grid',
                gridTemplateColumns: '160px 1fr auto',
                gap: 20,
                alignItems: 'center',
              }}
            >
              <Link
                to={`/restaurant/${b.restaurantId}`}
                style={{
                  height: 100,
                  borderRadius: 'var(--r-md)',
                  overflow: 'hidden',
                  background: `url(${b.restaurantImage}) center/cover`,
                }}
              />
              <div>
                <div className="eyebrow">{b.restaurantCuisine}</div>
                <Link
                  to={`/restaurant/${b.restaurantId}`}
                  className="editorial"
                  style={{ fontSize: 26, fontWeight: 400, marginTop: 4, display: 'block' }}
                >
                  {b.restaurantName}
                </Link>
                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-55)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span>
                    <span className="mat" style={{ fontSize: 14, verticalAlign: 'middle' }}>event</span> {b.date}
                  </span>
                  <span>
                    <span className="mat" style={{ fontSize: 14, verticalAlign: 'middle' }}>schedule</span> {b.time}
                  </span>
                  <span>
                    <span className="mat" style={{ fontSize: 14, verticalAlign: 'middle' }}>group</span>{' '}
                    {b.guests} {t('bookings.guests')}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <span
                  className="chip"
                  style={
                    b.status === 'confirmed'
                      ? { background: 'rgba(16,185,129,0.12)', color: '#0a7c5a', borderColor: 'transparent' }
                      : { background: 'rgba(225,29,72,0.12)', color: '#b01446', borderColor: 'transparent' }
                  }
                >
                  {b.status === 'confirmed' ? t('bookings.confirmed') : t('bookings.cancelled')}
                </span>
                {b.status === 'confirmed' && filter === 'upcoming' && (
                  <button onClick={() => cancel(b.id)} className="btn btn-ghost" style={{ height: 36, fontSize: 12 }}>
                    {t('bookings.cancel')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 700px) {
          .booking-row { grid-template-columns: 1fr !important; }
          .booking-row > a:first-child { height: 180px !important; }
        }
      `}</style>
    </motion.div>
  );
};

export default MyBookings;
