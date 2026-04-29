import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/images/reservia_hero_dining_1769099684622.png';
import italianImg from '../assets/images/cuisine_italian_pasta_1769099701383.png';
import sushiImg from '../assets/images/cuisine_sushi_platter_1769099717268.png';
import steakImg from '../assets/images/cuisine_steak_grilled_1769099732584.png';
import mexicanImg from '../assets/images/cuisine_mexican_tacos_1769099775852.png';
import burgerImg from '../assets/images/cuisine_burger_gourmet_1769099791338.png';
import healthyImg from '../assets/images/cuisine_healthy_salad_1769099807481.png';
import bakeryImg from '../assets/images/cuisine_bakery_bread_1769099834160.png';
import asianImg from '../assets/images/cuisine_asian_noodles_dimsum_1769099849081.png';

const PLATE_POOL = [italianImg, sushiImg, steakImg, mexicanImg, burgerImg, healthyImg, bakeryImg, asianImg];

interface TypewriterLine {
  text: string;
  italic?: boolean;
  small?: boolean;
}

const useTypewriter = (lines: TypewriterLine[], speed = 55, replayKey = 0) => {
  const [typed, setTyped] = useState<string[]>(() => lines.map(() => ''));
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    setTyped(lines.map(() => ''));
    setActiveIdx(0);

    let cancelled = false;
    let lineIdx = 0;
    let charIdx = 0;
    let timer: number | undefined;

    const writeChar = () => {
      if (cancelled) return;
      const line = lines[lineIdx];
      if (!line) return;

      if (charIdx < line.text.length) {
        const nextSlice = line.text.slice(0, charIdx + 1);
        setTyped((prev) => {
          const next = [...prev];
          next[lineIdx] = nextSlice;
          return next;
        });
        charIdx += 1;
        timer = window.setTimeout(writeChar, line.small ? 40 : speed);
        return;
      }

      setTyped((prev) => {
        const next = [...prev];
        next[lineIdx] = line.text;
        return next;
      });
      lineIdx += 1;
      charIdx = 0;
      setActiveIdx(lineIdx);
      if (lineIdx < lines.length) {
        timer = window.setTimeout(writeChar, 320);
      }
    };

    timer = window.setTimeout(writeChar, 250);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayKey]);

  return { typed, activeIdx };
};

