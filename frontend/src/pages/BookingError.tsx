import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

type Reason = 'no_availability' | 'payment_failed' | 'not_authenticated' | 'cancelled';

const STATES: Record<Reason, { icon: string; eyebrow: string; title: React.ReactNode; hint: string; cta: { label: string; to: string } }> = {
  no_availability: {
    icon: 'event_busy',
    eyebrow: 'Sin disponibilidad',
    title: (
      <>
        Esa mesa <span className="italic-accent">se nos escapó</span>.
      </>
    ),
    hint: 'Otro comensal se adelantó. Pero hay 280+ mesas más esperándote esta noche.',
    cta: { label: 'Buscar otra mesa', to: '/' },
  },
  payment_failed: {
    icon: 'credit_card_off',
    eyebrow: 'Pago no procesado',
    title: (
      <>
        El pago <span className="italic-accent">no pasó</span>.
      </>
    ),
    hint: 'Revisa los datos de tu tarjeta o prueba con otra forma de pago.',
    cta: { label: 'Reintentar', to: '/' },
  },
  not_authenticated: {
    icon: 'lock',
    eyebrow: 'Acceso requerido',
    title: (
      <>
        Identifícate para <span className="italic-accent">reservar</span>.
      </>
    ),
    hint: 'Necesitamos saber quién eres para confirmar tu mesa.',
    cta: { label: 'Iniciar sesión', to: '/' },
  },
  cancelled: {
    icon: 'event_repeat',
    eyebrow: 'Reserva cancelada',
    title: (
      <>
        Hemos liberado <span className="italic-accent">tu mesa</span>.
      </>
    ),
    hint: 'Esperamos verte pronto. Cuando quieras, prueba con otra fecha.',
    cta: { label: 'Volver a explorar', to: '/' },
  },
};

const BookingError: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reason: Reason = (location.state as { reason?: Reason })?.reason || 'no_availability';
  const s = STATES[reason];

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
          <span className="mat" style={{ fontSize: 52 }}>{s.icon}</span>
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
        {s.eyebrow}
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
        {s.title}
      </h1>
      <p style={{ marginTop: 16, fontSize: 16, color: 'var(--ink-55)', maxWidth: 480, marginInline: 'auto' }}>
        {s.hint}
      </p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
        <Link to={s.cta.to} className="btn btn-primary">
          <span>{s.cta.label}</span>
          <span className="mat" style={{ fontSize: 16 }}>arrow_forward</span>
        </Link>
        <button onClick={() => navigate(-1)} className="btn btn-ghost">
          <span className="mat" style={{ fontSize: 16 }}>arrow_back</span>
          <span>Atrás</span>
        </button>
      </div>
    </motion.div>
  );
};

export default BookingError;
