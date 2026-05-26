import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import CategoryCard from '../components/CategoryCard';
import RestaurantCard from '../components/RestaurantCard';
import { restaurantsApi, type Restaurant } from '../api/restaurants';
import { useAuth } from '../context/AuthContext';

import italianImg from '../assets/images/cuisine_italian_pasta_1769099701383.png';
import sushiImg from '../assets/images/cuisine_sushi_platter_1769099717268.png';
import steakImg from '../assets/images/cuisine_steak_grilled_1769099732584.png';
import healthyImg from '../assets/images/cuisine_healthy_salad_1769099807481.png';
import bakeryImg from '../assets/images/cuisine_bakery_bread_1769099834160.png';
import asianImg from '../assets/images/cuisine_asian_noodles_dimsum_1769099849081.png';

const CATEGORIES = [
  { key: 'Italian', image: italianImg },
  { key: 'Japanese', image: sushiImg },
  { key: 'Steakhouse', image: steakImg },
  { key: 'Fusion', image: asianImg },
  { key: 'French', image: bakeryImg },
  { key: 'Healthy', image: healthyImg },
];

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [total, setTotal] = useState(0);
  const [loadedQueryKey, setLoadedQueryKey] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const search = searchParams.get('search') || '';
  const cuisine = searchParams.get('cuisine') || '';
  const queryKey = `${search}::${cuisine}`;
  const loading = loadedQueryKey !== queryKey;

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isActive = true;
    restaurantsApi
      .list({ search: search || undefined, cuisine: cuisine || undefined })
      .then((data) => {
        if (!isActive) return;
        setRestaurants(data.items);
        setTotal(data.total);
      })
      .catch(console.error)
      .finally(() => {
        if (!isActive) return;
        setLoadedQueryKey(queryKey);
      });
    return () => {
      isActive = false;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [search, cuisine, queryKey]);

  useEffect(() => {
    if (!user) return;
    restaurantsApi.favorites().then((data) => {
      setFavoriteIds(new Set(data.favorites.map((r) => r.id)));
    }).catch(() => {});
  }, [user]);

  const handleToggleFavorite = useCallback((id: string) => {
    const numId = parseInt(id, 10);
    if (favoriteIds.has(id)) {
      restaurantsApi.removeFavorite(numId).catch(() => {});
      setFavoriteIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    } else {
      restaurantsApi.addFavorite(numId).catch(() => {});
      setFavoriteIds((prev) => new Set(prev).add(id));
    }
  }, [favoriteIds]);

  const handleCategoryClick = (key: string) => {
    const params = new URLSearchParams();
    if (cuisine !== key) params.set('cuisine', key);
    navigate(`/?${params.toString()}`);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      document.getElementById('restaurant-list')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const featured = restaurants.slice(0, 6);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Hero key={location.key} />

      {/* Cuisines ribbon */}
      <section style={{ padding: 'var(--d-section) 0 clamp(24px, 4vw, 40px)', background: 'var(--surface)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 32,
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div className="eyebrow">01 · {t('home.browseByCraving')}</div>
              <h2
                className="editorial"
                style={{
                  fontSize: 'clamp(40px,5vw,64px)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.05,
                  marginTop: 10,
                }}
              >
                {t('home.cravingPre')} <span className="italic-accent">{t('home.cravingAccent')}</span>{t('home.cravingPost')}
              </h2>
            </div>
            <Link to="/map" className="btn btn-ghost">
              <span>{t('home.viewAllCuisines')}</span>
              <span className="mat" style={{ fontSize: 16 }}>arrow_forward</span>
            </Link>
          </div>
          <div className="scroll-x" style={{ display: 'flex', gap: 16, scrollSnapType: 'x mandatory', paddingBottom: 12 }}>
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.key}
                name={t(`cuisines.${cat.key}`, { defaultValue: cat.key })}
                image={cat.image}
                active={cuisine === cat.key}
                onClick={() => handleCategoryClick(cat.key)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial pull quote */}
      <section
        className="grain"
        style={{ padding: '64px 0', background: 'var(--surface-2)', position: 'relative' }}
      >
        <div className="container-narrow" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div className="eyebrow" style={{ color: 'var(--primary)' }}>
            {t('home.manifesto.eyebrow')}
          </div>
          <blockquote
            className="editorial"
            style={{
              fontSize: 'clamp(32px,4.5vw,58px)',
              fontWeight: 300,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              margin: '24px 0',
            }}
          >
            {t('home.manifesto.quotePre')} <em className="italic-accent">{t('home.manifesto.quoteAccent1')}</em>{' '}
            {t('home.manifesto.quoteMid')} <em className="italic-accent">{t('home.manifesto.quoteAccent2')}</em>{' '}
            {t('home.manifesto.quotePost')}
          </blockquote>
          <div style={{ fontSize: 13, color: 'var(--ink-55)', marginTop: 24 }}>
            {t('home.manifesto.author')} <span style={{ fontWeight: 700 }}>ReserVia</span>
          </div>
        </div>
      </section>

      {/* Featured restaurants grid */}
      <section
        id="restaurant-list"
        style={{ padding: 'var(--d-section) 0', background: 'var(--surface)' }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 40,
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div className="eyebrow">{t('home.curationEyebrow')}</div>
              <h2
                className="editorial"
                style={{
                  fontSize: 'clamp(40px,5vw,64px)',
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.05,
                  marginTop: 10,
                }}
              >
                {cuisine
                  ? t(`cuisines.${cuisine}`, { defaultValue: cuisine })
                  : search
                    ? `"${search}"`
                    : (
                      <>
                        {t('home.mesasConAlmaPre')} <span className="italic-accent">{t('home.mesasConAlmaAccent')}</span>{t('home.mesasConAlmaPost')}
                      </>
                    )}
              </h2>
              <p style={{ fontSize: 15, color: 'var(--ink-55)', marginTop: 10, maxWidth: 540 }}>
                {t('home.topRatedSubtitle')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {(search || cuisine) && (
                <Link to="/" className="btn btn-ghost">
                  <span className="mat" style={{ fontSize: 16 }}>close</span>
                  <span>{t('home.clearFilters')}</span>
                </Link>
              )}
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                {total} {t('home.results')}
              </span>
            </div>
          </div>

          {loading ? (
            <div
              className="restaurant-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 'clamp(16px, 2.5vw, 24px)',
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="shimmer"
                  style={{ height: 360, borderRadius: 'var(--r-xl)' }}
                />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-40)' }}>
              <span className="mat" style={{ fontSize: 48, marginBottom: 12, display: 'block' }}>
                search_off
              </span>
              <p style={{ fontSize: 17, fontWeight: 600 }}>{t('home.noResults')}</p>
              <Link
                to="/"
                style={{
                  marginTop: 16,
                  display: 'inline-block',
                  color: 'var(--primary)',
                  fontWeight: 700,
                }}
              >
                {t('home.clearFilters')}
              </Link>
            </div>
          ) : (
            <div
              className="restaurant-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 'clamp(16px, 2.5vw, 24px)',
              }}
            >
              {featured.map((rest, i) => {
                const isFeatured = i === 0 && featured.length > 2;
                return (
                  <div
                    key={rest.id}
                    className="featured-slot"
                    style={{ gridColumn: isFeatured ? 'span 2' : 'span 1' }}
                  >
                    <RestaurantCard
                      {...rest}
                      cuisine={t(`cuisines.${rest.cuisine}`, { defaultValue: rest.cuisine })}
                      featured={isFeatured}
                      tonight={3 + (parseInt(rest.id, 10) % 5)}
                      isFavorite={favoriteIds.has(rest.id)}
                      onToggleFavorite={user ? handleToggleFavorite : undefined}
                    />
                  </div>
                );
              })}
              {restaurants.slice(6).map((rest) => (
                <RestaurantCard
                  key={rest.id}
                  {...rest}
                  cuisine={t(`cuisines.${rest.cuisine}`, { defaultValue: rest.cuisine })}
                  isFavorite={favoriteIds.has(rest.id)}
                  onToggleFavorite={user ? handleToggleFavorite : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* For business CTA */}
      <section
        className="grain"
        style={{ padding: 'var(--d-section) 0', background: 'var(--navy)', color: 'var(--cream)' }}
      >
        <div
          className="container business-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 64,
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div>
            <div className="eyebrow" style={{ color: 'var(--primary)' }}>
              {t('home.business.eyebrow')}
            </div>
            <h2
              className="editorial"
              style={{
                fontSize: 'clamp(40px,5vw,72px)',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                lineHeight: 1.02,
                marginTop: 14,
              }}
            >
              {t('home.business.headlinePre')} <span className="italic-accent">{t('home.business.headlineAccent')}</span>{t('home.business.headlinePost')}
            </h2>
            <p style={{ fontSize: 17, opacity: 0.8, marginTop: 24, lineHeight: 1.6, maxWidth: 520 }}>
              {t('home.business.desc')}
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
              <button
                className="btn btn-ember"
                onClick={() => window.dispatchEvent(new CustomEvent('reservia:open-auth', { detail: { mode: 'register', role: 'owner' } }))}
              >
                <span>{t('home.business.ctaRegister')}</span>
                <span className="mat" style={{ fontSize: 16 }}>arrow_forward</span>
              </button>
              <button
                className="btn btn-dark"
                onClick={() => window.dispatchEvent(new CustomEvent('reservia:open-auth', { detail: { mode: 'login', role: 'owner' } }))}
              >
                <span>{t('home.business.ctaLogin')}</span>
              </button>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--r-xl)',
                overflow: 'hidden',
                boxShadow: 'var(--sh-lg)',
                aspectRatio: '4/5',
                background: `url(${steakImg}) center/cover`,
              }}
            />
            <div
              className="card"
              style={{
                position: 'absolute',
                bottom: -28,
                left: -28,
                padding: 18,
                background: 'var(--surface-3)',
                color: 'var(--ink)',
                minWidth: 220,
                borderRadius: 'var(--r-lg)',
                boxShadow: 'var(--sh-lg)',
              }}
            >
              <div className="eyebrow">{t('home.platformLabel', { defaultValue: 'En la plataforma' })}</div>
              <div
                className="editorial mono-num"
                style={{ fontSize: 44, fontWeight: 400, lineHeight: 1, marginTop: 6 }}
              >
                {total > 0 ? total : '—'}{' '}
                <span style={{ fontStyle: 'italic', color: 'var(--primary)', fontSize: '0.5em' }}>
                  {t('home.restaurantsLabel', { defaultValue: 'restaurantes' })}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-55)', marginTop: 6 }}>
                {t('home.platformSub', { defaultValue: 'Disponibles ahora mismo' })}
              </div>
            </div>
          </div>
        </div>
        <style>{`
          @media (max-width: 900px) {
            .business-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          }
        `}</style>
      </section>

      {/* How it works */}
      <section style={{ padding: 'var(--d-section) 0', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="eyebrow">{t('home.howItWorks.eyebrow')}</div>
            <h2
              className="editorial"
              style={{
                fontSize: 'clamp(36px,5vw,60px)',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                marginTop: 10,
              }}
            >
              {t('home.howItWorks.titlePre')} <span className="italic-accent">{t('home.howItWorks.titleAccent')}</span>
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
            }}
          >
            {[
              { n: '01', key: 'discover', i: 'auto_awesome' },
              { n: '02', key: 'book', i: 'touch_app' },
              { n: '03', key: 'enjoy', i: 'restaurant' },
            ].map((step) => (
              <div
                key={step.n}
                className="card"
                style={{ padding: 32, background: 'var(--surface-3)' }}
              >
                <div className="eyebrow" style={{ color: 'var(--primary)' }}>
                  {step.n}
                </div>
                <span
                  className="mat"
                  style={{ fontSize: 44, color: 'var(--ink)', marginTop: 20, display: 'block' }}
                >
                  {step.i}
                </span>
                <h3
                  className="editorial"
                  style={{
                    fontSize: 32,
                    fontWeight: 400,
                    marginTop: 18,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {t(`home.steps.${step.key}.title`)}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--ink-55)', lineHeight: 1.6, marginTop: 10 }}>
                  {t(`home.steps.${step.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
