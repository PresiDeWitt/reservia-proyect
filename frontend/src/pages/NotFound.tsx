import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
  >
    <span className="material-symbols-outlined text-6xl sm:text-8xl text-slate-200 mb-4">search_off</span>
    <h1 className="text-4xl sm:text-6xl font-black text-navy mb-2">404</h1>
    <p className="text-lg sm:text-xl text-slate-500 mb-8">Page not found</p>
    <Link
      to="/"
      className="px-8 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
    >
      Back to Home
    </Link>
  </motion.div>
);

export default NotFound;
