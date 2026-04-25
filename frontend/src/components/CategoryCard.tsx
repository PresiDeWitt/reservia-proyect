import React from 'react';

interface CategoryCardProps {
  name: string;
  image: string;
  onClick?: () => void;
  active?: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, image, onClick, active }) => {
  return (
    <button
      onClick={onClick}
      className="relative shrink-0 overflow-hidden transition-transform"
      style={{
        width: 180,
        height: 240,
        borderRadius: 'var(--r-xl)',
        scrollSnapAlign: 'start',
        border: active ? '3px solid var(--primary)' : '3px solid transparent',
        background: 'transparent',
        cursor: 'pointer',
        padding: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <img
        src={image}
        alt={name}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.7)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 40%, rgba(15,23,42,0.85) 100%)',
        }}
      />
      <div
        className="absolute left-3.5 bottom-3.5 text-left"
        style={{ color: '#fff' }}
      >
        <div
          className="editorial"
          style={{
            fontSize: 22,
            fontWeight: 400,
            letterSpacing: '-0.01em',
            lineHeight: 1.05,
          }}
        >
          {name}
        </div>
      </div>
    </button>
  );
};

export default CategoryCard;
