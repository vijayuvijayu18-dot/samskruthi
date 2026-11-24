import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, Settings } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  preferences: boolean;
  analytics: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'samskruthi_cookie_consent';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    preferences: true,
    analytics: false,
  });

  useEffect(() => {
    // Check if consent has already been recorded
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setIsVisible(true);
      } else {
        const parsed: CookiePreferences = JSON.parse(saved);
        setPreferences({
          necessary: true,
          preferences: parsed.preferences ?? true,
          analytics: parsed.analytics ?? false,
        });
      }
    } catch {
      setIsVisible(true);
    }

    // Listen for custom event to reopen preferences anytime
    const handleReopen = () => {
      setIsVisible(true);
      setShowCustomize(true);
    };

    window.addEventListener('samskruthi:open_cookie_preferences', handleReopen);
    return () => {
      window.removeEventListener('samskruthi:open_cookie_preferences', handleReopen);
    };
  }, []);

  const saveConsent = (prefs: { necessary: boolean; preferences: boolean; analytics: boolean }) => {
    const payload: CookiePreferences = {
      ...prefs,
      necessary: true,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
    setPreferences({ necessary: true, preferences: prefs.preferences, analytics: prefs.analytics });
    setIsVisible(false);
    setShowCustomize(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, preferences: true, analytics: true });
  };

  const handleRejectNonEssential = () => {
    saveConsent({ necessary: true, preferences: false, analytics: false });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-[99999] bg-[#16100c]/98 text-[#ede6d8] border border-[#c5a059]/40 rounded-2xl shadow-2xl backdrop-blur-md p-4 sm:p-5 text-left animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="space-y-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#241a12] border border-[#c5a059]/40 flex items-center justify-center text-[#d4af37] flex-shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#f7f2ea]">
                Cookie &amp; Privacy Preferences
              </h3>
              <span className="text-[10px] text-stone-400 font-sans">
                GDPR &amp; DPDP Act Transparency
              </span>
            </div>
          </div>
          <button
            onClick={handleRejectNonEssential}
            className="text-stone-400 hover:text-stone-200 p-1"
            aria-label="Decline non-essential cookies"
            title="Decline non-essential cookies"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Concise Description */}
        <p className="text-xs text-stone-300 font-sans leading-relaxed">
          We use strictly necessary cookies to maintain your authentication session and local storage for your accessibility settings. We do not use third-party advertising tracking. Review our{' '}
          <Link to="/cookie-policy" className="text-[#c5a059] underline hover:text-[#e6ca85]">
            Cookie Policy
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-[#c5a059] underline hover:text-[#e6ca85]">
            Privacy Policy
          </Link>.
        </p>

        {/* Granular Customization Panel */}
        {showCustomize && (
          <div className="space-y-2.5 pt-2 border-t border-white/10 text-xs">
            {/* Necessary */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#201712] border border-white/5">
              <div>
                <p className="font-semibold text-stone-200">Strictly Necessary</p>
                <p className="text-[10px] text-stone-400">Security, session tokens &amp; CSRF protection</p>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Always On
              </span>
            </div>

            {/* Preferences */}
            <label className="flex items-center justify-between p-2 rounded-lg bg-[#201712] border border-white/5 cursor-pointer">
              <div>
                <p className="font-semibold text-stone-200">Preferences &amp; Accessibility</p>
                <p className="text-[10px] text-stone-400">Reduced motion, map filters, theme caching</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.preferences}
                onChange={(e) => setPreferences((prev) => ({ ...prev, preferences: e.target.checked }))}
                className="w-4 h-4 rounded text-[#c5a059] focus:ring-0 bg-[#0e0a07] border-white/20"
              />
            </label>

            {/* Analytics */}
            <label className="flex items-center justify-between p-2 rounded-lg bg-[#201712] border border-white/5 cursor-pointer">
              <div>
                <p className="font-semibold text-stone-200">Diagnostics &amp; Performance</p>
                <p className="text-[10px] text-stone-400">Anonymous map tile and page load telemetry</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))}
                className="w-4 h-4 rounded text-[#c5a059] focus:ring-0 bg-[#0e0a07] border-white/20"
              />
            </label>
          </div>
        )}

        {/* Buttons Action Strip */}
        <div className="pt-1 flex flex-col sm:flex-row gap-2">
          {showCustomize ? (
            <button
              onClick={handleSaveCustom}
              className="flex-1 py-2 px-3 rounded-xl bg-[#c5a059] hover:bg-[#b89047] text-[#16100c] text-xs font-sans font-bold transition-all shadow-sm"
            >
              Save My Preferences
            </button>
          ) : (
            <>
              <button
                onClick={handleAcceptAll}
                className="flex-1 py-2 px-3 rounded-xl bg-[#c5a059] hover:bg-[#b89047] text-[#16100c] text-xs font-sans font-bold transition-all shadow-sm"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-sans font-medium transition-all"
              >
                Essential Only
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setShowCustomize((prev) => !prev)}
            className="py-2 px-3 rounded-xl bg-[#201712] hover:bg-[#2b1f15] border border-white/10 text-stone-300 text-xs font-sans font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{showCustomize ? 'Less' : 'Customize'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
