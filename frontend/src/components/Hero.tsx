import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/images/reservia_hero_dining_1769099684622.png';

const HeroHeadline: React.FC = () => {
  const lines = ['La mesa que', 'recordarás'];
  const tail = '— no la que reservaste.';
  const [t1, setT1] = useState('');
  const [t2, setT2] = useState('');
  const [t3, setT3] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let id: ReturnType<typeof setInterval>;
    const type = (text: string, setter: (s: string) => void, next: () => void, speed = 55) => {
      i = 0;
      id = setInterval(() => {
        i++;
        setter(text.slice(0, i));
        if (i >= text.length) { clearInterval(id); setTimeout(next, 280); }
      }, speed);
    };
    type(lines[0], setT1, () =>
      type(lines[1], setT2, () =>
        type(tail, setT3, () => setDone(true), 40), 65));
    return () => clearInterval(id);
  }, []);

  const caret = (show: boolean) => show && (
    <span style={{ display: 'inline-block', width: '0.05em', height: '0.8em', background: 'var(--primary)', marginLeft: 4, verticalAlign: '-0.05em', animation: 'caret-blink 0.9s steps(1) infinite' }} />
  );

  return (
    <h1 className="editorial" style={{ fontSize: 'clamp(52px, 8vw, 120px)', fontWeight: 300, lineHeight: 0.93, letterSpacing: '-0.035em', marginTop: 20, minHeight: '2.8em' }}>
      <span style={{ display: 'block' }}>{t1}{caret(t1.length < lines[0].length)}</span>
      <span className="italic-accent" style={{ fontWeight: 300, display: 'block', minHeight: '0.95em' }}>
        {t2}{caret(t1.length >= lines[0].length && t2.length < lines[1].length)}
      </span>
      <span style={{ opacity: 0.6, fontSize: '0.58em', display: 'block', minHeight: '1.1em', marginTop: 10 }}>
        {t3}{caret(!done && t2.length >= lines[1].length)}
      </span>
    </h1>
  );
};

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [tonight, setTonight] = useState(284);
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('hoy');
  const [time, setTime] = useState('21:00');
  const [guests, setGuests] = useState('2');

  useEffect(() => {
    const id = setInterval(() => setTonight(t => t + Math.floor(Math.random() * 3 - 1)), 3500);
    return () => clearInterval(id);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: (e.clientX - r.left - r.width / 2) / r.width,
      y: (e.clientY - r.top - r.height / 2) / r.height,
    });
  };

  return (
    <section
      onMouseMove={onMove}
      style={{ position: 'relative', minHeight: '100vh', marginTop: '-64px', paddingTop: 64, background: 'var(--espresso)', color: 'var(--cream)', overflow: 'hidden' }}
    >
      {/* Background image with parallax */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img
          src={heroImg}
          alt=""
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(1.1) translate(${mouse.x * -18}px, ${mouse.y * -12}px)`,
            transition: 'transform 0.6s cubic-bezier(0.2,0.8,0.2,1)',
            filter: 'brightness(0.45) saturate(1.1)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(35,23,15,0.4) 0%, rgba(35,23,15,0.15) 40%, rgba(35,23,15,0.9) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 80%, rgba(249,116,21,0.22) 0%, transparent 55%)' }} />
      </div>

      {/* Grain */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0.2, pointerEvents: 'none', backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\")" }} />

      {/* Orbiting circles (decorative) */}
      <div
        className="hide-sm"
        style={{
          position: 'absolute', top: '50%', right: '-8%', width: 600, height: 600, zIndex: 2, pointerEvents: 'none',
          transform: `translateY(-50%) translate(${mouse.x * 20}px, ${mouse.y * 14}px)`,
          transition: 'transform 0.5s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '50%', animation: 'spin 60s linear infinite' }}>
          {[0, 120, 240].map((deg, i) => (
            <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', transform: `rotate(${deg}deg) translateX(290px)`, animationDelay: `${i * 1.2}s` }} className="drift">
              <div style={{ width: 100, height: 100, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', background: `rgba(249,116,21,${0.05 + i * 0.03})`, boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)', transform: `rotate(-${deg}deg)` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ position: 'relative', zIndex: 3, paddingTop: 100, paddingBottom: 120 }}>
        <div style={{ maxWidth: 900 }} className="rise-stagger">
          {/* Live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--emerald)', animation: 'pulse-glow 2s ease-out infinite' }} />
            <span className="eyebrow" style={{ color: 'rgba(249,116,21,0.9)', letterSpacing: '0.25em' }}>
              {tonight} mesas disponibles · esta noche · Madrid
            </span>
          </div>

          <HeroHeadline />

          <p style={{ fontSize: 18, lineHeight: 1.5, maxWidth: 540, marginTop: 32, opacity: 0.8 }}>
            Cocinas independientes, chefs con alma, barrios con historia.
            Reserva en dos toques y llega directamente a la sobremesa.
          </p>

          {/* Reserve card */}
          <div className="card" style={{ marginTop: 40, padding: 24, maxWidth: 880, background: 'var(--cream)', color: 'var(--ink)', boxShadow: 'var(--sh-lg)', borderRadius: 'var(--r-xl)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'flex-end' }} className="hero-grid">
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Cocina o ambiente</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--ink-5)', borderRadius: 'var(--r-md)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary)' }}>search</span>
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') navigate(`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`); }}
                    placeholder="italiano, romántico, terraza…"
                    style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontFamily: '"Fraunces", serif', fontSize: 16, fontStyle: 'italic', color: 'var(--ink)' }}
                  />
                </div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Día</div>
                <select value={date} onChange={e => setDate(e.target.value)} className="input" style={{ background: 'var(--ink-5)', border: 'none' }}>
                  <option value="hoy">Hoy</option>
                  <option>Mañana</option>
                  <option>Viernes</option>
                  <option>Sábado</option>
                </select>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Hora</div>
                <select value={time} onChange={e => setTime(e.target.value)} className="input" style={{ background: 'var(--ink-5)', border: 'none' }}>
                  {['13:30', '14:00', '20:30', '21:00', '21:30', '22:00'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Mesa</div>
                <select value={guests} onChange={e => setGuests(e.target.value)} className="input" style={{ background: 'var(--ink-5)', border: 'none' }}>
                  {[1, 2, 3, 4, 5, 6, 8].map(n => <option key={n} value={n}>{n} pers.</option>)}
                </select>
              </div>
              <div>
                <button
                  onClick={() => navigate(`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`)}
                  className="btn btn-primary"
                  style={{ height: 48, padding: '0 22px' }}
                >
                  <span>Encontrar</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, position: 'relative', zIndex: 1 }}>arrow_forward</span>
                </button>
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--ink-55)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--primary)' }}>auto_awesome</span>
              <span>IA: <em style={{ color: 'var(--primary)', fontFamily: '"Fraunces", serif' }}>"cena tranquila para una primera cita"</em> o <em style={{ color: 'var(--primary)', fontFamily: '"Fraunces", serif' }}>"algo para celebrar un aniversario"</em></span>
            </div>
          </div>

          {/* Trust strip */}
          <div style={{ marginTop: 48, display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', opacity: 0.65 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 700 }}>Elegido por</div>
            {['El País · Gastro', 'Vogue', 'Condé Nast', 'Time Out'].map(n => (
              <div key={n} className="editorial" style={{ fontSize: 17, fontStyle: 'italic', fontWeight: 300 }}>{n}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }} className="drift hide-sm">
        <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.55)' }}>Sigue explorando</div>
        <span className="material-symbols-outlined" style={{ opacity: 0.7, fontSize: 24 }}>expand_more</span>
      </div>

      <style>{`
        @media (max-width: 900px) { .hero-grid { grid-template-columns: 1fr !important; } }
        @keyframes caret-blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 0 0 rgba(249,116,21,0.4)} 50%{box-shadow:0 0 0 10px transparent} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
};

export default Hero;
