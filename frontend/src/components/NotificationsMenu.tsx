import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: number;
  icon: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

const INITIAL: Notification[] = [
  { id: 1, icon: 'check_circle', title: 'Reserva confirmada', description: 'Kinoko Izakaya · 24 abr, 21:00 · Mesa para 2', time: 'HACE 2H', unread: true },
  { id: 2, icon: 'schedule', title: 'Mañana tienes mesa', description: 'Panadería Miga · 10:30 · Brunch para 2', time: 'HACE 6H', unread: true },
  { id: 3, icon: 'local_fire_department', title: 'Tu restaurante favorito tiene hueco', description: 'Le Petit Atelier — sábado 21:30, solo quedan 3 mesas', time: 'HACE 1D', unread: false },
  { id: 4, icon: 'chat_bubble', title: '¿Qué tal Le Petit Atelier?', description: 'Cuéntale a otros comensales tu experiencia del 18 de marzo', time: 'HACE 2D', unread: false },
  { id: 5, icon: 'star', title: 'Has subido a Habitué', description: 'Desbloqueaste reservas prioritarias + mesa sin espera en tu cumpleaños', time: 'HACE 1SEM', unread: false },
];

interface Props {
  variant?: 'light' | 'dark';
}

const NotificationsMenu: React.FC<Props> = ({ variant = 'dark' }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const markAllRead = () => setNotifications((n) => n.map((item) => ({ ...item, unread: false })));

  const isDark = variant === 'dark';

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
        className="relative grid place-items-center rounded-full transition-colors"
        style={{
          width: 40, height: 40,
          background: 'transparent',
          border: 'none', cursor: 'pointer',
          color: isDark ? '#fff' : 'var(--ink)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'var(--ink-5)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span className="mat" style={{ fontSize: 22 }}>notifications</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--primary)',
            border: '1.5px solid transparent',
          }} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              position: 'absolute', right: 0, top: 'calc(100% + 10px)',
              width: 360, maxWidth: 'calc(100vw - 2rem)',
              background: 'var(--surface-3)',
              borderRadius: 20,
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              zIndex: 200,
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px 20px 12px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink-55)', marginBottom: 4 }}>AVISOS</p>
              <div className="flex items-center justify-between">
                <h2 style={{ fontSize: 28, fontWeight: 400, fontFamily: 'var(--font-editorial)', color: 'var(--ink)', margin: 0 }}>Bandeja</h2>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Marcar leídos
                  </button>
                )}
              </div>
            </div>

            {/* Lista */}
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {notifications.map((n, i) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '14px 20px',
                    background: n.unread ? 'rgba(249,116,21,0.08)' : 'transparent',
                    borderTop: i === 0 ? '1px solid var(--border)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = n.unread ? 'rgba(249,116,21,0.13)' : 'var(--ink-5)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = n.unread ? 'rgba(249,116,21,0.08)' : 'transparent'; }}
                  onClick={() => setNotifications((prev) => prev.map((item) => item.id === n.id ? { ...item, unread: false } : item))}
                >
                  {/* Icono */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: n.unread ? 'rgba(249,116,21,0.15)' : 'var(--ink-5)',
                    display: 'grid', placeItems: 'center',
                  }}>
                    <span className="mat" style={{ fontSize: 20, color: n.unread ? 'var(--primary)' : 'var(--ink-55)' }}>{n.icon}</span>
                  </div>

                  {/* Texto */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', margin: '0 0 2px' }}>{n.title}</p>
                    <p style={{ fontSize: 13, color: 'var(--ink-55)', margin: '0 0 4px', lineHeight: 1.4 }}>{n.description}</p>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--ink-40)', margin: 0 }}>{n.time}</p>
                  </div>

                  {/* Punto no leído */}
                  {n.unread && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsMenu;
