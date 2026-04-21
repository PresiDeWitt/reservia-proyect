import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import heroImg from '../assets/images/reservia_hero_dining_1769099684622.png';

const HeroTypewriter: React.FC = () => {
  const lines = ['La mesa que', 'recordarás.'];
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const typePhase = (text: string, setter: (s: string) => void, speed: number, next: () => void) => {
      i = 0;
      const id = setInterval(() => {
        i++;
        setter(text.slice(0, i));
        if (i >= text.length) { clearInterval(id); timeout = setTimeout(next, 200); }
      }, speed);
    };
    typePhase(lines[0], setText1, 60, () => {
      setPhase(1);
      typePhase(lines[1], setText2, 65, () => setPhase(2));
    });
    return () => clearTimeout(timeout);
  }, []);

  const caret = (show: boolean) =>
    show ? (
      <span style={{
        display: 'inline-block', width: '0.05em', height: '0.85em',
        background: 'var(--primary)', marginLeft: 4, verticalAlign: '-0.08em',
        animation: 'caret-blink 0.9s steps(1) infinite',
      }} />
    ) : null;

  return (
    <h1
      className="editorial"
      style={{
        fontSize: 'clamp(52px, 9vw, 120px)',
        fontWeight: 300, lineHeight: 0.9, letterSpacing: '-0.035em',
        marginTop: 16, color: '#fff',
      }}
    >
      <span style={{ display: 'block' }}>
        {text1}{caret(phase === 0)}
      </span>
      <span className="italic-accent" style={{ display: 'block', minHeight: '1em' }}>
        {text2}{caret(phase === 1)}
      </span>
    </h1>
  );
};

