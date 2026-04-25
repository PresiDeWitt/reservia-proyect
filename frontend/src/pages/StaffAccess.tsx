import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const STAFF_CODES: Record<string, string> = {
  owner: 'OWNER-2026',
  admin: 'ADMIN-2026',
};

const StaffAccess: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const role = Object.entries(STAFF_CODES).find(([, c]) => c === code.trim().toUpperCase())?.[0];
    if (!role) {
      setError('Código no válido');
      return;
    }
    localStorage.setItem('reservia_staff_role', role);
    navigate(role === 'owner' ? '/owner' : '/admin');
  };

  return (
    <div
      className="grain"
      style={{
        minHeight: '100vh',
        marginTop: -88,
        paddingTop: 88,
        background: 'var(--navy)',
        color: 'var(--cream)',
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 48,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 'var(--r-xl)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(14px)',
          textAlign: 'center',
        }}
      >
        <span className="mat" style={{ fontSize: 48, color: 'var(--primary)' }}>shield_person</span>
        <div className="eyebrow" style={{ color: 'rgba(248,247,245,0.6)', marginTop: 18 }}>
          Acceso restringido
        </div>
        <h1 className="editorial" style={{ fontSize: 40, fontWeight: 300, marginTop: 8 }}>
          Equipo <span className="italic-accent">ReserVia</span>
        </h1>
        <form onSubmit={submit} style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código de acceso"
            className="input"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--cream)',
              fontFamily: 'monospace',
              letterSpacing: '0.2em',
              textAlign: 'center',
              fontSize: 16,
            }}
          />
          {error && <div style={{ color: 'var(--ruby)', fontSize: 12 }}>{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ height: 52 }}>
            <span>Entrar</span>
            <span className="mat" style={{ fontSize: 16 }}>arrow_forward</span>
          </button>
        </form>
        <div style={{ fontSize: 11, opacity: 0.5, marginTop: 24 }}>
          Demo: <span style={{ fontFamily: 'monospace' }}>OWNER-2026</span> ·{' '}
          <span style={{ fontFamily: 'monospace' }}>ADMIN-2026</span>
        </div>
      </motion.div>
    </div>
  );
};

export default StaffAccess;
