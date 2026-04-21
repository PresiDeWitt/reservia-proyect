import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { chatApi, type ChatMessage } from '../api/chat';

const SUGGESTIONS = [
  'Restaurante romántico esta noche',
  'Mesa para 4 en Madrid hoy',
  'Sushi de calidad cerca de mí',
  'Terraza con vistas',
];

const ChatBot: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locEnabled, setLocEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleLocation = () => {
    if (!locEnabled) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocEnabled(true);
        },
        () => setLocEnabled(false),
      );
    } else {
      setLocEnabled(false);
      setLocation(null);
    }
  };

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await chatApi.send(msg, newMessages.slice(-10), location ?? undefined);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chat.error') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Vía IA"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 200,
          width: 56, height: 56, borderRadius: '50%',
          background: open ? 'var(--navy)' : 'var(--primary)',
          border: 'none', cursor: 'pointer',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 8px 32px rgba(249,116,21,0.4)',
          color: '#fff',
          transition: 'background 0.25s',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
          {open ? 'close' : 'auto_awesome'}
        </span>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              position: 'fixed', bottom: 96, right: 28, zIndex: 199,
              width: 'min(380px, calc(100vw - 32px))',
              height: 'min(520px, calc(100vh - 120px))',
              background: '#fff',
              borderRadius: 24,
              boxShadow: '0 24px 80px rgba(15,23,42,0.18)',
              border: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: 'var(--navy)',
              display: 'flex', alignItems: 'center', gap: 12,
              flexShrink: 0,
            }} className="grain">
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--primary)',
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#fff' }}>auto_awesome</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: '"Fraunces", serif', fontSize: 16, fontWeight: 500, color: '#fff', letterSpacing: '-0.01em' }}>
                  Vía <span style={{ fontStyle: 'italic', color: 'var(--primary)' }}>IA</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{t('chat.subtitle')}</div>
              </div>
              <button
                onClick={toggleLocation}
                title={locEnabled ? t('chat.locationOn') : t('chat.locationOff')}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: locEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  color: '#fff', display: 'grid', placeItems: 'center',
                  transition: 'background 0.2s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>my_location</span>
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--ink-20)', display: 'block', marginBottom: 12 }}>auto_awesome</span>
                  <p style={{ fontFamily: '"Fraunces", serif', fontSize: 18, fontWeight: 300, color: 'var(--navy)', marginBottom: 6, letterSpacing: '-0.01em' }}>
                    {t('chat.welcome')}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--ink-40)', marginBottom: 16 }}>Cuéntame qué buscas y te recomiendo mesas.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        style={{
                          padding: '6px 12px', borderRadius: 999,
                          border: '1px solid var(--border)', background: 'var(--cream-2)',
                          fontSize: 11, fontWeight: 600, color: 'var(--navy)',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--navy)'; }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '82%', padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.role === 'user' ? 'var(--navy)' : 'var(--cream-2)',
                    color: msg.role === 'user' ? '#fff' : 'var(--navy)',
                    fontSize: 13, lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: 'var(--cream-2)', display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-40)', animation: `typingDot 1.2s ${i * 0.15}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '12px 14px',
              borderTop: '1px solid var(--border)',
              display: 'flex', gap: 8, alignItems: 'center',
              flexShrink: 0,
            }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder={t('chat.placeholder')}
                style={{
                  flex: 1, border: '1px solid var(--border)', outline: 'none',
                  borderRadius: 12, padding: '9px 14px', fontSize: 13,
                  background: 'var(--cream-2)', color: 'var(--navy)',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                style={{
                  width: 38, height: 38, borderRadius: 10, border: 'none',
                  background: input.trim() && !loading ? 'var(--primary)' : 'var(--ink-20)',
                  color: '#fff', display: 'grid', placeItems: 'center',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  flexShrink: 0, transition: 'background 0.2s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
