import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type Reason = 'no_availability' | 'payment_failed' | 'not_authenticated' | 'cancelled';

const ICON_MAP: Record<Reason, string> = {
  no_availability: 'event_busy',
  payment_failed: 'credit_card_off',
  not_authenticated: 'lock',
  cancelled: 'event_repeat',
};

const KEY_MAP: Record<Reason, string> = {
  no_availability: 'noAvailability',
  payment_failed: 'paymentFailed',
  not_authenticated: 'notAuthenticated',
  cancelled: 'cancelled',
};

const BookingError: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const state = location.state as { reason?: Reason; restaurant?: { id: string | number } } | null;
  const reason: Reason = state?.reason || 'no_availability';
  const key = KEY_MAP[reason];
  const icon = ICON_MAP[reason];

  const ctaTo = reason === 'no_availability' && state?.restaurant?.id
    ? `/restaurant/${state.restaurant.id}`
    : '/';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container container-narrow"
      style={{ padding: '120px 24px 80px', textAlign: 'center' }}
    >
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1] }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'var(--ruby)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <span className="mat" style={{ fontSize: 52 }}>{icon}</span>
        </motion.div>
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid var(--ruby)',
            animation: 'ripple 2s ease-out infinite',
            pointerEvents: 'none',
          }}
        />
      </div>

      <div className="eyebrow" style={{ color: 'var(--ruby)', marginTop: 28 }}>
        {t(`bookingError.${key}.eyebrow`)}
      </div>
      <h1
        className="editorial"
        style={{
          fontSize: 'clamp(40px,6vw,80px)',
          fontWeight: 300,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          marginTop: 12,
        }}
      >
        {t(`bookingError.${key}.title`)}{' '}
        <span className="italic-accent">{t(`bookingError.${key}.titleAccent`)}</span>.
      </h1>
      <p style={{ marginTop: 16, fontSize: 16, color: 'var(--ink-55)', maxWidth: 480, marginInline: 'auto' }}>
        {t(`bookingError.${key}.hint`)}
      </p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
        <Link to={ctaTo} className="btn btn-primary">
          <span>{t(`bookingError.${key}.cta`)}</span>
          <span className="mat" style={{ fontSize: 16 }}>arrow_forward</span>
        </Link>
        <button onClick={() => navigate(-1)} className="btn btn-ghost">
          <span className="mat" style={{ fontSize: 16 }}>arrow_back</span>
          <span>{t('bookingError.back')}</span>
        </button>
      </div>
    </motion.div>
  );
};

export default BookingError;
