import React, { useState } from 'react';
import { motion } from 'framer-motion';

const RESERVATIONS = [
  { id: 1, name: 'Elena Martínez', guests: 4, time: '13:00', date: 'Hoy', status: 'confirmed', table: 'A2' },
  { id: 2, name: 'Javier Ruiz', guests: 2, time: '14:00', date: 'Hoy', status: 'pending', table: 'B1' },
  { id: 3, name: 'Sara López', guests: 6, time: '20:30', date: 'Hoy', status: 'confirmed', table: 'C3' },
  { id: 4, name: 'Marco Ferreira', guests: 3, time: '21:00', date: 'Hoy', status: 'confirmed', table: 'A4' },
  { id: 5, name: 'Ana García', guests: 2, time: '21:30', date: 'Hoy', status: 'cancelled', table: 'B2' },
  { id: 6, name: 'Luis Moreno', guests: 5, time: '22:00', date: 'Hoy', status: 'pending', table: 'D1' },
];

const FLOOR = [
  { id: 'A1', x: 8, y: 10, w: 14, h: 14, status: 'free', cap: 2 },
  { id: 'A2', x: 8, y: 30, w: 14, h: 14, status: 'taken', cap: 4, who: 'Elena M.' },
  { id: 'A3', x: 8, y: 50, w: 14, h: 14, status: 'reserved', cap: 2 },
  { id: 'A4', x: 8, y: 70, w: 14, h: 14, status: 'taken', cap: 4, who: 'Marco F.' },
  { id: 'B1', x: 30, y: 10, w: 18, h: 14, status: 'reserved', cap: 2 },
  { id: 'B2', x: 30, y: 30, w: 18, h: 14, status: 'free', cap: 2 },
  { id: 'B3', x: 30, y: 50, w: 18, h: 20, status: 'taken', cap: 6, who: 'Grupo 6' },
  { id: 'C1', x: 58, y: 10, w: 16, h: 20, status: 'free', cap: 4 },
  { id: 'C2', x: 58, y: 36, w: 16, h: 14, status: 'free', cap: 2 },
  { id: 'C3', x: 58, y: 56, w: 16, h: 28, status: 'reserved', cap: 8, who: 'Sara L.' },
  { id: 'D1', x: 82, y: 20, w: 14, h: 60, status: 'free', cap: 10 },
];

