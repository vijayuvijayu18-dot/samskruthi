import React, { useState, useEffect } from 'react';

interface PreloaderProps {
  onComplete?: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check session and accessibility
    const hasSeenIntro = sessionStorage.getItem('samskruthi_intro_seen');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hasSeenIntro || prefersReducedMotion) {
      if (onComplete) onComplete();
      return;
    }

    setIsVisible(true);
    const timer = setTimeout(() => {
      handleDismiss();
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleDismiss = () => {
    sessionStorage.setItem('samskruthi_intro_seen', 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-heritage-darker text-white p-4 transition-opacity duration-700 select-none animate-fadeIn"
    >
      {/* Animated Mandala/Kolam Rings */}
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center mb-6">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full animate-[spin_16s_linear_infinite]"
          fill="none"
          stroke="url(#preloader-gold)"
        >
          <circle cx="50" cy="50" r="46" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
          <circle cx="50" cy="50" r="38" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.8" />
          <polygon
            points="50,15 62,38 85,50 62,62 50,85 38,62 15,50 38,38"
            strokeWidth="1.2"
            fill="none"
            opacity="0.9"
          />
          <polygon
            points="50,22 58,42 78,50 58,58 50,78 42,58 22,50 42,42"
            strokeWidth="1"
            fill="rgba(212, 175, 55, 0.05)"
          />
          <defs>
            <linearGradient id="preloader-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f3d979" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Emblem Glow */}
        <div className="absolute w-12 h-12 rounded-full bg-heritage-gold/20 flex items-center justify-center border border-heritage-gold shadow-lg shadow-heritage-gold/20 animate-pulse">
          <span className="font-kannada font-bold text-xl text-heritage-gold">ಸಂ</span>
        </div>
      </div>

      {/* Wordmark Reveal */}
      <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-wider text-gradient-gold">
        SAMSKRUTHI
      </h1>
      <p className="font-kannada text-heritage-gold/80 text-sm mt-1 tracking-wide">
        ಸಂಸ್ಕೃತಿ • ಭಾರತೀಯ ಪರಂಪರೆ
      </p>
      <p className="text-xs uppercase tracking-widest text-slate-400 mt-2">
        Digital Heritage Preservation Archive
      </p>

      {/* Progress Bar */}
      <div className="w-48 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-heritage-saffron via-heritage-gold to-heritage-emerald animate-[shimmer_2s_ease-in-out_infinite] w-full" />
      </div>

      {/* Skip Button */}
      <button
        onClick={handleDismiss}
        className="mt-8 text-xs text-slate-400 hover:text-heritage-gold transition-colors underline underline-offset-4 focus:outline-none"
      >
        Skip intro &rarr;
      </button>
    </div>
  );
};

