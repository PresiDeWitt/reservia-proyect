import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { chatApi, type ChatMessage } from '../api/chat';

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

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await chatApi.send(text, newMessages.slice(-10), location ?? undefined);
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
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center"
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
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100"
            style={{ height: '480px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-orange-500 px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
              </div>
              <div className="min-w-0">
                <div className="text-white font-bold text-sm">ReserVia AI</div>
                <div className="text-orange-100 text-xs truncate">{t('chat.subtitle')}</div>
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
                <div className="text-center text-slate-400 text-sm mt-8 px-4">
                  <span className="material-symbols-outlined text-4xl block mb-2 text-slate-300">
                    auto_awesome
                  </span>
                  {t('chat.welcome')}
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-slate-400"
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
            <div className="p-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={t('chat.placeholder')}
                className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-slate-200"
              />
              <button
                onClick={send}
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
