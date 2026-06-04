import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  type MapViewport,
} from '@/components/ui/map';
import { useTheme } from '../context/ThemeContext';
import { restaurantsApi, type Restaurant } from '../api/restaurants';

const DEFAULT_CENTER: [number, number] = [-3.5986, 37.1773];
const DEFAULT_ZOOM = 14;

const FALLBACK_CUISINES = ['Italian', 'Japanese', 'Steakhouse', 'Fusion', 'Healthy', 'French'];

function computeCenter(list: Restaurant[]): [number, number] {
  if (list.length === 0) return DEFAULT_CENTER;
  const lngs = list.map((r) => r.coords[1]);
  const lats = list.map((r) => r.coords[0]);
  const cx = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  const cy = (Math.min(...lats) + Math.max(...lats)) / 2;
  if (Number.isNaN(cx) || Number.isNaN(cy)) return DEFAULT_CENTER;
  return [cx, cy];
}

const MapExplorer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [cuisineOptions, setCuisineOptions] = useState<string[]>([]);
  const [loadedCuisine, setLoadedCuisine] = useState<string | undefined>(undefined);

  const [viewport, setViewport] = useState<MapViewport>({
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    bearing: 0,
    pitch: 0,
  });

  const loading = loadedCuisine !== cuisineFilter;

  useEffect(() => {
    restaurantsApi
      .list(cuisineFilter ? { cuisine: cuisineFilter } : undefined)
      .then((data) => {
        const list = data.items;
        setRestaurants(list);

        if (list.length > 0) {
          setCuisineOptions(
            [...new Set(list.map((r) => r.cuisine))].sort(),
          );

          // Auto-select restaurant when arriving via ?restaurant=<id>
          const targetId = searchParams.get('restaurant');
          if (targetId) {
            const target = list.find((r) => String(r.id) === targetId);
            if (target) {
              const numId = Number(target.id);
              setSelectedId(numId);
              setViewport((prev) => ({
                ...prev,
                center: [target.coords[1], target.coords[0]],
                zoom: 17,
              }));
              return;
            }
          }

          if (!cuisineFilter) {
            setViewport((prev) => ({
              ...prev,
              center: computeCenter(list),
              zoom: 14,
            }));
          }
        }
        setLoadedCuisine(cuisineFilter);
      })
      .catch((err) => {
        console.error('Failed to load restaurants:', err);
        setLoadedCuisine(cuisineFilter);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuisineFilter]);

  const handleSelectRestaurant = useCallback(
    (rest: Restaurant) => {
      const id = Number(rest.id);
      const isSelected = id === selectedId;
      setSelectedId(isSelected ? null : id);
      if (!isSelected) {
        setViewport((prev) => ({
          ...prev,
          center: [rest.coords[1], rest.coords[0]],
          zoom: 16,
        }));
      }
    },
    [selectedId],
  );

  const handleViewportChange = useCallback((vp: MapViewport) => {
    setViewport(vp);
  }, []);

  const currentOptions = cuisineOptions.length > 0 ? cuisineOptions : FALLBACK_CUISINES;

  return (
    <div className="gmap-layout">
      {/* Mobile-only floating filter pills at the top */}
      <div className="gmap-mobile-filters show-mobile">
        <div className="gmap-filters-scroll">
          {currentOptions.map((c) => (
            <button
              key={c}
              onClick={() => setCuisineFilter(cuisineFilter === c ? '' : c)}
              style={{
                height: 30,
                padding: '0 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                background: cuisineFilter === c ? 'var(--navy)' : 'var(--surface-3)',
                borderColor: cuisineFilter === c ? 'var(--navy)' : 'var(--border-strong)',
                color: cuisineFilter === c ? '#fff' : 'var(--ink)',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
            >
              {t(`cuisines.${c}`, { defaultValue: c })}
            </button>
          ))}
          {loading && (
            <span style={{ fontSize: 12, color: 'var(--ink-40)', alignSelf: 'center', marginLeft: 8 }}>
              {t('map.loading')}
            </span>
          )}
        </div>
      </div>

      {/* Map (occupies 100% of space) */}
      <div className="gmap-map-wrapper">
        <Map
          theme={theme}
          viewport={viewport}
          onViewportChange={handleViewportChange}
          className="w-full h-full"
        >
          <MapControls showZoom showCompass showFullscreen />

          {restaurants.map((rest) => {
            const lng = rest.coords[1];
            const lat = rest.coords[0];
            const id = Number(rest.id);
            const isActive = id === selectedId;

            return (
              <MapMarker
                key={id}
                longitude={lng}
                latitude={lat}
                onClick={() => handleSelectRestaurant(rest)}
              >
                <MarkerContent>
                  <div
                    style={{
                      width: isActive ? 40 : 32,
                      height: isActive ? 40 : 32,
                      borderRadius: '50%',
                      background: isActive ? 'var(--primary)' : 'var(--navy)',
                      border: `3px solid ${isActive ? '#fff' : 'rgba(255,255,255,0.5)'}`,
                      boxShadow: isActive
                         ? '0 4px 20px rgba(249,116,21,0.6)'
                         : '0 2px 8px rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        color: '#fff',
                        fontSize: isActive ? 20 : 16,
                        fontVariationSettings: "'FILL' 1",
                      }}
                    >
                      restaurant
                    </span>
                  </div>
                </MarkerContent>

                {isActive && (
                  <MarkerPopup>
                    <div
                      style={{
                        background: 'var(--surface-3)',
                        border: '1px solid var(--border)',
                        borderRadius: 16,
                        overflow: 'hidden',
                        minWidth: 200,
                        boxShadow: 'var(--sh-md)',
                      }}
                    >
                      <img
                        src={rest.image}
                        alt={rest.name}
                        style={{ width: '100%', height: 100, objectFit: 'cover' }}
                      />
                      <div style={{ padding: '12px 14px' }}>
                        <div
                          style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 3 }}
                        >
                          {rest.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ink-55)', marginBottom: 10 }}>
                          {t(`cuisines.${rest.cuisine}`, { defaultValue: rest.cuisine })} ·{' '}
                          {rest.priceRange}
                        </div>
                        <button
                          onClick={() => navigate(`/restaurant/${id}`)}
                          style={{
                            width: '100%',
                            height: 34,
                            borderRadius: 8,
                            background: 'var(--navy)',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          {t('map.book')}
                        </button>
                      </div>
                    </div>
                  </MarkerPopup>
                )}
              </MapMarker>
            );
          })}
        </Map>
      </div>

      {/* Google Maps floating sidebar overlay panel */}
      <div className="gmap-sidebar">
        {/* Title, totals, and desktop filters inside the sidebar header */}
        <div className="gmap-sidebar-header">
          <span
            className="editorial"
            style={{ fontSize: 18, fontWeight: 400, letterSpacing: '-0.02em', display: 'block', marginBottom: 12 }}
          >
            {t('map.title')} <span className="italic-accent">{t('map.titleAccent')}</span>
          </span>

          <div className="gmap-filters-scroll">
            {currentOptions.map((c) => (
              <button
                key={c}
                onClick={() => setCuisineFilter(cuisineFilter === c ? '' : c)}
                style={{
                  height: 28,
                  padding: '0 10px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  background: cuisineFilter === c ? 'var(--navy)' : 'transparent',
                  borderColor: cuisineFilter === c ? 'var(--navy)' : 'var(--border-strong)',
                  color: cuisineFilter === c ? '#fff' : 'var(--ink)',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
              >
                {t(`cuisines.${c}`, { defaultValue: c })}
              </button>
            ))}
            {loading && (
              <span style={{ fontSize: 11, color: 'var(--ink-40)', alignSelf: 'center', marginLeft: 8 }}>
                {t('map.loading')}
              </span>
            )}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-55)', marginTop: 12 }}>
            {t('map.restaurantCount', { count: restaurants.length })}
          </div>
        </div>

        {/* List of restaurants (scrolls vertically on desktop, horizontally snaps on mobile) */}
        <div className="gmap-sidebar-list">
          {restaurants.map((rest) => {
            const id = Number(rest.id);
            return (
              <button
                key={id}
                onClick={() => handleSelectRestaurant(rest)}
                className="gmap-restaurant-card"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  textAlign: 'left',
                  background: id === selectedId ? 'var(--primary-glow)' : 'transparent',
                  borderLeft:
                    id === selectedId
                      ? '3px solid var(--primary)'
                      : '3px solid transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <img
                  src={rest.image}
                  alt={rest.name}
                  style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--ink)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {rest.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-55)', marginTop: 2 }}>
                    {t(`cuisines.${rest.cuisine}`, { defaultValue: rest.cuisine })} · {rest.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--primary)',
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 11, fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      {rest.rating}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--ink-40)' }}>·</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>
                      {rest.priceRange}
                    </span>
                  </div>
                </div>
                {id === selectedId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/restaurant/${id}`);
                    }}
                    style={{
                      flexShrink: 0,
                      height: 32,
                      padding: '0 12px',
                      borderRadius: 8,
                      background: 'var(--navy)',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {t('map.view')}
                  </button>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MapExplorer;
