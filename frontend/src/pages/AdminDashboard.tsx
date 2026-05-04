import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PLATFORM_STATS = [
  { label: 'Restaurantes activos', value: '1.284', delta: '+34 este mes', icon: 'storefront', up: true },
  { label: 'Reservas totales', value: '48.920', delta: '+22%', icon: 'event', up: true },
  { label: 'Usuarios registrados', value: '210.450', delta: '+15%', icon: 'group', up: true },
  { label: 'Ingresos netos', value: '142.000€', delta: '+31%', icon: 'payments', up: true },
];

const PENDING = [
  { id: 1, name: 'Taberna del Sol', city: 'Sevilla', cuisine: 'Spanish', submitted: 'hace 2h', rating: null },
  { id: 2, name: 'Ramen Tokio', city: 'Barcelona', cuisine: 'Asian', submitted: 'hace 5h', rating: null },
  { id: 3, name: 'La Brasserie', city: 'Granada', cuisine: 'French', submitted: 'ayer', rating: null },
  { id: 4, name: 'Green Bowl', city: 'Valencia', cuisine: 'Healthy', submitted: 'hace 3 días', rating: null },
];

const TOP_RESTAURANTS = [
  { name: 'Osteria del Borgo', city: 'Granada', bookings: 1240, revenue: '18.400€', rating: 4.9 },
  { name: 'Le Petit Atelier', city: 'Barcelona', bookings: 980, revenue: '14.200€', rating: 4.8 },
  { name: 'Sushi Omakase', city: 'Granada', bookings: 870, revenue: '21.600€', rating: 4.9 },
  { name: 'La Fogata', city: 'Sevilla', bookings: 760, revenue: '9.800€', rating: 4.7 },
  { name: 'Botín Clásico', city: 'Granada', bookings: 720, revenue: '11.200€', rating: 4.8 },
];

const CITIES = [
  { name: 'Granada', restaurants: 512, bookings: 21400, pct: 44 },
  { name: 'Barcelona', restaurants: 384, bookings: 15800, pct: 32 },
  { name: 'Valencia', restaurants: 198, bookings: 6200, pct: 13 },
  { name: 'Sevilla', restaurants: 112, bookings: 3400, pct: 7 },
  { name: 'Otras', restaurants: 78, bookings: 2120, pct: 4 },
];

