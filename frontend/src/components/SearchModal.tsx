import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { restaurantsApi, type Restaurant } from '../api/restaurants';

interface Props {
  open: boolean;
  onClose: () => void;
}

const POPULAR_FALLBACK: Restaurant[] = [];

const SearchModal: React.FC<Props> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Restaurant[]>([]);
  const [popular, setPopular] = useState<Restaurant[]>(POPULAR_FALLBACK);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load popular restaurants once
  useEffect(() => {
    restaurantsApi.list().then((r) => setPopular(r.restaurants.slice(0, 4))).catch(() => {});
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery('');
      setResults([]);
    }
  }, [open]);

  // Close on Escape
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
  const sectionLabel = query.trim() ? 'RESULTADOS' : 'POPULAR AHORA';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(10,14,26,0.72)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 9998,
            }}
          />

          {/* Modal card */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            style={{
              position: 'fixed',
              top: '10vh',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: 660,
              background: '#fff',
              borderRadius: 20,
              boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
              zIndex: 9999,
              overflow: 'hidden',
            }}
          >
            {/* Search input row */}
            <form onSubmit={submit}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '18px 20px',
                  borderBottom: '1.5px solid #f0f0f0',
                }}
              >
                <span style={{ fontSize: 22, color: 'var(--primary)', flexShrink: 0 }} className="mat">search</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={handleChange}
                  placeholder="Busca una cocina, un barrio, un ambiente..."
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: 17,
                    color: '#111',
                    background: 'transparent',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: 'none',
                    background: '#f0f0f0',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    color: '#555',
                  }}
                >
                  <span className="mat" style={{ fontSize: 18 }}>close</span>
                </button>
              </div>
            </form>

            {/* Geolocation chip */}
            <div style={{ padding: '10px 20px 0' }}>
              <button
                type="button"
                onClick={() => { navigate('/map'); onClose(); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 13px',
                  borderRadius: 999,
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                }}
              >
                <span className="mat" style={{ fontSize: 15 }}>near_me</span>
                Cerca de mí
              </button>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#f0f0f0', margin: '14px 0 0' }} />

            {/* Results list */}
            <div style={{ padding: '0 0 8px' }}>
              <div
                style={{
                  padding: '14px 22px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#aaa',
                }}
              >
                {loading ? 'BUSCANDO…' : sectionLabel}
              </div>

              {list.length === 0 && !loading && query.trim() && (
                <div style={{ padding: '12px 22px 20px', fontSize: 14, color: '#999' }}>
                  Sin resultados para "{query}"
                </div>
              )}

              {list.map((r, i) => (
                <motion.button
                  key={r.id}
                  type="button"
                  onClick={() => goTo(r)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.045 }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '10px 22px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#fafafa'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 10,
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: '#eee',
                    }}
                  >
                    <img
                      src={r.image}
                      alt={r.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#111', marginBottom: 2 }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#888' }}>
                      {r.cuisine} · {r.location} · {r.distance}
                    </div>
                  </div>

                  {/* Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <span className="mat" style={{ fontSize: 16, color: 'var(--primary)' }}>star</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>
                      {r.rating.toFixed(1)}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
