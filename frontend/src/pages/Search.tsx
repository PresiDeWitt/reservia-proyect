import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import RestaurantCard from '../components/RestaurantCard';
import { restaurantsApi, type Restaurant } from '../api/restaurants';

const CUISINE_OPTS = ['Italian', 'Sushi', 'Steak', 'Mexican', 'Burgers', 'Healthy', 'Bakery', 'Asian'];
const PRICE_OPTS = ['€', '€€', '€€€', '€€€€'];

const Search: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('recommended');
  const [priceFilter, setPriceFilter] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const search = searchParams.get('search') || '';
  const cuisine = searchParams.get('cuisine') || '';

  useEffect(() => {
    setLoading(true);
    restaurantsApi.list({ search: search || undefined, cuisine: cuisine || undefined })
      .then(data => { setRestaurants(data.restaurants); setTotal(data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, cuisine]);

  const filtered = useMemo(() => {
    let list = [...restaurants];
    if (priceFilter) list = list.filter(r => r.priceRange === priceFilter);
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [restaurants, priceFilter, sort]);

  const setFilter = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', padding: '48px 0 96px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div className="eyebrow" style={{ marginBottom: 10 }}>Explorar</div>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}
        >
          <h1 className="editorial" style={{ fontSize: 'clamp(40px,5vw,68px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1, margin: 0 }}>
            {loading ? '...' : filtered.length} mesas{' '}
            <span className="italic-accent">disponibles</span>
          </h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{
                height: 40, padding: '0 14px', borderRadius: 999,
                background: '#fff', border: '1px solid var(--border)',
                fontSize: 13, fontWeight: 600, color: 'var(--navy)', cursor: 'pointer',
              }}
            >
              <option value="recommended">Recomendados</option>
              <option value="rating">Mejor valorados</option>
            </select>
            {/* View toggle */}
            <div style={{ display: 'flex', background: 'var(--ink-5)', borderRadius: 999, padding: 4, border: '1px solid var(--border)' }}>
              {(['grid', 'list'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                    background: view === v ? 'var(--navy)' : 'transparent',
                    color: view === v ? '#fff' : 'var(--ink-55)',
                    transition: 'all 0.2s',
                  }}
                >
                  {v === 'grid' ? 'Cuadrícula' : 'Lista'}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36, alignItems: 'center' }}>
          {CUISINE_OPTS.map(c => (
            <button
              key={c}
              onClick={() => setFilter('cuisine', cuisine === c ? '' : c)}
              style={{
                height: 38, padding: '0 16px', borderRadius: 999,
                fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid',
                background: cuisine === c ? 'var(--navy)' : '#fff',
                borderColor: cuisine === c ? 'var(--navy)' : 'var(--border)',
                color: cuisine === c ? '#fff' : 'var(--navy)',
                transition: 'all 0.15s',
              }}
            >
              {t(`cuisines.${c}`, { defaultValue: c })}
            </button>
          ))}
          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />
          {PRICE_OPTS.map(p => (
            <button
              key={p}
              onClick={() => setPriceFilter(priceFilter === p ? '' : p)}
              style={{
                height: 38, padding: '0 14px', borderRadius: 999,
                fontSize: 13, fontWeight: 700, cursor: 'pointer', border: '1px solid',
                background: priceFilter === p ? 'var(--primary)' : '#fff',
                borderColor: priceFilter === p ? 'var(--primary)' : 'var(--border)',
                color: priceFilter === p ? '#fff' : 'var(--navy)',
                transition: 'all 0.15s',
              }}
            >
              {p}
            </button>
          ))}
          {(cuisine || priceFilter || search) && (
            <button
              onClick={() => { setFilter('cuisine', ''); setFilter('search', ''); setPriceFilter(''); }}
              style={{
                height: 38, padding: '0 14px', borderRadius: 999,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--ink-55)', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ height: 380, borderRadius: 28 }} className="shimmer-bg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-55)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>search_off</span>
            <p className="editorial" style={{ fontSize: 28, fontWeight: 300 }}>{t('home.noResults')}</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
            gap: view === 'grid' ? 24 : 16,
          }}>
            {filtered.map((rest, i) => (
              <motion.div
                key={rest.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                {view === 'grid' ? (
                  <RestaurantCard {...rest} cuisine={t(`cuisines.${rest.cuisine}`, { defaultValue: rest.cuisine })} />
                ) : (
                  <ListRestaurantCard rest={rest} />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ListRestaurantCard: React.FC<{ rest: Restaurant }> = ({ rest }) => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: 'flex', background: '#fff', borderRadius: 20,
        border: '1px solid var(--border)', overflow: 'hidden',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-md)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
    >
      <div style={{ width: 200, flexShrink: 0, overflow: 'hidden' }}>
        <img src={rest.image} alt={rest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
        <h3 className="editorial" style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em', margin: 0 }}>{rest.name}</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13, color: 'var(--ink-55)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontWeight: 700 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>star</span>
            {rest.rating}
          </span>
          <span>·</span>
          <span>{t(`cuisines.${rest.cuisine}`, { defaultValue: rest.cuisine })}</span>
          <span>·</span>
          <span>{rest.location}</span>
          <span>·</span>
          <span>{rest.distance}</span>
          <span>·</span>
          <span style={{ fontWeight: 700 }}>{rest.priceRange}</span>
        </div>
        {rest.description && (
          <p style={{ fontSize: 14, color: 'var(--ink-55)', lineHeight: 1.6, margin: 0, maxWidth: 600 }}>
            {rest.description.slice(0, 140)}…
          </p>
        )}
      </div>
      <div style={{ padding: 24, display: 'flex', alignItems: 'center' }}>
        <a
          href={`/restaurant/${rest.id}`}
          style={{
            height: 44, padding: '0 20px', borderRadius: 14,
            background: 'var(--navy)', color: '#fff',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'background 0.2s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--primary)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--navy)')}
        >
          Reservar
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
        </a>
      </div>
    </div>
  );
};

export default Search;
