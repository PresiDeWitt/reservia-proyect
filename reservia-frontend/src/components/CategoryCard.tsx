import React from 'react';

interface CategoryCardProps {
  name: string;
  image: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, image }) => {
  return (
    <div className="flex flex-col items-center gap-4 min-w-[120px] cursor-pointer group snap-center">
      <div 
        className="size-24 rounded-full bg-cover bg-center shadow-md group-hover:shadow-xl transition-all group-hover:scale-105 ring-4 ring-white"
        style={{ backgroundImage: `url(${image})` }}
      />
      <span className="text-base font-bold text-slate-700 group-hover:text-primary">{name}</span>
    </div>
  );
};

export default CategoryCard;
