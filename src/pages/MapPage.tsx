import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Compass, ArrowRight, Globe } from 'lucide-react';
import { HERITAGE_ITEMS } from '../data/heritageData';
import { CONTINENTS } from '../data/categories';
import { SafeImage } from '../components/ui/SafeImage';
import type { HeritageItem, HeritageCategorySlug, Continent } from '../types/heritage';

// Helper component to programmatic flyTo coordinates
const MapFlyTo: React.FC<{ coords: [number, number] | null }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 7, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
};

// Custom SVG DivIcon generator
const createCustomPin = (color: string, number: number) => {
  return L.divIcon({
    className: 'custom-heritage-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        border: 2px solid #ffffff;
      ">
        <span style="
          transform: rotate(45deg);
          color: #ffffff;
          font-weight: bold;
          font-size: 11px;
          font-family: sans-serif;
        ">${number}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const CATEGORY_COLORS: Record<HeritageCategorySlug, string> = {
  'ancient-civilizations': '#d4af37',
  'monuments-architecture': '#c85a32',
  'historic-cities': '#0d9488',
  'traditional-crafts': '#0284c7',
  'performing-arts': '#9333ea',
  'languages-literature': '#4f46e5',
  'oral-histories': '#059669',
  'festivals-celebrations': '#f97316',
  'indigenous-knowledge': '#15803d',
  'historical-archives': '#854d0e',
  'food-heritage': '#d97706',
  'maritime-industrial': '#0891b2',
};

export const MapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const slugParam = searchParams.get('slug');

  const [selectedContinent, setSelectedContinent] = useState<Continent | 'all'>('all');
  const [activeItem, setActiveItem] = useState<HeritageItem | null>(null);
  const [flyCoords, setFlyCoords] = useState<[number, number] | null>(null);

  // All items with geographic GPS coordinates
  const mappedItems = useMemo(() => {
    return HERITAGE_ITEMS.filter((item): item is HeritageItem & { coordinates: { lat: number; lng: number } } => {
      return Boolean(item.coordinates && item.coordinates.lat !== undefined && item.coordinates.lng !== undefined);
    });
  }, []);

  const filteredItems = useMemo(() => {
    if (selectedContinent === 'all') return mappedItems;
    return mappedItems.filter((i) => i.continent === selectedContinent);
  }, [mappedItems, selectedContinent]);

  // Handle initial slug URL query
  useEffect(() => {
    if (slugParam) {
      const match = mappedItems.find((i) => i.slug === slugParam);
      if (match) {
        setActiveItem(match);
        setFlyCoords([match.coordinates.lat, match.coordinates.lng]);
      }
    } else if (mappedItems.length > 0 && !activeItem) {
      setActiveItem(mappedItems[0]);
    }
  }, [slugParam, mappedItems]);

  const handleSelectItem = (item: HeritageItem & { coordinates: { lat: number; lng: number } }) => {
    setActiveItem(item);
    setFlyCoords([item.coordinates.lat, item.coordinates.lng]);
  };

  // Worldwide view center by default
  const defaultCenter: [number, number] = [20.0, 10.0];

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-heritage-surface border border-heritage-gold/30 text-xs text-heritage-gold font-semibold uppercase tracking-widest mb-2 shadow-md">
            <Compass className="w-3.5 h-3.5" />
            <span>GIS Global Cultural Cartography</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-white">
            World Cultural Heritage Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-sans">
            Explore archaeological monuments, indigenous sanctuaries, traditional settlements, and living craft traditions across all six continents.
          </p>
        </div>

        {/* Continent Filter Pills */}
        <div className="flex flex-wrap gap-1.5 self-start md:self-end">
          <button
            onClick={() => setSelectedContinent('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedContinent === 'all'
                ? 'bg-heritage-gold text-heritage-darker shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            All Continents ({mappedItems.length})
          </button>
          {CONTINENTS.map((cont) => {
            const count = mappedItems.filter((i) => i.continent === cont.name).length;
            return (
              <button
                key={cont.name}
                onClick={() => setSelectedContinent(cont.name as Continent)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedContinent === cont.name
                    ? 'bg-heritage-gold text-heritage-darker font-bold shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                {cont.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map + Sidebar Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[680px]">
        {/* Left Column: Interactive Leaflet Map (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl overflow-hidden border border-heritage-gold/30 shadow-2xl relative bg-heritage-surface z-0 flex flex-col">
          <MapContainer
            center={defaultCenter}
            zoom={2}
            minZoom={2}
            maxZoom={18}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url={`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${(import.meta as any).env?.VITE_CARTO_API_KEY || 'cb1_5f60_1_79760ad753ff70b0c644d859'}`}
            />

            <MapFlyTo coords={flyCoords} />

            {filteredItems.map((item, idx) => {
              const color = CATEGORY_COLORS[item.category] || '#d4af37';
              const icon = createCustomPin(color, idx + 1);

              return (
                <Marker
                  key={item.id}
                  position={[item.coordinates.lat, item.coordinates.lng]}
                  icon={icon}
                  eventHandlers={{
                    click: () => setActiveItem(item),
                  }}
                >
                  <Popup className="heritage-custom-popup">
                    <div className="p-1 space-y-2 max-w-xs text-slate-900">
                      <div className="w-full h-24 overflow-hidden rounded-lg">
                        <img
                          src={item.primaryImage.src}
                          alt={item.primaryImage.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-amber-700 font-bold uppercase">
                          <span>{item.continent}</span>
                          <span>{item.country}</span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-slate-900 leading-tight mt-0.5">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                          {item.shortDescription}
                        </p>
                      </div>
                      <Link
                        to={`/heritage/${item.slug}`}
                        className="block text-center py-1 rounded bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors"
                      >
                        Open Record →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Map Overlay Badge */}
          <div className="absolute top-4 right-4 z-10 bg-heritage-darker/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-slate-200 pointer-events-none flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Globe className="w-3.5 h-3.5 text-heritage-gold" />
            <span>{filteredItems.length} Mapped Heritage Sites</span>
          </div>
        </div>

        {/* Right Column: Synced Sites List & Active Inspector (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full">
          {/* Active Highlight Card */}
          {activeItem && (
            <div className="bg-heritage-surface border border-heritage-gold/40 rounded-2xl p-5 shadow-xl space-y-3 flex-shrink-0">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="uppercase font-bold text-heritage-gold text-[10px] flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>{activeItem.continent} • {activeItem.country}</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {activeItem.coordinates ? `${activeItem.coordinates.lat.toFixed(2)}°, ${activeItem.coordinates.lng.toFixed(2)}°` : ''}
                </span>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                  <SafeImage
                    src={activeItem.primaryImage.src}
                    alt={activeItem.primaryImage.alt}
                    title={activeItem.title}
                    categoryBadge={activeItem.category}
                    country={activeItem.country}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <h3 className="font-serif font-bold text-base text-white truncate">
                    {activeItem.title}
                  </h3>
                  <p className="text-xs text-heritage-gold flex items-center gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{activeItem.region}, {activeItem.country}</span>
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2">
                {activeItem.shortDescription}
              </p>

              <Link
                to={`/heritage/${activeItem.slug}`}
                className="w-full py-2 rounded-xl bg-heritage-gold text-heritage-darker font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-heritage-gold-light transition-colors"
                data-cursor="link"
              >
                <span>Read Full Cultural Record</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Scrollable Sites Explorer */}
          <div className="bg-heritage-surface/80 border border-white/10 rounded-2xl p-4 shadow-lg flex-1 flex flex-col overflow-hidden">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">
              Documented Global Sites ({filteredItems.length})
            </span>

            <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {filteredItems.map((item, idx) => {
                const isSelected = activeItem?.id === item.id;
                const color = CATEGORY_COLORS[item.category] || '#d4af37';

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-heritage-gold/15 border-heritage-gold text-white shadow-md'
                        : 'bg-black/30 border-white/5 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {item.region}, {item.country} ({item.continent})
                        </span>
                      </div>
                    </div>

                    <Navigation className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-heritage-gold' : 'text-slate-500'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
