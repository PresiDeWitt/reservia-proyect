import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ES from 'country-flag-icons/react/3x2/ES';
import GB from 'country-flag-icons/react/3x2/GB';

type LangCode = 'es' | 'en';

interface LangDef {
  code: LangCode;
  label: string;
  native: string;
  Flag: React.ComponentType<{ className?: string; title?: string }>;
}

const LANGS: LangDef[] = [
  { code: 'es', label: 'Spanish', native: 'Español', Flag: ES },
  { code: 'en', label: 'English', native: 'English', Flag: GB },
];

interface LanguageMenuProps {
  variant?: 'light' | 'dark';
}

const LanguageMenu: React.FC<LanguageMenuProps> = ({ variant = 'dark' }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const current = (i18n.language || 'es').split('-')[0] as LangCode;
  const active = LANGS.find((l) => l.code === current) ?? LANGS[0];
  const ActiveFlag = active.Flag;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (code: LangCode) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Idioma: ${active.native}`}
        className={`group flex items-center justify-center transition-all ${
          variant === 'dark'
            ? 'hover:bg-white/10 ring-2 ring-white/20 hover:ring-white/40'
            : 'hover:bg-[var(--ink-5)] ring-2 ring-[var(--border)] hover:ring-[var(--primary)]'
        }`}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'transparent',
          padding: 0,
          overflow: 'hidden',
          border: 'none',
        }}
      >
        <ActiveFlag
          title={active.native}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          } as React.CSSProperties}
        />
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
            className="absolute right-0 top-[calc(100%+10px)] origin-top-right overflow-hidden"
            style={{
              width: 220,
              maxWidth: 'calc(100vw - 2rem)',
              transformOrigin: 'top right',
              background: 'var(--surface-3)',
              color: 'var(--ink)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--sh-lg)',
              border: '1px solid var(--border)',
              padding: 8,
            }}
          >
            <li
              className="eyebrow"
              style={{ padding: '4px 10px 8px', color: 'var(--ink-55)' }}
            >
              Idioma · Language
            </li>
            {LANGS.map((lang) => {
              const isActive = lang.code === current;
              const F = lang.Flag;
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
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'var(--ink-5)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span
                      className="relative overflow-hidden block"
                      style={{
                        width: 32,
                        height: 22,
                        borderRadius: 4,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.25), 0 0 0 1px var(--border)',
                        flexShrink: 0,
                      }}
                    >
                      <F
                        title={lang.native}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        } as React.CSSProperties}
                      />
                    </span>
                    <span className="flex-1 text-left">
                      <span
                        className="block text-sm font-bold leading-tight"
                        style={{ color: isActive ? 'var(--primary)' : 'var(--ink)' }}
                      >
                        {lang.native}
                      </span>
                      <span className="block text-[11px]" style={{ color: 'var(--ink-55)' }}>
                        {lang.label}
                      </span>
                    </span>
                    <span
                      className={`mat ${isActive ? 'mat-fill' : ''}`}
                      style={{
                        fontSize: 18,
                        color: isActive ? 'var(--primary)' : 'var(--ink-40)',
                      }}
                      aria-hidden="true"
                    >
                      {isActive ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
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
