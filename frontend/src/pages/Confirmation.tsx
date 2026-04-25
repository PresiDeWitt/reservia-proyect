import React, { useEffect, useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Restaurant } from '../api/restaurants';

interface State {
  restaurant: Restaurant;
  date: string;
  time: string;
  guests: number;
  occasion?: string;
  note?: string;
  code: string;
}

const Confetti: React.FC = () => {
  const pieces = Array.from({ length: 44 });
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 50 }}>
      {pieces.map((_, i) => {
        const vx = (Math.random() - 0.5) * 600;
        const vy = -(Math.random() * 400 + 200);
        const colors = ['#f97415', '#10B981', '#0F172A', '#E11D48'];
        const c = colors[i % colors.length];
        return (
          <span
            key={i}
            style={
              {
                position: 'absolute',
                left: '50%',
                top: '40%',
                width: 8,
                height: 14,
                background: c,
                borderRadius: 2,
                transform: `translate(0,0) rotate(${Math.random() * 360}deg)`,
                animation: `confetti-${i} 1.6s cubic-bezier(0.2,0.8,0.2,1) forwards`,
                ['--vx' as never]: `${vx}px`,
                ['--vy' as never]: `${vy}px`,
              } as React.CSSProperties
            }
          />
        );
      })}
      <style>{pieces
        .map(
          (_, i) => `
        @keyframes confetti-${i} {
          to { transform: translate(${(Math.random() - 0.5) * 800}px, ${Math.random() * 600 + 200}px) rotate(${Math.random() * 720}deg); opacity: 0; }
        }`,
        )
        .join('\n')}</style>
    </div>
  );
};

const Confirmation: React.FC = () => {
  const location = useLocation();
  const state = location.state as State | null;
  const [now, setNow] = useState(new Date());
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    const t = setTimeout(() => setShowConfetti(false), 2000);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, []);

  if (!state) return <Navigate to="/" replace />;

  const { restaurant, date, time, guests, occasion, note, code } = state;
  const target = new Date(`${date}T${time}`);
  const diffMs = target.getTime() - now.getTime();
  const hours = Math.max(0, Math.floor(diffMs / 3_600_000));
  const minutes = Math.max(0, Math.floor((diffMs % 3_600_000) / 60_000));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container" style={{ padding: '120px 24px 80px' }}>
      {showConfetti && <Confetti />}
      <div className="container-narrow" style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1] }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'var(--emerald)',
            margin: '0 auto',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            boxShadow: '0 20px 50px -10px rgba(16,185,129,0.4)',
          }}
        >
          <span className="mat" style={{ fontSize: 56 }}>check</span>
        </motion.div>

        <div className="eyebrow" style={{ color: 'var(--emerald)', marginTop: 28 }}>
          Reserva confirmada
        </div>
        <h1
          className="editorial"
          style={{
            fontSize: 'clamp(40px,6vw,80px)',
            fontWeight: 300,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginTop: 12,
          }}
        >
          Te <span className="italic-accent">esperamos</span>.
        </h1>

        {/* Ticket */}
        <div
          className="card"
          style={{
            margin: '40px auto 0',
            maxWidth: 560,
            background: 'var(--surface-3)',
            borderRadius: 'var(--r-xl)',
            overflow: 'hidden',
            textAlign: 'left',
            boxShadow: 'var(--sh-md)',
          }}
        >
          <div style={{ position: 'relative', height: 200 }}>
            <img src={restaurant.image} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(15,23,42,0.85))' }} />
            <div style={{ position: 'absolute', bottom: 16, left: 20, color: '#fff' }}>
              <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)' }}>{restaurant.cuisine} · {restaurant.location}</div>
              <h2 className="editorial" style={{ fontSize: 32, fontWeight: 400, marginTop: 4 }}>{restaurant.name}</h2>
            </div>
          </div>

          {/* Tear line */}
          <div style={{ position: 'relative', height: 24 }}>
            <div
              style={{
                position: 'absolute',
                left: -12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--surface)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: -12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--surface)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 16,
                right: 16,
                borderTop: '2px dashed var(--border-strong)',
              }}
            />
          </div>

          <div style={{ padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <div>
                <div className="eyebrow">Fecha</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{date}</div>
              </div>
              <div>
                <div className="eyebrow">Hora</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{time}</div>
              </div>
              <div>
                <div className="eyebrow">Mesa</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{guests} pers.</div>
              </div>
            </div>
            {occasion && (
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-55)' }}>
                Ocasión: <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{occasion}</span>
              </div>
            )}
            {note && (
              <div style={{ marginTop: 4, fontSize: 12, color: 'var(--ink-55)' }}>
                Nota: <span style={{ color: 'var(--ink)' }}>{note}</span>
              </div>
            )}

            <div
              style={{
                marginTop: 20,
                padding: 16,
                background: 'var(--navy)',
                color: 'var(--cream)',
                borderRadius: 'var(--r-md)',
                textAlign: 'center',
              }}
            >
              <div className="eyebrow" style={{ color: 'rgba(248,247,245,0.6)' }}>Código</div>
              <div className="mono-num" style={{ marginTop: 6, fontFamily: 'monospace', fontSize: 24, letterSpacing: '0.4em' }}>
                {code}
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 1, justifyContent: 'center', height: 36 }}>
                {Array.from({ length: 60 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i % 3 === 0 ? 3 : 1,
                      height: '100%',
                      background: 'var(--cream)',
                      opacity: ((i * 13) % 7) > 1 ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: 'rgba(249,116,21,0.08)',
                borderRadius: 'var(--r-md)',
                fontSize: 12,
                color: 'var(--ink-55)',
                textAlign: 'center',
              }}
            >
              <span className="mat" style={{ fontSize: 14, color: 'var(--primary)', verticalAlign: 'middle' }}>schedule</span>{' '}
              Llegan en <span className="mono-num" style={{ color: 'var(--ink)', fontWeight: 700 }}>{hours}h {minutes}m</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          <Link to="/my-bookings" className="btn btn-primary">
            <span>Ver mis reservas</span>
            <span className="mat" style={{ fontSize: 16 }}>arrow_forward</span>
          </Link>
          <Link to="/" className="btn btn-ghost">
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Confirmation;
