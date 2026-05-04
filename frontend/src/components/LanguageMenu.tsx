import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type LangCode = 'es' | 'en';

interface LangDef {
  code: LangCode;
  label: string;
  native: string;
  countryCode: string;
}

const LANGS: LangDef[] = [
  { code: 'es', label: 'Spanish', native: 'Español', countryCode: 'es' },
  { code: 'en', label: 'English', native: 'English', countryCode: 'gb' },
];

interface LanguageMenuProps {
  variant?: 'light' | 'dark';
}

const Flag: React.FC<{ countryCode: string; size?: number }> = ({ countryCode, size = 24 }) => (
  <span
    className={`fi fi-${countryCode}`}
    style={{
      width: size * 1.4,
      height: size,
      borderRadius: 4,
      display: 'inline-block',
      backgroundSize: 'cover',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      flexShrink: 0,
    }}
  />
);

const LanguageMenu: React.FC<LanguageMenuProps> = ({ variant = 'dark' }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const current = (i18n.language || 'es').split('-')[0] as LangCode;
  const active = LANGS.find((l) => l.code === current) ?? LANGS[0];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (code: LangCode) => { i18n.changeLanguage(code); setOpen(false); };

  const isDark = variant === 'dark';

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Idioma: ${active.native}`}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors"
        style={{
          background: 'transparent',
          border: 'none',
          color: isDark ? '#fff' : 'var(--ink)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'var(--ink-5)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <Flag countryCode={active.countryCode} size={20} />
        <span
          className="mat"
          style={{ fontSize: 16, opacity: 0.6, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          expand_more
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Seleccionar idioma"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] origin-top-right overflow-hidden"
            style={{
              width: 200,
              maxWidth: 'calc(100vw - 2rem)',
              background: 'var(--surface-3)',
              color: 'var(--ink)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--sh-lg)',
              border: '1px solid var(--border)',
              padding: 6,
              listStyle: 'none',
              margin: 0,
            }}
          >
            {LANGS.map((lang) => {
              const isActive = lang.code === current;
              return (
                <li key={lang.code} role="option" aria-selected={isActive}>
                  <button
                    onClick={() => choose(lang.code)}
                    className="w-full flex items-center gap-3"
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--r-md)',
                      background: isActive ? 'rgba(249,116,21,0.12)' : 'transparent',
                      color: 'var(--ink)',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      border: 'none',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--ink-5)'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Flag countryCode={lang.countryCode} size={22} />
                    <span className="flex-1 text-left">
                      <span className="block text-sm font-bold leading-tight" style={{ color: isActive ? 'var(--primary)' : 'var(--ink)' }}>
                        {lang.native}
                      </span>
                      <span className="block text-[11px]" style={{ color: 'var(--ink-55)' }}>{lang.label}</span>
                    </span>
                    {isActive && (
                      <span className="mat mat-fill" style={{ fontSize: 16, color: 'var(--primary)' }}>check_circle</span>
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageMenu;
