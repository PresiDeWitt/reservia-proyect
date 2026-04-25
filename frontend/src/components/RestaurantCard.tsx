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
      style={{
        background: 'var(--surface-3)',
        borderRadius: 'var(--r-xl)',
        color: 'var(--ink)',
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          height: featured ? 360 : 240,
          borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
        }}
      >
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ filter: 'brightness(0.95)' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        <div className="absolute top-3.5 left-3.5 flex gap-1.5">
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
              Editor's Pick
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
              Solo {tonight} mesas hoy
            </span>
          )}
        </div>

        <button
          onClick={toggleFav}
          aria-label={fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          className="absolute top-3.5 right-3.5 grid place-items-center transition-transform"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)',
            color: fav ? 'var(--ruby)' : 'var(--ink-55)',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span className={`mat ${fav ? 'mat-fill' : ''}`} style={{ fontSize: 18 }}>
            favorite
          </span>
        </button>

        <div
          className="absolute bottom-3.5 left-3.5"
          style={{
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

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div>
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
          </div>
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--primary)',
              }}
            >
              <span className="mat mat-fill" style={{ fontSize: 14 }}>star</span>
              <span className="mono-num" style={{ fontWeight: 700, color: 'var(--ink)' }}>
                {rating.toFixed(1)}
              </span>
            </span>
            {reviewsCount !== undefined && (
              <div style={{ fontSize: 10, color: 'var(--ink-40)', marginTop: 2 }}>{reviewsCount} reseñas</div>
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
            <span className="mono-num" style={{ fontWeight: 700, color: 'var(--ink)' }}>
              {priceRange}
            </span>{' '}
            · {distance}
          </div>
          <span className="btn btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 12 }}>
            <span>{t('restaurant.bookNow')}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
