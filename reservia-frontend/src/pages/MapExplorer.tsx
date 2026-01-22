import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import RestaurantCard from '../components/RestaurantCard';

// Fix for default marker icons in Leaflet with React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker for selected restaurant
const activeIcon = L.divIcon({
  className: 'custom-div-icon',
  html: "<div style='background-color:#FF6B00; width:30px; height:30px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center;'><span class='material-symbols-outlined' style='color:white; font-size:18px;'>restaurant</span></div>",
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

// Helper component to center map when selection changes
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  map.setView(center, 15);
  return null;
};

const MapExplorer: React.FC = () => {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const restaurants = [
    { 
      id: '1', 
      name: 'The Golden Fork', 
      cuisine: 'Italian', 
      location: 'Downtown', 
      distance: '0.8 mi', 
      rating: 4.8, 
      priceRange: '$$$',
      coords: [40.4168, -3.7038] as [number, number],
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400'
    },
    { 
      id: '2', 
      name: 'Sakura Gardens', 
      cuisine: 'Japanese', 
      location: 'West End', 
      distance: '2.1 mi', 
      rating: 4.6, 
      priceRange: '$$',
      coords: [40.4233, -3.7121] as [number, number],
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=400'
    },
    { 
      id: '3', 
      name: 'Prime Cuts', 
      cuisine: 'Steakhouse', 
      location: 'Uptown', 
      distance: '1.5 mi', 
      rating: 4.9, 
      priceRange: '$$$$',
      coords: [40.4319, -3.6896] as [number, number],
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=400'
    }
  ];

  const activeRestaurant = restaurants.find(r => r.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-73px)] w-full overflow-hidden bg-slate-50">
      {/* Sidebar List */}
      <div className="w-full md:w-96 h-full overflow-y-auto bg-white border-r border-slate-200 z-10 shadow-xl scrollbar-hide">
        <div className="p-6">
          <h2 className="text-2xl font-black text-navy mb-2">{t('home.topRatedTitle')}</h2>
          <p className="text-slate-500 text-sm mb-6">{restaurants.length} {t('home.topRatedSubtitle')}</p>
          
          <div className="flex flex-col gap-4">
            {restaurants.map((rest) => (
              <button 
                key={rest.id}
                onClick={() => setSelectedId(rest.id)}
                className={`w-full text-left transition-all ${selectedId === rest.id ? 'ring-2 ring-primary rounded-2xl' : ''}`}
                title={rest.name}
              >



                <div className="scale-95 group hover:scale-[0.98] transition-transform">
                    <RestaurantCard {...rest} cuisine={t(`cuisines.${rest.cuisine}`)} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 relative">
        <MapContainer 
          center={[40.4168, -3.7038]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          
          {restaurants.map((rest) => (
            <Marker 
              key={rest.id} 
              position={rest.coords}
              icon={selectedId === rest.id ? activeIcon : DefaultIcon}
              eventHandlers={{
                click: () => setSelectedId(rest.id),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1">
                  <h4 className="font-bold text-navy">{rest.name}</h4>
                  <p className="text-xs text-slate-500">{t(`cuisines.${rest.cuisine}`)} • {rest.priceRange}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {activeRestaurant && <ChangeView center={activeRestaurant.coords} />}
        </MapContainer>

        {/* Floating Category Filter */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex gap-2">
           {['Italian', 'Sushi', 'Steak'].map(cat => (
              <button key={cat} className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-primary hover:text-white transition-all">
                {t(`cuisines.${cat}`)}
              </button>
           ))}
        </div>

      </div>
    </div>
  );
};

export default MapExplorer;
