import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import RestaurantCard from '../components/RestaurantCard';
import { restaurantsApi, type Restaurant } from '../api/restaurants';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const FavoritesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    restaurantsApi
      .favorites()
      .then((data) => setRestaurants(data.favorites))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleToggleFavorite = (id: string) => {
    restaurantsApi.removeFavorite(parseInt(id, 10)).catch(() => {});
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  };

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

      {!user ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-40)' }}>
          <span className="mat" style={{ fontSize: 48, marginBottom: 12, display: 'block' }}>lock</span>
          <p style={{ fontSize: 16 }}>Inicia sesión para ver tus favoritos.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>
            <span>Ir al inicio</span>
          </Link>
        </div>
      ) : loading ? (
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
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default FavoritesPage;
