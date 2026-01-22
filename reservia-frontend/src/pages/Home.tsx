import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Hero from '../components/Hero';
import CategoryCard from '../components/CategoryCard';
import RestaurantCard from '../components/RestaurantCard';
import { motion, type Variants } from 'framer-motion';

// Images
import italianImg from '../assets/images/cuisine_italian_pasta_1769099701383.png';
import sushiImg from '../assets/images/cuisine_sushi_platter_1769099717268.png';
import steakImg from '../assets/images/cuisine_steak_grilled_1769099732584.png';
import mexicanImg from '../assets/images/cuisine_mexican_tacos_1769099775852.png';
import burgerImg from '../assets/images/cuisine_burger_gourmet_1769099791338.png';
import healthyImg from '../assets/images/cuisine_healthy_salad_1769099807481.png';
import bakeryImg from '../assets/images/cuisine_bakery_bread_1769099834160.png';
import asianImg from '../assets/images/cuisine_asian_noodles_dimsum_1769099849081.png';

import goldenForkImg from '../assets/images/restaurant_golden_fork_interior_1769099879216.png';
import sakuraImg from '../assets/images/restaurant_sakura_gardens_sushi_1769099894850.png';
import primeCutsImg from '../assets/images/restaurant_prime_cuts_steakhouse_1769099911211.png';

const Home: React.FC = () => {
  const { t } = useTranslation();

  const categories = [
    { name: 'Italian', image: italianImg },
    { name: 'Sushi', image: sushiImg },
    { name: 'Steak', image: steakImg },
    { name: 'Mexican', image: mexicanImg },
    { name: 'Burgers', image: burgerImg },
    { name: 'Healthy', image: healthyImg },
    { name: 'Bakery', image: bakeryImg },
    { name: 'Asian', image: asianImg },
  ];

  const topRated = [
    { id: '1', name: 'The Golden Fork', image: goldenForkImg, cuisine: 'Italian', location: 'Downtown', distance: '0.8 mi', rating: 4.8, priceRange: '$$$' },
    { id: '2', name: 'Sakura Gardens', image: sakuraImg, cuisine: 'Japanese', location: 'West End', distance: '2.1 mi', rating: 4.6, priceRange: '$$' },
    { id: '3', name: 'Prime Cuts', image: primeCutsImg, cuisine: 'Steakhouse', location: 'Uptown', distance: '1.5 mi', rating: 4.9, priceRange: '$$$$' },
  ];

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
          <motion.div 
            variants={itemVariants}
            className="flex overflow-x-auto pb-6 gap-8 scrollbar-hide snap-x"
          >
            {categories.map(cat => (
              <CategoryCard 
                key={cat.name} 
                {...cat} 
                name={t(`cuisines.${cat.name}`)}
              />
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-4 md:px-10 lg:px-40 bg-white">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
          <motion.div variants={itemVariants} className="flex justify-between items-end">
            <div>
              <h2 className="text-navy text-3xl font-bold leading-tight tracking-tight">{t('home.topRatedTitle')}</h2>
              <p className="text-slate-500 mt-2 text-lg">{t('home.topRatedSubtitle')}</p>
            </div>
            <Link to="/" className="text-primary font-bold text-base hover:underline flex items-center gap-1">
              {t('home.viewAll')} (42)
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topRated.map((rest) => (
              <motion.div
                key={rest.name}
                variants={itemVariants}
                viewport={{ once: true }}
              >
                <RestaurantCard 
                  {...rest} 
                  cuisine={t(`cuisines.${rest.cuisine}`)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;

