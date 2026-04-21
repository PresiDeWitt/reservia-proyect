import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { restaurantsApi, type Restaurant } from '../api/restaurants';
import { reservationsApi } from '../api/reservations';
import { useAuth } from '../context/AuthContext';

const LUNCH_SLOTS = ['13:00', '13:30', '14:00', '14:30', '15:00'];
const DINNER_SLOTS = ['20:00', '20:30', '21:00', '21:30', '22:00', '22:30'];
const UNAVAILABLE = new Set(['13:30', '21:30']);

const MOCK_REVIEWS = [
  { id: 1, user: 'Ana R.', avatar: 'AR', date: 'Hace 2 días', rating: 5, text: 'Experiencia increíble. El chef vino a nuestra mesa a explicar cada plato. La relación calidad-precio es excepcional.', likes: 12, verified: true },
  { id: 2, user: 'Marco L.', avatar: 'ML', date: 'Hace 1 semana', rating: 4, text: 'Muy buen ambiente y servicio impecable. Los postres son espectaculares. Volveré sin duda.', likes: 8, verified: true },
  { id: 3, user: 'Sofia M.', avatar: 'SM', date: 'Hace 2 semanas', rating: 5, text: 'Una de las mejores cenas que he tenido en Madrid. El menú de temporada es simplemente perfecto.', likes: 21, verified: false },
];

const Stars: React.FC<{ value: number; size?: number }> = ({ value, size = 14 }) => (
  <div style={{ display: 'inline-flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <span key={n} className="material-symbols-outlined" style={{ fontSize: size, color: n <= Math.round(value) ? 'var(--primary)' : 'var(--ink-20)', fontVariationSettings: "'FILL' 1" }}>star</span>
    ))}
  </div>
);