const Hero: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('reservar');
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [tonight] = useState(284);
  const sectionRef = useRef<HTMLElement>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    const r = sectionRef.current?.getBoundingClientRect();
    if (!r) return;
    setMouse({
      x: (e.clientX - r.left - r.width / 2) / r.width,
      y: (e.clientY - r.top - r.height / 2) / r.height,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    navigate(`/?${params.toString()}`);
    setTimeout(() => document.getElementById('restaurant-list')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      style={{
        position: 'relative', minHeight: '100vh',
        marginTop: '-68px', paddingTop: 68,
        background: '#23170f', color: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Background image with parallax */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img
          src={heroImg}
          alt=""
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(1.08) translate(${mouse.x * -18}px, ${mouse.y * -12}px)`,
            transition: 'transform 0.6s cubic-bezier(0.2,0.8,0.2,1)',
            filter: 'brightness(0.46) saturate(1.1)',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(35,23,15,0.45) 0%, rgba(35,23,15,0.2) 40%, rgba(35,23,15,0.9) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 80%, rgba(249,116,21,0.2) 0%, transparent 55%)',
        }} />
      </div>

      {/* Grain */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, opacity: 0.22, pointerEvents: 'none',
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\")",
      }} />

      {/* Content */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 3, paddingTop: 100, paddingBottom: 120 }}>
        <div style={{ maxWidth: 860 }} className="rise-stagger">
          {/* Live badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--primary)', opacity: 0,
          }}>
            <span style={{
              display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
              background: 'var(--primary)',
              animation: 'pulse-ring 2s ease-out infinite',
            }} />
            {tonight} mesas disponibles · esta noche · Madrid
          </div>

          {/* Headline typewriter */}
          <HeroTypewriter />

          <p style={{
            fontSize: 18, lineHeight: 1.55, maxWidth: 520,
            marginTop: 28, opacity: 0.8, color: '#fff',
          }}>
            Cocinas independientes, chefs con alma, barrios con historia.
            Reserva en dos toques — llega directamente a la sobremesa.
          </p>

          {/* Big booking card */}
          <div style={{
            marginTop: 40, padding: 24, maxWidth: 860,
            background: '#fff', color: 'var(--navy)',
            boxShadow: 'var(--sh-lg)',
            borderRadius: 28,
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
              {[
                { k: 'reservar', l: 'Reservar mesa', i: 'restaurant' },
                { k: 'pedir', l: 'Pedir para llevar', i: 'takeout_dining' },
              ].map(t2 => (
                <button
                  key={t2.k}
                  onClick={() => setTab(t2.k)}
                  style={{
                    padding: '10px 18px', borderRadius: 999,
                    fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                    color: tab === t2.k ? 'var(--primary)' : 'var(--ink-55)',
                    background: tab === t2.k ? 'var(--primary-glow)' : 'transparent',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    transition: 'all 0.2s',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{t2.i}</span>
                  {t2.l}
                </button>
              ))}
            </div>

            {/* Form grid */}
            <form
              onSubmit={handleSearch}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                gap: 10, alignItems: 'end',
              }}
              className="hero-form"
            >
              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Cocina o ambiente</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px',
                  background: 'var(--ink-5)', borderRadius: 14,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)', flexShrink: 0 }}>search</span>
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={`${t('hero.searchPlaceholder')}`}
                    style={{
                      border: 'none', background: 'transparent', outline: 'none', flex: 1,
                      fontFamily: '"Fraunces", serif', fontSize: 17, fontStyle: 'italic',
                      color: 'var(--navy)',
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Día</div>
                <select style={{
                  width: '100%', height: 48, padding: '0 12px',
                  borderRadius: 14, border: 'none',
                  background: 'var(--ink-5)',
                  fontSize: 14, fontFamily: 'inherit', color: 'var(--navy)',
                  cursor: 'pointer', outline: 'none',
                }}>
                  <option>Hoy</option>
                  <option>Mañana</option>
                  <option>Viernes</option>
                  <option>Sábado</option>
                </select>
              </div>

              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Hora</div>
                <select style={{
                  width: '100%', height: 48, padding: '0 12px',
                  borderRadius: 14, border: 'none',
                  background: 'var(--ink-5)',
                  fontSize: 14, fontFamily: 'inherit', color: 'var(--navy)',
                  cursor: 'pointer', outline: 'none',
                }}>
                  <option>21:00</option>
                  <option>21:30</option>
                  <option>20:30</option>
                  <option>14:00</option>
                </select>
              </div>

              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Personas</div>
                <select style={{
                  width: '100%', height: 48, padding: '0 12px',
                  borderRadius: 14, border: 'none',
                  background: 'var(--ink-5)',
                  fontSize: 14, fontFamily: 'inherit', color: 'var(--navy)',
                  cursor: 'pointer', outline: 'none',
                }}>
                  {[1, 2, 3, 4, 5, 6, 8].map(n => <option key={n}>{n} pers.</option>)}
                </select>
              </div>

              <button
                type="submit"
                style={{
                  height: 48, padding: '0 24px',
                  borderRadius: 14, border: 'none',
                  background: 'var(--navy)', color: '#fff',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--navy)')}
              >
                <span>Encontrar mesa</span>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </button>
            </form>

            <div style={{
              marginTop: 16, display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 12, color: 'var(--ink-55)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--primary)' }}>auto_awesome</span>
              <span>
                IA:&nbsp;
                <em className="editorial italic-accent" style={{ fontStyle: 'italic' }}>"cena romántica para una primera cita"</em>
                &nbsp;·&nbsp;
                <em className="editorial italic-accent" style={{ fontStyle: 'italic' }}>"algo para celebrar un aniversario"</em>
              </span>
            </div>
          </div>

          {/* Trust strip */}
          <div style={{
            marginTop: 48, display: 'flex', flexWrap: 'wrap',
            gap: 32, alignItems: 'center', opacity: 0.7,
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Elegido por</div>
            {['El País · Gastro', 'Vogue', 'Condé Nast', 'Time Out', 'Esquire'].map(n => (
              <div key={n} className="editorial" style={{ fontSize: 18, fontStyle: 'italic', fontWeight: 300 }}>{n}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        animation: 'drift-anim 2.5s ease-in-out infinite',
      }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
          Sigue explorando
        </div>
        <span className="material-symbols-outlined" style={{ opacity: 0.7, color: '#fff' }}>expand_more</span>
      </div>

      <style>{`
        .hero-form { }
        @media (max-width: 860px) {
          .hero-form { grid-template-columns: 1fr !important; }
        }
        @keyframes caret-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
