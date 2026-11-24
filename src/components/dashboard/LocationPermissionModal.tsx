import React, { useState, useEffect, useRef } from 'react';
import { MapPin, LocateFixed, Search, X, CheckCircle2, AlertTriangle, Navigation, Crosshair } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSet?: (location: { coords: [number, number]; accuracy: number; address: string }) => void;
}

// 25 popular Indian cities + major international cities for quick set
const POPULAR_HUBS: Array<{ name: string; state: string; coords: [number, number] }> = [
  { name: 'Bengaluru', state: 'Karnataka', coords: [12.9716, 77.5946] },
  { name: 'Hyderabad', state: 'Telangana', coords: [17.3850, 78.4867] },
  { name: 'Chennai', state: 'Tamil Nadu', coords: [13.0827, 80.2707] },
  { name: 'Delhi NCR', state: 'Delhi', coords: [28.6139, 77.2090] },
  { name: 'Mumbai', state: 'Maharashtra', coords: [19.0760, 72.8777] },
  { name: 'Pune', state: 'Maharashtra', coords: [18.5204, 73.8567] },
  { name: 'Kochi', state: 'Kerala', coords: [9.9312, 76.2673] },
  { name: 'Kolkata', state: 'West Bengal', coords: [22.5726, 88.3639] },
  { name: 'Jaipur', state: 'Rajasthan', coords: [26.9124, 75.7873] },
  { name: 'Varanasi', state: 'Uttar Pradesh', coords: [25.3176, 82.9739] },
  { name: 'Mysuru', state: 'Karnataka', coords: [12.2958, 76.6394] },
  { name: 'Thanjavur', state: 'Tamil Nadu', coords: [10.7870, 79.1378] },
  { name: 'Ahmedabad', state: 'Gujarat', coords: [23.0225, 72.5714] },
  { name: 'Bhopal', state: 'Madhya Pradesh', coords: [23.2599, 77.4126] },
  { name: 'Lucknow', state: 'Uttar Pradesh', coords: [26.8467, 80.9462] },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', coords: [17.6868, 83.2185] },
];

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  onLocationSet,
}) => {
  const [step, setStep] = useState<'choose' | 'search' | 'confirm-gps'>('search');
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; lat: number; lon: number }>>([]);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [pendingGpsLocation, setPendingGpsLocation] = useState<{
    coords: [number, number];
    accuracy: number;
    address: string;
  } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    localStorage.setItem('samskruthi_location_prompted', 'true');
    onClose();
  };

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const raw = val.trim();
      const isPin = /^\d{6}$/.test(raw);
      const query = isPin ? `${raw}, India` : raw;
      const countryParam = isPin ? '&countrycodes=in' : '';

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}${countryParam}&limit=6&addressdetails=1`,
          { headers: { 'User-Agent': 'SamskruthiHeritageApp/1.0 (contact@samskruthi.org)' } }
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(
            data.map((item: any) => ({
              name: item.display_name,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
            }))
          );
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const saveAndClose = (locationData: { coords: [number, number]; accuracy: number; address: string }) => {
    localStorage.setItem('samskruthi_user_location', JSON.stringify(locationData));
    localStorage.setItem('samskruthi_location_prompted', 'true');
    window.dispatchEvent(new CustomEvent('samskruthi:location_updated', { detail: locationData }));
    if (onLocationSet) onLocationSet(locationData);
    onClose();
  };

  const handleSelectSuggestion = (item: { name: string; lat: number; lon: number }) => {
    const coords: [number, number] = [item.lat, item.lon];
    // Build a concise address from the display_name
    const parts = item.name.split(',').map((p: string) => p.trim());
    const address = parts.slice(0, 3).join(', ');
    saveAndClose({ coords, accuracy: 15, address });
  };

  const handleDirectSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
      return;
    }
    const raw = searchInput.trim();
    if (!raw) return;
    setIsSearching(true);
    const isPin = /^\d{6}$/.test(raw);
    const query = isPin ? `${raw}, India` : raw.toLowerCase().includes('india') ? raw : `${raw}, India`;
    const countryParam = '&countrycodes=in';

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}${countryParam}&limit=1&addressdetails=1`,
        { headers: { 'User-Agent': 'SamskruthiHeritageApp/1.0 (contact@samskruthi.org)' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const item = data[0];
          const coords: [number, number] = [parseFloat(item.lat), parseFloat(item.lon)];
          const parts = item.display_name.split(',').map((p: string) => p.trim());
          const address = parts.slice(0, 3).join(', ');
          saveAndClose({ coords, accuracy: 15, address });
          return;
        }
      }
    } catch {}
    setIsSearching(false);
  };

  const handleSelectHub = (hub: { name: string; state: string; coords: [number, number] }) => {
    // Label clearly as City Center preset, not a fake exact GPS reading
    saveAndClose({
      coords: hub.coords,
      accuracy: 5000,
      address: `${hub.name} City Centre, ${hub.state}`,
    });
  };

  const handleRequestGps = () => {
    setIsLocatingGps(true);
    setGpsError(null);

    if (!('geolocation' in navigator)) {
      setIsLocatingGps(false);
      setGpsError('Your browser does not support location detection. Please search for your area above.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        const accuracy = Math.round(pos.coords.accuracy);

        // Reverse geocode to get the address at these coordinates
        let address = `${coords[0].toFixed(4)}°N, ${coords[1].toFixed(4)}°E`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}&zoom=16`,
            { headers: { 'User-Agent': 'SamskruthiHeritageApp/1.0 (contact@samskruthi.org)' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.address) {
              const a = data.address;
              const parts = [
                a.house_number ? `${a.house_number} ${a.road}` : (a.road || a.pedestrian),
                a.suburb || a.neighbourhood || a.quarter,
                a.city || a.town || a.village || a.county,
                a.state,
              ].filter(Boolean);
              if (parts.length > 0) address = parts.join(', ');
            }
          }
        } catch {
          // Use coordinates as fallback address
        }

        setIsLocatingGps(false);
        // Show CONFIRM step — do NOT save yet
        setPendingGpsLocation({ coords, accuracy, address });
        setStep('confirm-gps');
      },
      (err) => {
        setIsLocatingGps(false);
        if (err.code === 1) {
          setGpsError(
            'Location permission was denied by your browser. Please search for your area, PIN code, or city using the search box above.'
          );
        } else if (err.code === 2) {
          setGpsError(
            'Your device could not determine your position. On desktop computers, GPS hardware is not available — please search for your location manually.'
          );
        } else {
          setGpsError(
            'Location detection timed out. Desktop computers rely on network-based positioning which may be slow or inaccurate. Use the search box instead.'
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ============================================================
  // STEP: CONFIRM GPS
  // ============================================================
  if (step === 'confirm-gps' && pendingGpsLocation) {
    const { coords, accuracy, address } = pendingGpsLocation;
    const isVeryAccurate = accuracy <= 50;
    const isMaybeAccurate = accuracy > 50 && accuracy <= 500;
    const isInaccurate = accuracy > 500;

    const mapsLink = `https://www.openstreetmap.org/?mlat=${coords[0]}&mlon=${coords[1]}&zoom=16`;

    return (
      <div className="fixed inset-0 z-[9000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#fcfaf6] border border-[#c5a059]/50 rounded-3xl max-w-md w-full shadow-2xl relative text-left overflow-hidden">
          {/* Header */}
          <div className="bg-[#241a12] px-5 py-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d4af37]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Navigation className="w-4.5 h-4.5 text-[#d4af37]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#fcfaf6]">Confirm Your Location</h3>
              <p className="text-[11px] text-[#c5a059]/80 mt-0.5 font-sans">
                Your browser detected a position — please verify it is correct before saving
              </p>
            </div>
            <button onClick={handleDismiss} className="ml-auto p-1.5 rounded-full text-[#c5a059]/60 hover:text-[#d4af37]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Accuracy Indicator */}
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-sans ${
                isVeryAccurate
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : isMaybeAccurate
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              {isVeryAccurate ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">
                  {isVeryAccurate
                    ? `GPS Accuracy: ±${accuracy}m — Good signal`
                    : isMaybeAccurate
                    ? `Network Accuracy: ±${accuracy}m — May be approximate`
                    : `IP-Based Estimate: ±${(accuracy / 1000).toFixed(1)}km — Often incorrect`}
                </p>
                <p className="mt-0.5 opacity-80">
                  {isInaccurate
                    ? 'Desktop computers have no GPS hardware. The detected location may be your ISP hub city, not your actual location. Please verify below and correct if needed.'
                    : isMaybeAccurate
                    ? 'Wi-Fi positioning may be off by a few hundred meters. Verify the location on the map link below.'
                    : 'This looks accurate. Confirm if this is your correct location.'}
                </p>
              </div>
            </div>

            {/* Detected Location Display */}
            <div className="bg-[#f4efe6] border border-[#e2d6c3] rounded-xl p-3.5">
              <p className="text-[10px] font-sans font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                Detected Position
              </p>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#d4af37] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-sans font-semibold text-[#241a12] leading-snug">{address}</p>
                  <p className="text-[10px] font-mono text-stone-500 mt-0.5">
                    {coords[0].toFixed(6)}°N, {coords[1].toFixed(6)}°E
                  </p>
                </div>
              </div>
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 flex items-center gap-1.5 text-[11px] font-sans font-semibold text-[#996515] hover:text-[#241a12] underline underline-offset-2"
              >
                <Crosshair className="w-3 h-3" />
                Verify on OpenStreetMap — does the pin land on your actual location?
              </a>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => saveAndClose({ coords, accuracy, address })}
                className="w-full py-2.5 rounded-xl bg-[#241a12] text-[#e6ca85] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#38281b] transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Yes, This Is My Location — Save It
              </button>
              <button
                onClick={() => {
                  setPendingGpsLocation(null);
                  setStep('search');
                  setSearchInput(address);
                  setTimeout(() => searchRef.current?.focus(), 100);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors"
              >
                <Search className="w-4 h-4" />
                No — Search For My Correct Location
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // STEP: SEARCH (full search mode)
  // ============================================================
  if (step === 'search') {
    return (
      <div className="fixed inset-0 z-[9000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#fcfaf6] border border-[#c5a059]/50 rounded-3xl max-w-lg w-full shadow-2xl relative text-left">
          {/* Header */}
          <div className="bg-[#241a12] px-5 py-4 flex items-center gap-3 rounded-t-3xl">
            <button
              onClick={() => setStep('choose')}
              className="p-1.5 rounded-full text-[#c5a059]/60 hover:text-[#d4af37] transition-colors"
              title="Back"
            >
              <X className="w-4 h-4 rotate-45" />
            </button>
            <div className="flex-1">
              <h3 className="font-serif font-bold text-sm text-[#fcfaf6]">Search Your Exact Location</h3>
              <p className="text-[11px] text-[#c5a059]/80 mt-0.5 font-sans">
                Enter PIN code, street, colony, or city name
              </p>
            </div>
            <button onClick={handleDismiss} className="p-1.5 rounded-full text-[#c5a059]/60 hover:text-[#d4af37]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5">
            {/* Search Input Form */}
            <form onSubmit={handleDirectSearchSubmit} className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                {isSearching && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin" />
                )}
                <input
                  ref={searchRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Enter 6-digit PIN (e.g. 560004) or Area/Colony..."
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border-2 border-[#d4af37]/60 text-stone-900 text-sm focus:outline-none focus:border-[#996515] shadow-sm font-sans placeholder-stone-400"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setSuggestions([]);
                      searchRef.current?.focus();
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchInput.trim()}
                className="px-4 py-3 rounded-xl bg-[#241a12] text-[#e6ca85] text-xs font-bold hover:bg-[#38281b] disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm flex-shrink-0"
              >
                <MapPin className="w-4 h-4 text-[#d4af37]" />
                <span>Set Exact</span>
              </button>
            </form>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-2 bg-white rounded-xl border border-[#e8dfd3] shadow-lg max-h-56 overflow-y-auto divide-y divide-stone-100">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left p-3 text-xs text-stone-800 hover:bg-[#f8f4ed] hover:text-[#996515] flex items-start gap-2.5 transition-colors font-sans"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{s.name}</span>
                  </button>
                ))}
              </div>
            )}

            {searchInput.length > 1 && !isSearching && suggestions.length === 0 && (
              <div className="mt-2 p-3 text-xs text-stone-500 font-sans text-center bg-stone-50 rounded-xl border border-stone-200">
                No results found. Try a broader search like a city or state name.
              </div>
            )}

            {/* Common Locations Help */}
            <div className="mt-4 pt-3 border-t border-[#e8dfd3]">
              <p className="text-[10px] font-sans font-bold text-stone-500 uppercase tracking-wider mb-2.5">
                Quick Select — Popular Heritage Hubs:
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {POPULAR_HUBS.map((hub) => (
                  <button
                    key={hub.name}
                    onClick={() => handleSelectHub(hub)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-sans font-medium bg-white hover:bg-[#241a12] hover:text-[#e6ca85] border border-[#e2d6c3] text-stone-700 transition-colors shadow-sm"
                  >
                    {hub.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // STEP: CHOOSE (default landing step)
  // ============================================================
  return (
    <div className="fixed inset-0 z-[9000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#fcfaf6] border border-[#c5a059]/50 rounded-3xl max-w-md w-full shadow-2xl relative text-left overflow-hidden">
        {/* Header */}
        <div className="bg-[#241a12] px-5 py-5 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#c5a059]/60 hover:text-[#d4af37] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#fcfaf6]">Set Your Location</h3>
              <p className="text-[11px] font-sans text-[#c5a059]/80 mt-0.5">
                Discover heritage sites, temples & monuments near you
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {/* Important Notice about Desktop GPS */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Desktop GPS is often approximate</p>
              <p className="mt-0.5 opacity-80">
                Laptops and desktop PCs without satellite GPS rely on ISP IP geocoding, which
                may resolve to a central hub. For pinpoint local precision, search your area or 6-digit PIN code.
              </p>
            </div>
          </div>

          {/* OPTION 1: Search (PRIMARY, most accurate) */}
          <button
            onClick={() => setStep('search')}
            className="w-full py-3.5 px-4 rounded-xl bg-[#241a12] text-[#e6ca85] font-semibold text-sm flex items-center gap-3 hover:bg-[#38281b] transition-colors shadow-sm group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 flex items-center justify-center group-hover:bg-[#d4af37]/25 transition-colors">
              <Search className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div className="text-left">
              <span className="block text-[#fcfaf6]">Search My Area or PIN Code</span>
              <span className="block text-[11px] font-sans font-normal text-[#e6ca85]/70 mt-0.5">
                Exact precision — enter street, locality, PIN code or city hub
              </span>
            </div>
            <span className="ml-auto text-[10px] font-bold bg-emerald-800/40 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/40">
              RECOMMENDED
            </span>
          </button>

          {/* OPTION 2: GPS (secondary, with confirmation) */}
          <button
            onClick={handleRequestGps}
            disabled={isLocatingGps}
            className="w-full py-3.5 px-4 rounded-xl bg-[#f4efe6] border border-[#e2d6c3] text-stone-700 font-medium text-sm flex items-center gap-3 hover:bg-[#ebe2cd] transition-colors disabled:opacity-60 group"
          >
            <div className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center group-hover:bg-stone-300 transition-colors">
              <LocateFixed className={`w-4 h-4 text-[#996515] ${isLocatingGps ? 'animate-spin' : ''}`} />
            </div>
            <div className="text-left">
              <span className="block">{isLocatingGps ? 'Detecting location...' : 'Try Browser GPS'}</span>
              <span className="block text-[11px] font-sans font-normal text-stone-500 mt-0.5">
                {isLocatingGps
                  ? 'Please wait while we query your browser location'
                  : 'You will be asked to verify before saving — desktop may be inaccurate'}
              </span>
            </div>
          </button>

          {gpsError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 font-sans">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Quick City Presets */}
          <div className="pt-2 border-t border-[#e8dfd3]">
            <p className="text-[10px] font-sans font-bold text-stone-500 uppercase tracking-wider mb-2">
              Quick Select — Major Cities:
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
              {POPULAR_HUBS.slice(0, 10).map((hub) => (
                <button
                  key={hub.name}
                  onClick={() => handleSelectHub(hub)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-sans font-medium bg-white hover:bg-[#241a12] hover:text-[#e6ca85] border border-[#e2d6c3] text-stone-700 transition-colors shadow-sm"
                >
                  {hub.name}
                </button>
              ))}
            </div>
          </div>

          {/* Skip */}
          <button
            onClick={handleDismiss}
            className="w-full text-center text-xs font-sans text-stone-400 hover:text-stone-700 py-1 transition-colors"
          >
            Set location later from the map
          </button>
        </div>
      </div>
    </div>
  );
};
