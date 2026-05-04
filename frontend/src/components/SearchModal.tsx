import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { restaurantsApi, type Restaurant } from '../api/restaurants';
import './SearchModal.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SPRING = { type: 'spring', stiffness: 400, damping: 32 } as const;

const SearchModal: React.FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Restaurant[]>([]);
  const [popular, setPopular] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    restaurantsApi.list().then((r) => setPopular(r.restaurants.slice(0, 4))).catch(() => {});
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    restaurantsApi.list({ search: q })
      .then((r) => setResults(r.restaurants.slice(0, 5)))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 280);
  };

  const goTo = (r: Restaurant) => {
    navigate(`/restaurant/${r.id}`);
    onClose();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const list = query.trim() ? results : popular;
  const sectionLabel = query.trim() ? t('search.results') : t('search.popular');

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="sm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <div className="sm-wrapper">
            <motion.div
              key="modal"
              className="sm-card"
              initial={{ opacity: 0, y: -24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={SPRING}
            >
              <form onSubmit={submit}>
                <div className="sm-input-row">
                  <span className="mat sm-icon">search</span>
                  <input
                    ref={inputRef}
                    className="sm-input"
                    value={query}
                    onChange={handleChange}
                    placeholder={t('search.placeholder')}
                  />
                  <button type="button" className="sm-close-btn" onClick={onClose}>
                    <span className="mat" style={{ fontSize: 18 }}>close</span>
                  </button>
                </div>
              </form>

              <div className="sm-geo-row">
                <button
                  type="button"
                  className="sm-geo-chip"
                  onClick={() => { navigate('/map'); onClose(); }}
                >
                  <span className="mat">near_me</span>
                  {t('search.nearMe')}
                </button>
              </div>

              <div className="sm-divider" />

              <div className="sm-list">
                <div className="sm-section-label">
                  {loading ? t('search.searching') : sectionLabel}
                </div>

                {list.length === 0 && !loading && query.trim() && (
                  <div className="sm-empty">{t('search.noResults')} "{query}"</div>
                )}

                {list.map((r, i) => (
                  <motion.button
                    key={r.id}
                    type="button"
                    className="sm-item"
                    onClick={() => goTo(r)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.045 }}
                  >
                    <div className="sm-thumb">
                      <img src={r.image} alt={r.name} loading="lazy" />
                    </div>
                    <div className="sm-info">
                      <div className="sm-name">{r.name}</div>
                      <div className="sm-meta">{r.cuisine} · {r.location} · {r.distance}</div>
                    </div>
                    <div className="sm-rating">
                      <span className="mat">star</span>
                      <span className="sm-rating-value">{r.rating.toFixed(1)}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
