import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/auth';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const uid = searchParams.get('uid') ?? '';
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const invalid = !uid || !token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError(t('resetPassword.errorMinLength'));
      return;
    }
    if (password !== confirm) {
      setError(t('resetPassword.errorMismatch'));
      return;
    }
    setLoading(true);
    try {
      await authApi.confirmPasswordReset(uid, token, password);
      setDone(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || t('resetPassword.errorInvalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container"
      style={{ padding: '120px 24px 80px', maxWidth: 480, margin: '0 auto' }}
    >
      <div className="eyebrow" style={{ marginBottom: 8 }}>ReserVia</div>
      <h1 className="editorial" style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 300, letterSpacing: '-0.03em' }}>
        {t('resetPassword.title')} <span className="italic-accent">{t('resetPassword.titleAccent')}</span>
      </h1>

      {invalid ? (
        <div style={{ marginTop: 32, padding: 20, background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
          <p style={{ fontSize: 14, color: 'var(--ink-55)' }}>
            {t('resetPassword.invalidLink')}{' '}
            <Link to="/" style={{ color: 'var(--primary)', fontWeight: 700 }}>{t('resetPassword.backHome')}</Link>
          </p>
        </div>
      ) : done ? (
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--emerald)', display: 'grid', placeItems: 'center' }}>
            <span className="mat" style={{ fontSize: 36, color: '#fff' }}>check</span>
          </div>
          <p style={{ fontSize: 16, fontWeight: 600 }}>{t('resetPassword.passwordUpdated')}</p>
          <p style={{ fontSize: 13, color: 'var(--ink-55)' }}>{t('resetPassword.redirecting')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-55)', display: 'block', marginBottom: 6 }}>
              {t('resetPassword.newPasswordLabel')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('resetPassword.newPasswordPlaceholder')}
              required
              minLength={8}
              className="input"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-55)', display: 'block', marginBottom: 6 }}>
              {t('resetPassword.confirmPasswordLabel')}
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={t('resetPassword.confirmPasswordPlaceholder')}
              required
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#e53e3e', padding: '10px 14px', background: 'rgba(229,62,62,0.08)', borderRadius: 'var(--r-sm)' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ height: 52, marginTop: 4 }}>
            {loading ? t('resetPassword.saving') : t('resetPassword.setPassword')}
          </button>
        </form>
      )}
    </motion.div>
  );
};

export default ResetPassword;
