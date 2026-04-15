import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type LangCode = 'es' | 'en';

interface LangDef {
  code: LangCode;
  label: string;
  native: string;
  flag: React.ReactNode;
}

const FlagES = (
  <svg
    viewBox="0 0 3 2"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full"
    aria-hidden="true"
  >
    <rect width="3" height="2" fill="#aa151b" />
    <rect y="0.5" width="3" height="1" fill="#f1bf00" />
  </svg>
);

const FlagGB = (
  <svg
    viewBox="0 0 60 30"
    preserveAspectRatio="xMidYMid slice"
    className="w-full h-full"
    aria-hidden="true"
  >
    <clipPath id="lm-uk-t">
      <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
    </clipPath>
    <rect width="60" height="30" fill="#012169" />
    <path d="M0 0L60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
    <path
      d="M0 0L60 30M60 0L0 30"
      stroke="#c8102e"
      strokeWidth="4"
      clipPath="url(#lm-uk-t)"
    />
    <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
    <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6" />
  </svg>
);

const LANGS: LangDef[] = [
  { code: 'es', label: 'Spanish', native: 'Español', flag: FlagES },
  { code: 'en', label: 'English', native: 'English', flag: FlagGB },
];

const LanguageMenu: React.FC = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const current = ((i18n.language || 'es').split('-')[0] as LangCode);
  const active = LANGS.find((l) => l.code === current) ?? LANGS[0];

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
        aria-label={`Idioma actual: ${active.native}`}
        className="group flex items-center gap-2 h-11 pl-1.5 pr-3 rounded-full bg-slate-800/50 border border-slate-700 hover:border-primary/60 hover:bg-slate-800 transition-all"
      >
        <span className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-slate-900/50 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.6)]">
          {active.flag}
        </span>
        <span className="text-[11px] font-black tracking-[0.15em] uppercase text-white">
          {active.code}
        </span>
        <span
          className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${
            open ? 'rotate-180 text-primary' : 'group-hover:text-primary'
          }`}
          style={{ fontSize: 18 }}
          aria-hidden="true"
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
            className="absolute right-0 top-[calc(100%+10px)] w-[220px] origin-top-right bg-background-light rounded-2xl shadow-[0_30px_80px_-20px_rgba(15,23,42,0.5)] ring-1 ring-navy/10 overflow-hidden p-2"
            style={{ transformOrigin: 'top right' }}
          >
            <li className="px-3 pt-1 pb-2 text-[10px] tracking-[0.25em] uppercase text-navy/45 font-bold">
              Idioma · Language
            </li>
            {LANGS.map((lang) => {
              const isActive = lang.code === current;
              return (
                <li key={lang.code} role="option" aria-selected={isActive}>
                  <button
                    onClick={() => choose(lang.code)}
                    className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      isActive ? 'bg-primary/10' : 'hover:bg-navy/5'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-navy/10 shrink-0">
                      {lang.flag}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-sm font-bold leading-tight ${isActive ? 'text-primary' : 'text-navy'}`}>
                        {lang.native}
                      </span>
                      <span className="block text-[11px] text-navy/50">{lang.label}</span>
                    </span>
                    {isActive ? (
                      <span
                        className="material-symbols-outlined text-primary"
                        style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
                        aria-hidden="true"
                      >
                        check_circle
                      </span>
                    ) : (
                      <span
                        className="material-symbols-outlined text-navy/20 group-hover:text-navy/40 transition-colors"
                        style={{ fontSize: 18 }}
                        aria-hidden="true"
                      >
                        radio_button_unchecked
                      </span>
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
