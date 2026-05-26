import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
    >
      <span className="material-symbols-outlined text-8xl mb-4" style={{ color: 'var(--ink-20)' }}>search_off</span>
      <h1 className="text-6xl font-black mb-2" style={{ color: 'var(--ink)' }}>404</h1>
      <p className="text-xl mb-8" style={{ color: 'var(--ink-55)' }}>{t('notFound.message')}</p>
      <Link
        to="/"
        className="px-8 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
      >
        {t('notFound.backHome')}
      </Link>
    </motion.div>
  );
};

export default NotFound;
