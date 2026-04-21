import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { restaurantsApi, type Restaurant } from '../api/restaurants';
import { reservationsApi } from '../api/reservations';
import { useAuth } from '../context/AuthContext';

const TIME_SLOTS_LUNCH = ['13:00', '13:30', '14:00', '14:30', '15:00'];
const TIME_SLOTS_DINNER = ['20:00', '20:30', '21:00', '21:30', '22:00', '22:30'];
const UNAVAILABLE = new Set(['13:30', '21:30']);

const AMENITIES = [
  { i: 'restaurant_menu', t: 'Carta de temporada' },
  { i: 'deck', t: 'Terraza cubierta' },
  { i: 'local_bar', t: 'Barra de cocktails' },
  { i: 'accessible', t: 'Accesible' },
  { i: 'pets', t: 'Pet friendly' },
  { i: 'wifi', t: 'Wi-Fi' },
];

const MOCK_REVIEWS = [
  { id: 1, user: 'Elena R.', avatar: 'ER', rating: 5, date: 'Hace 2 días', text: 'Una experiencia memorable. El ambiente es perfecto y el trato del personal es exquisito. Volveré sin duda.', likes: 8, verified: true },
  { id: 2, user: 'Marco F.', avatar: 'MF', rating: 5, date: 'Hace 1 semana', text: 'La cocina de temporada es simplemente espectacular. Cada plato cuenta una historia. Mi restaurante favorito de Madrid.', likes: 14, verified: true },
  { id: 3, user: 'Sara L.', avatar: 'SL', rating: 4, date: 'Hace 2 semanas', text: 'Muy buena experiencia en general. El maridaje de vinos fue todo un acierto. Repetiré seguro.', likes: 5, verified: false },
];

const Stars: React.FC<{ value: number; size?: number }> = ({ value, size = 14 }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--primary)' }}>
    <span className="material-symbols-outlined" style={{ fontSize: size, fontVariationSettings: "'FILL' 1" }}>stars</span>
    <span style={{ fontWeight: 700, fontSize: size }}>{value}</span>
  </span>
);

