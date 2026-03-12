import React from 'react';
import { useTranslation } from 'react-i18next';

const Legend: React.FC = () => {
  const { t } = useTranslation();

  const items = [
    { color: '#34d399', stroke: '#10b981', label: t('floorPlan.available') },
    { color: '#f97316', stroke: '#ea580c', label: t('floorPlan.selected') },
    { color: '#cbd5e1', stroke: '#94a3b8', label: t('floorPlan.occupied') },
  ];

  return (
    <div className="flex items-center justify-center gap-8 py-2">
      {items.map(({ color, stroke, label }) => (
        <div key={label} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <svg width="18" height="18" viewBox="-9 -9 18 18">
            <rect x="-6" y="-9" width="12" height="5" rx="2.5" fill={color} stroke={stroke} strokeWidth="1" opacity={0.9} />
            <ellipse cx="0" cy="1" rx="6.5" ry="5" fill={color} stroke={stroke} strokeWidth="1" />
          </svg>
          {label}
        </div>
      ))}
    </div>
  );
};

export default Legend;
