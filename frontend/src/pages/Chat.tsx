import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatApi, type ChatMessage } from '../api/chat';

type Convo = { id: string; name: string; lastMsg: string; time: string; unread: number; online: boolean; type: 'restaurant' | 'support' };
type Msg = { id: number; from: 'me' | 'them'; text: string; time: string };

const CONVOS: Convo[] = [
  { id: 'c1', type: 'restaurant', name: 'Osteria del Borgo', lastMsg: 'Os reservo la mesa junto a la ventana.', time: '14:22', unread: 0, online: true },
  { id: 'c2', type: 'support', name: 'ReserVia · Soporte', lastMsg: 'Un placer, ¿algo más?', time: '11:08', unread: 0, online: true },
  { id: 'c3', type: 'restaurant', name: 'Le Petit Atelier', lastMsg: 'Sí, podemos adaptar el menú sin gluten.', time: 'Ayer', unread: 2, online: false },
];

const SEED: Record<string, Msg[]> = {
  c1: [
    { id: 1, from: 'them', text: 'Hola 👋 Vi vuestra reserva para el jueves a las 21h.', time: '14:18' },
    { id: 2, from: 'me', text: '¡Hola! Somos 4. ¿Podríais ponernos mesa junto a la ventana?', time: '14:19' },
    { id: 3, from: 'them', text: 'Perfecto, os reservo la mesa junto a la ventana. Y os preparamos algo dulce. Marco, jefe de sala.', time: '14:22' },
  ],
  c2: [
    { id: 1, from: 'them', text: 'Hola, soy Luis de soporte. ¿En qué te ayudo?', time: '11:02' },
    { id: 2, from: 'me', text: 'Quería cambiar la fecha de una reserva.', time: '11:04' },
    { id: 3, from: 'them', text: 'Listo, la moví al sábado. Te llegará la confirmación. Un placer, ¿algo más?', time: '11:08' },
  ],
  c3: [
    { id: 1, from: 'them', text: 'Hemos recibido tu pregunta sobre alergias. Sí, podemos adaptar el menú sin gluten.', time: 'Ayer 19:31' },
  ],
};

const AIReplies: Record<string, string[]> = {
  c1: ['Anotado. ¡Nos vemos el jueves!', 'Podemos añadir una copa de cava de cortesía.'],
  c2: ['Un momento, lo gestiono.', 'Listo ✅ Te acabo de enviar el email.'],
  c3: ['Sin problema, tomamos nota.'],
};

