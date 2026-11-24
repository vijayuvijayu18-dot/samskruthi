import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Compass,
  MapPin,
  Search,
  Navigation,
  X,
  ExternalLink,
  Bookmark,
  Share2,
  Calendar,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  LocateFixed,
  RotateCcw,
  Maximize2,
  Minimize2,
  Crosshair,
  SlidersHorizontal,
  ChevronDown,
  SidebarClose,
  SidebarOpen,
} from 'lucide-react';
import { apiService, type HeritagePlace } from '../../../services/api';
import { LocationPermissionModal } from '../LocationPermissionModal';

// ==========================================
// 1. GEODETIC HAVERSINE FORMULA
// ==========================================
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// ==========================================
// 2. CATEGORIES, CONTINENTS & RADIUS OPTIONS
// ==========================================
interface CategoryMeta {
  id: string;
  name: string;
  color: string;
  iconSymbol: string;
}

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  all: { id: 'all', name: 'All Treasures', color: '#d4af37', iconSymbol: '' },
  'monuments-architecture': { id: 'monuments-architecture', name: 'Monuments', color: '#c85a32', iconSymbol: '' },
  'ancient-temples': { id: 'ancient-temples', name: 'Temples', color: '#d4af37', iconSymbol: '' },
  'forts-palaces': { id: 'forts-palaces', name: 'Forts & Palaces', color: '#b45309', iconSymbol: '' },
  'ancient-civilizations': { id: 'ancient-civilizations', name: 'Ancient Eras', color: '#eab308', iconSymbol: '' },
  'historic-cities': { id: 'historic-cities', name: 'Historic Cities', color: '#0d9488', iconSymbol: '' },
  'traditional-crafts': { id: 'traditional-crafts', name: 'Crafts', color: '#0284c7', iconSymbol: '' },
  'performing-arts': { id: 'performing-arts', name: 'Dance & Music', color: '#9333ea', iconSymbol: '' },
  'festivals-celebrations': { id: 'festivals-celebrations', name: 'Festivals', color: '#f97316', iconSymbol: '' },
  'cultural-traditions': { id: 'cultural-traditions', name: 'Cultural Traditions', color: '#15803d', iconSymbol: '' },
  'food-heritage': { id: 'food-heritage', name: 'Food Heritage', color: '#d97706', iconSymbol: '' },
};

const CONTINENT_OPTIONS = [
  { id: 'all', label: 'All Continents' },
  { id: 'Asia', label: 'Asia' },
  { id: 'Europe', label: 'Europe' },
  { id: 'Africa', label: 'Africa' },
  { id: 'North America', label: 'North America' },
  { id: 'South America', label: 'South America' },
  { id: 'Oceania', label: 'Oceania' },
];

const CONTINENT_BOUNDS: Record<string, [[number, number], [number, number]]> = {
  all: [[-50, -130], [65, 150]],
  Asia: [[3, 60], [45, 142]],
  Europe: [[34, -12], [58, 35]],
  Africa: [[-35, -20], [35, 52]],
  'North America': [[14, -125], [55, -65]],
  'South America': [[-55, -82], [12, -34]],
  Oceania: [[-46, 110], [-10, 180]],
};

const DISTANCE_OPTIONS = [
  { id: 0, label: 'Worldwide' },
  { id: 5, label: 'Within 5 km' },
  { id: 10, label: 'Within 10 km' },
  { id: 25, label: 'Within 25 km' },
  { id: 50, label: 'Within 50 km' },
  { id: 100, label: 'Within 100 km' },
  { id: 250, label: 'Within 250 km' },
  { id: 500, label: 'Within 500 km' },
];

const CARTO_API_KEY = (import.meta as any).env?.VITE_CARTO_API_KEY || 'cb1_5f60_1_79760ad753ff70b0c644d859';

const MAP_LAYERS = [
  {
    id: 'carto-voyager',
    name: 'Standard Map',
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    id: 'esri-satellite',
    name: 'Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
  },
  {
    id: 'esri-topo',
    name: 'Terrain Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, USGS, NOAA',
  },
];

