import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Hero from '../components/Hero';
import RestaurantCard from '../components/RestaurantCard';
import { restaurantsApi, type Restaurant } from '../api/restaurants';

import italianImg from '../assets/images/cuisine_italian_pasta_1769099701383.png';
import sushiImg from '../assets/images/cuisine_sushi_platter_1769099717268.png';
import steakImg from '../assets/images/cuisine_steak_grilled_1769099732584.png';
import mexicanImg from '../assets/images/cuisine_mexican_tacos_1769099775852.png';
import burgerImg from '../assets/images/cuisine_burger_gourmet_1769099791338.png';
import healthyImg from '../assets/images/cuisine_healthy_salad_1769099807481.png';
import bakeryImg from '../assets/images/cuisine_bakery_bread_1769099834160.png';
import asianImg from '../assets/images/cuisine_asian_noodles_dimsum_1769099849081.png';

const CATEGORIES = [
  { key: 'Italian', image: italianImg, color: '#7c3d1c' },
  { key: 'Sushi', image: sushiImg, color: '#1c2c4c' },
  { key: 'Steak', image: steakImg, color: '#3d1c1c' },
  { key: 'Mexican', image: mexicanImg, color: '#1c3d1c' },
  { key: 'Burgers', image: burgerImg, color: '#2c1c0c' },
  { key: 'Healthy', image: healthyImg, color: '#1c3c2c' },
  { key: 'Bakery', image: bakeryImg, color: '#3c2c1c' },
  { key: 'Asian', image: asianImg, color: '#1c1c3c' },
];

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
      .then((data) => { if (!isActive) return; setRestaurants(data.restaurants); setTotal(data.total); })
      .catch(console.error)
      .finally(() => { if (!isActive) return; setLoadedQueryKey(queryKey); });
    return () => { isActive = false; };
  }, [search, cuisine, queryKey]);

  const handleCategoryClick = (key: string) => {
    const params = new URLSearchParams();
    if (cuisine !== key) params.set('cuisine', key);
    navigate(`/?${params.toString()}`);
    setTimeout(() => document.getElementById('restaurant-list')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const nearBy = [...restaurants].slice(0, 4);
  const trending = [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div>
      <Hero />

      {/* ForYou — Cerca de ti */}
      {!search && !cuisine && restaurants.length > 0 && (
        <>
          <section style={{ padding: '56px 0', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>near_me</span> Cerca de ti
                  </div>
                  <h2 className="editorial" style={{ fontSize: 'clamp(32px,3.5vw,44px)', fontWeight: 300, letterSpacing: '-0.025em', marginTop: 6, lineHeight: 1.05 }}>
                    A un <span className="italic-accent">paso</span> de tu mesa.
                  </h2>
                </div>
                <Link to="/map" className="btn btn-ghost" style={{ height: 36, fontSize: 13, textDecoration: 'none' }}>
                  <span>Ver en el mapa</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, position: 'relative', zIndex: 1 }}>arrow_forward</span>
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {nearBy.map(r => (
                  <RestaurantCard key={r.id} {...r} cuisine={t(`cuisines.${r.cuisine}`, { defaultValue: r.cuisine })} location={r.address} />
                ))}
              </div>
            </div>
          </section>

          {/* Trending */}
          <section style={{ padding: '56px 0', background: 'var(--cream-2)', borderTop: '1px solid var(--border)' }}>
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>trending_up</span> Todos hablan de ellos
                  </div>
                  <h2 className="editorial" style={{ fontSize: 'clamp(32px,3.5vw,44px)', fontWeight: 300, letterSpacing: '-0.025em', marginTop: 6, lineHeight: 1.05 }}>
                    En <span className="italic-accent">boca</span> de todos.
                  </h2>
                </div>
                <Link to="/search" className="btn btn-ghost" style={{ height: 36, fontSize: 13, textDecoration: 'none' }}>
                  <span>Ver más</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, position: 'relative', zIndex: 1 }}>arrow_forward</span>
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {trending.map(r => (
                  <RestaurantCard key={r.id} {...r} cuisine={t(`cuisines.${r.cuisine}`, { defaultValue: r.cuisine })} location={r.address} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Cuisine ribbon */}
      <section style={{ padding: 'var(--d-section) 0 40px', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="eyebrow">01 — Explora por antojo</div>
              <h2 className="editorial" style={{ fontSize: 'clamp(36px,5vw,60px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 10 }}>
                ¿Qué te <span className="italic-accent">apetece</span> esta noche?
              </h2>
            </div>
            <Link to="/search" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
              <span>Ver todas las cocinas</span>
              <span className="material-symbols-outlined" style={{ fontSize: 16, position: 'relative', zIndex: 1 }}>arrow_forward</span>
            </Link>
          </div>
          <div className="scroll-x" style={{ display: 'flex', gap: 16, paddingBottom: 12 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => handleCategoryClick(cat.key)}
                style={{
                  flexShrink: 0, width: 180, height: 240, borderRadius: 'var(--r-xl)',
                  overflow: 'hidden', position: 'relative', scrollSnapAlign: 'start',
                  border: cuisine === cat.key ? '3px solid var(--primary)' : '3px solid transparent',
                  cursor: 'pointer', background: 'none', padding: 0,
                  transition: 'transform 0.3s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
              >
                <img src={cat.image} alt={cat.key} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }} />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 40%, ${cat.color}dd 100%)` }} />
                <div style={{ position: 'absolute', bottom: 16, left: 16, color: '#fff' }}>
                  <div className="editorial" style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-0.01em' }}>
                    {t(`cuisines.${cat.key}`, { defaultValue: cat.key })}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial manifesto */}
      <section style={{ padding: '64px 0', background: 'var(--cream-2)', position: 'relative' }} className="grain">
        <div className="container-narrow" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div className="eyebrow" style={{ color: 'var(--primary)' }}>Manifiesto</div>
          <blockquote className="editorial" style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.02em', margin: '24px 0', color: 'var(--ink)' }}>
            Creemos que una buena cena empieza <em className="italic-accent">antes</em> de pisar el restaurante —
            con la expectativa, con la promesa, con la <em className="italic-accent">sobremesa</em> que ya te estás imaginando.
          </blockquote>
          <div style={{ fontSize: 13, color: 'var(--ink-55)', marginTop: 24 }}>
            — El equipo editorial de <span style={{ fontWeight: 700 }}>ReserVia</span>
          </div>
        </div>
      </section>

      {/* Restaurant list */}
      <section id="restaurant-list" style={{ padding: 'var(--d-section) 0', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="eyebrow">02 — Curado esta semana</div>
              <h2 className="editorial" style={{ fontSize: 'clamp(36px,5vw,60px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 10 }}>
                {cuisine
                  ? <>{t(`cuisines.${cuisine}`, { defaultValue: cuisine })} con <span className="italic-accent">alma</span>.</>
                  : search
                    ? <>"{search}"</>
                    : <>Mesas con <span className="italic-accent">alma</span>.</>}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {(search || cuisine) && (
                <Link to="/" style={{ fontSize: 13, color: 'var(--ink-55)', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600, textDecoration: 'none' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                  {t('home.clearFilters')}
                </Link>
              )}
              <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>{total} {t('home.results')}</span>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {[1, 2, 3].map(i => <div key={i} style={{ height: 380, borderRadius: 'var(--r-xl)', background: 'var(--ink-5)' }} className="shimmer-bg" />)}
            </div>
          ) : restaurants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-55)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 56, display: 'block', marginBottom: 16, opacity: 0.4 }}>search_off</span>
              <p className="editorial" style={{ fontSize: 28, fontWeight: 300 }}>{t('home.noResults')}</p>
              <Link to="/" className="btn btn-primary" style={{ marginTop: 20, textDecoration: 'none', display: 'inline-flex' }}>
                <span>{t('home.clearFilters')}</span>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {restaurants.map(rest => (
                <RestaurantCard
                  key={rest.id}
                  {...rest}
                  cuisine={t(`cuisines.${rest.cuisine}`, { defaultValue: rest.cuisine })}
                  location={rest.address}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Owner section */}
      <section style={{ padding: 'var(--d-section) 0', background: 'var(--navy)', color: 'var(--cream)' }} className="grain">
        <div className="container owner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--primary)' }}>Para restauradores</div>
            <h2 className="editorial" style={{ fontSize: 'clamp(36px,5vw,68px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.02, marginTop: 14 }}>
              Que tu cocina se <span className="italic-accent">llene</span> — sin complicarte.
            </h2>
            <p style={{ fontSize: 16, opacity: 0.8, marginTop: 20, lineHeight: 1.6, maxWidth: 480 }}>
              Plan de mesas en tiempo real, lista de espera, recordatorios automáticos, pre-pago opcional. Todo en un panel que aprende de tu servicio.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button className="btn btn-ember"><span>Más información</span><span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span></button>
              <button className="btn btn-dark">Hablar con ventas</button>
            </div>
            <div style={{ display: 'flex', gap: 40, marginTop: 40 }}>
              <div>
                <div className="editorial mono-num" style={{ fontSize: 40, fontWeight: 300 }}>32<span style={{ fontSize: 24, fontStyle: 'italic', color: 'var(--primary)' }}>%</span></div>
                <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>Más covers por mes</div>
              </div>
              <div>
                <div className="editorial mono-num" style={{ fontSize: 40, fontWeight: 300 }}>4.9<span style={{ fontSize: 18, fontStyle: 'italic', color: 'var(--primary)' }}>★</span></div>
                <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>De sus dueños</div>
              </div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', background: 'var(--navy-800)', aspectRatio: '4/5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 80, opacity: 0.15 }}>storefront</span>
            </div>
            <div style={{ position: 'absolute', bottom: -24, left: -24, padding: 18, background: 'var(--cream)', color: 'var(--ink)', minWidth: 200, borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-lg)' }}>
              <div className="eyebrow">Hoy</div>
              <div className="editorial mono-num" style={{ fontSize: 44, fontWeight: 400, lineHeight: 1, marginTop: 6 }}>
                84 <span style={{ fontStyle: 'italic', color: 'var(--primary)', fontSize: '0.5em' }}>covers</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-55)', marginTop: 6 }}>+18% vs. martes pasado</div>
            </div>
          </div>
        </div>
        <style>{`@media(max-width:900px){.owner-grid{grid-template-columns:1fr!important}}`}</style>
      </section>

      {/* How it works */}
      <section style={{ padding: 'var(--d-section) 0', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="eyebrow">Así funciona</div>
            <h2 className="editorial" style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 300, letterSpacing: '-0.02em', marginTop: 10 }}>
              Tres pasos. <span className="italic-accent">Cero esperas.</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { n: '01', t: 'Descubre', d: 'Pregunta a la IA por un ambiente, no por un nombre. Te proponemos mesas con criterio editorial.', i: 'auto_awesome' },
              { n: '02', t: 'Reserva', d: 'Dos toques y confirmado. Sin formularios, sin llamadas, sin fricción.', i: 'touch_app' },
              { n: '03', t: 'Disfruta', d: 'Llegas, te sientas, comes. Si hay cambios, te avisamos. Nada más.', i: 'restaurant' },
            ].map(s => (
              <div key={s.n} className="card" style={{ padding: 32, background: 'var(--surface-3)' }}>
                <div className="eyebrow" style={{ color: 'var(--primary)' }}>{s.n}</div>
                <span className="material-symbols-outlined" style={{ fontSize: 44, color: 'var(--ink)', marginTop: 20, display: 'block' }}>{s.i}</span>
                <h3 className="editorial" style={{ fontSize: 30, fontWeight: 400, marginTop: 18, letterSpacing: '-0.02em' }}>{s.t}</h3>
                <p style={{ fontSize: 14, color: 'var(--ink-55)', lineHeight: 1.6, marginTop: 10 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0 0' }}>
        <div className="container">
          <div style={{ position: 'relative', borderRadius: 'var(--r-xl)', overflow: 'hidden', minHeight: 400, background: 'var(--navy)', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(249,116,21,0.25) 0%, transparent 60%)' }} />
            <div style={{ position: 'relative', zIndex: 2, padding: '72px 48px', color: 'var(--cream)', maxWidth: 620 }}>
              <h2 className="editorial" style={{ fontSize: 'clamp(36px,5vw,68px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.02 }}>
                Hay una mesa esperándote <span className="italic-accent">esta noche</span>.
              </h2>
              <p style={{ fontSize: 16, opacity: 0.8, marginTop: 16 }}>
                {total || restaurants.length} restaurantes con disponibilidad ahora mismo. Uno es el tuyo.
              </p>
              <Link to="/search" className="btn btn-ember" style={{ marginTop: 24, height: 54, padding: '0 28px', fontSize: 15, textDecoration: 'none', display: 'inline-flex' }}>
                <span>Explorar mesas</span>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
