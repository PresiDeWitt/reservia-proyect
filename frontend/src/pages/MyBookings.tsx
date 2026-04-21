import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { reservationsApi, type Reservation } from '../api/reservations';
import { useAuth } from '../context/AuthContext';

const MyBookings: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, token } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const [tab, setTab] = useState<'confirmed' | 'cancelled'>('confirmed');
  const loading = !!(isAuthenticated && token && loadedToken !== token);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    let isActive = true;
    reservationsApi.myReservations()
      .then(data => { if (!isActive) return; setReservations(data); })
      .catch(console.error)
      .finally(() => { if (!isActive) return; setLoadedToken(token); });
    return () => { isActive = false; };
  }, [isAuthenticated, token]);

  const handleCancel = async (id: number) => {
    try {
      await reservationsApi.cancel(id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' as const } : r));
    } catch (err) { console.error(err); }
  };

  const confirmed = reservations.filter(r => r.status === 'confirmed');
  const cancelled = reservations.filter(r => r.status === 'cancelled');
  const list = tab === 'confirmed' ? confirmed : cancelled;

  const TABS = [
    { k: 'confirmed' as const, l: `Próximas (${confirmed.length})` },
    { k: 'cancelled' as const, l: `Canceladas (${cancelled.length})` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', padding: '32px 0 64px' }}>
      <div className="container" style={{ maxWidth: 860 }}>
        <div className="eyebrow">Mi agenda</div>
        <h1 className="editorial" style={{ fontSize: 'clamp(40px,5vw,68px)', fontWeight: 300, letterSpacing: '-0.02em', marginTop: 8 }}>
          Mis <span className="italic-accent">reservas</span>
        </h1>

        {!isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-55)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 56, display: 'block', marginBottom: 16, opacity: 0.4 }}>lock</span>
            <p className="editorial" style={{ fontSize: 24, fontWeight: 300 }}>Inicia sesión para ver tus reservas.</p>
          </div>
        ) : (
          <>
            <div style={{ marginTop: 28 }}>
              <div className="segmented">
                {TABS.map(t => (
                  <button key={t.k} className={tab === t.k ? 'active' : ''} onClick={() => setTab(t.k)}>{t.l}</button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {loading ? (
                [1, 2].map(i => <div key={i} style={{ height: 110, borderRadius: 'var(--r-xl)', background: 'var(--ink-5)' }} className="shimmer-bg" />)
              ) : list.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-55)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 16, opacity: 0.4 }}>event_busy</span>
                  <p className="editorial" style={{ fontSize: 22, fontWeight: 300 }}>{t('bookings.empty')}</p>
                  <Link to="/search" className="btn btn-primary" style={{ marginTop: 20, textDecoration: 'none', display: 'inline-flex' }}><span>Encontrar una mesa</span></Link>
                </div>
              ) : list.map(r => (
                <div key={r.id} style={{ background: 'var(--surface-3)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--sh-md)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <img src={r.restaurantImage} alt={r.restaurantName} style={{ width: 110, objectFit: 'cover', flexShrink: 0 }} className="hide-sm" />
                  <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <Link to={`/restaurant/${r.restaurantId}`} style={{ fontSize: 17, fontWeight: 700, color: 'var(--navy)', textDecoration: 'none' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--navy)')}
                        >{r.restaurantName}</Link>
                        <p style={{ fontSize: 12, color: 'var(--ink-55)', marginTop: 2, marginBottom: 0 }}>{r.restaurantCuisine} · {r.restaurantAddress}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <span style={{ padding: '4px 12px', borderRadius: 'var(--r-pill)', fontSize: 11, fontWeight: 700, background: r.status === 'confirmed' ? 'rgba(16,185,129,0.1)' : 'var(--ink-5)', color: r.status === 'confirmed' ? 'var(--emerald)' : 'var(--ink-55)' }}>
                          {t(`bookings.${r.status}`)}
                        </span>
                        {r.status === 'confirmed' && (
                          <button onClick={() => handleCancel(r.id)} style={{ fontSize: 12, fontWeight: 700, color: 'var(--ruby)', background: 'none', border: 'none', cursor: 'pointer' }}>
                            {t('bookings.cancel')}
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      {[
                        { icon: 'calendar_today', text: r.date },
                        { icon: 'schedule', text: r.time },
                        { icon: 'group', text: `${r.guests} ${t('bookings.guests')}` },
                      ].map(x => (
                        <span key={x.icon} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-55)' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--primary)' }}>{x.icon}</span>
                          {x.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
