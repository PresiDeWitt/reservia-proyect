import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getOwnerProfile, type OwnerProfile } from '../api/ownerProfile';
import OwnerOnboarding from '../components/OwnerOnboarding';
import { ownerApi, type OwnerStats, type OwnerReservation, type OwnerAttendanceStatus, type OwnerTableData } from '../api/owner';
import { STORAGE_KEYS, storage } from '../api/storage';



const ALL_HOURS = ['12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

const statusColor: Record<string, string> = {
  confirmed: 'var(--emerald)',
  arrived: '#0ea5e9',
  pending: '#f59e0b',
  cancelled: 'var(--ruby)',
  no_show: '#6b7280',
};

const floorColor: Record<string, string> = {
  free: '#e6f9f1',
  taken: '#fde8e8',
  reserved: '#fef3c7',
};
const floorBorder: Record<string, string> = {
  free: '#10b981',
  taken: '#ef4444',
  reserved: '#f59e0b',
};

const TABLE_W = 14;
const TABLE_H = 10;
const COLS = 6;

const OwnerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reservations' | 'floor' | 'heatmap'>('reservations');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(false);
  const [apiStats, setApiStats] = useState<OwnerStats | null>(null);
  const [reservations, setReservations] = useState<OwnerReservation[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRes, setLoadingRes] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [tables, setTables] = useState<OwnerTableData[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);

  const handleLogout = () => {
    storage.remove(STORAGE_KEYS.STAFF_ROLE);
    storage.remove(STORAGE_KEYS.STAFF_TOKEN);
    navigate('/staff', { replace: true });
  };

  const loadStats = useCallback(() => {
    setLoadingStats(true);
    ownerApi.stats()
      .then(setApiStats)
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    const role = storage.get(STORAGE_KEYS.STAFF_ROLE);
    const token = storage.get(STORAGE_KEYS.STAFF_TOKEN);
    if (role !== 'owner' || !token) {
      navigate('/staff', { replace: true });
      return;
    }
    getOwnerProfile('').then((p) => {
      setProfile(p);
      setProfileLoading(false);
    });
    loadStats();
  }, [loadStats, navigate]);

  const loadReservations = useCallback(() => {
    setLoadingRes(true);
    ownerApi.reservations({ status: filter })
      .then((r) => setReservations(r.reservations))
      .catch(() => setReservations([]))
      .finally(() => setLoadingRes(false));
  }, [filter]);

  useEffect(() => { loadReservations(); }, [loadReservations]);

  useEffect(() => {
    if (activeTab === 'floor') {
      setLoadingTables(true);
      ownerApi.getTables()
        .then(setTables)
        .catch(() => setTables([]))
        .finally(() => setLoadingTables(false));
    }
  }, [activeTab]);

  const handleStatusUpdate = async (id: number, newStatus: OwnerAttendanceStatus) => {
    setUpdatingId(id);
    try {
      await ownerApi.updateStatus(id, newStatus);
      setReservations(prev => prev
        .map(r => r.id === id ? { ...r, status: newStatus } : r)
        .filter(r => filter === 'all' || r.status === filter));
      loadStats();
    } catch {
      // State stays unchanged if the backend rejects the update.
    } finally {
      setUpdatingId(null);
    }
  };

  if (profileLoading) {
    return null;
  }
  if (!profile) {
    return <OwnerOnboarding email={user?.email ?? ''} initialName={user?.name} onDone={setProfile} />;
  }
  if (editing) {
    return (
      <OwnerOnboarding
        email={user?.email ?? ''}
        initialProfile={profile}
        onDone={(p) => { setProfile(p); setEditing(false); }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  const restName = apiStats?.restaurantName ?? profile?.name ?? t('owner.yourRestaurant');
  const restCuisine = apiStats?.restaurantCuisine ?? profile?.cuisine ?? '';
  const [firstWord, ...restWords] = restName.split(' ');
  const restRest = restWords.join(' ');

  const stats = loadingStats || !apiStats ? [] : [
    { label: t('owner.stats.reservations'), value: String(apiStats.totalReservations), icon: 'event', up: true },
    { label: t('owner.stats.guests'), value: String(apiStats.totalGuests), icon: 'group', up: true },
    { label: t('owner.stats.cancellations'), value: String(apiStats.cancelledReservations), icon: 'event_busy', up: false },
    { label: t('owner.stats.avgGuests'), value: String(apiStats.avgGuests), icon: 'person', up: true },
  ];

  const statusLabel: Record<string, string> = {
    confirmed: t('owner.status.confirmed'),
    arrived: t('owner.status.arrived'),
    pending: t('owner.status.pending'),
    cancelled: t('owner.status.cancelled'),
    no_show: t('owner.status.no_show'),
  };

  const occasionLabel: Record<string, string> = {
    birthday: t('owner.occasion.birthday'),
    anniversary: t('owner.occasion.anniversary'),
    business: t('owner.occasion.business'),
    other: t('owner.occasion.other'),
  };

  const actionButtonStyle = (
    variant: 'success' | 'danger' | 'neutral',
    disabled: boolean,
  ): React.CSSProperties => {
    const colors = {
      success: { bg: '#ecfdf5', border: '#bbf7d0', text: '#047857' },
      danger: { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
      neutral: { bg: 'var(--surface-2)', border: 'var(--border)', text: 'var(--ink-55)' },
    }[variant];

    return {
      height: 30,
      padding: '0 10px',
      borderRadius: 8,
      border: `1px solid ${colors.border}`,
      background: disabled ? 'var(--ink-5)' : colors.bg,
      color: disabled ? 'var(--ink-40)' : colors.text,
      fontSize: 11,
      fontWeight: 700,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      whiteSpace: 'nowrap',
    };
  };

  const heatmapData = ALL_HOURS.map((h) => {
    const entry = apiStats?.hourDistribution?.find((d) => String(d.hour) === h);
    return entry?.count ?? 0;
  });
  const maxCount = Math.max(...heatmapData, 1);

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', padding: '48px 24px 96px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{restCuisine ? `${t('owner.panel')} · ${restCuisine}` : t('owner.panel')}</div>
          <div className="owner-header-row">
            <h1 className="editorial" style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 300, letterSpacing: '-0.02em', margin: 0 }}>
              {firstWord} {restRest && <span className="italic-accent">{restRest}</span>}
            </h1>
            <div className="owner-btn-group">
              <button style={{
                height: 40, padding: '0 18px', borderRadius: 12,
                background: 'var(--navy)', color: '#fff',
                border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                {t('owner.newReservation')}
              </button>
              <button
                onClick={() => setEditing(true)}
                style={{
                  height: 40, padding: '0 18px', borderRadius: 12,
                  background: 'var(--surface-3)', color: 'var(--ink)',
                  border: '1px solid var(--border)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>settings</span>
                {t('owner.edit')}
              </button>
              <button onClick={handleLogout} style={{
                height: 40, padding: '0 18px', borderRadius: 12,
                background: '#fef2f2', color: '#ef4444',
                border: '1px solid #fecaca', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
                {t('profile.logout')}
              </button>
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }} className="kpi-grid">
          {loadingStats
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: 120, borderRadius: 20, background: 'var(--surface-3)', border: '1px solid var(--border)', animation: 'pulse 1.5s infinite' }} />
              ))
            : stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{
                    padding: '22px 20px', borderRadius: 20,
                    background: 'var(--surface-3)', border: '1px solid var(--border)',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)', marginBottom: 12, display: 'block' }}>{s.icon}</span>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink)', fontFamily: '"Fraunces", serif' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-55)', marginTop: 4 }}>{s.label}</div>
                </motion.div>
              ))
          }
        </div>

        {/* Tabs */}
        <div className="owner-tabs-container">
          {([['reservations', t('owner.tabs.reservations'), 'event'], ['floor', t('owner.tabs.floor'), 'table_restaurant'], ['heatmap', t('owner.tabs.heatmap'), 'bar_chart']] as const).map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: '8px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
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

        {/* Reservations tab */}
        {activeTab === 'reservations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Filter pills */}
            <div className="owner-filter-pills">
              {[['all', t('owner.filters.all')], ['confirmed', t('owner.filters.confirmed')], ['arrived', t('owner.filters.arrived')], ['no_show', t('owner.filters.no_show')], ['cancelled', t('owner.filters.cancelled')]].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setFilter(v)}
                  style={{
                    height: 34, padding: '0 14px', borderRadius: 999,
                    border: '1px solid',
                    background: filter === v ? 'var(--navy)' : '#fff',
                    borderColor: filter === v ? 'var(--navy)' : 'var(--border)',
                    color: filter === v ? '#fff' : 'var(--navy)',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            <div style={{ background: 'var(--surface-3)', borderRadius: 20, border: '1px solid var(--border)', overflowX: 'auto', overflowY: 'hidden' }}>
              <table style={{ width: '100%', minWidth: 880, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {[t('owner.table.table'), t('owner.table.client'), t('owner.table.guests'), t('owner.table.time'), t('owner.table.status'), t('owner.table.actions')].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-40)', fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingRes ? (
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--ink-55)', fontSize: 13 }}>{t('owner.loading')}</td></tr>
                  ) : reservations.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--ink-55)', fontSize: 13 }}>{t('owner.noReservations')}</td></tr>
                  ) : reservations.map((r, i) => {
                    const note = r.note.trim();
                    const occasion = r.occasion ? (occasionLabel[r.occasion] ?? r.occasion) : '';
                    const isUpdating = updatingId === r.id;
                    const canUpdate = r.status !== 'cancelled';

                    return (
                    <tr key={r.id} style={{ borderBottom: i < reservations.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--ink-5)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{r.table}</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--ink)' }}>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{r.name}</div>
                        {(occasion || note) ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 300 }}>
                            {occasion && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--ink-55)', fontSize: 12, lineHeight: 1.35 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>celebration</span>
                                {occasion}
                              </span>
                            )}
                            {note && (
                              <span title={note} style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 4, color: 'var(--ink-55)', fontSize: 12, lineHeight: 1.35, whiteSpace: 'normal' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14, marginTop: 1 }}>medical_information</span>
                                {note}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div style={{ color: 'var(--ink-40)', fontSize: 12 }}>{t('owner.table.noNote')}</div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--ink-55)', fontSize: 13 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
                          {r.guests}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{r.time} · {r.date}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 999,
                          background: `${statusColor[r.status] ?? 'var(--ink-20)'}22`,
                          color: statusColor[r.status] ?? 'var(--ink-55)',
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {statusLabel[r.status] ?? r.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {canUpdate ? (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minWidth: 220 }}>
                            {r.status !== 'arrived' && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(r.id, 'arrived')}
                                style={actionButtonStyle('success', isUpdating)}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                                {t('owner.table.markArrived')}
                              </button>
                            )}
                            {r.status !== 'no_show' && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(r.id, 'no_show')}
                                style={actionButtonStyle('danger', isUpdating)}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person_off</span>
                                {t('owner.table.markNoShow')}
                              </button>
                            )}
                            {(r.status === 'arrived' || r.status === 'no_show') && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(r.id, 'confirmed')}
                                style={actionButtonStyle('neutral', isUpdating)}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>undo</span>
                                {t('owner.table.revertConfirmed')}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--ink-40)', fontSize: 12 }}>—</span>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Floor plan tab */}
        {activeTab === 'floor' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {loadingTables ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-55)', fontSize: 13 }}>{t('owner.loading')}</div>
            ) : tables.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-55)', fontSize: 13 }}>No hay mesas configuradas. Añádelas desde la gestión de mesas.</div>
            ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20 }}>
              <div style={{ background: 'var(--surface-3)', borderRadius: 20, border: '1px solid var(--border)', padding: 24, overflow: 'hidden' }}>
                <div className="eyebrow" style={{ marginBottom: 16 }}>{t('owner.floor.title')}</div>
                <svg viewBox="0 0 100 90" style={{ width: '100%', fontFamily: 'inherit' }}>
                  <rect x="0" y="0" width="100" height="90" fill="#f8f7f5" rx="2" />
                  <rect x="0" y="0" width="100" height="6" fill="#e2e0db" />
                  <text x="50" y="4.5" textAnchor="middle" fontSize="2.5" fill="#94928e" fontWeight="600">{t('owner.floor.entrance')}</text>

                  {tables.map((t, i) => {
                    const col = i % COLS;
                    const row = Math.floor(i / COLS);
                    const x = 3 + col * (100 / COLS);
                    const y = 10 + row * (TABLE_H + 2);
                    return (
                      <g key={t.id}>
                        <rect
                          x={x} y={y} width={TABLE_W} height={TABLE_H}
                          rx="2"
                          fill={t.is_active ? floorColor.free : '#f1f0ed'}
                          stroke={t.is_active ? floorBorder.free : '#d1d0cc'}
                          strokeWidth="0.8"
                        />
                        <text x={x + TABLE_W / 2} y={y + TABLE_H / 2 - 1} textAnchor="middle" fontSize="2.8" fontWeight="700" fill="#1e293b">{t.label}</text>
                        <text x={x + TABLE_W / 2} y={y + TABLE_H - 2} textAnchor="middle" fontSize="1.8" fill="#94928e">{t.capacity}p</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: 'var(--surface-3)', borderRadius: 16, border: '1px solid var(--border)', padding: 18 }}>
                  <div className="eyebrow" style={{ marginBottom: 12 }}>{t('owner.floor.legend')}</div>
                  {[['free', '#10b981', t('owner.floor.free')], ['taken', '#ef4444', t('owner.floor.taken')], ['reserved', '#f59e0b', t('owner.floor.reserved')]].map(([, c, l]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ width: 12, height: 12, borderRadius: 4, background: `${c}33`, border: `1.5px solid ${c}`, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>{l}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'var(--surface-3)', borderRadius: 16, border: '1px solid var(--border)', padding: 18 }}>
                  <div className="eyebrow" style={{ marginBottom: 12 }}>{t('owner.floor.summary')}</div>
                  {[[t('owner.floor.freeTables'), tables.filter(x => x.is_active).length],
                    [t('owner.floor.takenTables'), 0],
                    [t('owner.floor.reservedTables'), 0]].map(([l, v]) => (
                    <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--ink-55)' }}>{l}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}
          </motion.div>
        )}

        {/* Heatmap tab */}
        {activeTab === 'heatmap' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ background: 'var(--surface-3)', borderRadius: 20, border: '1px solid var(--border)', padding: 32 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>{t('owner.heatmap.title')}</div>
              <p style={{ fontSize: 14, color: 'var(--ink-55)', marginBottom: 28 }}>{t('owner.heatmap.subtitle')}</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 200 }}>
                {heatmapData.map((v, i) => {
                  const pct = maxCount > 0 ? Math.round(v / maxCount * 100) : 0;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: pct > 75 ? 'var(--primary)' : 'var(--ink-55)' }}>{v > 0 ? v : ''}</span>
                      <div
                        style={{
                          width: '100%', borderRadius: '6px 6px 0 0',
                          height: `${Math.max(4, pct * 1.6)}px`,
                          background: pct > 75 ? 'var(--primary)' : pct > 40 ? 'var(--navy)' : 'var(--ink-20)',
                          transition: 'height 0.5s',
                          opacity: pct > 0 ? 1 : 0.3,
                        }}
                      />
                      <span style={{ fontSize: 10, color: 'var(--ink-40)', marginTop: 4 }}>{ALL_HOURS[i]}h</span>
                    </div>
                  );
                })}
              </div>
              {apiStats && (
                <div style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {(() => {
                    const peakEntry = apiStats.hourDistribution.reduce((a, b) => (a.count > b.count ? a : b), { hour: 0, count: 0 });
                    return [
                      [t('owner.heatmap.peak'), peakEntry.count > 0 ? `${peakEntry.hour}h — ${peakEntry.count} res.` : '—'],
                      [t('owner.heatmap.average'), apiStats.avgGuests + ' ' + t('owner.heatmap.guestsAvg')],
                      [t('owner.heatmap.cancellationRate'), apiStats.cancellationRate + '%'],
                    ].map(([l, v]) => (
                      <div key={l as string} style={{ padding: '12px 18px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                        <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-40)', fontWeight: 700, marginBottom: 4 }}>{l}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', fontFamily: '"Fraunces", serif' }}>{v}</div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default OwnerDashboard;
