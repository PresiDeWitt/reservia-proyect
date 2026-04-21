import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface RestaurantCardProps {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  location: string;
  distance: string;
  rating: number;
  reviewsCount?: number;
  priceRange: string;
  description?: string;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ id, name, image, cuisine, location, distance, rating, reviewsCount, priceRange, description }) => {
  const [faved, setFaved] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface-3)',
        borderRadius: 'var(--r-xl)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--sh-lg)' : '0 2px 8px -4px rgba(15,23,42,0.1)',
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
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.7s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        />
        {/* Cuisine + location pill */}
        <div style={{ position: 'absolute', bottom: 14, left: 14, padding: '6px 12px', background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(8px)', borderRadius: 999, fontSize: 11, fontWeight: 700, color: '#fff' }}>
          {cuisine} · {location}
        </div>
        {/* Fav button */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); setFaved(f => !f); }}
          style={{ position: 'absolute', top: 14, right: 14, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: faved ? '#E11D48' : 'rgba(15,23,42,0.4)', transition: 'transform 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: faved ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
        </button>
      </Link>

      {/* Card body */}
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <Link to={`/restaurant/${id}`} style={{ textDecoration: 'none', flex: 1 }}>
            <h3 className="editorial" style={{ fontSize: 24, fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--navy)', margin: 0 }}>
              {name}
            </h3>
          </Link>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {[1,2,3,4,5].map(n => (
                <span key={n} className="material-symbols-outlined" style={{ fontSize: 13, color: n <= Math.round(rating) ? 'var(--primary)' : 'var(--ink-20)', fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginLeft: 4 }}>{rating}</span>
            </div>
            {reviewsCount && <div style={{ fontSize: 10, color: 'var(--ink-40)', marginTop: 2 }}>{reviewsCount} reseñas</div>}
          </div>
        </div>

        {description && (
          <p style={{ fontSize: 12, color: 'var(--ink-55)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {description}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-55)' }}>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{priceRange}</span> · {distance}
          </div>
          <Link
            to={`/restaurant/${id}`}
            className="btn btn-primary"
            style={{ height: 36, padding: '0 14px', fontSize: 12, textDecoration: 'none' }}
          >
            <span>Reservar</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
