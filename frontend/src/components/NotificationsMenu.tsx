import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { notificationsApi, type AppNotification } from '../api/notifications';
import { useAuth } from '../context/AuthContext';

// Icono Material según el tipo de notificación del backend
const iconForType = (type: string): string => {
  switch (type) {
    case 'booking_confirmed': return 'check_circle';
    case 'booking_cancelled': return 'cancel';
    case 'booking_reminder': return 'schedule';
    case 'review_request':   return 'star';
    case 'system':           return 'info';
    default:                 return 'notifications';
  }
};

// Tiempo relativo legible
const relativeTime = (iso: string, t: (key: string) => string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return t('notifications.justNow');
  if (m < 60) return t('notifications.minutesAgo').replace('${m}', String(m));
  const h = Math.floor(m / 60);
  if (h < 24) return t('notifications.hoursAgo').replace('${h}', String(h));
  const d = Math.floor(h / 24);
  return t('notifications.daysAgo').replace('${d}', String(d));
};

interface Props {
  variant?: 'light' | 'dark';
}

const NotificationsMenu: React.FC<Props> = ({ variant = 'dark' }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const [open, setOpen]                     = useState(false);
  const [notifications, setNotifications]   = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [loading, setLoading]               = useState(false);
  const wrapperRef                          = useRef<HTMLDivElement>(null);
  const isDark                              = variant === 'dark';

  // ── Carga el conteo de no leídas (ligero, para el badge) ─────────────────
  const fetchCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationsApi.unreadCount();
      setUnreadCount(data.count);
    } catch {
      // silencioso — el badge simplemente no se actualiza
    }
  }, [isAuthenticated]);

  // ── Carga la lista completa (solo al abrir el menú) ───────────────────────
  const fetchList = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await notificationsApi.list();
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter((n) => !n.is_read).length);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Badge: carga count al montar y cada 30 segundos
  useEffect(() => {
    fetchCount();
    if (!isAuthenticated) return;
    const id = window.setInterval(fetchCount, 30_000);
    return () => window.clearInterval(id);
  }, [fetchCount, isAuthenticated]);

  // Carga lista cuando se abre el menú
  useEffect(() => {
    if (open) fetchList();
  }, [open, fetchList]);

  // Cierre con clic fuera o Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // ── Marcar una como leída ─────────────────────────────────────────────────
  const markOne = async (n: AppNotification) => {
    if (n.is_read) return;
    setNotifications((prev) =>
      prev.map((item) => item.id === n.id ? { ...item, is_read: true } : item)
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notificationsApi.markRead(n.id);
    } catch {
      // revertir en caso de error
      setNotifications((prev) =>
        prev.map((item) => item.id === n.id ? { ...item, is_read: false } : item)
      );
      setUnreadCount((c) => c + 1);
    }
  };

  // ── Marcar todas como leídas ──────────────────────────────────────────────
  const markAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await notificationsApi.markAllRead();
    } catch {
      // revertir
      fetchList();
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {/* ── Botón campana ── */}
      <button
        id="notifications-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('notifications.ariaLabel')}
        aria-expanded={open}
        style={{
          position: 'relative',
          width: 40, height: 40,
          display: 'grid', placeItems: 'center',
          borderRadius: '50%',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: isDark ? '#fff' : 'var(--ink)',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'var(--ink-5)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span className="mat" style={{ fontSize: 22 }}>notifications</span>

        {/* Badge numérico rojo */}
        {unreadCount > 0 && (
          <span
            aria-label={`${unreadCount} notificaciones sin leer`}
            style={{
              position: 'absolute',
              top: 4, right: 4,
              minWidth: 16, height: 16,
              borderRadius: 8,
              background: 'var(--danger)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 800,
              lineHeight: '16px',
              textAlign: 'center',
              padding: '0 3px',
              border: '1.5px solid ' + (isDark ? 'var(--espresso)' : 'var(--surface)'),
              fontFamily: 'var(--font-sans)',
              pointerEvents: 'none',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
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
              boxShadow: 'var(--sh-md)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              zIndex: 200,
            }}
          >
            {/* Cabecera */}
            <div style={{ padding: '20px 20px 12px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink-55)', marginBottom: 4, textTransform: 'uppercase' }}>
                {t('notifications.header')}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 28, fontWeight: 400, fontFamily: 'var(--font-editorial)', color: 'var(--ink)', margin: 0 }}>
                  {t('notifications.title')}
                </h2>
                {unreadCount > 0 && (
                  <button
                    onClick={markAll}
                    style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {t('notifications.markAllRead')}
                  </button>
                )}
              </div>
            </div>

            {/* Lista */}
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {loading && (
                <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--ink-55)', fontSize: 14 }}>
                  <span className="mat" style={{ fontSize: 22, display: 'block', marginBottom: 8, opacity: 0.5 }}>hourglass_empty</span>
                  {t('notifications.loading')}
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--ink-55)' }}>
                  <span className="mat" style={{ fontSize: 36, display: 'block', marginBottom: 12, opacity: 0.35 }}>notifications_off</span>
                  <p style={{ fontSize: 14, margin: 0 }}>{t('notifications.empty')}</p>
                </div>
              )}

              {!loading && notifications.map((n, i) => (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  aria-label={n.title}
                  onClick={() => markOne(n)}
                  onKeyDown={(e) => { if (e.key === 'Enter') markOne(n); }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '14px 20px',
                    background: !n.is_read ? 'rgba(249,116,21,0.08)' : 'transparent',
                    borderTop: i === 0 ? '1px solid var(--border)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = !n.is_read ? 'rgba(249,116,21,0.13)' : 'var(--ink-5)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = !n.is_read ? 'rgba(249,116,21,0.08)' : 'transparent'; }}
                >
                  {/* Icono */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: !n.is_read ? 'rgba(249,116,21,0.15)' : 'var(--ink-5)',
                    display: 'grid', placeItems: 'center',
                  }}>
                    <span className="mat" style={{ fontSize: 20, color: !n.is_read ? 'var(--primary)' : 'var(--ink-55)' }}>
                      {iconForType(n.type)}
                    </span>
                  </div>

                  {/* Texto */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {n.title}
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--ink-55)', margin: '0 0 4px', lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--ink-40)', margin: 0, textTransform: 'uppercase' }}>
                      {relativeTime(n.created_at, t)}
                    </p>
                  </div>

                  {/* Punto no leído */}
                  {!n.is_read && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 6 }} />
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
