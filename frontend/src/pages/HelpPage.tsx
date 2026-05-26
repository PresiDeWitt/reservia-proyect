import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const HelpPage: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);

  // Use i18n array — works for any language added in the future
  const faqs = (t('help.faq', { returnObjects: true }) as { q: string; a: string }[]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', paddingTop: 88 }}>
      <div className="container" style={{ maxWidth: 720, paddingTop: 48, paddingBottom: 80 }}>

        {/* Back */}
        <Link to="/" className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--ink-55)', marginBottom: 32 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          {t('confirmation.backHome')}
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <span className="eyebrow">{t('profile.help')}</span>
          <h1 className="editorial" style={{ fontSize: 36, fontWeight: 400, marginTop: 8 }}>
            {t('help.titlePre')} <em className="italic-accent">{t('help.titleAccent')}</em>{t('help.titlePost')}
          </h1>
        </div>

        {/* Contact card */}
        <div style={{
          background: 'var(--background-light)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '24px 28px',
          marginBottom: 40,
          display: 'flex',
          gap: 20,
          alignItems: 'flex-start',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--primary)', marginTop: 2 }}>mail</span>
          <div>
            <div className="font-semibold" style={{ marginBottom: 4 }}>
              {t('help.contact.title')}
            </div>
            <p style={{ color: 'var(--ink-55)', fontSize: 14, marginBottom: 10 }}>
              {t('help.contact.desc')}
            </p>
            <a
              href="mailto:support@reservia.app"
              className="btn btn-primary"
              style={{ fontSize: 13, padding: '8px 18px' }}
            >
              support@reservia.app
            </a>
          </div>
        </div>

        {/* FAQ */}
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
          {t('help.faqTitle')}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((item, i) => (
            <div
              key={i}
              style={{
                background: 'var(--background-light)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 text-left font-medium"
                style={{ padding: '16px 20px', fontSize: 15 }}
              >
                {item.q}
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 20,
                    color: 'var(--ink-55)',
                    transform: open === i ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }}
                >
                  expand_more
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={{ padding: '0 20px 16px', color: 'var(--ink-55)', fontSize: 14, lineHeight: 1.6 }}>
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
