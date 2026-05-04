import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import RestaurantCard from '../components/RestaurantCard';
import { restaurantsApi, type Restaurant } from '../api/restaurants';
import { useTranslation } from 'react-i18next';

const FAV_KEY = 'reservia_favorites';

const FavoritesPage: React.FC = () => {
  const { t } = useTranslation();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const ids = JSON.parse(localStorage.getItem(FAV_KEY) || '[]') as string[];

  useEffect(() => {
    restaurantsApi
      .list()
      .then((data) => setRestaurants(data.restaurants.filter((r) => ids.includes(r.id))))
      .catch(console.error)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container"
      style={{ padding: '120px 24px 80px' }}
    >
      <div className="eyebrow">Tu colección</div>
      <h1
        className="editorial"
        style={{ fontSize: 'clamp(48px,6vw,88px)', fontWeight: 300, letterSpacing: '-0.03em', marginTop: 8 }}
      >
        Tus <span className="italic-accent">favoritos</span>
      </h1>

      {loading ? (
        <div
          style={{
            marginTop: 40,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer" style={{ height: 360, borderRadius: 'var(--r-xl)' }} />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-40)' }}>
          <span className="mat" style={{ fontSize: 48, marginBottom: 12, display: 'block' }}>favorite_border</span>
          <p style={{ fontSize: 16 }}>Aún no has guardado ningún restaurante.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>
            <span>Explorar</span>
          </Link>
        </div>
      ) : (
        <div
          style={{
            marginTop: 40,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {restaurants.map((r) => (
            <RestaurantCard
              key={r.id}
              {...r}
              cuisine={t(`cuisines.${r.cuisine}`, { defaultValue: r.cuisine })}
              isFavorite
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default FavoritesPage;