const ReservationWidget: React.FC<{ restaurant: Restaurant }> = ({ restaurant }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [service, setService] = useState<'lunch' | 'dinner'>('dinner');
  const [time, setTime] = useState('');
  const [occasion, setOccasion] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ code: string; date: string; time: string; guests: number } | null>(null);
  const [error, setError] = useState('');

  const slots = service === 'lunch' ? LUNCH_SLOTS : DINNER_SLOTS;

  const submit = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError('');
    try {
      await reservationsApi.create({ restaurantId: Number(restaurant.id), date, time, guests });
      const code = 'RV-' + Math.floor(1000 + Math.random() * 9000);
      setDone({ code, date, time, guests });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al reservar');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="scale-in" style={{ position: 'sticky', top: 100, padding: 28, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-md)', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--emerald)', display: 'grid', placeItems: 'center', margin: '0 auto', color: '#fff' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36 }}>check</span>
        </div>
        <div className="eyebrow" style={{ marginTop: 20, color: 'var(--emerald)' }}>Mesa confirmada</div>
        <h3 className="editorial" style={{ fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 8 }}>
          Te <span className="italic-accent">esperamos</span>.
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20, fontSize: 12 }}>
          {[['Fecha', done.date], ['Hora', done.time], ['Mesa', `${done.guests} pers.`], ['Código', done.code]].map(([k, v]) => (
            <div key={k} style={{ padding: 10, background: 'var(--surface-3)', borderRadius: 'var(--r-sm)' }}>
              <div className="eyebrow">{k}</div>
              <div style={{ fontWeight: 700, marginTop: 4, fontFamily: k === 'Código' ? 'monospace' : 'inherit' }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, padding: 14, background: 'var(--navy)', color: 'var(--cream)', borderRadius: 'var(--r-md)' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.7 }}>Ticket digital</div>
          <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 22, letterSpacing: '0.4em' }}>{done.code}</div>
          <div style={{ marginTop: 10, display: 'flex', gap: 1, justifyContent: 'center', height: 36 }}>
            {Array.from({ length: 55 }).map((_, i) => (
              <div key={i} style={{ width: i % 3 === 0 ? 3 : 1, height: '100%', background: 'var(--cream)', opacity: (i * 7 + 3) % 10 > 2 ? 1 : 0.3 }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <button className="btn btn-ghost" style={{ flex: 1, height: 44 }} onClick={() => navigate('/my-bookings')}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>event</span><span>Ver reservas</span>
          </button>
          <button className="btn btn-primary" style={{ flex: 1, height: 44 }} onClick={() => { setDone(null); setStep(1); setTime(''); }}>
            <span>Otra mesa</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'sticky', top: 100, padding: 24, background: 'var(--cream)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-md)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="eyebrow">Reserva tu mesa</div>
          <h3 className="editorial" style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em', marginTop: 4 }}>
            Paso <span className="italic-accent mono-num">{step}</span>/3
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3].map(n => <div key={n} style={{ width: 24, height: 3, borderRadius: 2, background: step >= n ? 'var(--primary)' : 'var(--ink-10)' }} />)}
        </div>
      </div>

      {step === 1 && (
        <div className="fade-in" style={{ marginTop: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Comensales</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <button key={n} onClick={() => setGuests(n)} style={{ height: 40, borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 700, background: guests === n ? 'var(--navy)' : 'var(--surface-3)', color: guests === n ? 'var(--cream)' : 'var(--ink)', border: '1px solid ' + (guests === n ? 'var(--navy)' : 'var(--border)'), transition: 'all 0.15s', cursor: 'pointer' }}>{n}</button>
            ))}
          </div>

          <div className="eyebrow" style={{ marginTop: 16, marginBottom: 8 }}>Fecha</div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />

          <div className="eyebrow" style={{ marginTop: 16, marginBottom: 8 }}>Servicio</div>
          <div className="segmented" style={{ width: '100%' }}>
            {[{ value: 'lunch', label: 'Comida' }, { value: 'dinner', label: 'Cena' }].map(opt => (
              <button key={opt.value} className={service === opt.value ? 'active' : ''} onClick={() => { setService(opt.value as 'lunch' | 'dinner'); setTime(''); }} style={{ flex: 1 }}>{opt.label}</button>
            ))}
          </div>

          <div className="eyebrow" style={{ marginTop: 16, marginBottom: 8 }}>Hora</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {slots.map(s => {
              const unavail = UNAVAILABLE.has(s);
              return (
                <button key={s} disabled={unavail} onClick={() => setTime(s)} style={{ height: 40, borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 700, background: time === s ? 'var(--primary)' : unavail ? 'var(--ink-5)' : 'var(--surface-3)', color: time === s ? '#fff' : unavail ? 'var(--ink-20)' : 'var(--ink)', border: '1px solid ' + (time === s ? 'var(--primary)' : 'var(--border)'), textDecoration: unavail ? 'line-through' : 'none', cursor: unavail ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>{s}</button>
              );
            })}
          </div>

          <button disabled={!time} onClick={() => setStep(2)} className="btn btn-primary" style={{ width: '100%', height: 50, marginTop: 20, opacity: time ? 1 : 0.5 }}>
            <span>Continuar</span><span className="material-symbols-outlined" style={{ fontSize: 16, position: 'relative', zIndex: 1 }}>arrow_forward</span>
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="fade-in" style={{ marginTop: 20 }}>
          <div className="eyebrow">Ocasión (opcional)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {['Cumpleaños', 'Aniversario', 'Primera cita', 'Negocios', 'Casual'].map(o => (
              <button key={o} onClick={() => setOccasion(occasion === o ? '' : o)} className={'chip' + (occasion === o ? ' active' : '')}>{o}</button>
            ))}
          </div>
          <div className="eyebrow" style={{ marginTop: 18 }}>Nota al restaurante</div>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Alergias, mesa tranquila, silla para bebé..." style={{ width: '100%', minHeight: 80, padding: 12, marginTop: 8, borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--surface-3)', resize: 'vertical', fontSize: 13, color: 'var(--ink)', outline: 'none', fontFamily: 'inherit' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button onClick={() => setStep(1)} className="btn btn-ghost" style={{ flex: 1 }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span><span>Atrás</span></button>
            <button onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 2 }}><span>Revisar</span><span className="material-symbols-outlined" style={{ fontSize: 16, position: 'relative', zIndex: 1 }}>arrow_forward</span></button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="fade-in" style={{ marginTop: 20 }}>
          <div style={{ padding: 16, background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{restaurant.name}</div>
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 12 }}>
              <div><div className="eyebrow">Día</div><div style={{ fontWeight: 700, marginTop: 2 }}>{date}</div></div>
              <div><div className="eyebrow">Hora</div><div style={{ fontWeight: 700, marginTop: 2 }}>{time}</div></div>
              <div><div className="eyebrow">Mesa</div><div style={{ fontWeight: 700, marginTop: 2 }}>{guests}p</div></div>
            </div>
            {occasion && <div style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-55)' }}>Ocasión: <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{occasion}</span></div>}
          </div>
          <div style={{ marginTop: 12, padding: 12, background: 'rgba(249,116,21,0.08)', borderRadius: 'var(--r-md)', fontSize: 11, color: 'var(--ink-55)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--primary)', flexShrink: 0, marginTop: 1 }}>info</span>
            Sin cargo por ahora. Solo depósito €10/pers si cancelas con menos de 4h.
          </div>
          {error && <p style={{ color: 'var(--ruby)', fontSize: 12, marginTop: 10, textAlign: 'center' }}>{error}</p>}
          {!isAuthenticated && <p style={{ color: 'var(--primary)', fontSize: 12, textAlign: 'center', marginTop: 10 }}>Inicia sesión para finalizar la reserva</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={() => setStep(2)} className="btn btn-ghost" style={{ flex: 1 }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span></button>
            <button onClick={submit} disabled={loading || !isAuthenticated} className="btn btn-primary" style={{ flex: 3, height: 50 }}>
              {loading
                ? <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', position: 'relative', zIndex: 1 }} />
                : <><span>Confirmar reserva</span><span className="material-symbols-outlined" style={{ fontSize: 16, position: 'relative', zIndex: 1 }}>check</span></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const RestaurantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('acerca');
  const [galleryIdx, setGalleryIdx] = useState(0);

  useEffect(() => {
    if (id) restaurantsApi.get(id).then(setRestaurant).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!restaurant) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-55)' }}>Restaurante no encontrado.</div>
  );

  const TABS = [
    { k: 'acerca', l: 'Sobre el lugar' },
    { k: 'menu', l: 'Carta' },
    { k: 'resenas', l: 'Reseñas' },
    { k: 'info', l: 'Info práctica' },
  ];

  return (
    <div>
      {/* Cinematic hero */}
      <div style={{ position: 'relative', height: '65vh', minHeight: 500, marginTop: -64, paddingTop: 64, overflow: 'hidden' }}>
        <img src={restaurant.image} alt={restaurant.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.08) 40%, rgba(15,23,42,0.88) 100%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 48, color: 'var(--cream)' }}>
          <div className="rise-stagger" style={{ maxWidth: 900 }}>
            <div className="eyebrow" style={{ color: 'var(--primary)' }}>
              {t(`cuisines.${restaurant.cuisine}`, { defaultValue: restaurant.cuisine })} · {restaurant.address}
            </div>
            <h1 className="editorial" style={{ fontSize: 'clamp(44px,7vw,100px)', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 0.95, marginTop: 14 }}>
              {restaurant.name}
            </h1>
            <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <Stars value={restaurant.rating} size={16} />
              <span style={{ opacity: 0.6 }}>·</span>
              <span style={{ fontSize: 13 }}>{restaurant.reviewsCount} {t('restaurant.reviews')}</span>
              <span style={{ opacity: 0.6 }}>·</span>
              <span style={{ fontSize: 13 }}>{restaurant.priceRange}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
              <button className="btn btn-dark" style={{ height: 42 }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>favorite_border</span><span>Guardar</span></button>
              <button className="btn btn-dark" style={{ height: 42 }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>ios_share</span><span>Compartir</span></button>
              <button className="btn btn-dark" style={{ height: 42 }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>directions</span><span>Cómo llegar</span></button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery strip */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ padding: '14px 24px' }}>
          <div className="scroll-x" style={{ display: 'flex', gap: 10 }}>
            {[0, 1, 2, 3].map(i => (
              <button key={i} onClick={() => setGalleryIdx(i)} style={{ flexShrink: 0, width: 130, height: 80, borderRadius: 'var(--r-md)', overflow: 'hidden', border: galleryIdx === i ? '2px solid var(--primary)' : '2px solid transparent', padding: 0, cursor: 'pointer', background: 'var(--ink-5)' }}>
                <img src={restaurant.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: i > 0 ? `hue-rotate(${i * 20}deg) brightness(0.9)` : 'none' }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content + sidebar */}
      <div className="container detail-grid" style={{ padding: '48px 24px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: 48 }}>
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
            {TABS.map(t => (
              <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: tab === t.k ? 'var(--ink)' : 'var(--ink-55)', borderBottom: tab === t.k ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1, transition: 'all 0.2s', background: 'none' }}>{t.l}</button>
            ))}
          </div>

          {tab === 'acerca' && (
            <div className="fade-in">
              <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--ink)', maxWidth: 640 }}>{restaurant.description}</p>
              <div style={{ marginTop: 40 }}>
                <div className="eyebrow">Del chef</div>
                <blockquote className="editorial" style={{ fontSize: 26, fontWeight: 300, fontStyle: 'italic', letterSpacing: '-0.01em', lineHeight: 1.35, marginTop: 14, maxWidth: 600, color: 'var(--ink)', margin: '14px 0 0' }}>
                  "Nuestra cocina es un homenaje al producto de temporada. Si vienes por primera vez, empieza por el menú degustación."
                </blockquote>
              </div>
              <div style={{ marginTop: 40 }}>
                <div className="eyebrow">Bueno saber</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12, marginTop: 14 }}>
                  {[
                    { i: 'restaurant_menu', t: 'Carta de temporada' },
                    { i: 'deck', t: 'Terraza cubierta' },
                    { i: 'local_bar', t: 'Barra de cocktails' },
                    { i: 'accessible', t: 'Accesible' },
                    { i: 'pets', t: 'Pet friendly' },
                    { i: 'wifi', t: 'Wi-Fi gratis' },
                  ].map(x => (
                    <div key={x.t} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 14, background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 20 }}>{x.i}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{x.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'menu' && (
            <div className="fade-in">
              <div className="eyebrow">Platos destacados</div>
              {restaurant.menuItems && restaurant.menuItems.length > 0 ? (
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {restaurant.menuItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: 16, padding: 20, background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <h4 className="editorial" style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-0.01em', margin: 0 }}>{item.name}</h4>
                        <p style={{ fontSize: 13, color: 'var(--ink-55)', marginTop: 6, marginBottom: 0 }}>{item.description}</p>
                      </div>
                      <div className="editorial mono-num" style={{ fontSize: 22, fontWeight: 400, color: 'var(--primary)', flexShrink: 0 }}>€{item.price}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ marginTop: 20, color: 'var(--ink-55)' }}>Menú no disponible actualmente.</p>
              )}
            </div>
          )}

          {tab === 'resenas' && (
            <div className="fade-in">
              <div style={{ display: 'flex', gap: 36, alignItems: 'center', padding: 24, background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', marginBottom: 24, flexWrap: 'wrap' }}>
                <div>
                  <div className="editorial mono-num" style={{ fontSize: 64, fontWeight: 300, lineHeight: 1 }}>{restaurant.rating}</div>
                  <Stars value={restaurant.rating} size={16} />
                  <div style={{ fontSize: 12, color: 'var(--ink-55)', marginTop: 6 }}>{restaurant.reviewsCount} reseñas</div>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  {[['Comida', 4.9], ['Servicio', 4.8], ['Ambiente', 4.7], ['Calidad-precio', 4.5]].map(([k, v]) => (
                    <div key={k as string} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <div style={{ fontSize: 12, width: 130, color: 'var(--ink-55)' }}>{k}</div>
                      <div style={{ flex: 1, height: 5, background: 'var(--ink-5)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${((v as number) / 5) * 100}%`, background: 'var(--primary)', borderRadius: 999 }} />
                      </div>
                      <div className="mono-num" style={{ fontSize: 12, fontWeight: 700, width: 28, textAlign: 'right' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {MOCK_REVIEWS.map(rev => (
                  <div key={rev.id} style={{ padding: 20, background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--navy)', color: 'var(--cream)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>{rev.avatar}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{rev.user} {rev.verified && <span className="material-symbols-outlined" style={{ fontSize: 12, color: 'var(--primary)', verticalAlign: 'middle' }}>verified</span>}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink-55)' }}>{rev.date}</div>
                        </div>
                      </div>
                      <Stars value={rev.rating} size={13} />
                    </div>
                    <p style={{ fontSize: 14, marginTop: 12, lineHeight: 1.6, marginBottom: 0 }}>{rev.text}</p>
                    <div style={{ marginTop: 10, display: 'flex', gap: 12, fontSize: 11, color: 'var(--ink-55)' }}>
                      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-55)', fontSize: 11 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>thumb_up</span> Útil ({rev.likes})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'info' && (
            <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { t: 'Dirección', v: restaurant.address, i: 'location_on' },
                { t: 'Teléfono', v: '+34 912 345 678', i: 'call' },
                { t: 'Horario', v: 'Mar–Dom · 13:00–16:00 · 20:00–23:00', i: 'schedule' },
                { t: 'Formas de pago', v: 'Visa · MC · AmEx · Bizum', i: 'credit_card' },
                { t: 'Código vestimenta', v: 'Smart casual', i: 'checkroom' },
                { t: 'Aparcamiento', v: 'SER verde · parking 200m', i: 'local_parking' },
              ].map(x => (
                <div key={x.t} style={{ padding: 20, background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 20 }}>{x.i}</span>
                  <div className="eyebrow" style={{ marginTop: 10 }}>{x.t}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{x.v}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ReservationWidget restaurant={restaurant} />
      </div>

      <style>{`
        @media (max-width: 900px) { .detail-grid { grid-template-columns: 1fr !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default RestaurantDetails;
