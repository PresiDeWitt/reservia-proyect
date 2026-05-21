import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { restaurantsApi, type Restaurant, type Review, type ReviewsResponse } from '../api/restaurants';
import ReservationWidget from '../components/ReservationWidget';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';

type TabKey = 'about' | 'menu' | 'reviews' | 'info';

const TAB_KEYS: TabKey[] = ['about', 'menu', 'reviews', 'info'];

const FACT_KEYS = [
  { i: 'restaurant_menu', k: 'seasonal' },
  { i: 'deck', k: 'terrace' },
  { i: 'local_bar', k: 'bar' },
  { i: 'accessible', k: 'accessible' },
  { i: 'pets', k: 'pets' },
  { i: 'wifi', k: 'wifi' },
];

const StarInput: React.FC<{ value: number; onChange: (n: number) => void }> = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span
            className="mat mat-fill"
            style={{ fontSize: 28, color: n <= (hover || value) ? 'var(--primary)' : 'var(--ink-20)', transition: 'color 0.1s' }}
          >
            star
          </span>
        </button>
      ))}
    </div>
  );
};

const RestaurantDetails: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('about');
  const [authOpen, setAuthOpen] = useState(false);
  const [favorite, setFavorite] = useState(false);

  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!id) return;
    restaurantsApi.get(id).then(setRestaurant).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || tab !== 'reviews') return;
    restaurantsApi.reviews(id).then(setReviewsData).catch(console.error);
  }, [id, tab, user]);

  const handleSubmitReview = async () => {
    if (!id || reviewRating === 0) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const review = await restaurantsApi.createReview(id, reviewRating, reviewComment);
      setReviewsData((prev) =>
        prev
          ? { ...prev, reviews: [review, ...prev.reviews], can_review: false, has_reviewed: true }
          : prev,
      );
      setReviewComment('');
      setReviewRating(5);
      // Refresh restaurant rating
      restaurantsApi.get(id).then(setRestaurant).catch(() => {});
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setSubmitError(msg || 'Error al publicar la reseña');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '120px 24px' }}>
        <div className="shimmer" style={{ height: 480, borderRadius: 'var(--r-xl)' }} />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container" style={{ padding: '120px 24px', textAlign: 'center' }}>
        <h1 className="editorial" style={{ fontSize: 48, fontWeight: 300 }}>
          No <span className="italic-accent">encontrado</span>
        </h1>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Hero */}
      <div
        style={{
          position: 'relative',
          height: '65vh',
          minHeight: 500,
          marginTop: -88,
          paddingTop: 88,
          overflow: 'hidden',
        }}
      >
        <img
          src={restaurant.image}
          alt={restaurant.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.1) 40%, rgba(15,23,42,0.85) 100%)',
          }}
        />
        <div
          className="container"
          style={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            paddingBottom: 48,
            color: 'var(--cream)',
          }}
        >
          <div className="rise-stagger" style={{ maxWidth: 900 }}>
            <div className="eyebrow" style={{ color: 'var(--primary)' }}>
              {restaurant.cuisine} · {restaurant.location}
            </div>
            <h1
              className="editorial"
              style={{
                fontSize: 'clamp(48px,7vw,104px)',
                fontWeight: 300,
                letterSpacing: '-0.03em',
                lineHeight: 0.95,
                marginTop: 14,
              }}
            >
              {restaurant.name}
            </h1>
            <div style={{ display: 'flex', gap: 18, marginTop: 24, flexWrap: 'wrap', alignItems: 'center', fontSize: 13 }}>
              <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--primary)' }}>
                <span className="mat mat-fill" style={{ fontSize: 16 }}>star</span>
                <span style={{ color: 'var(--cream)', fontWeight: 700 }}>{restaurant.rating.toFixed(1)}</span>
              </span>
              <span style={{ opacity: 0.6 }}>·</span>
              <span>{restaurant.reviewsCount} {t('restaurantDetail.reviews')}</span>
              <span style={{ opacity: 0.6 }}>·</span>
              <span>{restaurant.priceRange}</span>
              <span style={{ opacity: 0.6 }}>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--emerald)',
                    animation: 'pulse-glow 2s ease-out infinite',
                  }}
                />
                {t('restaurantDetail.openNow')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 32, flexWrap: 'wrap' }}>
              <button onClick={() => setFavorite((v) => !v)} className="btn btn-dark">
                <span className={`mat ${favorite ? 'mat-fill' : ''}`} style={{ fontSize: 16, color: favorite ? 'var(--primary)' : 'inherit' }}>
                  favorite
                </span>
                <span>{favorite ? t('restaurantDetail.saved') : t('restaurantDetail.save')}</span>
              </button>
              <button className="btn btn-dark">
                <span className="mat" style={{ fontSize: 16 }}>ios_share</span>
                <span>{t('restaurantDetail.share')}</span>
              </button>
              <button className="btn btn-dark">
                <span className="mat" style={{ fontSize: 16 }}>directions</span>
                <span>{t('restaurantDetail.directions')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        className="container detail-grid"
        style={{
          padding: '48px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: 48,
        }}
      >
        <div>
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              borderBottom: '1px solid var(--border)',
              marginBottom: 32,
              flexWrap: 'wrap',
            }}
          >
            {TAB_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                style={{
                  padding: '14px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: tab === k ? 'var(--ink)' : 'var(--ink-55)',
                  borderBottom: tab === k ? '2px solid var(--primary)' : '2px solid transparent',
                  marginBottom: -1,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {t(`restaurantDetail.tabs.${k}`)}
              </button>
            ))}
          </div>

          {tab === 'about' && (
            <div key="about" className="tab-content">
              <p style={{ fontSize: 18, lineHeight: 1.7, maxWidth: 640 }}>
                {restaurant.description ||
                  `${restaurant.name} es una propuesta de cocina ${restaurant.cuisine.toLowerCase()} en ${restaurant.location}. Cocina honesta, producto local y una sala con alma.`}
              </p>

              <div style={{ marginTop: 48 }}>
                <div className="eyebrow">{t('restaurantDetail.goodToKnow')}</div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 14,
                    marginTop: 14,
                  }}
                >
                  {FACT_KEYS.map((x) => (
                    <div
                      key={x.k}
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center',
                        padding: 14,
                        background: 'var(--surface-3)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-md)',
                      }}
                    >
                      <span className="mat" style={{ color: 'var(--primary)' }}>{x.i}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{t(`restaurantDetail.facts.${x.k}`)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'menu' && (
            <div key="menu" className="tab-content">
              <div className="eyebrow">{t('restaurantDetail.featuredDishes')}</div>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(restaurant.menuItems && restaurant.menuItems.length > 0
                  ? restaurant.menuItems
                  : [
                      { id: 1, name: 'Plato de temporada', description: 'Producto local de mercado', price: 18 },
                      { id: 2, name: 'Especialidad de la casa', description: 'Receta de siempre', price: 24 },
                    ]
                ).map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      gap: 16,
                      padding: 20,
                      background: 'var(--surface-3)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-md)',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 className="editorial" style={{ fontSize: 22, fontWeight: 400 }}>
                        {m.name}
                      </h4>
                      <p style={{ fontSize: 13, color: 'var(--ink-55)', marginTop: 6 }}>{m.description}</p>
                    </div>
                    <div
                      className="editorial mono-num"
                      style={{ fontSize: 24, fontWeight: 400, color: 'var(--primary)' }}
                    >
                      €{m.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'reviews' && (
            <div key="reviews" className="tab-content">
              {/* Aggregate score */}
              <div
                style={{
                  display: 'flex',
                  gap: 32,
                  alignItems: 'center',
                  padding: 24,
                  background: 'var(--surface-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div className="editorial mono-num" style={{ fontSize: 72, fontWeight: 300, lineHeight: 1 }}>
                    {restaurant.rating.toFixed(1)}
                  </div>
                  <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className="mat mat-fill"
                        style={{ fontSize: 16, color: n <= Math.round(restaurant.rating) ? 'var(--primary)' : 'var(--ink-20)' }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-55)', marginTop: 6 }}>
                    {restaurant.reviewsCount} {t('restaurantDetail.reviews')}
                  </div>
                </div>
              </div>

              {/* Write a review */}
              {user && reviewsData?.can_review && (
                <div
                  style={{
                    marginTop: 24,
                    padding: 24,
                    background: 'var(--surface-3)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                  }}
                >
                  <div className="eyebrow" style={{ marginBottom: 16 }}>Tu reseña</div>
                  <StarInput value={reviewRating} onChange={setReviewRating} />
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Comparte tu experiencia…"
                    rows={3}
                    style={{
                      marginTop: 14,
                      width: '100%',
                      padding: '12px 14px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-md)',
                      fontSize: 14,
                      color: 'var(--ink)',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                  {submitError && (
                    <p style={{ color: 'var(--danger, #e53e3e)', fontSize: 13, marginTop: 8 }}>{submitError}</p>
                  )}
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting || reviewRating === 0}
                    className="btn btn-primary"
                    style={{ marginTop: 14 }}
                  >
                    {submitting ? 'Publicando…' : 'Publicar reseña'}
                  </button>
                </div>
              )}

              {user && reviewsData?.has_reviewed && (
                <p style={{ marginTop: 24, color: 'var(--ink-55)', fontSize: 14 }}>
                  Ya has publicado una reseña para este restaurante.
                </p>
              )}

              {!user && (
                <p style={{ marginTop: 24, color: 'var(--ink-55)', fontSize: 14 }}>
                  <button
                    onClick={() => setAuthOpen(true)}
                    style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 700 }}
                  >
                    Inicia sesión
                  </button>{' '}
                  para dejar una reseña tras tu visita.
                </p>
              )}

              {/* Review list */}
              {reviewsData && reviewsData.reviews.length > 0 ? (
                <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {reviewsData.reviews.map((review: Review) => (
                    <div
                      key={review.id}
                      style={{
                        padding: 20,
                        background: 'var(--surface-3)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-md)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{review.userName}</div>
                          <div style={{ fontSize: 12, color: 'var(--ink-55)' }}>
                            {new Date(review.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <span
                              key={n}
                              className="mat mat-fill"
                              style={{ fontSize: 14, color: n <= review.rating ? 'var(--primary)' : 'var(--ink-20)' }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-80, var(--ink))' }}>{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : reviewsData ? (
                <p style={{ marginTop: 24, color: 'var(--ink-55)', fontSize: 14 }}>
                  {t('restaurantDetail.reviewsVerified')}
                </p>
              ) : (
                <div style={{ marginTop: 24 }}>
                  {[1, 2].map((n) => (
                    <div key={n} className="shimmer" style={{ height: 90, borderRadius: 'var(--r-md)', marginBottom: 12 }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'info' && (
            <div
              key="info"
              className="tab-content"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              {[
                { k: 'address', v: restaurant.address, i: 'location_on' },
                { k: 'phone', v: '+34 912 345 678', i: 'call' },
                { k: 'hours', v: 'Mar a Dom · 13:00 a 16:00 · 20:00 a 23:30', i: 'schedule' },
                { k: 'payment', v: 'Visa · MC · AmEx · Bizum', i: 'credit_card' },
                { k: 'dress', v: 'Smart casual', i: 'checkroom' },
                { k: 'parking', v: 'SER · parking 200m', i: 'local_parking' },
              ].map((x) => (
                <div
                  key={x.k}
                  style={{
                    padding: 20,
                    background: 'var(--surface-3)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                  }}
                >
                  <span className="mat" style={{ color: 'var(--primary)' }}>{x.i}</span>
                  <div className="eyebrow" style={{ marginTop: 10 }}>
                    {t(`restaurantDetail.infoItems.${x.k}`)}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{x.v}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ReservationWidget restaurant={restaurant} onAuthRequired={() => setAuthOpen(true)} />
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      <style>{`
        @media (max-width: 900px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  );
};

export default RestaurantDetails;
