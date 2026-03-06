import React from 'react';
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

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <Link to={`/restaurant/${id}`} className="relative h-60 w-full overflow-hidden block">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-emerald text-white px-3 py-1.5 text-xs font-bold shadow-md">
          <span className="material-symbols-outlined text-[14px]">bolt</span>
          {t('restaurant.realTime')}
        </div>
        <button 
          className="absolute top-4 right-4 z-10 rounded-full bg-white/90 p-2 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <span className="material-symbols-outlined block text-[20px]">favorite</span>
        </button>
        <div 
          className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${image})` }}
        />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex justify-between items-start mb-3">
          <Link to={`/restaurant/${id}`}>
            <h3 className="text-xl font-bold text-navy group-hover:text-primary transition-colors">{name}</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">{cuisine} • {location} • {distance}</p>
          </Link>
          <div className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 border border-green-100">
            <span className="material-symbols-outlined text-[16px] text-green-600">star</span>
            <span className="text-sm font-bold text-navy">{rating}</span>
          </div>
        </div>
        <div className="mb-6 flex items-center gap-3 text-sm text-slate-600">
          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">{priceRange}</span>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-3">
          <button className="w-full rounded-xl bg-slate-50 border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors">
            {t('restaurant.menu')}
          </button>
          <Link 
            to={`/restaurant/${id}`}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md hover:bg-orange-600 transition-all text-center"
          >
            {t('restaurant.bookNow')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;