// 3-step reservation widget
const ReservationWidget: React.FC<{ restaurant: Restaurant; isAuthenticated: boolean }> = ({ restaurant, isAuthenticated }) => {
  const [step, setStep] = useState(1);
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [service, setService] = useState<'lunch' | 'dinner'>('dinner');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [occasion, setOccasion] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ code: string; date: string; time: string; guests: number } | null>(null);
  const [error, setError] = useState('');

  const slots = service === 'lunch' ? TIME_SLOTS_LUNCH : TIME_SLOTS_DINNER;

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      await reservationsApi.create({ restaurantId: Number(restaurant.id), date, time, guests });
      const code = 'RV-' + Math.floor(1000 + Math.random() * 9000);
      setDone({ code, date, time, guests });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al confirmar reserva');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{
        position: 'sticky', top: 100,
        padding: 28, borderRadius: 28, background: '#fff',
        border: '1px solid var(--border)', boxShadow: 'var(--sh-md)', textAlign: 'center',
      }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--emerald)', display: 'grid', placeItems: 'center', margin: '0 auto', color: '#fff' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36 }}>check</span>
        </div>
        <div className="eyebrow" style={{ marginTop: 20, color: 'var(--emerald)' }}>Mesa confirmada</div>
        <h3 className="editorial" style={{ fontSize: 34, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 8 }}>
          Te <span className="italic-accent">esperamos</span>.
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
          {[['Fecha', done.date], ['Hora', done.time], ['Mesa', `${done.guests} pers.`], ['Código', done.code]].map(([l, v]) => (
            <div key={l} style={{ padding: 12, background: 'var(--cream-2)', borderRadius: 12 }}>
              <div className="eyebrow" style={{ marginBottom: 4 }}>{l}</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, padding: 16, background: 'var(--navy)', color: '#fff', borderRadius: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.7 }}>Ticket digital</div>
          <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 24, letterSpacing: '0.4em' }}>{done.code}</div>
          <div style={{ marginTop: 10, display: 'flex', gap: 1, justifyContent: 'center', height: 32 }}>
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} style={{ width: i % 3 === 0 ? 3 : 1, height: '100%', background: 'rgba(255,255,255,0.7)', opacity: [0.3, 0.7, 1, 0.4, 1][i % 5] }} />
            ))}
          </div>
        </div>
        <button
          onClick={() => { setDone(null); setStep(1); setTime(''); }}
          style={{
            marginTop: 16, width: '100%', height: 44, borderRadius: 12,
            background: 'var(--navy)', color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Reservar otra mesa
        </button>
      </motion.div>
    );
  }

  return (
    <div style={{ position: 'sticky', top: 100, padding: 24, borderRadius: 28, background: '#fff', border: '1px solid var(--border)', boxShadow: 'var(--sh-md)' }}>
      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Reserva tu mesa</div>
          <h3 className="editorial" style={{ fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em', margin: 0 }}>
            Paso <span className="italic-accent" style={{ fontStyle: 'italic' }}>{step}</span>/3
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ width: 24, height: 3, borderRadius: 2, background: step >= n ? 'var(--primary)' : 'var(--ink-10)', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>

      {/* Step 1: Date / guests / time */}
      {step === 1 && (
        <AnimatePresence mode="wait">
          <motion.div key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Comensales</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => setGuests(n)} style={{
                  height: 40, borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: guests === n ? 'var(--navy)' : 'var(--cream-2)',
                  color: guests === n ? '#fff' : 'var(--navy)',
                  border: '1px solid ' + (guests === n ? 'var(--navy)' : 'var(--border)'),
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>{n}</button>
              ))}
            </div>

            <div className="eyebrow" style={{ marginBottom: 8 }}>Fecha</div>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{
                width: '100%', height: 44, padding: '0 14px', marginBottom: 16,
                borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--cream-2)', color: 'var(--navy)',
                fontSize: 14, fontFamily: 'inherit', outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />

            <div className="eyebrow" style={{ marginBottom: 8 }}>Servicio</div>
            <div style={{ display: 'flex', background: 'var(--cream-2)', borderRadius: 10, padding: 4, marginBottom: 16, border: '1px solid var(--border)' }}>
              {[['lunch', 'Comida'], ['dinner', 'Cena']].map(([v, l]) => (
                <button key={v} onClick={() => { setService(v as 'lunch' | 'dinner'); setTime(''); }} style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: service === v ? 'var(--navy)' : 'transparent',
                  color: service === v ? '#fff' : 'var(--ink-55)',
                  fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
                }}>{l}</button>
              ))}
            </div>

            <div className="eyebrow" style={{ marginBottom: 8 }}>Hora</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 20 }}>
              {slots.map(s => {
                const unavail = UNAVAILABLE.has(s);
                return (
                  <button key={s} disabled={unavail} onClick={() => setTime(s)} style={{
                    height: 40, borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: time === s ? 'var(--primary)' : unavail ? 'var(--ink-5)' : 'var(--cream-2)',
                    color: time === s ? '#fff' : unavail ? 'var(--ink-20)' : 'var(--navy)',
                    border: '1px solid ' + (time === s ? 'var(--primary)' : 'var(--border)'),
                    textDecoration: unavail ? 'line-through' : 'none',
                    cursor: unavail ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                  }}>{s}</button>
                );
              })}
            </div>

            <button
              disabled={!time}
              onClick={() => setStep(2)}
              style={{
                width: '100%', height: 50, borderRadius: 14, border: 'none',
                background: time ? 'var(--navy)' : 'var(--ink-20)',
                color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: time ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (time) (e.currentTarget as HTMLElement).style.background = 'var(--primary)'; }}
              onMouseLeave={e => { if (time) (e.currentTarget as HTMLElement).style.background = 'var(--navy)'; }}
            >
              <span>Continuar</span>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
            </button>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Step 2: Occasion / note */}
      {step === 2 && (
        <AnimatePresence mode="wait">
          <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Ocasión (opcional)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {['Cumpleaños', 'Aniversario', 'Primera cita', 'Negocios', 'Casual'].map(o => (
                <button key={o} onClick={() => setOccasion(occasion === o ? '' : o)} style={{
                  padding: '6px 14px', borderRadius: 999,
                  border: '1px solid',
                  background: occasion === o ? 'var(--primary)' : '#fff',
                  borderColor: occasion === o ? 'var(--primary)' : 'var(--border)',
                  color: occasion === o ? '#fff' : 'var(--navy)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                }}>{o}</button>
              ))}
            </div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Nota al restaurante</div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Alergias, mesa tranquila, silla para bebé..."
              style={{
                width: '100%', minHeight: 90, padding: 12, marginBottom: 20,
                borderRadius: 12, border: '1px solid var(--border)',
                background: 'var(--cream-2)', color: 'var(--navy)',
                fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, height: 48, borderRadius: 12, border: '1px solid var(--border)', background: '#fff', color: 'var(--navy)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                Atrás
              </button>
              <button onClick={() => setStep(3)} style={{ flex: 2, height: 48, borderRadius: 12, border: 'none', background: 'var(--navy)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--navy)')}
              >
                Revisar
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Step 3: Summary + confirm */}
      {step === 3 && (
        <AnimatePresence mode="wait">
          <motion.div key="s3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <div style={{ padding: 16, background: 'var(--cream-2)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>{restaurant.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 12, marginTop: 10 }}>
                <div><div className="eyebrow" style={{ marginBottom: 2 }}>Día</div><div style={{ fontWeight: 700 }}>{date}</div></div>
                <div><div className="eyebrow" style={{ marginBottom: 2 }}>Hora</div><div style={{ fontWeight: 700 }}>{time}</div></div>
                <div><div className="eyebrow" style={{ marginBottom: 2 }}>Mesa</div><div style={{ fontWeight: 700 }}>{guests}p</div></div>
              </div>
              {occasion && <div style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-55)' }}>Ocasión: <strong>{occasion}</strong></div>}
              {note && <div style={{ marginTop: 4, fontSize: 11, color: 'var(--ink-55)', fontStyle: 'italic' }}>"{note}"</div>}
            </div>
            <div style={{ padding: 10, background: 'rgba(249,116,21,0.08)', borderRadius: 10, fontSize: 11, color: 'var(--ink-55)', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--primary)', flexShrink: 0 }}>info</span>
              Sin cargo por ahora. Sólo depósito de €10/pers si cancelas con menos de 4h.
            </div>
            {!isAuthenticated && <p style={{ fontSize: 12, color: '#b45309', textAlign: 'center', fontWeight: 600, marginBottom: 12 }}>Inicia sesión para finalizar la reserva.</p>}
            {error && <p style={{ fontSize: 12, color: 'var(--ruby)', textAlign: 'center', marginBottom: 12 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep(2)} style={{ width: 44, height: 50, borderRadius: 12, border: '1px solid var(--border)', background: '#fff', color: 'var(--navy)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
              </button>
              <button
                onClick={submit}
                disabled={loading || !isAuthenticated}
                style={{
                  flex: 1, height: 50, borderRadius: 12, border: 'none',
                  background: !isAuthenticated ? 'var(--ink-20)' : 'var(--navy)',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: !isAuthenticated || loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { if (isAuthenticated) (e.currentTarget as HTMLElement).style.background = 'var(--primary)'; }}
                onMouseLeave={e => { if (isAuthenticated) (e.currentTarget as HTMLElement).style.background = 'var(--navy)'; }}
              >
                {loading
                  ? <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                  : <><span>Confirmar reserva</span><span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span></>
                }
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--ink-40)', marginTop: 14 }}>
        Sin cargos inesperados · Cancelación gratuita
      </p>
    </div>
  );
};

const RestaurantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'acerca' | 'menu' | 'resenas' | 'info'>('acerca');
  const [faved, setFaved] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);

  useEffect(() => {
    if (id) {
      restaurantsApi.get(id).then(setRestaurant).catch(console.error).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!restaurant) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-55)' }}>
      Restaurante no encontrado.
    </div>
  );

  const galleryImages = [restaurant.image, restaurant.image, restaurant.image, restaurant.image];

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', paddingBottom: 80 }}>
      {/* ── Cinematic hero — overlaps header ── */}
      <div style={{
        position: 'relative',
        height: '65vh', minHeight: 500,
        marginTop: -72, paddingTop: 72,
        overflow: 'hidden',
      }}>
        <img
          src={galleryImages[galleryIdx]}
          alt={restaurant.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.5s' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.1) 40%, rgba(15,23,42,0.88) 100%)' }} />

        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 48, color: '#fff' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: 10 }}>
              {t(`cuisines.${restaurant.cuisine}`, { defaultValue: restaurant.cuisine })} · {restaurant.location}
            </div>
            <h1 className="editorial" style={{ fontSize: 'clamp(44px,7vw,96px)', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 0.96, margin: '0 0 14px' }}>
              {restaurant.name}
            </h1>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
              <Stars value={restaurant.rating} size={16} />
              <span style={{ opacity: 0.6 }}>·</span>
              <span style={{ fontSize: 13 }}>{restaurant.reviewsCount} reseñas</span>
              <span style={{ opacity: 0.6 }}>·</span>
              <span style={{ fontSize: 13 }}>{restaurant.priceRange}</span>
              <span style={{ opacity: 0.6 }}>·</span>
              <span style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 0 2px rgba(16,185,129,0.3)', animation: 'pulse-glow 2s infinite' }} />
                Abierto hasta las 23:00
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => setFaved(f => !f)}
                style={{
                  height: 40, padding: '0 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: faved ? 'var(--primary)' : '#fff',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: faved ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                {faved ? 'Guardado' : 'Guardar'}
              </button>
              <button style={{
                height: 40, padding: '0 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>ios_share</span>
                Compartir
              </button>
              <button style={{
                height: 40, padding: '0 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>directions</span>
                Cómo llegar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gallery thumbs ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '12px 24px' }}>
          <div className="scroll-x" style={{ display: 'flex', gap: 8 }}>
            {galleryImages.map((src, i) => (
              <button
                key={i}
                onClick={() => setGalleryIdx(i)}
                style={{
                  flexShrink: 0, width: 130, height: 82, borderRadius: 10, overflow: 'hidden',
                  border: galleryIdx === i ? '2px solid var(--primary)' : '2px solid transparent',
                  transition: 'border-color 0.2s',
                  padding: 0, cursor: 'pointer',
                }}
              >
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </button>
            ))}
            <button style={{ flexShrink: 0, width: 130, height: 82, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--cream-2)', cursor: 'pointer', display: 'grid', placeItems: 'center', gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--ink-55)' }}>photo_library</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-55)' }}>Ver todas</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 0', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48 }} className="detail-grid">
        {/* Left: tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 32 }}>
            {([['acerca', 'Sobre el lugar'], ['menu', 'Carta'], ['resenas', 'Reseñas'], ['info', 'Info práctica']] as const).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                style={{
                  padding: '14px 18px', fontSize: 13, fontWeight: 700,
                  color: tab === k ? 'var(--navy)' : 'var(--ink-55)',
                  borderBottom: tab === k ? '2px solid var(--primary)' : '2px solid transparent',
                  marginBottom: -2, background: 'none', border: 'none', cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Sobre el lugar */}
          {tab === 'acerca' && (
            <motion.div key="acerca" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--ink)', marginBottom: 40, maxWidth: 640 }}>
                {restaurant.description}
              </p>

              <div style={{ marginBottom: 48 }}>
                <div className="eyebrow" style={{ marginBottom: 14 }}>Del chef</div>
                <blockquote className="editorial" style={{ fontSize: 26, fontWeight: 300, fontStyle: 'italic', letterSpacing: '-0.01em', lineHeight: 1.35, maxWidth: 600, color: 'var(--navy)', margin: 0 }}>
                  "Nuestra firma es la <span className="italic-accent">cocina de temporada</span>. Si vienes por primera vez, empieza por ahí."
                </blockquote>
                <div style={{ fontSize: 13, color: 'var(--ink-55)', marginTop: 12 }}>— El chef</div>
              </div>

              <div>
                <div className="eyebrow" style={{ marginBottom: 14 }}>Bueno saber</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {AMENITIES.map(x => (
                    <div key={x.t} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 14, background: '#fff', border: '1px solid var(--border)', borderRadius: 12 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>{x.i}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{x.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Carta */}
          {tab === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Platos destacados</div>
              {restaurant.menuItems && restaurant.menuItems.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {restaurant.menuItems.map((item, i) => (
                    <div key={item.id} style={{
                      display: 'flex', gap: 16, padding: 20, background: '#fff',
                      border: '1px solid var(--border)', borderRadius: 16, alignItems: 'center',
                      transition: 'border-color 0.2s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                          <h4 className="editorial" style={{ fontSize: 20, fontWeight: 400, letterSpacing: '-0.01em', margin: 0 }}>{item.name}</h4>
                          {i === 0 && (
                            <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 700 }}>Firma</span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--ink-55)', margin: 0 }}>{item.description}</p>
                      </div>
                      <span className="editorial" style={{ fontSize: 22, fontWeight: 400, color: 'var(--primary)', flexShrink: 0 }}>€{item.price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-55)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>restaurant_menu</span>
                  <p>La carta está siendo actualizada.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Reseñas */}
          {tab === 'resenas' && (
            <motion.div key="resenas" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Rating overview */}
              <div style={{ display: 'flex', gap: 40, alignItems: 'center', padding: 24, background: '#fff', border: '1px solid var(--border)', borderRadius: 18, marginBottom: 28 }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div className="editorial" style={{ fontSize: 64, fontWeight: 300, lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--navy)' }}>{restaurant.rating}</div>
                  <Stars value={restaurant.rating} size={16} />
                  <div style={{ fontSize: 12, color: 'var(--ink-55)', marginTop: 4 }}>{restaurant.reviewsCount} reseñas</div>
                </div>
                <div style={{ flex: 1 }}>
                  {[['Comida', 4.9], ['Servicio', 4.8], ['Ambiente', 4.7], ['Relación calidad/precio', 4.5]].map(([k, v]) => (
                    <div key={k as string} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ fontSize: 12, width: 180, color: 'var(--ink-55)' }}>{k}</div>
                      <div style={{ flex: 1, height: 6, background: 'var(--ink-5)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${((v as number) / 5) * 100}%`, background: 'var(--primary)', borderRadius: 999 }} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, width: 28, textAlign: 'right', color: 'var(--navy)' }}>{v as number}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Individual reviews */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {MOCK_REVIEWS.map(rev => (
                  <div key={rev.id} style={{ padding: 20, background: '#fff', border: '1px solid var(--border)', borderRadius: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{rev.avatar}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {rev.user}
                            {rev.verified && <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>verified</span>}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--ink-55)' }}>{rev.date}</div>
                        </div>
                      </div>
                      <Stars value={rev.rating} size={13} />
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink)', margin: 0 }}>{rev.text}</p>
                    <div style={{ marginTop: 10, display: 'flex', gap: 12, fontSize: 11, color: 'var(--ink-55)' }}>
                      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-55)', fontSize: 11 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>thumb_up</span>
                        Útil ({rev.likes})
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-55)', fontSize: 11 }}>Responder</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Info práctica */}
          {tab === 'info' && (
            <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { t: 'Dirección', v: restaurant.address, i: 'location_on' },
                  { t: 'Teléfono', v: '+34 912 345 678', i: 'call' },
                  { t: 'Horario', v: 'Mar–Dom · 13:00–16:00 · 20:00–23:00', i: 'schedule' },
                  { t: 'Formas de pago', v: 'Visa · MC · AmEx · Bizum', i: 'credit_card' },
                  { t: 'Código vestimenta', v: 'Smart casual', i: 'checkroom' },
                  { t: 'Aparcamiento', v: 'SER verde · parking 200m', i: 'local_parking' },
                ].map(x => (
                  <div key={x.t} style={{ padding: 20, background: '#fff', border: '1px solid var(--border)', borderRadius: 16 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)', display: 'block', marginBottom: 10 }}>{x.i}</span>
                    <div className="eyebrow" style={{ marginBottom: 6 }}>{x.t}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{x.v}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Right: reservation widget */}
        <div>
          <ReservationWidget restaurant={restaurant} isAuthenticated={isAuthenticated} />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.4)} 50%{box-shadow:0 0 0 4px rgba(16,185,129,0.1)} }
        @media (max-width: 900px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default RestaurantDetails;
