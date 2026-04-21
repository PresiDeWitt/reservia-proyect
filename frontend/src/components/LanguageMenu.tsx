import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'en', label: 'EN', name: 'English' },
];

const LanguageMenu: React.FC = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find(l => l.code === i18n.language) || LANGS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) setTimeout(() => document.addEventListener('click', handler));
    return () => document.removeEventListener('click', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ height: 36, padding: '0 12px', borderRadius: 'var(--r-pill)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: 4 }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>language</span>
        {current.label}
      </button>

      {open && (
        <div className="scale-in" style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--surface-3)', color: 'var(--ink)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', boxShadow: 'var(--sh-lg)', zIndex: 200, overflow: 'hidden', minWidth: 130 }}>
          {LANGS.map(lang => (
            <button
              key={lang.code}
              onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', fontSize: 13, fontWeight: lang.code === i18n.language ? 700 : 500, color: lang.code === i18n.language ? 'var(--primary)' : 'var(--ink)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-5)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontWeight: 700, fontSize: 11, width: 24 }}>{lang.label}</span>
              {lang.name}
              {lang.code === i18n.language && <span className="material-symbols-outlined" style={{ fontSize: 14, marginLeft: 'auto', color: 'var(--primary)' }}>check</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageMenu;
