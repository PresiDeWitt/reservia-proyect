import React from 'react';

interface LogoProps {
  size?: number;
  color?: string;
  variant?: 'full' | 'mark';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 28, color = 'currentColor', variant = 'full', className = '' }) => {
  const uid = React.useId().replace(/:/g, '');
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.38,
        color,
        userSelect: 'none',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none" style={{ flexShrink: 0 }}>
        <defs>
          <linearGradient id={`lg${uid}`} x1="6" y1="4" x2="38" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f97415" />
            <stop offset="1" stopColor="#c94d05" />
          </linearGradient>
        </defs>
        <circle cx="22" cy="22" r="20" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.25" />
        <path d="M14 8 L14 17 Q14 20 16 21 L16 36" stroke={`url(#lg${uid})`} strokeWidth="2" strokeLinecap="round" />
        <path d="M11 8 L11 15" stroke={`url(#lg${uid})`} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M17 8 L17 15" stroke={`url(#lg${uid})`} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M30 8 C34 10 34 17 30 19 L30 36" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="22" cy="22" r="2.2" fill={`url(#lg${uid})`} />
        <path d="M22 16 C23.5 18 24.5 20 22 21.5 C21 20 20.5 18.5 22 16 Z" fill={`url(#lg${uid})`} opacity="0.7" />
      </svg>
      {variant === 'full' && (
        <span
          style={{
            fontFamily: 'var(--font-editorial)',
            fontOpticalSizing: 'auto',
            fontVariationSettings: '"SOFT" 40, "WONK" 0',
            fontSize: size * 0.78,
            fontWeight: 500,
            letterSpacing: '-0.025em',
            lineHeight: 1,
            display: 'block',
          }}
        >
          Reser
          <span
            style={{
              fontStyle: 'italic',
              color: 'var(--primary)',
              fontVariationSettings: '"SOFT" 100, "WONK" 0',
            }}
          >
            Via
          </span>
        </span>
      )}
    </span>
  );
};

export default Logo;