const REVENUE_CHART = [42, 58, 51, 67, 75, 62, 88, 91, 79, 95, 102, 114];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'pending'>('overview');
  const [pendingItems, setPendingItems] = useState(PENDING);

  const handleLogout = () => {
    localStorage.removeItem('reservia_staff_role');
    localStorage.removeItem('reservia_staff_token');
    navigate('/staff', { replace: true });
  };

  useEffect(() => {
    const role = localStorage.getItem('reservia_staff_role');
    const token = localStorage.getItem('reservia_staff_token');
    if (role !== 'admin' || !token) {
      navigate('/staff', { replace: true });
    }
  }, [navigate]);

  const approve = (id: number) => setPendingItems(p => p.filter(r => r.id !== id));
  const reject = (id: number) => setPendingItems(p => p.filter(r => r.id !== id));

  const maxRevenue = Math.max(...REVENUE_CHART);

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', padding: '48px 24px 96px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Admin · Plataforma</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <h1 className="editorial" style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 300, letterSpacing: '-0.02em', margin: 0 }}>
              Panel <span className="italic-accent">ReserVia</span>
            </h1>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                padding: '8px 16px', borderRadius: 999,
                background: '#ecfdf5', color: '#10b981',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                Todos los sistemas operativos
              </div>
              <button onClick={handleLogout} style={{
                height: 36, padding: '0 16px', borderRadius: 999,
                background: '#fef2f2', color: '#ef4444',
                border: '1px solid #fecaca', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>
                Salir
              </button>
            </div>
          </div>
        </motion.div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }} className="admin-kpi">
          {PLATFORM_STATS.map((s, i) => (
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
              <div style={{
                marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11, fontWeight: 700,
                color: i === 0 ? 'rgba(255,255,255,0.8)' : 'var(--emerald)',
                background: i === 0 ? 'rgba(255,255,255,0.15)' : '#ecfdf5',
                padding: '2px 8px', borderRadius: 999,
              }}>
                {s.delta}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 6, marginBottom: 24, width: 'fit-content' }}>
          {([['overview', 'Visión general', 'analytics'], ['restaurants', 'Top restaurantes', 'workspace_premium'], ['pending', `Aprobaciones (${pendingItems.length})`, 'pending_actions']] as const).map(([id, label, icon]) => (
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
              {/* Revenue chart */}
              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: 28 }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Ingresos mensuales</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
                  <div style={{ fontSize: 32, fontWeight: 700, fontFamily: '"Fraunces", serif', letterSpacing: '-0.03em', color: 'var(--navy)' }}>142.000€</div>
                  <span style={{ padding: '4px 12px', borderRadius: 999, background: '#ecfdf5', color: '#10b981', fontSize: 12, fontWeight: 700 }}>+31% vs 2025</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
                  {REVENUE_CHART.map((v, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div
                        style={{
                          width: '100%', borderRadius: '5px 5px 0 0',
                          height: `${(v / maxRevenue) * 120}px`,
                          background: i === 11 ? 'var(--primary)' : i >= 8 ? 'var(--navy)' : 'var(--ink-20)',
                          transition: 'height 0.6s',
                        }}
                      />
                      <span style={{ fontSize: 9, color: 'var(--ink-40)', marginTop: 4 }}>{MONTHS[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cities */}
              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', padding: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 16 }}>Distribución por ciudad</div>
                {CITIES.map(c => (
                  <div key={c.name} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>{c.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--ink-55)' }}>{c.restaurants} restaurantes</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--ink-10)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${c.pct}%`, background: 'var(--primary)', borderRadius: 999 }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-40)', marginTop: 3 }}>{c.bookings.toLocaleString()} reservas · {c.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Top restaurants tab */}
        {activeTab === 'restaurants' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['#', 'Restaurante', 'Ciudad', 'Reservas', 'Ingresos', 'Valoración'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-40)', fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TOP_RESTAURANTS.map((r, i) => (
                    <tr key={r.name}
                      style={{ borderBottom: i < TOP_RESTAURANTS.length - 1 ? '1px solid var(--border)' : 'none' }}
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
                      <td style={{ padding: '16px 20px', fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>{r.name}</td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--ink-55)' }}>{r.city}</td>
                      <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600 }}>{r.bookings.toLocaleString()}</td>
                      <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{r.revenue}</td>
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

        {/* Pending approvals */}
        {activeTab === 'pending' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {pendingItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-55)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 56, display: 'block', marginBottom: 16, color: 'var(--emerald)' }}>check_circle</span>
                <p className="editorial" style={{ fontSize: 28, fontWeight: 300 }}>Todo al día</p>
                <p style={{ fontSize: 14, marginTop: 8 }}>No hay solicitudes pendientes de aprobación.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pendingItems.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      background: '#fff', borderRadius: 16,
                      border: '1px solid var(--border)',
                      padding: '20px 24px',
                      display: 'flex', alignItems: 'center', gap: 20,
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: 'var(--ink-5)',
                      display: 'grid', placeItems: 'center',
                      flexShrink: 0,
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--primary)' }}>storefront</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>{r.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--ink-55)', marginTop: 2 }}>
                        {r.city} · {r.cuisine} · Enviado {r.submitted}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => reject(r.id)}
                        style={{
                          height: 36, padding: '0 16px', borderRadius: 10,
                          border: '1px solid #fecaca', background: '#fef2f2',
                          color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => approve(r.id)}
                        style={{
                          height: 36, padding: '0 16px', borderRadius: 10,
                          border: 'none', background: 'var(--navy)',
                          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        Aprobar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
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
