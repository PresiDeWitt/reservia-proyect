import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { reservationsApi, type Reservation, type EditReservationData } from '../api/reservations';
import { useAuth } from '../context/AuthContext';

// ── Horarios disponibles ──────────────────────────────────────────────────────
const TIME_SLOTS = ['13:00', '13:30', '14:00', '14:30', '15:00', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'];
const OCCASIONS  = [
  { value: '', label: 'Sin ocasión especial' },
  { value: 'birthday',    label: '🎂 Cumpleaños' },
  { value: 'anniversary', label: '💑 Aniversario' },
  { value: 'business',    label: '💼 Negocios' },
  { value: 'other',       label: '✨ Otro' },
];

// ── Modal de edición ──────────────────────────────────────────────────────────
interface EditModalProps {
  booking: Reservation;
  onClose: () => void;
  onSaved: (updated: Reservation) => void;
}

const EditModal: React.FC<EditModalProps> = ({ booking, onClose, onSaved }) => {
  const [date,     setDate]     = useState(booking.date);
  const [time,     setTime]     = useState(booking.time.slice(0, 5));
  const [guests,   setGuests]   = useState(booking.guests);
  const [occasion, setOccasion] = useState(booking.occasion ?? '');
  const [note,     setNote]     = useState(booking.note ?? '');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  // Mínimo: mañana
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const save = async () => {
    setError('');
    setSaving(true);
    const payload: EditReservationData = {};
    if (date     !== booking.date)                  payload.date     = date;
    if (time     !== booking.time.slice(0, 5))      payload.time     = time;
    if (guests   !== booking.guests)                payload.guests   = guests;
    if (occasion !== (booking.occasion ?? ''))      payload.occasion = occasion;
    if (note     !== (booking.note ?? ''))          payload.note     = note;

    try {
      const updated = await reservationsApi.edit(booking.id, payload);
      onSaved(updated);
      onClose();
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? 'Error al guardar. Inténtalo de nuevo.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--r-xl)',
          boxShadow: '0 40px 120px -20px rgba(15,23,42,0.45)',
          width: '100%', maxWidth: 520,
          overflow: 'hidden',
        }}
      >
        {/* Cabecera */}
        <div style={{
          padding: '24px 28px 0',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 4 }}>
              Editar reserva
            </p>
            <h2
              id="edit-modal-title"
              className="editorial"
              style={{ fontSize: 26, fontWeight: 400, color: 'var(--ink)', margin: 0 }}
            >
              {booking.restaurantName}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--ink-5)', border: 'none', cursor: 'pointer',
              display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 4,
            }}
          >
            <span className="mat" style={{ fontSize: 20, color: 'var(--ink-55)' }}>close</span>
          </button>
        </div>

        {/* Formulario */}
        <div style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Fecha + Hora */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-55)', display: 'block', marginBottom: 6 }}>
                Fecha
              </label>
              <input
                type="date"
                value={date}
                min={minDateStr}
                onChange={(e) => setDate(e.target.value)}
                className="input"
                style={{ width: '100%', background: 'var(--ink-5)', border: 'none', color: 'var(--ink)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-55)', display: 'block', marginBottom: 6 }}>
                Hora
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input"
                style={{ width: '100%', background: 'var(--ink-5)', border: 'none', color: 'var(--ink)' }}
              >
                {TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Comensales */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-55)', display: 'block', marginBottom: 6 }}>
              Comensales
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--ink-5)', border: 'none', cursor: 'pointer',
                  fontSize: 20, display: 'grid', placeItems: 'center', color: 'var(--ink)',
                }}
              >−</button>
              <span style={{ fontSize: 20, fontWeight: 700, minWidth: 32, textAlign: 'center', color: 'var(--ink)' }}>{guests}</span>
              <button
                type="button"
                onClick={() => setGuests((g) => Math.min(20, g + 1))}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--ink-5)', border: 'none', cursor: 'pointer',
                  fontSize: 20, display: 'grid', placeItems: 'center', color: 'var(--ink)',
                }}
              >+</button>
            </div>
          </div>

          {/* Ocasión */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-55)', display: 'block', marginBottom: 6 }}>
              Ocasión
            </label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="input"
              style={{ width: '100%', background: 'var(--ink-5)', border: 'none', color: 'var(--ink)' }}
            >
              {OCCASIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Nota */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-55)', display: 'block', marginBottom: 6 }}>
              Nota para el restaurante
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Alergias, peticiones especiales…"
              maxLength={400}
              rows={3}
              style={{
                width: '100%', padding: '10px 14px',
                background: 'var(--ink-5)', border: 'none', borderRadius: 'var(--r-md)',
                color: 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: 14,
                resize: 'none', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: 11, color: 'var(--ink-40)', textAlign: 'right', margin: '4px 0 0' }}>
              {note.length}/400
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--r-md)',
              background: 'rgba(225,29,72,0.08)', color: '#b01446', fontSize: 13,
            }}>
              <span className="mat" style={{ fontSize: 15, verticalAlign: 'middle', marginRight: 6 }}>error</span>
              {error}
            </div>
          )}

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              onClick={onClose}
              className="btn btn-ghost"
              style={{ height: 44 }}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              onClick={save}
              className="btn btn-primary"
              style={{ height: 44, minWidth: 120 }}
              disabled={saving}
            >
              {saving ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="mat" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }}>progress_activity</span>
                  Guardando…
                </span>
              ) : (
                <span>Guardar cambios</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────
const MyBookings: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings]     = useState<Reservation[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [editingId, setEditingId]   = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    reservationsApi
      .myReservations()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const cancel = async (id: number) => {
    if (!window.confirm(t('bookings.confirmCancelPrompt'))) return;
    await reservationsApi.cancel(id);
    setBookings((b) => b.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)));
  };

  const handleSaved = (updated: Reservation) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '120px 24px', textAlign: 'center' }}>
        <h1 className="editorial" style={{ fontSize: 56, fontWeight: 300 }}>
          <span className="italic-accent">{t('bookings.loginMessage')}</span>
        </h1>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 28 }}>
          <span>{t('confirmation.backHome')}</span>
        </Link>
      </div>
    );
  }

  const now = new Date();
  const filtered = bookings.filter((b) => {
    if (b.status === 'cancelled') return filter === 'cancelled';
    const dt = new Date(`${b.date}T${b.time || '00:00'}`);
    return filter === 'upcoming' ? dt >= now : dt < now;
  });

  const bookingStatusLabel: Record<Reservation['status'], string> = {
    confirmed: t('bookings.confirmed'),
    arrived:   t('bookings.arrived'),
    cancelled: t('bookings.cancelled'),
    no_show:   t('bookings.noShow'),
  };
  const bookingStatusStyle: Record<Reservation['status'], React.CSSProperties> = {
    confirmed: { background: 'rgba(16,185,129,0.12)',  color: '#0a7c5a',  borderColor: 'transparent' },
    arrived:   { background: 'rgba(14,165,233,0.12)',  color: '#0369a1',  borderColor: 'transparent' },
    cancelled: { background: 'rgba(225,29,72,0.12)',   color: '#b01446',  borderColor: 'transparent' },
    no_show:   { background: 'rgba(107,114,128,0.12)', color: '#4b5563',  borderColor: 'transparent' },
  };

  const editingBooking = bookings.find((b) => b.id === editingId) ?? null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container"
        style={{ padding: '120px 24px 80px' }}
      >
        <div className="eyebrow">{t('bookings.agenda')}</div>
        <h1
          className="editorial"
          style={{ fontSize: 'clamp(48px,6vw,88px)', fontWeight: 300, letterSpacing: '-0.03em', marginTop: 8 }}
        >
          <span className="italic-accent">{t('bookings.title')}</span>
        </h1>

        <div style={{ display: 'flex', gap: 8, marginTop: 32, flexWrap: 'wrap' }}>
          {(['upcoming', 'past', 'cancelled'] as const).map((k) => (
            <button key={k} onClick={() => setFilter(k)} className={`chip ${filter === k ? 'active' : ''}`}>
              {k === 'upcoming' ? t('bookings.filterUpcoming') : k === 'past' ? t('bookings.filterPast') : t('bookings.filterCancelled')}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="shimmer" style={{ height: 140, borderRadius: 'var(--r-xl)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-40)' }}>
            <span className="mat" style={{ fontSize: 48, marginBottom: 12, display: 'block' }}>event_busy</span>
            <p style={{ fontSize: 16 }}>{t('bookings.empty')}</p>
          </div>
        ) : (
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map((b) => {
              const isUpcomingConfirmed = b.status === 'confirmed' && filter === 'upcoming';
              return (
                <div
                  key={b.id}
                  className="card booking-row"
                  style={{
                    background: 'var(--surface-3)',
                    borderRadius: 'var(--r-xl)',
                    padding: 20,
                    display: 'grid',
                    gridTemplateColumns: '160px 1fr auto',
                    gap: 20,
                    alignItems: 'center',
                  }}
                >
                  <Link
                    to={`/restaurant/${b.restaurantId}`}
                    style={{
                      height: 100,
                      borderRadius: 'var(--r-md)',
                      overflow: 'hidden',
                      background: `url(${b.restaurantImage}) center/cover`,
                    }}
                  />
                  <div>
                    <div className="eyebrow">{b.restaurantCuisine}</div>
                    <Link
                      to={`/restaurant/${b.restaurantId}`}
                      className="editorial"
                      style={{ fontSize: 26, fontWeight: 400, marginTop: 4, display: 'block' }}
                    >
                      {b.restaurantName}
                    </Link>
                    <div style={{ marginTop: 6, fontSize: 13, color: 'var(--ink-55)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      <span>
                        <span className="mat" style={{ fontSize: 14, verticalAlign: 'middle' }}>event</span>{' '}
                        {new Date(b.date + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span>
                        <span className="mat" style={{ fontSize: 14, verticalAlign: 'middle' }}>schedule</span> {b.time.slice(0, 5)}
                      </span>
                      <span>
                        <span className="mat" style={{ fontSize: 14, verticalAlign: 'middle' }}>group</span>{' '}
                        {b.guests} {t('bookings.guests')}
                      </span>
                      {b.occasion && (
                        <span>
                          <span className="mat" style={{ fontSize: 14, verticalAlign: 'middle' }}>celebration</span>{' '}
                          {OCCASIONS.find((o) => o.value === b.occasion)?.label ?? b.occasion}
                        </span>
                      )}
                    </div>
                    {b.note && (
                      <p style={{ marginTop: 6, fontSize: 12, color: 'var(--ink-40)', fontStyle: 'italic' }}>
                        "{b.note}"
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <span className="chip" style={bookingStatusStyle[b.status]}>
                      {bookingStatusLabel[b.status]}
                    </span>
                    {isUpcomingConfirmed && (
                      <>
                        <button
                          id={`edit-booking-${b.id}`}
                          onClick={() => setEditingId(b.id)}
                          className="btn btn-ghost"
                          style={{ height: 36, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          <span className="mat" style={{ fontSize: 15 }}>edit</span>
                          Editar
                        </button>
                        <button
                          id={`cancel-booking-${b.id}`}
                          onClick={() => cancel(b.id)}
                          className="btn btn-ghost"
                          style={{ height: 36, fontSize: 12, color: '#b01446' }}
                        >
                          {t('bookings.cancel')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <style>{`
          @media (max-width: 700px) {
            .booking-row { grid-template-columns: 1fr !important; }
            .booking-row > a:first-child { height: 180px !important; }
          }
        `}</style>
      </motion.div>

      {/* Modal de edición */}
      <AnimatePresence>
        {editingBooking && (
          <EditModal
            booking={editingBooking}
            onClose={() => setEditingId(null)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MyBookings;
