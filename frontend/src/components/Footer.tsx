import React from 'react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';

const COLUMNS = [
  {
    title: 'Comensales',
    links: ['Explorar restaurantes', 'Mapa de mesas', 'Experiencias', 'App móvil', 'Tarjetas regalo'],
  },
  {
    title: 'Restauradores',
    links: ['Únete a ReserVia', 'Panel de gestión', 'POS integrado', 'Casos de éxito', 'Precios'],
  },
  { title: 'Compañía', links: ['Sobre nosotros', 'Editorial', 'Prensa', 'Carreras', 'Contacto'] },
];

const SOCIAL: { label: string; path: string }[] = [
  {
    label: 'Instagram',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  {
    label: 'X / Twitter',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'Podcast',
    path: 'M12 3a9 9 0 1 0 9 9A9 9 0 0 0 12 3zm0 16a7 7 0 1 1 7-7 7 7 0 0 1-7 7zm1-11h-2v5h2zm0 6h-2v2h2z',
  },
];

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer style={{ background: 'var(--navy)', color: 'var(--cream)', marginTop: 80 }}>
      {/* Top accent line */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(249,116,21,0.5), transparent)' }} />

      <div className="container" style={{ padding: '72px 24px 0' }}>
        {/* Main grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '48px 40px',
            paddingBottom: 56,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Brand column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Logo size={38} />

            <p
              className="editorial"
              style={{
                fontSize: 18,
                fontWeight: 300,
                lineHeight: 1.55,
                maxWidth: 280,
                letterSpacing: '-0.01em',
                color: 'rgba(248,247,245,0.82)',
              }}
            >
              Reservar una mesa no debería sentirse como{' '}
              <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>rellenar un formulario</em>.
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: 8 }}>
              {SOCIAL.map(({ label, path }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'rgba(255,255,255,0.7)',
                    transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: 20,
                }}
              >
                {col.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                {col.links.map((label) => (
                  <a
                    key={label}
                    href="#"
                    className="link-underline"
                    style={{
                      fontSize: 14,
                      color: 'rgba(248,247,245,0.72)',
                      textDecoration: 'none',
                      lineHeight: 1.4,
                    }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            padding: '20px 0 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{t('footer.rights')}</span>
            <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />
            {[t('footer.privacy'), t('footer.terms'), t('footer.contact')].map((label) => (
              <a
                key={label}
                href="#"
                className="link-underline"
                style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
              >
                {label}
              </a>
            ))}
          </div>

          <p className="editorial" style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', margin: 0 }}>
            Hecho con{' '}
            <span style={{ color: 'var(--primary)' }}>amor al buen comer</span>
            , en Granada.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