// ==========================================
// 3. CACHED LEAFLET ICONS (HIGH PERFORMANCE)
// ==========================================
const pinIconCache: Record<string, L.DivIcon> = {};
function getHeritagePin(category: string, isSelected: boolean): L.DivIcon {
  const key = `${category}_${isSelected ? '1' : '0'}`;
  if (!pinIconCache[key]) {
    const meta = CATEGORY_MAP[category] || CATEGORY_MAP.all;
    const size = isSelected ? 34 : 26;
    pinIconCache[key] = L.divIcon({
      className: 'custom-heritage-pin',
      html: `
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
          background: ${meta.color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
          border: 2px solid #ffffff;
          ${isSelected ? 'transform: rotate(-45deg) scale(1.2); border-color: #fef08a; box-shadow: 0 0 12px rgba(245, 158, 11, 0.9);' : ''}
        ">
          <span style="
            transform: rotate(45deg);
            font-size: ${isSelected ? '13px' : '10px'};
            line-height: 1;
          ">${meta.iconSymbol}</span>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    });
  }
  return pinIconCache[key];
}

const clusterIconCache: Record<number, L.DivIcon> = {};
function getClusterIcon(count: number): L.DivIcon {
  if (!clusterIconCache[count]) {
    const size = count > 10 ? 38 : count > 5 ? 32 : 28;
    clusterIconCache[count] = L.divIcon({
      className: 'heritage-cluster-pin',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: #996515;
          border: 2px solid #ffffff;
          box-shadow: 0 3px 10px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <span style="
            color: #ffffff;
            font-family: Inter, sans-serif;
            font-weight: 800;
            font-size: ${count > 99 ? '10px' : '12px'};
            letter-spacing: -0.5px;
          ">${count}</span>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }
  return clusterIconCache[count];
}

let userBeaconIcon: L.DivIcon | null = null;
function getUserLocationBeacon(): L.DivIcon {
  if (!userBeaconIcon) {
    userBeaconIcon = L.divIcon({
      className: 'user-location-beacon',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: grab;">
          <div style="
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #0284c7;
            border: 3px solid #ffffff;
            box-shadow: 0 0 12px rgba(2, 132, 199, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }
  return userBeaconIcon;
}

// ==========================================
// 4. MAP LIFECYCLE CONTROLLERS
// ==========================================
const MapResizeAndLifecycleHandler: React.FC<{ isFullscreen?: boolean; isSidebarOpen?: boolean }> = ({
  isFullscreen,
  isSidebarOpen,
}) => {
  const map = useMap();

  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize({ animate: false }), 100);
    const t2 = setTimeout(() => map.invalidateSize({ animate: false }), 350);

    const handleResize = () => {
      map.invalidateSize({ animate: false });
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
    };
  }, [map, isFullscreen, isSidebarOpen]);

  return null;
};

const MapController: React.FC<{
  flyTarget: { coords: [number, number]; zoom?: number } | null;
  fitBoundsTarget: [[number, number], [number, number]] | null;
  onMapZoomChange: (zoom: number) => void;
  isPinningLocation: boolean;
  onSetLocationFromMap: (coords: [number, number]) => void;
}> = ({ flyTarget, fitBoundsTarget, onMapZoomChange, isPinningLocation, onSetLocationFromMap }) => {
  const map = useMap();

  useMapEvents({
    zoomend: () => {
      onMapZoomChange(map.getZoom());
    },
    click: (e) => {
      if (isPinningLocation) {
        onSetLocationFromMap([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  useEffect(() => {
    if (flyTarget) {
      map.flyTo(flyTarget.coords, flyTarget.zoom || 8, {
        duration: 1.0,
        easeLinearity: 0.25,
      });
    }
  }, [flyTarget, map]);

  useEffect(() => {
    if (fitBoundsTarget) {
      map.fitBounds(fitBoundsTarget, {
        padding: [25, 25],
        maxZoom: 9,
        duration: 1.0,
      });
    }
  }, [fitBoundsTarget, map]);

  return null;
};

// ==========================================
// 5. MAIN HERITAGE MAP TAB COMPONENT
// ==========================================
export const HeritageMapTab: React.FC = () => {
  // Places & Directory State
  const [places, setPlaces] = useState<HeritagePlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<HeritagePlace | null>(null);

  // Filter States
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeContinent, setActiveContinent] = useState('all');
  const [selectedDistanceRadius, setSelectedDistanceRadius] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Map display settings
  const [activeMapLayer, setActiveMapLayer] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showLayersMenu, setShowLayersMenu] = useState(false);

  // Map viewport & Zoom
  const [currentZoom, setCurrentZoom] = useState(3);
  const [flyTarget, setFlyTarget] = useState<{ coords: [number, number]; zoom?: number } | null>(null);
  const [fitBoundsTarget, setFitBoundsTarget] = useState<[[number, number], [number, number]] | null>(null);

  // User Geolocation State
  // IMPORTANT: Filter out any stale ±2000m city-center preset from earlier testing
  const [userLocation, setUserLocation] = useState<{
    coords: [number, number];
    accuracy: number;
    isApproximate?: boolean;
    isCityCenter?: boolean;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('samskruthi_user_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.coords && parsed.accuracy !== 2000) {
          return {
            coords: parsed.coords,
            accuracy: parsed.accuracy ?? 25,
            isApproximate: parsed.accuracy > 150,
            isCityCenter: parsed.isCityCenter || false,
          };
        }
      }
    } catch {}
    return null;
  });

  const [userLocationAddress, setUserLocationAddress] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('samskruthi_user_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.address && parsed.accuracy !== 2000) return parsed.address;
      }
    } catch {}
    return '';
  });

  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsErrorFeedback, setGpsErrorFeedback] = useState<string | null>(null);
  const [isPinningLocation, setIsPinningLocation] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Dossier details state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [showDirectionsMenu, setShowDirectionsMenu] = useState(false);

  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const locationMenuRef = useRef<HTMLDivElement | null>(null);
  const layersMenuRef = useRef<HTMLDivElement | null>(null);

  // Handle Fullscreen Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        setShowLocationMenu(false);
        setShowLayersMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationMenuRef.current && !locationMenuRef.current.contains(e.target as Node)) {
        setShowLocationMenu(false);
      }
      if (layersMenuRef.current && !layersMenuRef.current.contains(e.target as Node)) {
        setShowLayersMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Fetch Heritage Places from backend
  useEffect(() => {
    loadPlaces();
  }, [activeCategory, activeContinent]);

  const loadPlaces = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      if (activeContinent !== 'all') params.continent = activeContinent;
      const data = await apiService.getPlaces(params);
      setPlaces(data);
    } catch (err) {
      console.warn('Failed to load places from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen to global location updates
  useEffect(() => {
    const handleLocationUpdated = (e: any) => {
      const loc = e.detail;
      if (loc && loc.coords) {
        setUserLocation({
          coords: loc.coords,
          accuracy: loc.accuracy,
          isApproximate: loc.accuracy > 150,
          isCityCenter: loc.isCityCenter || false,
        });
        setUserLocationAddress(loc.address || '');
        setFlyTarget({ coords: loc.coords, zoom: loc.accuracy < 100 ? 14 : loc.accuracy < 1000 ? 12 : 10 });
      }
    };
    window.addEventListener('samskruthi:location_updated', handleLocationUpdated);
    return () => window.removeEventListener('samskruthi:location_updated', handleLocationUpdated);
  }, []);

  // Reverse geocode coordinate into concise address
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`,
        {
          headers: {
            'User-Agent': 'SamskruthiHeritageApp/1.0 (contact@samskruthi.org)',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const concise = [
            addr.suburb || addr.neighbourhood || addr.village || addr.road,
            addr.city || addr.town || addr.county || addr.district,
            addr.state || addr.country,
          ]
            .filter(Boolean)
            .join(', ');
          setUserLocationAddress(concise || data.display_name.split(',').slice(0, 3).join(','));
        }
      }
    } catch (err) {
      console.warn('Reverse geocode error:', err);
    }
  };

  // High-accuracy device GPS handler (Automatic 1-Click Detection)
  const handleDetectGps = () => {
    setIsLocatingGps(true);
    setGpsErrorFeedback(null);
    setShowLocationMenu(false);

    if (!('geolocation' in navigator)) {
      setIsLocatingGps(false);
      setGpsErrorFeedback('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);
        const coords: [number, number] = [lat, lng];

        const locData = {
          coords,
          accuracy,
          isApproximate: accuracy > 200,
          isCityCenter: false,
        };

        // Automatically set user location and fly to it immediately
        setUserLocation(locData);
        setFlyTarget({ coords, zoom: accuracy < 200 ? 15 : accuracy < 2000 ? 13 : 11 });
        setIsLocatingGps(false);

        try {
          localStorage.setItem(
            'samskruthi_user_location',
            JSON.stringify({ coords, accuracy, address: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E` })
          );
          localStorage.setItem('samskruthi_location_prompted', 'true');
        } catch {}

        await reverseGeocode(lat, lng);
      },
      (err) => {
        setIsLocatingGps(false);
        if (err.code === 1) {
          setGpsErrorFeedback('Location access was denied. Please allow location access in your browser address bar.');
        } else if (err.code === 2) {
          setGpsErrorFeedback('Device location is currently unavailable.');
        } else {
          setGpsErrorFeedback('Location request timed out. Please click Current Location again.');
        }
        setTimeout(() => setGpsErrorFeedback(null), 6000);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  // Auto-detect location on tab load if permission is already granted
  useEffect(() => {
    if (!userLocation && typeof navigator !== 'undefined' && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          if (result.state === 'granted') {
            handleDetectGps();
          }
        })
        .catch(() => {});
    }
  }, []);

  // Handle click on map to pin spot
  const handleSetLocationFromMap = (coords: [number, number]) => {
    const locData = { coords, accuracy: 10, isApproximate: false, isCityCenter: false };
    setUserLocation(locData);
    setIsPinningLocation(false);
    try {
      localStorage.setItem('samskruthi_user_location', JSON.stringify({ coords, accuracy: 10, address: userLocationAddress }));
    } catch {}
    reverseGeocode(coords[0], coords[1]);
  };

  // Continent selector handler
  const handleContinentSelect = (continent: string) => {
    setActiveContinent(continent);
    setSelectedPlace(null);
    const bounds = CONTINENT_BOUNDS[continent] || CONTINENT_BOUNDS.all;
    setFitBoundsTarget(bounds);
  };

  // Clear all filters
  const handleResetFilters = () => {
    setActiveCategory('all');
    setActiveContinent('all');
    setSelectedDistanceRadius(0);
    setSearchQuery('');
    setFitBoundsTarget(CONTINENT_BOUNDS.all);
  };

  // Clear saved user location
  const handleClearLocation = () => {
    setUserLocation(null);
    setUserLocationAddress('');
    setSelectedDistanceRadius(0);
    setShowLocationMenu(false);
    try {
      localStorage.removeItem('samskruthi_user_location');
    } catch {}
  };

  // Processed Places
  const processedPlaces = useMemo(() => {
    const withDistances = places.map((place) => {
      let distanceKm: number | undefined;
      if (userLocation) {
        distanceKm = calculateHaversineDistance(
          userLocation.coords[0],
          userLocation.coords[1],
          place.latitude,
          place.longitude
        );
      }
      return {
        ...place,
        distanceKm,
      };
    });

    let filtered = withDistances;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.country?.toLowerCase().includes(q) ||
          p.state?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.architecturalStyle.toLowerCase().includes(q)
      );
    }

    if (userLocation && selectedDistanceRadius > 0) {
      filtered = filtered.filter(
        (p) => p.distanceKm !== undefined && p.distanceKm <= selectedDistanceRadius
      );
    }

    filtered.sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      return (a.country || '').localeCompare(b.country || '') || a.name.localeCompare(b.name);
    });

    return filtered;
  }, [places, userLocation, searchQuery, selectedDistanceRadius]);

  const nearestOverallPlace = useMemo(() => {
    if (!userLocation || places.length === 0) return null;
    let minPlace: (HeritagePlace & { distanceKm: number }) | null = null;
    for (const p of places) {
      const dist = calculateHaversineDistance(
        userLocation.coords[0],
        userLocation.coords[1],
        p.latitude,
        p.longitude
      );
      if (!minPlace || dist < minPlace.distanceKm) {
        minPlace = { ...p, distanceKm: dist };
      }
    }
    return minPlace;
  }, [userLocation, places]);

  // Spatial clustering
  const clustersAndSingles = useMemo(() => {
    if (currentZoom >= 7) {
      return { clusters: [], singles: processedPlaces };
    }

    const gridSize = currentZoom <= 3 ? 14 : currentZoom <= 4 ? 8 : currentZoom <= 5 ? 4.5 : 2.5;
    const grid: Record<string, HeritagePlace[]> = {};

    processedPlaces.forEach((p) => {
      const gx = Math.floor(p.longitude / gridSize);
      const gy = Math.floor(p.latitude / gridSize);
      const key = `${gx}_${gy}`;
      if (!grid[key]) grid[key] = [];
      grid[key].push(p);
    });

    const clusters: Array<{
      id: string;
      center: [number, number];
      bounds: [[number, number], [number, number]];
      items: HeritagePlace[];
    }> = [];
    const singles: HeritagePlace[] = [];

    Object.values(grid).forEach((group, idx) => {
      if (group.length > 1) {
        let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
        let sumLat = 0, sumLng = 0;
        group.forEach((p) => {
          sumLat += p.latitude;
          sumLng += p.longitude;
          if (p.latitude < minLat) minLat = p.latitude;
          if (p.latitude > maxLat) maxLat = p.latitude;
          if (p.longitude < minLng) minLng = p.longitude;
          if (p.longitude > maxLng) maxLng = p.longitude;
        });

        clusters.push({
          id: `cluster-${idx}`,
          center: [sumLat / group.length, sumLng / group.length],
          bounds: [
            [minLat - 0.2, minLng - 0.2],
            [maxLat + 0.2, maxLng + 0.2],
          ],
          items: group,
        });
      } else if (group.length === 1) {
        singles.push(group[0]);
      }
    });

    return { clusters, singles };
  }, [processedPlaces, currentZoom]);

  // Handle Place Selection: Safe zoom and popup
  const handlePlaceSelect = useCallback((place: HeritagePlace) => {
    setSelectedPlace(place);
    setIsBookmarked(false);
    setShareFeedback(false);
    setShowDirectionsMenu(false);

    setFlyTarget({ coords: [place.latitude, place.longitude], zoom: Math.max(currentZoom, 11) });

    // Safely trigger popup after zoom animation completes
    setTimeout(() => {
      const marker = markerRefs.current[place.id];
      if (marker && (marker as any)._map) {
        try {
          marker.openPopup();
        } catch {}
      }
    }, 400);
  }, [currentZoom]);

  const handleBookmarkToggle = async () => {
    if (!selectedPlace) return;
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    try {
      await apiService.toggleBookmark(selectedPlace.id);
    } catch {
      setIsBookmarked(!nextState);
    }
  };

  const handleShare = async () => {
    if (!selectedPlace) return;
    const shareText = `${selectedPlace.name} (${selectedPlace.country}) — ${selectedPlace.description}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Samskruthi | ${selectedPlace.name}`,
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {}
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${selectedPlace.name} - ${window.location.href}`);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2000);
    }
  };

  const getDirectionsUrl = (provider: 'google' | 'apple' | 'osm') => {
    if (!selectedPlace) return '#';
    const destLat = selectedPlace.latitude;
    const destLng = selectedPlace.longitude;
    const destName = encodeURIComponent(selectedPlace.name);

    if (provider === 'google') {
      return userLocation
        ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.coords[0]},${userLocation.coords[1]}&destination=${destLat},${destLng}`
        : `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`;
    }
    if (provider === 'apple') {
      return `https://maps.apple.com/?daddr=${destLat},${destLng}&q=${destName}`;
    }
    if (provider === 'osm') {
      return userLocation
        ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.coords[0]}%2C${userLocation.coords[1]}%3B${destLat}%2C${destLng}`
        : `https://www.openstreetmap.org/?mlat=${destLat}&mlon=${destLng}#map=12/${destLat}/${destLng}`;
    }
    return '#';
  };

  const hasActiveFilters =
    activeCategory !== 'all' ||
    activeContinent !== 'all' ||
    selectedDistanceRadius > 0 ||
    searchQuery.trim().length > 0;

  return (
    <div
      className={`flex flex-col text-left transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-[99999] w-screen h-screen rounded-none border-none shadow-none bg-[#fcfaf6]'
          : 'w-full h-full min-h-0 rounded-2xl overflow-hidden border border-[#e8dfd3] shadow-md relative bg-[#fcfaf6]'
      }`}
    >
      {/* ============================================================== */}
      {/* 1. PROFESSIONAL COMPACT TOOLBAR (HEIGHT ~46px)                 */}
      {/* ============================================================== */}
      <div className="px-3.5 py-2 bg-[#fcfaf6] border-b border-[#e8dfd3] flex items-center justify-between gap-2 z-20 flex-shrink-0">
        {/* Left: Brand Icon & Title */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Compass className="w-5 h-5 text-[#996515] flex-shrink-0" />
          <div className="flex items-center gap-1.5">
            <h2 className="font-serif font-bold text-sm md:text-base text-[#241a12] leading-none">
              Heritage Atlas
            </h2>
            <span className="text-xs font-sans font-semibold bg-[#f2ebd9] text-[#7d5314] px-1.5 py-0.5 rounded border border-[#c5a059]/30">
              {processedPlaces.length}
            </span>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="relative flex-1 max-w-xs md:max-w-sm min-w-[130px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search monuments, cities..."
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-white border border-[#e8dfd3] text-stone-900 text-xs focus:outline-none focus:border-[#996515] shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Right: Primary Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Automatic Current Location Button */}
          <button
            onClick={handleDetectGps}
            disabled={isLocatingGps}
            className="px-3 py-1.5 rounded-lg text-xs font-sans font-semibold bg-[#241a12] text-[#e6ca85] hover:bg-[#38281b] border border-[#c5a059]/40 flex items-center gap-1.5 transition-all shadow-xs"
            title="Auto-detect current location"
          >
            <LocateFixed className={`w-3.5 h-3.5 text-[#d4af37] ${isLocatingGps ? 'animate-spin' : ''}`} />
            <span>{isLocatingGps ? 'Detecting...' : 'Current Location'}</span>
          </button>

          {/* Location Dropdown Menu */}
          <div className="relative" ref={locationMenuRef}>
            <button
              onClick={() => setShowLocationMenu((prev) => !prev)}
              className={`px-2 py-1.5 rounded-lg text-xs font-sans font-medium flex items-center gap-1 transition-all border ${
                userLocation
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-[#f4efe6] text-stone-700 hover:bg-[#ebe3d4] border-[#e2d6c3]'
              }`}
              title="Location options: Search PIN, Pin on Map, Hubs"
            >
              <MapPin className={`w-3.5 h-3.5 ${userLocation ? 'text-emerald-700' : 'text-[#996515]'}`} />
              <span className="truncate max-w-[110px] sm:max-w-[140px] font-semibold text-[11px]">
                {userLocationAddress || (userLocation ? 'Location Set' : 'Location')}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showLocationMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-[#e8dfd3] rounded-xl shadow-xl p-2 z-30 space-y-1 text-xs">
                <button
                  onClick={handleDetectGps}
                  disabled={isLocatingGps}
                  className="w-full px-3 py-2 rounded-lg text-stone-800 hover:bg-[#f6f1e8] flex items-center gap-2 text-left font-medium transition-colors"
                >
                  <LocateFixed className="w-4 h-4 text-[#996515]" />
                  <div>
                    <div className="font-semibold text-[#241a12]">Auto-Detect Device GPS</div>
                    <div className="text-[10px] text-stone-500">Live high-precision geolocation</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowLocationMenu(false);
                    setShowLocationModal(true);
                  }}
                  className="w-full px-3 py-2 rounded-lg text-stone-800 hover:bg-[#f6f1e8] flex items-center gap-2 text-left font-medium transition-colors"
                >
                  <Search className="w-4 h-4 text-[#996515]" />
                  <div>
                    <div className="font-semibold text-[#241a12]">Search PIN Code / City</div>
                    <div className="text-[10px] text-stone-500">Search 6-digit PIN or city hub</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowLocationMenu(false);
                    setIsPinningLocation(true);
                  }}
                  className="w-full px-3 py-2 rounded-lg text-stone-800 hover:bg-[#f6f1e8] flex items-center gap-2 text-left font-medium transition-colors"
                >
                  <Crosshair className="w-4 h-4 text-[#996515]" />
                  <div>
                    <div className="font-semibold text-[#241a12]">Pin on Map</div>
                    <div className="text-[10px] text-stone-500">Click anywhere on the map</div>
                  </div>
                </button>

                {userLocation && (
                  <div className="pt-1 border-t border-stone-200">
                    <button
                      onClick={handleClearLocation}
                      className="w-full px-3 py-1.5 rounded-lg text-rose-700 hover:bg-rose-50 flex items-center gap-2 text-left font-medium transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Clear Location</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map Layer Switcher */}
          <div className="relative" ref={layersMenuRef}>
            <button
              onClick={() => setShowLayersMenu((prev) => !prev)}
              className="px-2 py-1.5 rounded-lg text-xs font-sans font-medium bg-[#f4efe6] text-stone-700 hover:bg-[#ebe3d4] border border-[#e2d6c3] flex items-center gap-1 transition-colors"
              title="Change Map Tile Layer"
            >
              <Layers className="w-3.5 h-3.5 text-[#996515]" />
              <span className="hidden md:inline font-semibold text-[11px]">{MAP_LAYERS[activeMapLayer].name}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showLayersMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-40 bg-white border border-[#e8dfd3] rounded-xl shadow-xl p-1.5 z-30 space-y-0.5 text-xs">
                {MAP_LAYERS.map((layer, idx) => (
                  <button
                    key={layer.id}
                    onClick={() => {
                      setActiveMapLayer(idx);
                      setShowLayersMenu(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between font-medium transition-colors ${
                      activeMapLayer === idx
                        ? 'bg-[#241a12] text-[#e6ca85] font-semibold'
                        : 'text-stone-700 hover:bg-[#f6f1e8]'
                    }`}
                  >
                    <span>{layer.name}</span>
                    {activeMapLayer === idx && <span className="text-[#d4af37]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset World View */}
          <button
            onClick={() => handleContinentSelect('all')}
            className="p-1.5 rounded-lg bg-[#f4efe6] text-stone-700 hover:bg-[#ebe3d4] border border-[#e2d6c3] transition-colors"
            title="Reset to Worldwide View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
          </button>

          {/* Full Screen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`px-2 py-1.5 rounded-lg text-xs font-sans font-semibold flex items-center gap-1 transition-all shadow-xs border ${
              isFullscreen
                ? 'bg-[#c5a059] text-[#16100c] border-amber-300'
                : 'bg-[#241a12] text-[#e6ca85] hover:bg-[#38281b] border-[#c5a059]/40'
            }`}
            title={isFullscreen ? 'Exit Full Screen (Esc)' : 'Expand Map to Full Screen'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Full</span>
              </>
            )}
          </button>

          {/* Toggle Directory Panel */}
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isSidebarOpen
                ? 'bg-[#f4efe6] text-stone-700 hover:bg-[#ebe3d4] border-[#e2d6c3]'
                : 'bg-[#241a12] text-[#d4af37] border-[#c5a059]/40'
            }`}
            title={isSidebarOpen ? 'Collapse Directory (Maximize Map)' : 'Show Directory'}
          >
            {isSidebarOpen ? <SidebarClose className="w-3.5 h-3.5" /> : <SidebarOpen className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. COMPACT SINGLE-ROW FILTER STRIP (HEIGHT ~36px)             */}
      {/* ============================================================== */}
      <div className="px-3 py-1.5 bg-[#f6f1e8] border-b border-[#e8dfd3] flex items-center justify-between gap-2 z-10 flex-shrink-0 text-xs flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 py-0.5">
          <div className="flex items-center gap-1 text-stone-500 font-semibold text-[11px] flex-shrink-0">
            <SlidersHorizontal className="w-3 h-3 text-[#996515]" />
            <span className="hidden md:inline">Filters:</span>
          </div>

          {/* Region Dropdown */}
          <select
            value={activeContinent}
            onChange={(e) => handleContinentSelect(e.target.value)}
            className="px-2 py-1 rounded-lg bg-white border border-[#e2d6c3] text-stone-800 text-[11px] font-medium focus:outline-none focus:border-[#996515] cursor-pointer shadow-xs flex-shrink-0"
          >
            {CONTINENT_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Category Dropdown */}
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="px-2 py-1 rounded-lg bg-white border border-[#e2d6c3] text-stone-800 text-[11px] font-medium focus:outline-none focus:border-[#996515] cursor-pointer shadow-xs flex-shrink-0"
          >
            {Object.values(CATEGORY_MAP).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Distance Radius Dropdown */}
          <select
            value={selectedDistanceRadius}
            onChange={(e) => setSelectedDistanceRadius(Number(e.target.value))}
            disabled={!userLocation}
            className={`px-2 py-1 rounded-lg border text-[11px] font-medium focus:outline-none focus:border-[#996515] cursor-pointer shadow-xs flex-shrink-0 ${
              userLocation
                ? selectedDistanceRadius > 0
                  ? 'bg-[#241a12] text-[#e6ca85] font-semibold border-[#c5a059]'
                  : 'bg-white border-[#e2d6c3] text-stone-800'
                : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
            }`}
            title={userLocation ? 'Filter by distance radius' : 'Set location to filter by distance'}
          >
            {DISTANCE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-2 py-1 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-700 text-[10px] font-semibold flex items-center gap-1 flex-shrink-0 transition-colors"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Location Status Pill with single-click clear */}
        {userLocation && (
          <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
            <span className="px-2.5 py-0.5 rounded-md font-medium flex items-center gap-1 border bg-emerald-50 text-emerald-900 border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                {userLocation.coords[0].toFixed(4)}°N, {userLocation.coords[1].toFixed(4)}°E (±{userLocation.accuracy}m)
              </span>
            </span>
            <button
              onClick={handleClearLocation}
              className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200"
              title="Clear Location"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Pin Location Helper */}
      {isPinningLocation && (
        <div className="px-4 py-1.5 bg-amber-500 text-stone-900 text-xs font-bold flex items-center justify-between z-20 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 animate-spin" />
            <span>Click any exact point on the map to pin your location!</span>
          </div>
          <button
            onClick={() => setIsPinningLocation(false)}
            className="px-2.5 py-0.5 bg-black/20 hover:bg-black/30 rounded text-stone-900 text-xs font-semibold"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Error Feedback */}
      {gpsErrorFeedback && (
        <div className="px-4 py-1.5 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between z-20 flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
            <span>{gpsErrorFeedback}</span>
          </div>
          <button onClick={() => setGpsErrorFeedback(null)} className="text-rose-600 hover:text-rose-900">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MAIN WORKSPACE: MAP CANVAS + HERITAGE DIRECTORY SIDEBAR     */}
      {/* ============================================================== */}
      <div className="flex-1 flex relative overflow-hidden min-h-0 h-full">
        {/* LEAFLET MAP CANVAS */}
        <div className={`flex-1 h-full min-h-0 z-0 relative ${isPinningLocation ? 'cursor-crosshair' : ''}`}>
          <MapContainer
            center={userLocation ? userLocation.coords : [22, 15]}
            zoom={userLocation ? 10 : 3}
            minZoom={2}
            maxZoom={18}
            worldCopyJump={false}
            style={{ height: '100%', width: '100%', backgroundColor: '#f7f2ea' }}
            className="w-full h-full"
            scrollWheelZoom={true}
            doubleClickZoom={true}
            touchZoom={true}
            dragging={true}
            maxBounds={[[-85, -180], [85, 180]]}
            maxBoundsViscosity={0.8}
          >
            <TileLayer
              key={MAP_LAYERS[activeMapLayer].id}
              attribution={MAP_LAYERS[activeMapLayer].attribution}
              url={MAP_LAYERS[activeMapLayer].url}
            />

            {/* Lifecycle handlers */}
            <MapResizeAndLifecycleHandler isFullscreen={isFullscreen} isSidebarOpen={isSidebarOpen} />
            <MapController
              flyTarget={flyTarget}
              fitBoundsTarget={fitBoundsTarget}
              onMapZoomChange={(z) => setCurrentZoom(z)}
              isPinningLocation={isPinningLocation}
              onSetLocationFromMap={handleSetLocationFromMap}
            />

            {/* User Location Beacon & Accuracy Ring */}
            {userLocation && (
              <>
                <Marker
                  position={userLocation.coords}
                  icon={getUserLocationBeacon()}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const marker = e.target;
                      const position = marker.getLatLng();
                      const newCoords: [number, number] = [position.lat, position.lng];
                      setUserLocation({
                        coords: newCoords,
                        accuracy: 10,
                        isApproximate: false,
                        isCityCenter: false,
                      });
                      reverseGeocode(newCoords[0], newCoords[1]);
                    },
                  }}
                >
                  <Popup autoPan={false}>
                    <div className="p-1 text-xs text-left max-w-[220px]">
                      <p className="font-bold text-[#0284c7] flex items-center gap-1 text-sm">
                        <span>📍 Your Location</span>
                      </p>
                      <p className="text-xs text-stone-800 font-semibold mt-1 leading-snug">
                        {userLocationAddress || `${userLocation.coords[0].toFixed(4)}°N, ${userLocation.coords[1].toFixed(4)}°E`}
                      </p>
                      <div className="mt-1.5 pt-1.5 border-t border-stone-200 text-[10px] text-stone-500">
                        💡 <strong>Interactive:</strong> Drag this blue pin directly onto your exact street or spot!
                      </div>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={userLocation.coords}
                  radius={Math.min(userLocation.accuracy || 250, 300)}
                  interactive={false}
                  pathOptions={{
                    fillColor: '#0284c7',
                    fillOpacity: 0.12,
                    color: '#0284c7',
                    weight: 1.5,
                  }}
                />
              </>
            )}

            {/* A. Marker Clusters (Zoom <= 6) */}
            {clustersAndSingles.clusters.map((cluster) => (
              <Marker
                key={cluster.id}
                position={cluster.center}
                icon={getClusterIcon(cluster.items.length)}
                eventHandlers={{
                  click: () => setFitBoundsTarget(cluster.bounds),
                }}
              >
                <Popup>
                  <div className="p-1 text-xs text-left max-w-[200px]">
                    <p className="font-bold text-[#996515] mb-1">
                      {cluster.items.length} Heritage Sanctuaries Here
                    </p>
                    <p className="text-[11px] text-stone-600 mb-2">
                      {cluster.items.slice(0, 3).map((i) => i.name).join(', ')}
                      {cluster.items.length > 3 ? ` and ${cluster.items.length - 3} more...` : ''}
                    </p>
                    <button
                      onClick={() => setFitBoundsTarget(cluster.bounds)}
                      className="w-full py-1 text-center rounded bg-[#241a12] text-[#e6ca85] text-[10px] font-bold"
                    >
                      Zoom In & Explore
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* B. Individual Verified Marker Pins (Zoom >= 7 or single points) */}
            {clustersAndSingles.singles.map((place) => {
              const isSelected = selectedPlace?.id === place.id;
              return (
                <Marker
                  key={place.id}
                  position={[place.latitude, place.longitude]}
                  icon={getHeritagePin(place.category, isSelected)}
                  ref={(ref) => {
                    markerRefs.current[place.id] = ref;
                  }}
                  eventHandlers={{
                    click: () => handlePlaceSelect(place),
                  }}
                >
                  <Popup>
                    <div className="p-1 max-w-[220px] text-left">
                      <div className="rounded-lg overflow-hidden aspect-[16/10] bg-stone-900 mb-2">
                        <img
                          src={place.imageUrl}
                          alt={place.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#996515] uppercase tracking-wider mb-0.5">
                        <span>{place.country}</span>
                        {place.distanceKm !== undefined && (
                          <span className="text-[#0284c7]">
                            • {place.distanceKm} km
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-xs text-[#241a12] leading-tight mb-1">
                        {place.name}
                      </h4>
                      <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed mb-2">
                        {place.description}
                      </p>
                      <button
                        onClick={() => handlePlaceSelect(place)}
                        className="w-full py-1 text-center rounded-lg bg-[#241a12] text-[#e6ca85] text-[11px] font-semibold hover:bg-[#38281b] transition-colors"
                      >
                        Explore Heritage Dossier
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* HERITAGE DIRECTORY SIDEBAR */}
        {isSidebarOpen && (
          <div className="w-[340px] sm:w-[380px] bg-[#fcfaf6] border-l border-[#e8dfd3] flex flex-col h-full min-h-0 overflow-hidden z-10 shadow-xl flex-shrink-0">
            {selectedPlace ? (
              /* Selected Place Detailed Dossier */
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {/* Header with Location & Close Button */}
                <div className="flex items-center justify-between pb-2 border-b border-[#e8dfd3]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-[#8c6224]">
                      {selectedPlace.city ? `${selectedPlace.city}, ` : ''}{selectedPlace.country}
                    </span>
                    {selectedPlace.distanceKm !== undefined && (
                      <span className="text-xs font-medium bg-[#0284c7]/10 text-[#0284c7] px-2 py-0.5 rounded-md border border-[#0284c7]/20">
                        {selectedPlace.distanceKm} km away
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedPlace(null)}
                    className="p-1 rounded-md text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                    title="Back to Directory"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Verified Image Canvas */}
                <div className="rounded-xl overflow-hidden aspect-[16/10] max-h-52 bg-stone-900 border border-[#c5a059]/40 shadow-xs relative group">
                  <img
                    src={selectedPlace.imageUrl}
                    alt={selectedPlace.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/heritage/virupaksha-temple-hampi.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  {selectedPlace.unescoStatus && (
                    <div className="absolute bottom-2 left-2 bg-stone-900/90 backdrop-blur-sm text-[#fef08a] text-xs font-sans font-medium px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>{selectedPlace.unescoStatus}</span>
                    </div>
                  )}
                </div>

                {/* Title & Coordinates */}
                <div>
                  <h3 className="font-serif font-bold text-base text-[#241a12] leading-snug">
                    {selectedPlace.name}
                  </h3>
                  <p className="text-xs font-sans text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#c5a059] flex-shrink-0" />
                    <span>{selectedPlace.location}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-stone-400">
                    <span>GPS: {selectedPlace.latitude.toFixed(4)}°N, {selectedPlace.longitude.toFixed(4)}°E</span>
                  </div>
                </div>

                {/* Actions: Directions, Bookmark, Share */}
                <div className="flex items-center gap-2 pt-0.5 pb-0.5">
                  <div className="relative flex-1">
                    <button
                      onClick={() => setShowDirectionsMenu((prev) => !prev)}
                      className="w-full py-2 px-3 rounded-xl bg-[#241a12] text-[#e6ca85] text-xs font-semibold hover:bg-[#38281b] flex items-center justify-center gap-1.5 shadow-xs transition-all border border-[#c5a059]/40"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Get Directions</span>
                    </button>

                    {showDirectionsMenu && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#e8dfd3] rounded-xl shadow-xl p-1 z-30 space-y-0.5 text-xs">
                        <a
                          href={getDirectionsUrl('google')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full px-3 py-1.5 rounded-lg text-stone-700 hover:bg-[#f6f1e8] flex items-center justify-between"
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </a>
                        <a
                          href={getDirectionsUrl('apple')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full px-3 py-1.5 rounded-lg text-stone-700 hover:bg-[#f6f1e8] flex items-center justify-between"
                        >
                          <span>Open in Apple Maps</span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </a>
                        <a
                          href={getDirectionsUrl('osm')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full px-3 py-1.5 rounded-lg text-stone-700 hover:bg-[#f6f1e8] flex items-center justify-between"
                        >
                          <span>Open in OpenStreetMap</span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </a>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleBookmarkToggle}
                    className={`p-2 rounded-xl border transition-all ${
                      isBookmarked
                        ? 'bg-[#c5a059]/15 border-[#c5a059] text-[#996515]'
                        : 'bg-white border-[#e8dfd3] text-stone-500 hover:text-stone-800'
                    }`}
                    title={isBookmarked ? 'Saved to Sanctuary' : 'Save Sanctuary'}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-2 rounded-xl bg-white border border-[#e8dfd3] text-stone-500 hover:text-stone-800 transition-all relative"
                    title="Share Sanctuary Dossier"
                  >
                    <Share2 className="w-4 h-4" />
                    {shareFeedback && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#241a12] text-[#e6ca85] text-[10px] rounded shadow-lg whitespace-nowrap">
                        Link Copied!
                      </span>
                    )}
                  </button>
                </div>

                {/* Historical Meta */}
                <div className="p-3 rounded-xl bg-[#f4efe6] border border-[#e2d6c3] text-xs space-y-1.5">
                  <div className="flex items-start gap-2 text-stone-700">
                    <Calendar className="w-3.5 h-3.5 text-[#c5a059] mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-[#241a12]">Era: </span>
                      <span>{selectedPlace.era}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-stone-700">
                    <Info className="w-3.5 h-3.5 text-[#c5a059] mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-[#241a12]">Architecture: </span>
                      <span>{selectedPlace.architecturalStyle}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-serif font-bold text-[#241a12] mb-1">
                    Historical Overview
                  </h4>
                  <p className="text-xs font-sans text-stone-700 leading-relaxed">
                    {selectedPlace.description}
                  </p>
                </div>

                {/* Cultural Significance */}
                {selectedPlace.culturalSignificance && (
                  <div>
                    <h4 className="text-xs font-serif font-bold text-[#241a12] mb-1">
                      Cultural Significance
                    </h4>
                    <p className="text-xs font-sans text-stone-700 leading-relaxed">
                      {selectedPlace.culturalSignificance}
                    </p>
                  </div>
                )}

                {/* Interesting Facts */}
                {selectedPlace.interestingFacts && (
                  <div>
                    <h4 className="text-xs font-serif font-bold text-[#241a12] mb-1">
                      Curiosities & Lore
                    </h4>
                    <p className="text-xs font-sans text-stone-700 leading-relaxed bg-[#f8f4ed] p-2.5 rounded-xl border border-[#e8dfd3]">
                      {selectedPlace.interestingFacts}
                    </p>
                  </div>
                )}

                {/* Visitor Info */}
                {selectedPlace.visitorInfo && (
                  <div>
                    <h4 className="text-xs font-serif font-bold text-[#241a12] mb-1">
                      Visitor Guidelines
                    </h4>
                    <p className="text-xs text-stone-600 bg-stone-100 p-2.5 rounded-xl border border-stone-200">
                      {selectedPlace.visitorInfo}
                    </p>
                  </div>
                )}

                {/* Official Source Link */}
                {selectedPlace.sourceUrl && (
                  <div className="pt-1 pb-3">
                    <a
                      href={selectedPlace.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#996515] hover:underline"
                    >
                      <span>Official World Heritage Record</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              /* Directory List Feed */
              <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
                {/* Directory Top Bar */}
                <div className="p-3 bg-[#fcfaf6] border-b border-[#e8dfd3] flex items-center justify-between flex-shrink-0">
                  <div>
                    <h3 className="font-serif font-bold text-xs md:text-sm text-[#241a12]">
                      {userLocation ? 'Nearby Heritage Sanctuaries' : 'Heritage Directory'}
                    </h3>
                    <p className="text-[10px] text-stone-500">
                      Showing {processedPlaces.length} mapped sanctuaries
                      {userLocation && selectedDistanceRadius > 0 && ` within ${selectedDistanceRadius} km`}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">
                    {activeContinent !== 'all' ? activeContinent : 'Global'}
                  </span>
                </div>

                {/* Scrollable Feed */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                  {isLoading && (
                    <div className="space-y-2 py-2">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="p-2.5 bg-white rounded-xl border border-[#e8dfd3] animate-pulse flex gap-2.5"
                        >
                          <div className="w-14 h-14 bg-stone-200 rounded-lg flex-shrink-0" />
                          <div className="flex-1 space-y-1.5 py-1">
                            <div className="w-3/4 h-3 bg-stone-300 rounded" />
                            <div className="w-1/2 h-2.5 bg-stone-200 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isLoading && processedPlaces.length === 0 && (
                    <div className="py-6 px-4 text-center space-y-2.5">
                      <Compass className="w-7 h-7 text-[#d4af37] mx-auto animate-pulse" />
                      <p className="text-xs font-bold text-stone-800">
                        {selectedDistanceRadius > 0
                          ? `No heritage sites found within ${selectedDistanceRadius} km.`
                          : 'No heritage sites match your filter criteria.'}
                      </p>
                      {nearestOverallPlace && selectedDistanceRadius > 0 && (
                        <p className="text-[11px] text-stone-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200 leading-relaxed">
                          The nearest heritage site is <strong>{nearestOverallPlace.name}</strong> ({nearestOverallPlace.city || nearestOverallPlace.country}), located <strong>{nearestOverallPlace.distanceKm} km</strong> away.
                        </p>
                      )}
                      <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                        {selectedDistanceRadius > 0 && nearestOverallPlace && (
                          <button
                            onClick={() => {
                              const nextRadius =
                                nearestOverallPlace.distanceKm <= 50
                                  ? 50
                                  : nearestOverallPlace.distanceKm <= 100
                                  ? 100
                                  : nearestOverallPlace.distanceKm <= 250
                                  ? 250
                                  : 500;
                              setSelectedDistanceRadius(nextRadius);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#241a12] text-[#e6ca85] text-[11px] font-semibold hover:bg-[#38281b] transition-colors"
                          >
                            Expand Radius
                          </button>
                        )}
                        <button
                          onClick={handleResetFilters}
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#e8dfd3] text-stone-700 text-[11px] font-semibold hover:bg-stone-50 transition-colors"
                        >
                          Show All Sites ({places.length})
                        </button>
                      </div>
                    </div>
                  )}

                  {!isLoading &&
                    processedPlaces.map((p) => {
                      return (
                        <div
                          key={p.id}
                          onClick={() => handlePlaceSelect(p)}
                          className="group p-2 rounded-xl border bg-white border-[#e8dfd3] hover:border-[#c5a059] flex gap-2.5 cursor-pointer transition-all shadow-xs hover:shadow-sm"
                        >
                          {/* Strictly constrained thumbnail box */}
                          <div className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-lg overflow-hidden bg-stone-900 flex-shrink-0 relative shadow-2xs">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/heritage/virupaksha-temple-hampi.jpg';
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-medium text-stone-600 truncate">
                                  {p.city ? `${p.city}, ` : ''}{p.country}
                                </span>
                                {p.distanceKm !== undefined && (
                                  <span className="text-xs font-semibold text-[#0284c7] flex-shrink-0">
                                    {p.distanceKm} km
                                  </span>
                                )}
                              </div>
                              <h4 className="font-serif font-bold text-xs text-[#241a12] group-hover:text-[#996515] transition-colors truncate">
                                {p.name}
                              </h4>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-stone-500">
                              <span className="truncate max-w-[130px]">{p.era}</span>
                              <span className="flex items-center text-[#996515] font-semibold group-hover:translate-x-0.5 transition-transform">
                                View <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. MODAL: SET EXACT LOCATION */}
      <LocationPermissionModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSet={(loc) => {
          setUserLocation({
            coords: loc.coords,
            accuracy: loc.accuracy,
            isApproximate: loc.accuracy > 150,
            isCityCenter: (loc as any).isCityCenter || false,
          });
          setUserLocationAddress(loc.address);
          setFlyTarget({ coords: loc.coords, zoom: loc.accuracy < 100 ? 14 : loc.accuracy < 1000 ? 12 : 10 });
          try {
            localStorage.setItem('samskruthi_user_location', JSON.stringify(loc));
          } catch {}
        }}
      />
    </div>
  );
};