const ChatPage: React.FC = () => {
  const [activeId, setActiveId] = useState('c1');
  const [messages, setMessages] = useState<Record<string, Msg[]>>(SEED);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const active = CONVOS.find(c => c.id === activeId)!;

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, activeId, typing]);

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!draft.trim()) return;
    const text = draft;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setMessages(m => ({ ...m, [activeId]: [...(m[activeId] || []), { id: Date.now(), from: 'me', text, time }] }));
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      const pool = AIReplies[activeId] || ['Recibido.'];
      const reply = pool[Math.floor(Math.random() * pool.length)];
      const t2 = new Date();
      const time2 = `${t2.getHours().toString().padStart(2, '0')}:${t2.getMinutes().toString().padStart(2, '0')}`;
      setMessages(m => ({ ...m, [activeId]: [...(m[activeId] || []), { id: Date.now() + 1, from: 'them', text: reply, time: time2 }] }));
      setTyping(false);
    }, 1200 + Math.random() * 800);
  };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', padding: '48px 24px 96px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Mensajes</div>
        <h1 className="editorial" style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 300, letterSpacing: '-0.02em', margin: '0 0 32px' }}>
          Habla con <span className="italic-accent">los tuyos</span>
        </h1>

        <div style={{
          display: 'grid', gridTemplateColumns: '320px 1fr', gap: 0,
          background: '#fff', borderRadius: 24,
          border: '1px solid var(--border)',
          overflow: 'hidden', height: 620, boxShadow: 'var(--sh-md)',
        }} className="chat-layout">

          {/* Sidebar */}
          <div style={{ borderRight: '1px solid var(--border)', background: 'var(--cream-2)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 16px 10px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: '#fff',
                border: '1px solid var(--border)', borderRadius: 12,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--ink-40)' }}>search</span>
                <input placeholder="Buscar…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, flex: 1, color: 'var(--navy)' }} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {CONVOS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  style={{
                    width: '100%', padding: '14px 16px',
                    display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left',
                    background: c.id === activeId ? '#fff' : 'transparent',
                    borderLeft: c.id === activeId ? '3px solid var(--primary)' : '3px solid transparent',
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: c.type === 'support' ? 'var(--navy)' : 'var(--primary)',
                      color: '#fff', display: 'grid', placeItems: 'center',
                      fontSize: 13, fontWeight: 700,
                    }}>
                      {c.type === 'support'
                        ? <span className="material-symbols-outlined" style={{ fontSize: 20 }}>support_agent</span>
                        : c.name.split(' ').map(x => x[0]).slice(0, 2).join('')}
                    </div>
                    {c.online && (
                      <span style={{
                        position: 'absolute', bottom: 2, right: 2,
                        width: 10, height: 10, borderRadius: '50%',
                        background: 'var(--emerald)', border: '2px solid var(--cream-2)',
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--ink-55)', flexShrink: 0 }}>{c.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-55)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMsg}</div>
                  </div>
                  {c.unread > 0 && (
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      {c.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Thread */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Thread header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: active.type === 'support' ? 'var(--navy)' : 'var(--primary)',
                color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
              }}>
                {active.type === 'support'
                  ? <span className="material-symbols-outlined" style={{ fontSize: 18 }}>support_agent</span>
                  : active.name.split(' ').map(x => x[0]).slice(0, 2).join('')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{active.name}</div>
                <div style={{ fontSize: 11, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4, color: active.online ? 'var(--emerald)' : 'var(--ink-55)' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: active.online ? 'var(--emerald)' : 'var(--ink-40)', display: 'inline-block' }} />
                  {active.online ? 'En línea' : 'Última vez hace 2h'}
                </div>
              </div>
              {[{ i: 'call' }, { i: 'videocam' }, { i: 'more_horiz' }].map(b => (
                <button key={b.i} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--ink-55)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{b.i}</span>
                </button>
              ))}
            </div>

            {/* Messages */}
            <div
              ref={bodyRef}
              style={{ flex: 1, padding: 24, overflowY: 'auto', background: 'var(--cream-2)', display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {(messages[activeId] || []).map(msg => (
                <div
                  key={msg.id}
                  style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start', gap: 8 }}
                >
                  {msg.from === 'them' && (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0, alignSelf: 'flex-end',
                      background: active.type === 'support' ? 'var(--navy)' : 'var(--primary)',
                      color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700,
                    }}>
                      {active.name[0]}
                    </div>
                  )}
                  <div style={{
                    maxWidth: '70%', padding: '10px 14px',
                    borderRadius: msg.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.from === 'me' ? 'var(--primary)' : '#fff',
                    color: msg.from === 'me' ? '#fff' : 'var(--navy)',
                    fontSize: 13, lineHeight: 1.5,
                    boxShadow: msg.from === 'them' ? 'var(--sh-sm)' : 'none',
                  }}>
                    {msg.text}
                    <div style={{ fontSize: 9, opacity: 0.55, marginTop: 4, textAlign: msg.from === 'me' ? 'right' : 'left' }}>{msg.time}</div>
                  </div>
                </div>
              ))}
              {typing && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700 }}>
                    {active.name[0]}
                  </div>
                  <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: '#fff', boxShadow: 'var(--sh-sm)', display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-40)', animation: `typingDot 1.2s ${i * 0.15}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={send}
              style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center', background: '#fff' }}
            >
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Escribe un mensaje…"
                style={{
                  flex: 1, border: '1px solid var(--border)', outline: 'none',
                  borderRadius: 12, padding: '10px 14px', fontSize: 13,
                  background: 'var(--cream-2)', color: 'var(--navy)',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                style={{
                  height: 42, padding: '0 18px', borderRadius: 12, border: 'none',
                  background: 'var(--navy)', color: '#fff',
                  fontSize: 13, fontWeight: 700, cursor: draft.trim() ? 'pointer' : 'not-allowed',
                  opacity: draft.trim() ? 1 : 0.5,
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { if (draft.trim()) (e.currentTarget as HTMLElement).style.background = 'var(--primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--navy)'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes typingDot { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-4px);opacity:1} }
        @media (max-width: 700px) { .chat-layout { grid-template-columns: 1fr !important; height: auto !important; } }
      `}</style>
    </div>
  );
};

export default ChatPage;
