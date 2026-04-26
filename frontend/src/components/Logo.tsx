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
      height={size}
      style={{ display: 'inline-block', userSelect: 'none', width: 'auto', maxHeight: size }}
      className={className}
    />
  );
};

export default Logo;
