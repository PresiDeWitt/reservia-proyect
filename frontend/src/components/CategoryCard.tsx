import React from 'react';

interface CategoryCardProps {
  name: string;
  image: string;
  onClick?: () => void;
  active?: boolean;
  color?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, image, onClick, active, color = '#1a2236' }) => {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        width: 180,
        height: 240,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        scrollSnapAlign: 'start',
        border: active ? '3px solid var(--primary)' : '3px solid transparent',
        cursor: 'pointer',
        background: 'none',
        padding: 0,
        transition: 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1)',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
    >
      <img
        src={image}
        alt={name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, transparent 40%, ${color}dd 100%)`,
      }} />
      <div style={{
        position: 'absolute', bottom: 16, left: 16, color: '#fff', textAlign: 'left',
      }}>
        <div
          className="editorial"
          style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.1 }}
        >
          {name}
        </div>
      </div>
      {active && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 22, height: 22, borderRadius: '50%',
          background: 'var(--primary)', display: 'grid', placeItems: 'center',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#fff' }}>check</span>
        </div>
      )}
    </button>
  );
};

export default CategoryCard;
