import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import RestaurantCard from '../components/RestaurantCard';
import { restaurantsApi, type Restaurant } from '../api/restaurants';
import { useAuth } from '../context/AuthContext';

const Favorites: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [all, setAll] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restaurantsApi.list()
      .then(d => setAll(d.restaurants))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Use top-rated as "favorites" since we don't have a real favorites API
  const favs = all.filter(r => r.rating >= 4.7).slice(0, 6);

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh', padding: '48px 0 96px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Tu colección</div>
          <h1 className="editorial" style={{ fontSize: 'clamp(40px,5vw,68px)', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1, margin: '0 0 8px' }}>
            Mesas que <span className="italic-accent">amas</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-55)', marginBottom: 40 }}>
            {favs.length} restaurantes guardados
          </p>
        </motion.div>

        {!isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 56, display: 'block', marginBottom: 16, color: 'var(--ink-20)' }}>favorite_border</span>
            <p className="editorial" style={{ fontSize: 28, fontWeight: 300, marginBottom: 20 }}>
              Inicia sesión para guardar tus favoritos.
            </p>
            <p style={{ fontSize: 14, color: 'var(--ink-55)', marginBottom: 24 }}>
              Mientras, aquí tienes los restaurantes mejor valorados.
            </p>
          </div>
        ) : null}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {[1, 2, 3].map(i => <div key={i} style={{ height: 380, borderRadius: 28 }} className="shimmer-bg" />)}
          </div>
        ) : favs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-55)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>favorite_border</span>
            <p className="editorial" style={{ fontSize: 28, fontWeight: 300, marginBottom: 20 }}>
              Aún no has guardado ninguna mesa.
            </p>
            <Link to="/search" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 48, padding: '0 24px', borderRadius: 14,
              background: 'var(--navy)', color: '#fff',
              fontSize: 14, fontWeight: 700, textDecoration: 'none',
            }}>
              Explorar restaurantes
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {favs.map((rest, i) => (
              <motion.div
                key={rest.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <RestaurantCard {...rest} cuisine={t(`cuisines.${rest.cuisine}`, { defaultValue: rest.cuisine })} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
