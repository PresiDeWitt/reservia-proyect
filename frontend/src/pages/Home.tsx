import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Hero from '../components/Hero';
import CategoryCard from '../components/CategoryCard';
import RestaurantCard from '../components/RestaurantCard';
import { motion, type Variants } from 'framer-motion';
import { restaurantsApi, type Restaurant } from '../api/restaurants';

import italianImg from '../assets/images/cuisine_italian_pasta_1769099701383.png';
import sushiImg from '../assets/images/cuisine_sushi_platter_1769099717268.png';
import steakImg from '../assets/images/cuisine_steak_grilled_1769099732584.png';
import mexicanImg from '../assets/images/cuisine_mexican_tacos_1769099775852.png';
import burgerImg from '../assets/images/cuisine_burger_gourmet_1769099791338.png';
import healthyImg from '../assets/images/cuisine_healthy_salad_1769099807481.png';
import bakeryImg from '../assets/images/cuisine_bakery_bread_1769099834160.png';
import asianImg from '../assets/images/cuisine_asian_noodles_dimsum_1769099849081.png';

const CATEGORIES = [
  { key: 'Italian', image: italianImg },
  { key: 'Sushi', image: sushiImg },
  { key: 'Steak', image: steakImg },
  { key: 'Mexican', image: mexicanImg },
  { key: 'Burgers', image: burgerImg },
  { key: 'Healthy', image: healthyImg },
  { key: 'Bakery', image: bakeryImg },
  { key: 'Asian', image: asianImg },
];

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [total, setTotal] = useState(0);
  const [loadedQueryKey, setLoadedQueryKey] = useState<string | null>(null);

  const search = searchParams.get('search') || '';
  const cuisine = searchParams.get('cuisine') || '';
  const queryKey = `${search}::${cuisine}`;
  const loading = loadedQueryKey !== queryKey;

  useEffect(() => {
    let isActive = true;

    restaurantsApi.list({ search: search || undefined, cuisine: cuisine || undefined })
      .then((data) => {
        if (!isActive) return;
        setRestaurants(data.restaurants);
        setTotal(data.total);
      })
      .catch(console.error)
      .finally(() => {
        if (!isActive) return;
        setLoadedQueryKey(queryKey);
      });

    return () => {
      isActive = false;
    };
  }, [search, cuisine, queryKey]);

  const handleCategoryClick = (key: string) => {
    const params = new URLSearchParams();
    if (cuisine !== key) params.set('cuisine', key);
    navigate(`/?${params.toString()}`);
    setTimeout(() => document.getElementById('restaurant-list')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Hero />
      
      <section className="pt-32 pb-12 px-4 md:px-10 lg:px-40">
        <div className="max-w-[1280px] mx-auto">
          <motion.h3 variants={itemVariants} className="text-slate-900 text-xl font-bold mb-8">{t('home.browseByCraving')}</motion.h3>
          <motion.div variants={itemVariants} className="flex overflow-x-auto pb-6 gap-4 sm:gap-8 scrollbar-hide snap-x">
            {CATEGORIES.map(cat => (
              <CategoryCard
                key={cat.key}
                name={t(`cuisines.${cat.key}`, { defaultValue: cat.key })}
                image={cat.image}
                active={cuisine === cat.key}
                onClick={() => handleCategoryClick(cat.key)}
              />
            ))}
          </motion.div>
        </div>
      </section>

      <section id="restaurant-list" className="py-12 px-4 md:px-10 lg:px-40 bg-white">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
          <motion.div variants={itemVariants} className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <h2 className="text-navy text-3xl font-bold leading-tight tracking-tight">
                {cuisine
                  ? t(`cuisines.${cuisine}`, { defaultValue: cuisine })
                  : search
                    ? `"${search}"`
                    : t('home.topRatedTitle')}
              </h2>
              <p className="text-slate-500 mt-2 text-lg">{t('home.topRatedSubtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
              {(search || cuisine) && (
                <Link to="/" className="text-sm text-slate-500 hover:text-primary flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-base">close</span>
                  {t('home.clearFilters')}
                </Link>
              )}
              <span className="text-primary font-bold text-base">
                {total} {t('home.results')}
              </span>
            </div>
          </motion.div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-4 block">search_off</span>
              <p className="text-lg font-medium">{t('home.noResults')}</p>
              <Link to="/" className="mt-4 inline-block text-primary font-bold hover:underline">{t('home.clearFilters')}</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((rest) => (
                <motion.div key={rest.id} variants={itemVariants} viewport={{ once: true }}>
                  <RestaurantCard
                    {...rest}
                    cuisine={t(`cuisines.${rest.cuisine}`, { defaultValue: rest.cuisine })}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default Home;

