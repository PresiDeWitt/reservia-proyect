import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Hero from '../components/Hero';
import CategoryCard from '../components/CategoryCard';
import RestaurantCard from '../components/RestaurantCard';
import { motion } from 'framer-motion';
import { restaurantsApi, type Restaurant } from '../api/restaurants';

import italianImg from '../assets/images/cuisine_italian_pasta_1769099701383.png';
import sushiImg from '../assets/images/cuisine_sushi_platter_1769099717268.png';
import steakImg from '../assets/images/cuisine_steak_grilled_1769099732584.png';
import mexicanImg from '../assets/images/cuisine_mexican_tacos_1769099775852.png';
import burgerImg from '../assets/images/cuisine_burger_gourmet_1769099791338.png';
import healthyImg from '../assets/images/cuisine_healthy_salad_1769099807481.png';
import bakeryImg from '../assets/images/cuisine_bakery_bread_1769099834160.png';
import asianImg from '../assets/images/cuisine_asian_noodles_dimsum_1769099849081.png';
import heroImg from '../assets/images/reservia_hero_dining_1769099684622.png';

const CATEGORIES = [
  { key: 'Italian',  image: italianImg,  color: '#b9441b' },
  { key: 'Sushi',    image: sushiImg,    color: '#0f172a' },
  { key: 'Steak',    image: steakImg,    color: '#5b2a13' },
  { key: 'Mexican',  image: mexicanImg,  color: '#c5421e' },
  { key: 'Burgers',  image: burgerImg,   color: '#3d2010' },
  { key: 'Healthy',  image: healthyImg,  color: '#2a5d3a' },
  { key: 'Bakery',   image: bakeryImg,   color: '#8a5a2b' },
  { key: 'Asian',    image: asianImg,    color: '#a63519' },
];

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [total, setTotal] = useState(0);
  const [loadedQueryKey, setLoadedQueryKey] = useState<string | null>(null);

  const search = searchParams.get('search') || '';
  const cuisine = searchParams.get('cuisine') || '';
  const queryKey = `${search}::${cuisine}`;
  const loading = loadedQueryKey !== queryKey;

  useEffect(() => {
    let isActive = true;
    restaurantsApi.list({ search: search || undefined, cuisine: cuisine || undefined })
      .then(data => {
        if (!isActive) return;
        setRestaurants(data.restaurants);
        setTotal(data.total);
      })
      .catch(console.error)
      .finally(() => { if (isActive) setLoadedQueryKey(queryKey); });
    return () => { isActive = false; };
  }, [search, cuisine, queryKey]);

  const handleCategoryClick = (key: string) => {
    const params = new URLSearchParams();
    if (cuisine !== key) params.set('cuisine', key);
    navigate(`/?${params.toString()}`);
    setTimeout(() => document.getElementById('restaurant-list')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  // "For you" data
  const near = [...restaurants].sort((a, b) => parseFloat(a.distance || '99') - parseFloat(b.distance || '99')).slice(0, 4);
  const trending = [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div>
      <Hero />

      {/* ── For You: Cerca de ti ── */}
      {!loading && near.length > 0 && (
        <section style={{ padding: '64px 0', background: 'var(--cream)', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>near_me</span> Cerca de ti
                </div>
                <h2 className="editorial" style={{ fontSize: 'clamp(30px,3.5vw,44px)', fontWeight: 300, letterSpacing: '-0.025em', marginTop: 6, lineHeight: 1.05 }}>
                  A un <span className="italic-accent">paso</span> de tu mesa.
                </h2>
                <p style={{ fontSize: 13, color: 'var(--ink-55)', marginTop: 6 }}>Madrid, Chamberí · basado en tu ubicación</p>
              </div>
              <Link to="/map" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', borderRadius: 12, border: '1px solid var(--border-strong)', fontSize: 13, fontWeight: 700, color: 'var(--navy)', textDecoration: 'none' }}>
                <span>Ver en el mapa</span>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {near.map((rest, i) => (
                <motion.div key={rest.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                  <RestaurantCard {...rest} cuisine={t(`cuisines.${rest.cuisine}`, { defaultValue: rest.cuisine })} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── For You: Trending ── */}
      {!loading && trending.length > 0 && (
        <section style={{ padding: '64px 0', background: '#fff', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>trending_up</span> Todos hablan de ellos
                </div>
                <h2 className="editorial" style={{ fontSize: 'clamp(30px,3.5vw,44px)', fontWeight: 300, letterSpacing: '-0.025em', marginTop: 6, lineHeight: 1.05 }}>
                  En <span className="italic-accent">boca</span> de todos.
                </h2>
                <p style={{ fontSize: 13, color: 'var(--ink-55)', marginTop: 6 }}>Los más reservados esta semana en Madrid.</p>
              </div>
              <Link to="/search" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', borderRadius: 12, border: '1px solid var(--border-strong)', fontSize: 13, fontWeight: 700, color: 'var(--navy)', textDecoration: 'none' }}>
                <span>Ver más</span>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {trending.map((rest, i) => (
                <motion.div key={rest.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                  <RestaurantCard {...rest} cuisine={t(`cuisines.${rest.cuisine}`, { defaultValue: rest.cuisine })} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Cuisine ribbon ── */}
      <section style={{ padding: '96px 0 48px', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={itemVariants}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}
          >
            <div>
              <div className="eyebrow">01 — Explora por antojo</div>
              <h2
                className="editorial"
                style={{ fontSize: 'clamp(38px,5vw,60px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 10, margin: '10px 0 0' }}
              >
                ¿Qué te <span className="italic-accent">apetece</span> esta noche?
              </h2>
            </div>
            <Link
              to="/map"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 44, padding: '0 20px', borderRadius: 14,
                border: '1px solid var(--border-strong)',
                fontSize: 13, fontWeight: 700, color: 'var(--navy)',
                textDecoration: 'none', transition: 'background 0.2s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--ink-5)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <span>Ver en mapa</span>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
            </Link>
          </motion.div>

          <div className="scroll-x" style={{ display: 'flex', gap: 16, paddingBottom: 12 }}>
            {CATEGORIES.map(cat => (
              <CategoryCard
                key={cat.key}
                name={t(`cuisines.${cat.key}`, { defaultValue: cat.key })}
                image={cat.image}
                color={cat.color}
                active={cuisine === cat.key}
                onClick={() => handleCategoryClick(cat.key)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Editorial pull quote ── */}
      <section style={{ padding: '64px 0', background: 'var(--cream-2)', position: 'relative' }} className="grain">
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div className="eyebrow" style={{ color: 'var(--primary)', display: 'block', marginBottom: 24 }}>Manifiesto</div>
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="editorial"
            style={{
              fontSize: 'clamp(28px,4vw,52px)', fontWeight: 300,
              lineHeight: 1.2, letterSpacing: '-0.02em',
              margin: '0 0 24px', color: 'var(--navy)',
            }}
          >
            Creemos que una buena cena empieza{' '}
            <em className="italic-accent">antes</em> de pisar el restaurante —
            con la expectativa, con la promesa,
            con la <em className="italic-accent">sobremesa</em> que ya imaginas.
          </motion.blockquote>
          <p style={{ fontSize: 13, color: 'var(--ink-55)' }}>
            — El equipo editorial de <strong>ReserVia</strong>
          </p>
        </div>
      </section>

      {/* ── Restaurant list ── */}
      <section id="restaurant-list" style={{ padding: '96px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={itemVariants}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}
          >
            <div>
              <div className="eyebrow">02 — Curado esta semana</div>
              <h2
                className="editorial"
                style={{ fontSize: 'clamp(38px,5vw,60px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05, margin: '10px 0 0' }}
              >
                {cuisine
                  ? <>{t(`cuisines.${cuisine}`, { defaultValue: cuisine })} · <span className="italic-accent">mesas</span></>
                  : search
                    ? <>Resultados para <span className="italic-accent">"{search}"</span></>
                    : <>Mesas con <span className="italic-accent">alma</span>.</>
                }
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {(search || cuisine) && (
                <Link
                  to="/"
                  style={{
                    fontSize: 13, color: 'var(--ink-55)', display: 'flex', alignItems: 'center', gap: 4,
                    fontWeight: 600, textDecoration: 'none',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                  {t('home.clearFilters')}
                </Link>
              )}
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
                {total} {t('home.results')}
              </span>
            </div>
          </motion.div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: 380, borderRadius: 28 }} className="shimmer-bg" />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-55)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>search_off</span>
              <p className="editorial" style={{ fontSize: 24, fontWeight: 300 }}>{t('home.noResults')}</p>
              <Link to="/" style={{ marginTop: 16, display: 'inline-block', fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                {t('home.clearFilters')}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {restaurants.map((rest, i) => (
                <motion.div
                  key={rest.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <RestaurantCard
                    {...rest}
                    cuisine={t(`cuisines.${rest.cuisine}`, { defaultValue: rest.cuisine })}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── For restaurateurs (navy section) ── */}
      <section style={{ padding: '96px 0', background: 'var(--navy)', color: '#fff', position: 'relative' }} className="grain">
        <div style={{
          maxWidth: 1320, margin: '0 auto', padding: '0 24px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64,
          alignItems: 'center', position: 'relative', zIndex: 2,
        }} className="owner-grid">
          <div>
            <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: 8 }}>Para restauradores</div>
            <h2
              className="editorial"
              style={{ fontSize: 'clamp(38px,5vw,68px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.02, margin: '0 0 24px' }}
            >
              Que tu cocina se <span className="italic-accent">llene</span> — sin complicarte.
            </h2>
            <p style={{ fontSize: 16, opacity: 0.8, lineHeight: 1.65, maxWidth: 480, marginBottom: 32 }}>
              Plan de mesas en tiempo real, lista de espera, recordatorios automáticos,
              pre-pago opcional y análisis de cobertura — todo en un panel que aprende de tu servicio.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button style={{
                height: 48, padding: '0 24px', borderRadius: 14,
                background: 'var(--primary)', color: '#fff',
                border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-700)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--primary)')}>
                <span>Más información</span>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </button>
              <button style={{
                height: 48, padding: '0 24px', borderRadius: 14,
                background: 'rgba(255,255,255,0.08)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.16)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}>
                Hablar con ventas
              </button>
            </div>
            <div style={{ display: 'flex', gap: 48, marginTop: 48 }}>
              {[{ v: '32%', l: 'más covers/mes' }, { v: '4.9', l: '★ de propietarios' }].map(s => (
                <div key={s.l}>
                  <div className="editorial" style={{ fontSize: 52, fontWeight: 300, fontStyle: 'italic', color: 'var(--primary)', lineHeight: 1 }}>{s.v}</div>
                  <div className="eyebrow" style={{ color: '#fff', opacity: 0.6, marginTop: 8 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 28, overflow: 'hidden', boxShadow: 'var(--sh-lg)' }}>
              <img src={heroImg} alt="Restaurant owner" style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover' }} />
            </div>
            <div style={{
              position: 'absolute', bottom: -28, left: -28,
              padding: '18px 22px',
              background: 'var(--cream)', color: 'var(--navy)',
              borderRadius: 20, boxShadow: 'var(--sh-lg)', minWidth: 220,
            }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Hoy</div>
              <div className="editorial" style={{ fontSize: 48, fontWeight: 300, lineHeight: 1 }}>
                84{' '}
                <span style={{ fontStyle: 'italic', color: 'var(--primary)', fontSize: '0.5em' }}>covers</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-55)', marginTop: 6 }}>+18% vs. martes pasado</div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .owner-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          }
        `}</style>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '96px 0', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Así funciona</div>
            <h2 className="editorial" style={{ fontSize: 'clamp(36px,5vw,60px)', fontWeight: 300, letterSpacing: '-0.02em', margin: 0 }}>
              Tres pasos. <span className="italic-accent">Cero esperas.</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              { n: '01', t: 'Descubre', d: 'Pregunta a la IA por un ambiente, no solo un nombre. Te proponemos mesas con criterio editorial.', i: 'auto_awesome' },
              { n: '02', t: 'Reserva', d: 'Dos toques y confirmado. Sin formularios, sin llamadas, sin fricción.', i: 'touch_app' },
              { n: '03', t: 'Disfruta', d: 'Llegas, te sientas, comes. Si hay cambios, te avisamos. Si no, silencio absoluto.', i: 'restaurant' },
            ].map(step => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                style={{
                  padding: 32, borderRadius: 28,
                  background: '#fff',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: 20 }}>{step.n}</div>
                <span className="material-symbols-outlined" style={{ fontSize: 44, color: 'var(--navy)' }}>{step.i}</span>
                <h3 className="editorial" style={{ fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', margin: '18px 0 10px' }}>{step.t}</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-55)', lineHeight: 1.65, margin: 0 }}>{step.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section style={{ padding: '0 0 96px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            position: 'relative', borderRadius: 28, overflow: 'hidden', minHeight: 420,
          }}>
            <img
              src={heroImg}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, rgba(35,23,15,0.85) 30%, transparent)',
            }} />
            <div style={{
              position: 'relative', zIndex: 2,
              padding: '80px 48px', color: '#fff', maxWidth: 620,
            }}>
              <h2 className="editorial" style={{
                fontSize: 'clamp(38px,5vw,68px)', fontWeight: 300,
                letterSpacing: '-0.02em', lineHeight: 1.02, margin: '0 0 20px',
              }}>
                Hay una mesa esperándote <span className="italic-accent">esta noche</span>.
              </h2>
              <p style={{ fontSize: 17, opacity: 0.8, marginBottom: 28 }}>
                {total || '+'} restaurantes con disponibilidad ahora mismo. Uno es el tuyo.
              </p>
              <button
                onClick={() => document.getElementById('restaurant-list')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  height: 56, padding: '0 28px', borderRadius: 14,
                  background: 'var(--primary)', color: '#fff',
                  border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  boxShadow: 'var(--sh-glow)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-700)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--primary)')}
              >
                <span>Explorar mesas</span>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
