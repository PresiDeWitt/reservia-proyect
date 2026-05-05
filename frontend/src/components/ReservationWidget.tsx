import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { reservationsApi } from '../api/reservations';
import { useAuth } from '../context/AuthContext';
import type { Restaurant } from '../api/restaurants';

const TIME_SLOTS_LUNCH = ['13:00', '13:30', '14:00', '14:30', '15:00'];
const TIME_SLOTS_DINNER = ['20:00', '20:30', '21:00', '21:30', '22:00', '22:30'];
const UNAVAILABLE = new Set(['13:30', '21:30']);

interface Props {
  restaurant: Restaurant;
  onAuthRequired?: () => void;
}

const ReservationWidget: React.FC<Props> = ({ restaurant, onAuthRequired }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [guests, setGuests] = useState(2);
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [service, setService] = useState<'lunch' | 'dinner'>('dinner');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [occasion, setOccasion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ code: string } | null>(null);

  const slots = service === 'lunch' ? TIME_SLOTS_LUNCH : TIME_SLOTS_DINNER;

  const submit = async () => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    setLoading(true);
    setError('');
    try {
      await reservationsApi.create({
        restaurantId: parseInt(restaurant.id, 10),
        date,
        time,
        guests,
      });
      setDone({ code: 'RV-' + Math.floor(1000 + Math.random() * 9000) });
      navigate('/confirmation', {
        state: {
          restaurant,
          date,
          time,
          guests,
          occasion,
          note,
          code: 'RV-' + Math.floor(1000 + Math.random() * 9000),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
      navigate('/booking-error', { state: { reason: 'no_availability', restaurant } });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div
        className="card scale-in"
        style={{
          position: 'sticky',
          top: 100,
          padding: 28,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--sh-md)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--emerald)',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto',
            color: '#fff',
          }}
        >
          <span className="mat" style={{ fontSize: 36 }}>check</span>
        </div>
        <div className="eyebrow" style={{ marginTop: 20, color: 'var(--emerald)' }}>
          {t('reservation.tableConfirmed')}
        </div>
        <h3 className="editorial" style={{ fontSize: 30, fontWeight: 400, marginTop: 8 }}>
          <span className="italic-accent">{t('reservation.seeYou')}</span>.
        </h3>
        <div className="mono-num" style={{ marginTop: 14, fontWeight: 700, fontSize: 18 }}>{done.code}</div>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        position: 'sticky',
        top: 100,
        padding: 24,
        background: 'var(--surface)',
        borderRadius: 'var(--r-xl)',
        boxShadow: 'var(--sh-md)',
        border: '1px solid var(--border)',
      }}
    >
      <div>
        <div className="eyebrow">{t('reservation.reserveTable')}</div>
      </div>

      {/* Stepper */}
      <div className="res-stepper">
        {([
          { n: 1, label: t('reservation.guests') },
          { n: 2, label: t('reservation.occasion') },
          { n: 3, label: t('reservation.review') },
        ] as { n: number; label: string }[]).map(({ n, label }) => (
          <div
            key={n}
            className={`res-step-item${step === n ? ' active' : step > n ? ' done' : ''}`}
          >
            <div className="res-step-dot">
              {step > n ? <span className="mat" style={{ fontSize: 14 }}>check</span> : n}
            </div>
            <span className="res-step-label">{label}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="fade-in" style={{ marginTop: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>{t('reservation.guests')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setGuests(n)}
                style={{
                  height: 40,
                  borderRadius: 'var(--r-sm)',
                  fontSize: 13,
                  fontWeight: 700,
                  background: guests === n ? 'var(--navy)' : 'var(--surface-3)',
                  color: guests === n ? 'var(--cream)' : 'var(--ink)',
                  border: `1px solid ${guests === n ? 'var(--navy)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="eyebrow" style={{ marginTop: 16, marginBottom: 8 }}>{t('reservation.date')}</div>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />

          <div className="eyebrow" style={{ marginTop: 16, marginBottom: 8 }}>{t('reservation.service')}</div>
          <div className="flex gap-2">
            {(['lunch', 'dinner'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setService(s)}
                className="chip"
                style={
                  service === s
                    ? { background: 'var(--navy)', color: 'var(--cream)', borderColor: 'var(--navy)' }
                    : undefined
                }
              >
                {s === 'lunch' ? t('reservation.lunch') : t('reservation.dinner')}
              </button>
            ))}
          </div>

          <div className="eyebrow" style={{ marginTop: 16, marginBottom: 8 }}>{t('reservation.time')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {slots.map((s) => {
              const unavail = UNAVAILABLE.has(s);
              const active = time === s;
              return (
                <button
                  key={s}
                  disabled={unavail}
                  onClick={() => setTime(s)}
                  style={{
                    height: 40,
                    borderRadius: 'var(--r-sm)',
                    fontSize: 13,
                    fontWeight: 700,
                    background: active ? 'var(--primary)' : unavail ? 'var(--ink-5)' : 'var(--surface-3)',
                    color: active ? '#fff' : unavail ? 'var(--ink-20)' : 'var(--ink)',
                    border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                    textDecoration: unavail ? 'line-through' : 'none',
                    cursor: unavail ? 'not-allowed' : 'pointer',
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>

          <button
            disabled={!time}
            onClick={() => setStep(2)}
            className="btn btn-primary"
            style={{ width: '100%', height: 52, marginTop: 20, opacity: time ? 1 : 0.5 }}
          >
            <span>{t('reservation.continue')}</span>
            <span className="mat" style={{ fontSize: 16 }}>arrow_forward</span>
          </button>

          <div style={{ position: 'relative', margin: '18px 0 14px', textAlign: 'center' }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                height: 1,
                background: 'var(--border)',
              }}
            />
            <span
              style={{
                position: 'relative',
                padding: '0 10px',
                background: 'var(--surface)',
                fontSize: 10,
                letterSpacing: '0.3em',
                color: 'var(--ink-55)',
                fontWeight: 700,
              }}
            >
              {t('reservation.orElse')}
            </span>
          </div>
          <button
            onClick={() => navigate(`/floor/${restaurant.id}`)}
            className="btn btn-ghost"
            style={{ width: '100%', height: 48, borderStyle: 'dashed' }}
          >
            <span className="mat" style={{ fontSize: 16 }}>table_restaurant</span>
            <span>{t('reservation.chooseFloor')}</span>
          </button>
          <p style={{ fontSize: 10, textAlign: 'center', color: 'var(--ink-55)', marginTop: 6 }}>
            {t('reservation.floorHint')}
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="fade-in" style={{ marginTop: 20 }}>
          <div className="eyebrow">{t('reservation.occasion')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {(['birthday', 'anniversary', 'firstDate', 'business', 'casual'] as const).map((o) => {
              const label = t(`reservation.occasionOptions.${o}`);
              return (
                <button
                  key={o}
                  onClick={() => setOccasion(occasion === label ? '' : label)}
                  className={`chip ${occasion === label ? 'active' : ''}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="eyebrow" style={{ marginTop: 18 }}>{t('reservation.noteToRestaurant')}</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('reservation.notePlaceholder')}
            style={{
              width: '100%',
              minHeight: 90,
              padding: 12,
              marginTop: 8,
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface-3)',
              resize: 'vertical',
              fontSize: 13,
              color: 'var(--ink)',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button onClick={() => setStep(1)} className="btn btn-ghost" style={{ flex: 1 }}>
              <span className="mat" style={{ fontSize: 16 }}>arrow_back</span>
              <span>{t('reservation.back')}</span>
            </button>
            <button onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 2 }}>
              <span>{t('reservation.review')}</span>
              <span className="mat" style={{ fontSize: 16 }}>arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="fade-in" style={{ marginTop: 20 }}>
          <div
            style={{
              padding: 16,
              background: 'var(--surface-3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700 }}>{restaurant.name}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-55)', marginTop: 2 }}>{restaurant.location}</div>
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 12 }}>
              <div>
                <div className="eyebrow">{t('reservation.day')}</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{date}</div>
              </div>
              <div>
                <div className="eyebrow">{t('reservation.time')}</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{time}</div>
              </div>
              <div>
                <div className="eyebrow">{t('reservation.table')}</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{guests}p</div>
              </div>
            </div>
            {occasion && (
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-55)' }}>
                {t('reservation.occasionLabel')}: <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{occasion}</span>
              </div>
            )}
            {note && (
              <div style={{ marginTop: 4, fontSize: 11, color: 'var(--ink-55)' }}>
                {t('reservation.noteLabel')}: <span style={{ color: 'var(--ink)' }}>{note}</span>
              </div>
            )}
          </div>
          <div
            style={{
              marginTop: 14,
              padding: 12,
              background: 'rgba(249,116,21,0.1)',
              borderRadius: 'var(--r-md)',
              fontSize: 11,
              color: 'var(--ink-55)',
            }}
          >
            <span className="mat" style={{ fontSize: 14, color: 'var(--primary)', verticalAlign: 'middle' }}>info</span>{' '}
            {t('reservation.cancelPolicy')}
          </div>
          {error && (
            <div
              style={{
                marginTop: 10,
                padding: 10,
                fontSize: 12,
                color: 'var(--ruby)',
                background: 'rgba(225,29,72,0.08)',
                borderRadius: 'var(--r-sm)',
              }}
            >
              {error}
            </div>
          )}
          {!isAuthenticated && (
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--primary)', textAlign: 'center' }}>
              {t('reservation.loginRequired')}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button onClick={() => setStep(2)} className="btn btn-ghost" style={{ flex: 1 }}>
              <span className="mat" style={{ fontSize: 16 }}>arrow_back</span>
            </button>
            <button onClick={submit} disabled={loading} className="btn btn-primary" style={{ flex: 3, height: 52 }}>
              {loading ? (
                <span
                  className="spin"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                    display: 'inline-block',
                  }}
                />
              ) : (
                <>
                  <span>{t('reservation.confirm')}</span>
                  <span className="mat" style={{ fontSize: 16 }}>check</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationWidget;
