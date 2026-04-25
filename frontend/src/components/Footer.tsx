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

const SOCIAL = ['instagram', 'alternate_email', 'language', 'podcasts'];

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer
      className="grain"
      style={{ background: 'var(--navy)', color: 'var(--cream)', padding: '80px 0 0', marginTop: 80 }}
    >
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.8fr 1fr 1fr 1fr',
            gap: 48,
            paddingBottom: 64,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div>
            <Logo size={34} color="var(--cream)" />
            <p
              className="editorial"
              style={{
                fontSize: 20,
                fontWeight: 300,
                lineHeight: 1.4,
                marginTop: 22,
                maxWidth: 300,
                letterSpacing: '-0.01em',
                opacity: 0.85,
              }}
            >
              Reservar una mesa no debería sentirse como{' '}
              <span className="italic-accent">rellenar un formulario</span>.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              {SOCIAL.map((icon) => (
                <a
                  key={icon}
                  href="#"
                  aria-label={icon}
                  className="grid place-items-center transition-all"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  }}
                >
                  <span className="mat" style={{ fontSize: 16 }}>{icon}</span>
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>
                {col.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map((label) => (
                  <a
                    key={label}
                    href="#"
                    className="link-underline"
                    style={{
                      opacity: 0.75,
                      fontSize: 14,
                      color: 'var(--cream)',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: '24px 0 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, opacity: 0.4 }}>{t('footer.rights')}</span>
            <a href="#" style={{ fontSize: 12, opacity: 0.5, color: 'var(--cream)' }}>
              {t('footer.privacy')}
            </a>
            <a href="#" style={{ fontSize: 12, opacity: 0.5, color: 'var(--cream)' }}>
              {t('footer.terms')}
            </a>
            <a href="#" style={{ fontSize: 12, opacity: 0.5, color: 'var(--cream)' }}>
              {t('footer.contact')}
            </a>
          </div>
          <div className="editorial" style={{ fontSize: 12, opacity: 0.35, fontStyle: 'italic' }}>
            Hecho con <span style={{ color: 'var(--primary)', opacity: 1 }}>amor al buen comer</span>, en Madrid.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
