import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { chatApi, type ChatMessage } from '../api/chat';
import { useAuth } from '../context/AuthContext';
import { reservationsApi } from '../api/reservations';

const ChatBot: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locEnabled, setLocEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // States for verification booking cards
  const [confirmedDrafts, setConfirmedDrafts] = useState<Record<number, { code: string; date: string; time: string; guests: number; restaurantName: string }>>({});
  const [loadingDrafts, setLoadingDrafts] = useState<Record<number, boolean>>({});
  const [cancelledDrafts, setCancelledDrafts] = useState<Record<number, boolean>>({});

  const parseMessage = (content: string) => {
    const match = content.match(/\[RESERVATION_DRAFT:(\{.*?\})\]/);
    if (match) {
      try {
        const draft = JSON.parse(match[1]);
        const text = content.replace(match[0], '').trim();
        return { text, draft };
      } catch {
        // Ignorar si el JSON no es válido
      }
    }
    return { text: content, draft: null };
  };

  const handleConfirmReservation = async (
    index: number,
    draft: {
      restaurant_id: number | string;
      restaurant_name: string;
      date: string;
      time: string;
      guests: number;
    }
  ) => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('reservia:open-auth', { detail: { mode: 'login' } }));
      return;
    }
    
    setLoadingDrafts((prev) => ({ ...prev, [index]: true }));
    try {
      const res = await reservationsApi.create({
        restaurantId: parseInt(draft.restaurant_id.toString(), 10),
        date: draft.date,
        time: draft.time,
        guests: draft.guests,
      });
      const code = 'RV-' + res.id.toString().padStart(4, '0');
      setConfirmedDrafts((prev) => ({
        ...prev,
        [index]: {
          code,
          date: draft.date,
          time: draft.time,
          guests: draft.guests,
          restaurantName: draft.restaurant_name,
        },
      }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al confirmar la reserva');
    } finally {
      setLoadingDrafts((prev) => ({ ...prev, [index]: false }));
    }
  };

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

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await chatApi.send(text, newMessages.slice(-10), location ?? undefined);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const msg = err instanceof Error && err.message.toLowerCase().includes('not configured')
        ? t('chat.notConfigured')
        : t('chat.error');
      setMessages((prev) => [...prev, { role: 'assistant', content: msg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center chat-aura"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="AI Chat"
      >
        <span className="material-symbols-outlined text-2xl">
          {open ? 'close' : 'auto_awesome'}
        </span>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[360px] max-w-[360px] h-[min(480px,calc(100vh-8rem))] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ background: 'var(--surface-3)', color: 'var(--ink)', border: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div className="grain px-4 py-3 flex items-center gap-3" style={{ background: 'var(--navy)', color: 'var(--cream)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--primary)' }}>
                <span className="mat" style={{ fontSize: 20 }}>auto_awesome</span>
              </div>
              <div className="min-w-0 relative z-10">
                <div className="editorial text-sm" style={{ fontWeight: 500, letterSpacing: '-0.01em' }}>
                  Reserv<span className="italic-accent">IA</span>
                </div>
                <div className="text-xs truncate" style={{ opacity: 0.7 }}>{t('chat.subtitle')}</div>
              </div>
              <button
                onClick={toggleLocation}
                className={`ml-auto p-1.5 rounded-full transition-colors shrink-0 ${
                  locEnabled ? 'bg-white/30 text-white' : 'bg-white/10 text-orange-200'
                }`}
                title={locEnabled ? t('chat.locationOn') : t('chat.locationOff')}
              >
                <span className="material-symbols-outlined text-base">my_location</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-sm mt-8 px-4" style={{ color: 'var(--ink-55)' }}>
                  <span className="material-symbols-outlined text-4xl block mb-2" style={{ color: 'var(--ink-40)' }}>
                    auto_awesome
                  </span>
                  {t('chat.welcome')}
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {[
                      t('chat.suggestions.romantic'),
                      t('chat.suggestions.group'),
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-xs px-3 py-1.5 rounded-full transition-colors"
                        style={{ background: 'var(--ink-5)', color: 'var(--ink)', border: '1px solid var(--border)' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                const { text, draft } = isUser ? { text: msg.content, draft: null } : parseMessage(msg.content);
                const isConfirmed = confirmedDrafts[i];
                const isLoading = loadingDrafts[i];
                const isCancelled = cancelledDrafts[i];
                
                return (
                  <div
                    key={i}
                    className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'rounded-bl-sm'
                      }`}
                      style={!isUser ? { background: 'var(--ink-5)', color: 'var(--ink)' } : undefined}
                    >
                      {text}
                    </div>
                    
                    {/* Render Interactive Draft Card if present and assistant role */}
                    {draft && !isUser && (
                      <div className="w-[82%] mt-1">
                        {isConfirmed ? (
                          <div
                            className="scale-in p-3 rounded-xl flex flex-col gap-2 text-center"
                            style={{
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#065f46',
                              boxShadow: 'var(--sh-sm)'
                            }}
                          >
                            <span className="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
                            <div className="text-xs font-bold uppercase tracking-wider">¡Reserva Confirmada!</div>
                            <div className="font-semibold text-xs leading-normal">
                              Mesa para {isConfirmed.guests} en **{isConfirmed.restaurantName}** para el {isConfirmed.date} a las {isConfirmed.time}.
                            </div>
                            <div className="text-sm font-black mono-num tracking-wide mt-1 bg-white/60 py-1 rounded-lg">
                              {isConfirmed.code}
                            </div>
                          </div>
                        ) : isCancelled ? (
                          <div
                            className="p-3 rounded-xl text-center text-xs"
                            style={{
                              background: 'var(--ink-5)',
                              border: '1px solid var(--border)',
                              color: 'var(--ink-55)'
                            }}
                          >
                            Reserva borrador cancelada.
                          </div>
                        ) : (
                          <div
                            className="p-4 rounded-xl flex flex-col gap-3"
                            style={{
                              background: 'color-mix(in srgb, var(--primary) 5%, var(--surface-3))',
                              border: '1px solid var(--primary-200)',
                              boxShadow: 'var(--sh-sm)'
                            }}
                          >
                            <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
                              <span className="material-symbols-outlined text-base">restaurant</span>
                              Borrador de Reserva
                            </div>
                            
                            <div className="text-xs space-y-1.5" style={{ color: 'var(--ink)' }}>
                              <div className="flex items-center gap-2 font-semibold">
                                <span className="material-symbols-outlined text-sm opacity-60">storefront</span>
                                <span>{draft.restaurant_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm opacity-60">calendar_month</span>
                                <span>{draft.date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm opacity-60">schedule</span>
                                <span>{draft.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm opacity-60">group</span>
                                <span>{draft.guests} {draft.guests === 1 ? 'persona' : 'personas'}</span>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 mt-1">
                              <button
                                disabled={isLoading}
                                onClick={() => handleConfirmReservation(i, draft)}
                                className="flex-1 btn btn-primary flex items-center justify-center gap-1.5"
                                style={{ height: 32, padding: '0 12px', fontSize: 12, borderRadius: 8 }}
                              >
                                {isLoading ? (
                                  <span className="spin" style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', display: 'inline-block' }} />
                                ) : (
                                  <>
                                    <span>Confirmar</span>
                                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                  </>
                                )}
                              </button>
                              <button
                                disabled={isLoading}
                                onClick={() => setCancelledDrafts((prev) => ({ ...prev, [i]: true }))}
                                className="btn btn-dark"
                                style={{ height: 32, padding: '0 12px', fontSize: 12, borderRadius: 8, background: 'var(--ink-10)', color: 'var(--ink)', border: 'none' }}
                              >
                                <span>Cancelar</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center" style={{ background: 'var(--ink-5)' }}>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'var(--ink-40)' }}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={t('chat.placeholder')}
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                style={{ background: 'var(--ink-5)', color: 'var(--ink)', border: '1px solid var(--border)' }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-orange-600 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
