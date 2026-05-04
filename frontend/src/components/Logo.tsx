import React from 'react';

interface LogoProps {
  size?: number;
  color?: string;
  variant?: 'full' | 'mark';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 28, className = '' }) => {
  return (
    <img
      src="/logo2.svg"
      alt="ReserVia"
      style={{
        display: 'block',
        height: `${size}px`,
        width: 'auto',
        userSelect: 'none',
        flexShrink: 0,
      }}
      className={className}
    />
  );
};

export default Logo;