const HEATMAP = [55, 70, 85, 60, 45, 90, 75, 80, 65, 50, 40, 35];
const HOURS = ['12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];

const STATS = [
  { label: 'Reservas hoy', value: '24', delta: '+12%', icon: 'event', up: true },
  { label: 'Comensales', value: '86', delta: '+8%', icon: 'group', up: true },
  { label: 'Cancelaciones', value: '3', delta: '-2', icon: 'event_busy', up: false },
  { label: 'Ingresos est.', value: '2.840€', delta: '+18%', icon: 'payments', up: true },
];

const statusColor: Record<string, string> = {
  confirmed: 'var(--emerald)',
  pending: '#f59e0b',
  cancelled: 'var(--ruby)',
};
const statusLabel: Record<string, string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
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

const OwnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reservations' | 'floor' | 'heatmap'>('reservations');
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? RESERVATIONS : RESERVATIONS.filter(r => r.status === filter);

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', padding: '48px 24px 96px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Panel de gestión</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <h1 className="editorial" style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 300, letterSpacing: '-0.02em', margin: 0 }}>
              Osteria <span className="italic-accent">del Borgo</span>
            </h1>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{
                height: 40, padding: '0 18px', borderRadius: 12,
                background: 'var(--navy)', color: '#fff',
                border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                Nueva reserva
              </button>
              <button style={{
                height: 40, padding: '0 18px', borderRadius: 12,
                background: '#fff', color: 'var(--navy)',
                border: '1px solid var(--border)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>settings</span>
                Config
              </button>
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }} className="kpi-grid">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{
                padding: '22px 20px', borderRadius: 20,
                background: '#fff', border: '1px solid var(--border)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)', marginBottom: 12, display: 'block' }}>{s.icon}</span>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--navy)', fontFamily: '"Fraunces", serif' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-55)', marginTop: 4 }}>{s.label}</div>
              <div style={{
                marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11, fontWeight: 700,
                color: s.up ? 'var(--emerald)' : 'var(--ruby)',
                background: s.up ? '#ecfdf5' : '#fef2f2',
                padding: '2px 8px', borderRadius: 999,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{s.up ? 'trending_up' : 'trending_down'}</span>
                {s.delta}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 6, marginBottom: 24, width: 'fit-content' }}>
          {([['reservations', 'Reservas', 'event'], ['floor', 'Plano de sala', 'table_restaurant'], ['heatmap', 'Ocupación', 'bar_chart']] as const).map(([id, label, icon]) => (
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
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {[['all', 'Todas'], ['confirmed', 'Confirmadas'], ['pending', 'Pendientes'], ['cancelled', 'Canceladas']].map(([v, l]) => (
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

            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Mesa', 'Cliente', 'Comensales', 'Hora', 'Estado', 'Acciones'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-40)', fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--ink-5)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>{r.table}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 14, color: 'var(--navy)' }}>{r.name}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--ink-55)', fontSize: 13 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
                          {r.guests}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 13, color: 'var(--navy)' }}>{r.time}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 999,
                          background: `${statusColor[r.status]}22`,
                          color: statusColor[r.status],
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {statusLabel[r.status]}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {r.status === 'pending' && (
                            <button style={{ height: 30, padding: '0 12px', borderRadius: 8, border: 'none', background: '#ecfdf5', color: '#10b981', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Confirmar</button>
                          )}
                          <button style={{ height: 30, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-55)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>more_horiz</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Floor plan tab */}
        {activeTab === 'floor' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20 }}>
              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: 24, overflow: 'hidden' }}>
                <div className="eyebrow" style={{ marginBottom: 16 }}>Plano de sala — Turno noche</div>
                <svg viewBox="0 0 100 90" style={{ width: '100%', fontFamily: 'inherit' }}>
                  <rect x="0" y="0" width="100" height="90" fill="#f8f7f5" rx="2" />
                  <rect x="0" y="0" width="100" height="6" fill="#e2e0db" />
                  <text x="50" y="4.5" textAnchor="middle" fontSize="2.5" fill="#94928e" fontWeight="600">ENTRADA</text>

                  {FLOOR.map(t => (
                    <g key={t.id}>
                      <rect
                        x={t.x} y={t.y} width={t.w} height={t.h}
                        rx="2"
                        fill={floorColor[t.status]}
                        stroke={floorBorder[t.status]}
                        strokeWidth="0.8"
                      />
                      <text x={t.x + t.w / 2} y={t.y + t.h / 2 - 1} textAnchor="middle" fontSize="2.8" fontWeight="700" fill="#1e293b">{t.id}</text>
                      {t.who && <text x={t.x + t.w / 2} y={t.y + t.h / 2 + 3} textAnchor="middle" fontSize="2" fill="#64748b">{t.who}</text>}
                      <text x={t.x + t.w / 2} y={t.y + t.h - 2} textAnchor="middle" fontSize="1.8" fill="#94928e">{t.cap}p</text>
                    </g>
                  ))}
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 18 }}>
                  <div className="eyebrow" style={{ marginBottom: 12 }}>Leyenda</div>
                  {[['free', '#10b981', 'Libre'], ['taken', '#ef4444', 'Ocupada'], ['reserved', '#f59e0b', 'Reservada']].map(([, c, l]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ width: 12, height: 12, borderRadius: 4, background: `${c}33`, border: `1.5px solid ${c}`, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 600 }}>{l}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 18 }}>
                  <div className="eyebrow" style={{ marginBottom: 12 }}>Resumen</div>
                  {[['Mesas libres', FLOOR.filter(t => t.status === 'free').length], ['Ocupadas', FLOOR.filter(t => t.status === 'taken').length], ['Reservadas', FLOOR.filter(t => t.status === 'reserved').length]].map(([l, v]) => (
                    <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--ink-55)' }}>{l}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Heatmap tab */}
        {activeTab === 'heatmap' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: 32 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Ocupación por hora</div>
              <p style={{ fontSize: 14, color: 'var(--ink-55)', marginBottom: 28 }}>Distribución de reservas durante el día</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 200 }}>
                {HEATMAP.map((v, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: v > 75 ? 'var(--primary)' : 'var(--ink-55)' }}>{v}%</span>
                    <div
                      style={{
                        width: '100%', borderRadius: '6px 6px 0 0',
                        height: `${v * 1.6}px`,
                        background: v > 75 ? 'var(--primary)' : v > 50 ? 'var(--navy)' : 'var(--ink-20)',
                        transition: 'height 0.5s',
                        opacity: v > 75 ? 1 : 0.7,
                      }}
                    />
                    <span style={{ fontSize: 10, color: 'var(--ink-40)', marginTop: 4 }}>{HOURS[i]}h</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[['Pico máximo', '20h — 90%'], ['Hora tranquila', '16h — 35%'], ['Media diaria', '65%']].map(([l, v]) => (
                  <div key={l} style={{ padding: '12px 18px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--cream-2)' }}>
                    <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-40)', fontWeight: 700, marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', fontFamily: '"Fraunces", serif' }}>{v}</div>
                  </div>
                ))}
              </div>
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
