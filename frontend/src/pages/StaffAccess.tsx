import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staffApi } from '../api/staff';

const StaffAccess: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await staffApi.login(code.trim());
      localStorage.setItem('reservia_staff_token', res.token);
      localStorage.setItem('reservia_staff_role', res.role);
      navigate(res.role === 'owner' ? '/owner' : '/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid access code');
    } finally {
      setLoading(false);
    }
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
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ height: 52 }}>
            {loading ? (
              <span className="spin" style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', display: 'inline-block' }} />
            ) : (
              <>
                <span>Entrar</span>
                <span className="mat" style={{ fontSize: 16 }}>arrow_forward</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default StaffAccess;
