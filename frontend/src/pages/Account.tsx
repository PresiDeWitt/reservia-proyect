import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Account: React.FC = () => {
  const { isAuthenticated, user } = useAuth() as any;

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', padding: 24 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--ink-20)', marginBottom: 16 }}>person</span>
        <p className="editorial" style={{ fontSize: 28, fontWeight: 300, marginBottom: 8 }}>Tu cuenta te espera.</p>
        <p style={{ color: 'var(--ink-55)', fontSize: 14 }}>Inicia sesión para ver tu perfil.</p>
      </div>
    );
  }

  const displayName = user?.name || user?.username || user?.email?.split('@')[0] || 'Usuario';
  const displayEmail = user?.email || 'usuario@reservia.com';
  const initials = displayName.split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase();

  const fields = [
    { label: 'Nombre', value: displayName, icon: 'person' },
    { label: 'Email', value: displayEmail, icon: 'mail' },
    { label: 'Ciudad', value: 'Granada', icon: 'location_on' },
    { label: 'Preferencias', value: 'Sin restricciones', icon: 'restaurant_menu' },
    { label: 'Idioma', value: 'Español', icon: 'language' },
    { label: 'Teléfono', value: '+34 612 345 678', icon: 'call' },
  ];

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', padding: '48px 24px 96px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Mi cuenta</div>
          <h1 className="editorial" style={{ fontSize: 'clamp(40px,6vw,64px)', fontWeight: 300, letterSpacing: '-0.025em', margin: '0 0 32px', lineHeight: 1 }}>
            Hola, <span className="italic-accent">{displayName.split(' ')[0]}</span>
          </h1>
        </motion.div>

        {/* Profile hero card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grain"
          style={{
            padding: 32, borderRadius: 28,
            background: 'var(--navy)', color: '#fff',
            position: 'relative', overflow: 'hidden', marginBottom: 24,
          }}
        >
          <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), #d95d05)',
              display: 'grid', placeItems: 'center',
              fontSize: 24, fontWeight: 700, color: '#fff',
            }}>
              {initials}
            </div>
            <div>
              <div className="editorial" style={{ fontSize: 28, fontWeight: 400 }}>{displayName}</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{displayEmail} · Miembro desde 2024</div>
              <div style={{ marginTop: 12, height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 999, overflow: 'hidden', maxWidth: 300 }}>
                <div style={{ height: '100%', width: '62%', background: 'var(--primary)' }} />
              </div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>1240 pts · 760 para <strong>Gourmet</strong></div>
            </div>
            <div style={{
              padding: '6px 14px', borderRadius: 999,
              background: 'var(--primary)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.05em', color: '#fff',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>workspace_premium</span>
              Habitué
            </div>
          </div>
        </motion.div>

        {/* Shortcuts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { to: '/my-bookings', icon: 'event', label: 'Mis reservas', sub: 'Historial y próximas' },
            { to: '/favorites', icon: 'favorite', label: 'Favoritos', sub: 'Mesas guardadas' },
            { to: '/search', icon: 'search', label: 'Explorar', sub: 'Descubrir mesas' },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                padding: '20px 18px', borderRadius: 20,
                background: '#fff', border: '1px solid var(--border)',
                textDecoration: 'none', color: 'var(--navy)',
                display: 'flex', flexDirection: 'column', gap: 8,
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-md)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--primary)' }}>{item.icon}</span>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-55)' }}>{item.sub}</div>
            </Link>
          ))}
        </div>

        {/* Info grid */}
        <h2 className="editorial" style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 16 }}>
          Datos personales
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="acct-grid">
          {fields.map(f => (
            <div
              key={f.label}
              style={{
                padding: '18px 20px', borderRadius: 18,
                background: '#fff', border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>{f.icon}</span>
                <button style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--primary)',
                  border: 'none', background: 'transparent', cursor: 'pointer',
                }}>
                  Editar
                </button>
              </div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .acct-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Account;
