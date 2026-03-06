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
      className={`flex flex-col items-center gap-4 min-w-[120px] group snap-center bg-transparent border-none p-0 cursor-pointer ${active ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
    >
      <div
        className={`size-24 rounded-full bg-cover bg-center shadow-md transition-all group-hover:scale-105 ${active ? 'ring-4 ring-primary scale-105' : 'ring-4 ring-white group-hover:shadow-xl'}`}
        style={{ backgroundImage: `url(${image})` }}
      />
      <span className={`text-base font-bold transition-colors ${active ? 'text-primary' : 'text-slate-700 group-hover:text-primary'}`}>{name}</span>
    </button>
  );
};

export default CategoryCard;
