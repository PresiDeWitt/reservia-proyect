import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { chatApi, type ChatMessage } from '../api/chat';
import { useAuth } from '../context/AuthContext';
import { reservationsApi } from '../api/reservations';

// Clear chatbot session storage on manual browser reload
if (typeof window !== 'undefined') {
  const navigation = window.performance?.getEntriesByType?.('navigation')[0] as PerformanceNavigationTiming | undefined;
  const isReload = navigation 
    ? navigation.type === 'reload'
    : window.performance?.navigation?.type === 1;

  if (isReload) {
    sessionStorage.removeItem('reservia_chat_messages');
    sessionStorage.removeItem('reservia_chat_open');
    sessionStorage.removeItem('reservia_chat_input');
  }
}

const ChatBot: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(() => {
    const saved = sessionStorage.getItem('reservia_chat_open');
    return saved === 'true';
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = sessionStorage.getItem('reservia_chat_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState(() => {
    return sessionStorage.getItem('reservia_chat_input') || '';
  });
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locEnabled, setLocEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // States for verification booking cards
  const [confirmedDrafts, setConfirmedDrafts] = useState<Record<number, { code: string; date: string; time: string; guests: number; restaurantName: string; occasion?: string; note?: string }>>({});
  const [loadingDrafts, setLoadingDrafts] = useState<Record<number, boolean>>({});
  const [cancelledDrafts, setCancelledDrafts] = useState<Record<number, boolean>>({});

  useEffect(() => {
    sessionStorage.setItem('reservia_chat_open', String(open));
  }, [open]);

  useEffect(() => {
    sessionStorage.setItem('reservia_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem('reservia_chat_input', input);
  }, [input]);

  const parseMessage = (content: string) => {
    let text = content;
    let draft = null;
    let floorPlanRestaurantId: number | null = null;

    // 1. Parse reservation draft
    const draftMatch = text.match(/\[RESERVATION_DRAFT:(\{[\s\S]*?\})\]/);
    if (draftMatch) {
      try {
        draft = JSON.parse(draftMatch[1]);
        text = text.replace(draftMatch[0], '');
      } catch {
        // Ignorar si el JSON no es válido
      }
    }

    // 2. Parse floorplan button
    const fpMatch = text.match(/\[FLOORPLAN_BUTTON:(\d+)\]/);
    if (fpMatch) {
      floorPlanRestaurantId = parseInt(fpMatch[1], 10);
      text = text.replace(fpMatch[0], '');
    }

    return { text: text.trim(), draft, floorPlanRestaurantId };
  };

  const handleConfirmReservation = async (
    index: number,
    draft: {
      restaurant_id: number | string;
      restaurant_name: string;
      date: string;
      time: string;
      guests: number;
      occasion?: string;
      note?: string;
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
        occasion: draft.occasion || '',
        note: draft.note || '',
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
          occasion: draft.occasion,
          note: draft.note,
        },
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al confirmar la reserva';
      // Show error in chat instead of browser alert
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `⚠️ ${errorMsg}\n\nPuedes intentar con otra hora, fecha o restaurante si lo deseas.`,
      }]);
      setCancelledDrafts((prev) => ({ ...prev, [index]: true }));
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
    if (!override) {
      setInput('');
    }
    setLoading(true);

    try {
      const reply = await chatApi.send(text, messages.slice(-10), location ?? undefined);
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

  // Restore open state and auto-send selected table from 3D map
  useEffect(() => {
    const selectedTable = localStorage.getItem('reservia_chat_selected_table');
    if (selectedTable) {
      localStorage.removeItem('reservia_chat_selected_table');
      setOpen(true); // Ensure chatbot is open
      setTimeout(() => {
        send(`He seleccionado la ${selectedTable} en el mapa 3D`);
      }, 600);
    }
  }, []);

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
                const { text, draft, floorPlanRestaurantId } = isUser 
                  ? { text: msg.content, draft: null, floorPlanRestaurantId: null } 
                  : parseMessage(msg.content);
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

                    {/* Render Choose Table 3D Button if present and assistant role */}
                    {floorPlanRestaurantId && !isUser && (
                      <div className="w-[82%] mt-0.5 scale-in">
                        <button
                          onClick={() => {
                            navigate(`/floor/${floorPlanRestaurantId}?fromChat=true`);
                          }}
                          className="w-full py-2 px-3.5 rounded-xl text-xs font-black bg-[#f97415] hover:bg-[#d95d02] text-[#f8f7f5] transition-colors duration-200 shadow-md flex items-center justify-center gap-1.5 border border-[#f97415]/10 tracking-wide uppercase"
                        >
                          <span className="material-symbols-outlined text-base">3d_rotation</span>
                          {t('chat.chooseFloorPlan')}
                        </button>
                      </div>
                    )}
                    
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
                            <div className="text-xs font-bold uppercase tracking-wider">{t('chat.bookingConfirmed')}</div>
                            <div className="font-semibold text-xs leading-normal">
                              Mesa para {isConfirmed.guests} en <strong>{isConfirmed.restaurantName}</strong> — {isConfirmed.date} a las {isConfirmed.time}.
                            </div>
                            {isConfirmed.occasion && (
                              <div className="text-xs opacity-80">🎉 {isConfirmed.occasion}</div>
                            )}
                            {isConfirmed.note && (
                              <div className="text-xs opacity-80">📝 {isConfirmed.note}</div>
                            )}
                            <div className="text-sm font-black mono-num tracking-wide mt-1 bg-white/60 py-1 rounded-lg">
                              {isConfirmed.code}
                            </div>
                            <button
                              onClick={() => {
                                navigate('/my-bookings');
                                setOpen(false);
                              }}
                              className="mt-2 w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-50 transition-colors duration-200 shadow-sm flex items-center justify-center gap-1.5 border border-emerald-200/50"
                            >
                              <span className="material-symbols-outlined text-base">visibility</span>
                              Ver Reserva
                            </button>
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
                            {t('chat.draftCancelled')}
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
                              {draft.table && (
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-sm opacity-60">table_restaurant</span>
                                  <span>Mesa {draft.table}</span>
                                </div>
                              )}
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
