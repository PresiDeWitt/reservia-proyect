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
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ id, name, image, cuisine, location, distance, rating, priceRange }) => {
  const { t } = useTranslation();
  const [faved, setFaved] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column',
        background: '#fff',
        borderRadius: 28,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--sh-lg)' : 'var(--sh-sm)',
        transition: 'transform 0.35s cubic-bezier(0.2,0.8,0.2,1), box-shadow 0.35s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <Link to={`/restaurant/${id}`} style={{ display: 'block', position: 'relative', height: 240, overflow: 'hidden', flexShrink: 0 }}>
        <div
          style={{
            width: '100%', height: '100%',
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.7s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        />
        {/* Cuisine + location pill */}
        <div style={{
          position: 'absolute', bottom: 14, left: 14,
          padding: '6px 12px',
          background: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(8px)',
          borderRadius: 999, fontSize: 11, fontWeight: 700, color: '#fff',
        }}>
          {cuisine} · {location}
        </div>
        {/* Fav button */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); setFaved(f => !f); }}
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            border: 'none', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            color: faved ? 'var(--ruby)' : 'var(--ink-40)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 18, fontVariationSettings: faved ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>
      </Link>

      {/* Card body */}
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <Link to={`/restaurant/${id}`} style={{ textDecoration: 'none' }}>
            <h3
              className="editorial"
              style={{
                fontSize: 24, fontWeight: 400, lineHeight: 1.1,
                letterSpacing: '-0.02em', color: 'var(--navy)', margin: 0,
              }}
            >
              {name}
            </h3>
          </Link>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            flexShrink: 0,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>star</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>{rating}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 8px',
            background: 'var(--ink-5)', borderRadius: 999,
            color: 'var(--ink-55)',
          }}>
            {priceRange}
          </span>
          <span style={{ fontSize: 12, color: 'var(--ink-40)' }}>·</span>
          <span style={{ fontSize: 12, color: 'var(--ink-55)' }}>{distance}</span>
        </div>

        <div style={{
          marginTop: 'auto', paddingTop: 14,
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 10,
        }}>
          <button
            style={{
              flex: 1, height: 42,
              borderRadius: 14,
              border: '1px solid var(--border-strong)',
              background: 'transparent',
              fontSize: 13, fontWeight: 700,
              color: 'var(--navy)', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-5)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {t('restaurant.menu')}
          </button>
          <Link
            to={`/restaurant/${id}`}
            style={{
              flex: 1, height: 42,
              borderRadius: 14,
              background: 'var(--navy)',
              fontSize: 13, fontWeight: 700, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none',
              transition: 'background 0.2s',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--primary)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--navy)')}
          >
            {t('restaurant.bookNow')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
