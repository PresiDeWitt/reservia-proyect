import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface RestaurantCardProps {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  location: string;
  distance: string;
  rating: number;
  priceRange: string;
  reviewsCount?: number;
  featured?: boolean;
  tonight?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  id,
  name,
  image,
  cuisine,
  location,
  distance,
  rating,
  priceRange,
  reviewsCount,
  featured = false,
  tonight,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const { t } = useTranslation();
  const [fav, setFav] = useState(isFavorite);

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFav((v) => !v);
    onToggleFavorite?.(id);
  };

  const showLowAvail = tonight !== undefined && tonight <= 3;
  const showEditorial = rating >= 4.8;

  return (
    <Link
      to={`/restaurant/${id}`}
      className="card card-lift block no-underline"
      style={{ background: 'var(--surface-3)', borderRadius: 'var(--r-xl)', color: 'var(--ink)' }}
    >
      {/* Image */}
      <div
        className="card-img-zoom"
        style={{ height: featured ? 360 : 240, borderRadius: 'var(--r-xl) var(--r-xl) 0 0', position: 'relative' }}
      >
        <img
          src={image}
          alt={name}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {/* Badges */}
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6, zIndex: 1 }}>
          {showEditorial && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                borderRadius: 'var(--r-pill)',
                fontSize: 11,
                fontWeight: 700,
                background: 'var(--navy)',
                color: 'var(--cream)',
                letterSpacing: '0.02em',
              }}
            >
              {t('restaurant.editorsPick')}
            </span>
          )}
          {showLowAvail && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                borderRadius: 'var(--r-pill)',
                fontSize: 11,
                fontWeight: 700,
                background: 'var(--primary)',
                color: '#fff',
                letterSpacing: '0.02em',
              }}
            >
              {t('restaurant.tablesLeft', { count: tonight })}
            </span>
          )}
        </div>

        {/* Fav button — 44×44 touch target */}
        <button
          onClick={toggleFav}
          aria-label={fav ? t('restaurant.removeFromFavorites', { defaultValue: 'Quitar de favoritos' }) : t('restaurant.addToFavorites', { defaultValue: 'Añadir a favoritos' })}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1,
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)',
            color: fav ? 'var(--ruby)' : 'var(--ink-55)',
            border: 'none',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            transition: 'transform 0.2s var(--ease-out-expo), background 0.2s',
          }}
          className="fav-btn"
        >
          <span className={`mat ${fav ? 'mat-fill' : ''}`} style={{ fontSize: 20 }}>
            favorite
          </span>
        </button>

        {/* Location pill */}
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 14,
            padding: '6px 10px',
            background: 'rgba(15,23,42,0.75)',
            backdropFilter: 'blur(8px)',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          {cuisine} · {location}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <h3
            className="editorial"
            style={{
              fontSize: featured ? 28 : 24,
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {name}
          </h3>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--primary)' }}>
              <span className="mat mat-fill" style={{ fontSize: 14 }}>star</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--ink)' }}>
                {rating.toFixed(1)}
              </span>
            </span>
            {reviewsCount !== undefined && (
              <div style={{ fontSize: 10, color: 'var(--ink-40)', marginTop: 2 }}>
                {reviewsCount} {t('restaurant.reviews')}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 10,
            marginTop: 4,
            borderTop: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--ink-55)' }}>
            <span className="mono-num" style={{ fontWeight: 700, color: 'var(--ink)' }}>{priceRange}</span>
            {' '}· {distance}
          </div>
          <div className="btn btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 12, pointerEvents: 'none' }}>
            <span>{t('restaurant.bookNow')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
