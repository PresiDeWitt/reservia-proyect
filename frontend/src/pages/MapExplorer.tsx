import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import RestaurantCard from '../components/RestaurantCard';
import { restaurantsApi, type Restaurant } from '../api/restaurants';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const activeIcon = L.divIcon({
  className: 'custom-div-icon',
  html: "<div style='background-color:#f97415; width:30px; height:30px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center;'><span class='material-symbols-outlined' style='color:white; font-size:18px;'>restaurant</span></div>",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  map.setView(center, 15);
  return null;
};

// Fixed Madrid coordinates for each restaurant (deterministic by index)
const COORDS: [number, number][] = [
  [40.4168, -3.7038],
  [40.4200, -3.6950],
  [40.4100, -3.7100],
  [40.4250, -3.6900],
  [40.4050, -3.6980],
  [40.4300, -3.7200],
  [40.4180, -3.7150],
  [40.4080, -3.6850],
  [40.4350, -3.7050],
  [40.4220, -3.7250],
  [40.4140, -3.6820],
  [40.4290, -3.6960],
];

const CUISINE_OPTS = ['Italian', 'Sushi', 'Steak', 'Mexican', 'Burgers', 'Healthy', 'Asian'];

const MapExplorer: React.FC = () => {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [cuisineFilter, setCuisineFilter] = useState('');

  useEffect(() => {
    restaurantsApi.list(cuisineFilter ? { cuisine: cuisineFilter } : undefined)
      .then(data => setRestaurants(data.restaurants))
      .catch(console.error);
  }, [cuisineFilter]);

  const activeRestaurant = restaurants.find(r => r.id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 72px)', overflow: 'hidden', background: 'var(--cream)' }}>
      {/* Filter bar */}
      <div style={{
        padding: '12px 24px', background: 'rgba(248,247,245,0.95)',
        backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)',
        display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
        flexShrink: 0, zIndex: 10,
      }}>
        <span className="editorial" style={{ fontSize: 16, fontWeight: 400, letterSpacing: '-0.02em', marginRight: 8 }}>
          Mapa <span className="italic-accent">de mesas</span>
        </span>
        <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 4px' }} />
        {CUISINE_OPTS.map(c => (
          <button
            key={c}
            onClick={() => setCuisineFilter(cuisineFilter === c ? '' : c)}
            style={{
              height: 30, padding: '0 12px', borderRadius: 999,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid',
              background: cuisineFilter === c ? 'var(--navy)' : '#fff',
              borderColor: cuisineFilter === c ? 'var(--navy)' : 'var(--border)',
              color: cuisineFilter === c ? '#fff' : 'var(--navy)',
              transition: 'all 0.15s',
            }}
          >
            {t(`cuisines.${c}`, { defaultValue: c })}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }} className="map-main">
        {/* Sidebar */}
        <div style={{ width: 380, flexShrink: 0, overflowY: 'auto', background: '#fff', borderRight: '1px solid var(--border)', zIndex: 5 }}>
          <div style={{ padding: '16px 16px 10px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>{restaurants.length} restaurantes</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {restaurants.map((rest, i) => (
              <button
                key={rest.id}
                onClick={() => setSelectedId(rest.id === selectedId ? null : rest.id)}
                style={{
                  width: '100%', padding: '14px 16px',
                  display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left',
                  background: rest.id === selectedId ? 'var(--cream-2)' : 'transparent',
                  borderLeft: rest.id === selectedId ? '3px solid var(--primary)' : '3px solid transparent',
                  border: 'none', borderBottom: '1px solid var(--border)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <img src={rest.image} alt={rest.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rest.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-55)', marginTop: 2 }}>
                    {t(`cuisines.${rest.cuisine}`, { defaultValue: rest.cuisine })} · {rest.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 11, fontVariationSettings: "'FILL' 1" }}>star</span>
                      {rest.rating}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--ink-40)' }}>·</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)' }}>{rest.priceRange}</span>
                  </div>
                </div>
                {rest.id === selectedId && (
                  <a
                    href={`/restaurant/${rest.id}`}
                    onClick={e => e.stopPropagation()}
                    style={{
                      flexShrink: 0, height: 32, padding: '0 12px', borderRadius: 8,
                      background: 'var(--navy)', color: '#fff',
                      fontSize: 11, fontWeight: 700, textDecoration: 'none',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    Ver
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>arrow_forward</span>
                  </a>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer
            center={[40.4168, -3.7038]}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {activeRestaurant && (
              <ChangeView center={COORDS[restaurants.indexOf(activeRestaurant) % COORDS.length]} />
            )}
            {restaurants.map((rest, i) => {
              const coords = COORDS[i % COORDS.length];
              const isActive = rest.id === selectedId;
              return (
                <Marker
                  key={rest.id}
                  position={coords}
                  icon={isActive ? activeIcon : DefaultIcon}
                  eventHandlers={{ click: () => setSelectedId(rest.id === selectedId ? null : rest.id) }}
                >
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <img src={rest.image} alt={rest.name} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)', marginBottom: 3 }}>{rest.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-55)', marginBottom: 8 }}>
                        {t(`cuisines.${rest.cuisine}`, { defaultValue: rest.cuisine })} · {rest.priceRange}
                      </div>
                      <a
                        href={`/restaurant/${rest.id}`}
                        style={{
                          display: 'block', textAlign: 'center',
                          height: 32, lineHeight: '32px',
                          borderRadius: 8, background: 'var(--navy)',
                          color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none',
                        }}
                      >
                        Reservar
                      </a>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .map-main { flex-direction: column !important; }
          .map-main > div:first-child { width: 100% !important; max-height: 240px; }
        }
      `}</style>
    </div>
  );
};

export default MapExplorer;