const Hero: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [tonight, setTonight] = useState(284);
  const [tab, setTab] = useState<'reservar' | 'pedir' | 'evento'>('reservar');
  const [query, setQuery] = useState('');
  const [day, setDay] = useState('hoy');
  const [time, setTime] = useState('21:00');
  const [people, setPeople] = useState('2');
  const [replayKey, setReplayKey] = useState(0);
  const [plateOffset, setPlateOffset] = useState(0);

  const lines: TypewriterLine[] = [
    { text: 'La mesa que' },
    { text: 'recordarás', italic: true },
    { text: 'no la que reservaste.', small: true },
  ];
  const { typed, activeIdx } = useTypewriter(lines, 55, replayKey);

  // Replay typewriter when hero re-enters viewport (scroll back to top)
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setReplayKey((k) => k + 1); },
      { threshold: 0.4 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Cycle plate images every 2.5s
  useEffect(() => {
    const id = window.setInterval(() => {
      setPlateOffset((o) => (o + 1) % PLATE_POOL.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTonight((t) => t + Math.floor(Math.random() * 3 - 1));
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMouse({ x, y });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    navigate(`/?${params.toString()}`);
    document.getElementById('restaurant-list')?.scrollIntoView({ behavior: 'smooth' });
  };

  const caret = (show: boolean) =>
    show ? (
      <span
        style={{
          display: 'inline-block',
          width: '0.05em',
          height: '0.85em',
          background: 'var(--primary)',
          marginLeft: 4,
          verticalAlign: '-0.08em',
          animation: 'caret-blink 0.9s steps(1) infinite',
        }}
      />
    ) : null;

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      style={{
        position: 'relative',
        minHeight: '100vh',
        marginTop: '-240px',
        paddingTop: 240,
        background: 'var(--espresso)',
        color: 'var(--cream)',
        overflow: 'hidden',
      }}
    >
      {/* Background image with parallax */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img
          src={heroImg}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(1.1) translate(${mouse.x * -18}px, ${mouse.y * -12}px)`,
            transition: 'transform 0.6s cubic-bezier(0.2,0.8,0.2,1)',
            filter: 'brightness(0.48) saturate(1.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(35,23,15,0.4) 0%, rgba(35,23,15,0.2) 40%, rgba(35,23,15,0.85) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 20% 80%, rgba(249,116,21,0.22) 0%, transparent 55%)',
          }}
        />
      </div>

      {/* Grain overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          opacity: 0.25,
          pointerEvents: 'none',
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\")",
        }}
      />

      {/* Orbiting plates */}
      <div
        className="hide-sm"
        style={{
          position: 'absolute',
          top: '50%',
          right: '-10%',
          width: 700,
          height: 700,
          zIndex: 2,
          pointerEvents: 'none',
          transform: `translateY(-50%) translate(${mouse.x * 20}px, ${mouse.y * 14}px)`,
          transition: 'transform 0.5s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '1px dashed rgba(255,255,255,0.12)',
            borderRadius: '50%',
            animation: 'spin 60s linear infinite',
          }}
        >
          {[0, 120, 240].map((deg, i) => {
            const src = PLATE_POOL[(plateOffset + i) % PLATE_POOL.length];
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${deg}deg) translateX(340px)`,
                  animation: 'drift 6s ease-in-out infinite',
                  animationDelay: `${i * 1.2}s`,
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.2)',
                    backgroundImage: `url(${src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)',
                    transform: `rotate(-${deg}deg)`,
                    transition: 'background-image 0.6s ease',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ position: 'relative', zIndex: 3, paddingTop: 100, paddingBottom: 120 }}>
        <div className="rise-stagger" style={{ maxWidth: 860 }}>
          <div
            className="eyebrow"
            style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 10 }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--primary)',
                animation: 'pulse-glow 2s ease-out infinite',
              }}
            />
            <span>{tonight} mesas disponibles · esta noche · Granada</span>
          </div>

          <h1
            className="editorial"
            style={{
              fontSize: 'clamp(54px, 9vw, 128px)',
              fontWeight: 300,
              lineHeight: 0.92,
              letterSpacing: '-0.035em',
              marginTop: 20,
              minHeight: '2.8em',
            }}
          >
            <span style={{ display: 'block' }}>
              {typed[0]}
              {caret(activeIdx === 0)}
            </span>
            <span
              className="italic-accent"
              style={{ fontWeight: 300, display: 'block', minHeight: '0.95em' }}
            >
              {typed[1]}
              {caret(activeIdx === 1)}
            </span>
            <span
              style={{
                opacity: 0.6,
                fontSize: '0.6em',
                display: 'block',
                minHeight: '1.1em',
                marginTop: 8,
              }}
            >
              {typed[2]}
              {caret(activeIdx === 2)}
            </span>
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.5, maxWidth: 540, marginTop: 32, opacity: 0.8 }}>
            Cocinas independientes, chefs con alma, barrios con historia. Reserva en dos toques y llega
            directamente a la sobremesa.
          </p>

          {/* Search card */}
          <div
            className="card"
            style={{
              marginTop: 40,
              padding: 24,
              maxWidth: 860,
              background: 'var(--cream)',
              color: 'var(--ink)',
              boxShadow: 'var(--sh-lg)',
              borderRadius: 'var(--r-xl)',
            }}
          >
            <div style={{ display: 'flex', gap: 4, marginBottom: 18, flexWrap: 'wrap' }}>
              {[
                { k: 'reservar' as const, l: 'Reservar mesa', i: 'restaurant' },
                { k: 'pedir' as const, l: 'Pedir para recoger', i: 'takeout_dining' },
                { k: 'evento' as const, l: 'Evento privado', i: 'celebration' },
              ].map((tabItem) => (
                <button
                  key={tabItem.k}
                  type="button"
                  onClick={() => setTab(tabItem.k)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 'var(--r-pill)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: tab === tabItem.k ? 'var(--primary)' : 'var(--ink-55)',
                    background: tab === tabItem.k ? 'var(--primary-glow)' : 'transparent',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <span className="mat" style={{ fontSize: 16 }}>
                    {tabItem.i}
                  </span>
                  {tabItem.l}
                </button>
              ))}
            </div>

            <form
              onSubmit={submit}
              className="hero-form-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                gap: 8,
                alignItems: 'stretch',
              }}
            >
              <div style={{ position: 'relative' }}>
                <div className="eyebrow" style={{ marginBottom: 6 }}>
                  Cocina o ambiente
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    background: 'var(--ink-5)',
                    borderRadius: 'var(--r-md)',
                  }}
                >
                  <span className="mat" style={{ fontSize: 18, color: 'var(--primary)' }}>
                    search
                  </span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="italiano, romántico, terraza…"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      flex: 1,
                      fontFamily: 'var(--font-editorial)',
                      fontSize: 17,
                      fontStyle: 'italic',
                      color: 'var(--ink)',
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>
                  Día
                </div>
                <select
                  className="input"
                  style={{ background: 'var(--ink-5)', border: 'none' }}
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                >
                  <option value="hoy">Hoy</option>
                  <option value="manana">Mañana</option>
                  <option value="viernes">Viernes</option>
                  <option value="sabado">Sábado</option>
                </select>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>
                  Hora
                </div>
                <select
                  className="input"
                  style={{ background: 'var(--ink-5)', border: 'none' }}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                >
                  <option>13:30</option>
                  <option>14:00</option>
                  <option>20:30</option>
                  <option>21:00</option>
                  <option>21:30</option>
                  <option>22:00</option>
                </select>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>
                  Mesa
                </div>
                <select
                  className="input"
                  style={{ background: 'var(--ink-5)', border: 'none' }}
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} pers.
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ height: 48, padding: '0 24px' }}>
                  <span>{t('hero.search')}</span>
                  <span className="mat" style={{ fontSize: 16, position: 'relative', zIndex: 1 }}>
                    arrow_forward
                  </span>
                </button>
              </div>
            </form>

            <div
              style={{
                marginTop: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 12,
                color: 'var(--ink-55)',
                flexWrap: 'wrap',
              }}
            >
              <span className="mat" style={{ fontSize: 14, color: 'var(--primary)' }}>
                auto_awesome
              </span>
              <span>
                IA:
                <span className="italic-accent editorial" style={{ fontStyle: 'italic', margin: '0 4px' }}>
                  "cena tranquila para una primera cita"
                </span>
                o
                <span className="italic-accent editorial" style={{ fontStyle: 'italic', margin: '0 4px' }}>
                  "algo para celebrar un aniversario"
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <button
        onClick={() => document.getElementById('restaurant-list')?.scrollIntoView({ behavior: 'smooth' })}
        className="hide-sm"
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          animation: 'drift 2.5s ease-in-out infinite',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          color: 'var(--cream)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span className="eyebrow" style={{ color: 'var(--cream)', opacity: 0.6 }}>
          Sigue explorando
        </span>
        <span className="mat" style={{ fontSize: 24, opacity: 0.8 }}>
          expand_more
        </span>
      </button>

      <style>{`
        @media (max-width: 900px) {
          .hero-form-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-form-grid > div:first-child { grid-column: 1 / -1; }
          .hero-form-grid > div:last-child { grid-column: 1 / -1; }
        }
        @media (max-width: 600px) {
          .hero-form-grid { grid-template-columns: 1fr !important; }
          .hero-form-grid > div:first-child,
          .hero-form-grid > div:last-child { grid-column: auto; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
