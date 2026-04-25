import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AccountPage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="container" style={{ padding: '120px 24px', textAlign: 'center' }}>
        <h1 className="editorial" style={{ fontSize: 56, fontWeight: 300 }}>
          Identifícate para ver tu <span className="italic-accent">cuenta</span>
        </h1>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 28 }}>
          <span>Volver al inicio</span>
        </Link>
      </div>
    );
  }

  const initials = (user.name || user.email)
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container"
      style={{ padding: '120px 24px 80px' }}
    >
      <div
        className="grain"
        style={{
          background: 'var(--navy)',
          color: 'var(--cream)',
          padding: '48px',
          borderRadius: 'var(--r-xl)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-700))',
              display: 'grid',
              placeItems: 'center',
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            {initials}
          </div>
          <div>
            <div className="eyebrow" style={{ color: 'rgba(248,247,245,0.5)' }}>Hola,</div>
            <h1 className="editorial" style={{ fontSize: 56, fontWeight: 300, marginTop: 4 }}>
              {user.name || user.email}
            </h1>
            <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>{user.email}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div className="eyebrow" style={{ color: 'rgba(248,247,245,0.5)' }}>Puntos</div>
            <div className="editorial mono-num" style={{ fontSize: 56, fontWeight: 300, color: 'var(--primary)' }}>
              0
            </div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>Sigue reservando para subir de nivel</div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {[
          { to: '/my-bookings', icon: 'event', t: 'Mis reservas', d: 'Próximas y pasadas' },
          { to: '/favorites', icon: 'favorite', t: 'Favoritos', d: 'Restaurantes guardados' },
          { to: '/map', icon: 'map', t: 'Mapa', d: 'Explora cerca de ti' },
        ].map((x) => (
          <Link
            key={x.to}
            to={x.to}
            className="card card-lift"
            style={{
              padding: 24,
              background: 'var(--surface-3)',
              borderRadius: 'var(--r-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <span
              className="grid place-items-center"
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--r-md)',
                background: 'rgba(249,116,21,0.12)',
              }}
            >
              <span className="mat" style={{ fontSize: 26, color: 'var(--primary)' }}>{x.icon}</span>
            </span>
            <div>
              <h3 className="editorial" style={{ fontSize: 22, fontWeight: 400 }}>{x.t}</h3>
              <p style={{ fontSize: 13, color: 'var(--ink-55)', marginTop: 4 }}>{x.d}</p>
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={logout}
        className="btn btn-ghost"
        style={{ marginTop: 32, color: 'var(--ruby)', borderColor: 'rgba(225,29,72,0.3)' }}
      >
        <span className="mat" style={{ fontSize: 16 }}>logout</span>
        <span>Cerrar sesión</span>
      </button>
    </motion.div>
  );
};

export default AccountPage;
