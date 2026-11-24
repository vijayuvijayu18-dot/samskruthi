import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Calendar, Info, Camera } from 'lucide-react';
import { HERITAGE_SLIDES, type HeritageSlide } from '../../data/slideshowData';

interface HeritageSlideshowProps {
  slides?: HeritageSlide[];
  autoPlayInterval?: number; // default 6000ms (5-7 seconds)
  onSlideChange?: (slide: HeritageSlide, index: number) => void;
  children?: React.ReactNode;
}

export const HeritageSlideshow: React.FC<HeritageSlideshowProps> = ({
  slides = HERITAGE_SLIDES,
  autoPlayInterval = 6000,
  onSlideChange,
  children,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  const totalSlides = slides.length;
  const currentSlide = slides[currentIndex];

  // Preload adjacent images (next and previous) for zero-lag transitions
  useEffect(() => {
    const nextIdx = (currentIndex + 1) % totalSlides;
    const prevIdx = (currentIndex - 1 + totalSlides) % totalSlides;
    const preloadNext = new Image();
    preloadNext.src = slides[nextIdx].imageUrl;
    const preloadPrev = new Image();
    preloadPrev.src = slides[prevIdx].imageUrl;
  }, [currentIndex, slides, totalSlides]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index === currentIndex) return;
      setPrevIndex(currentIndex);
      setCurrentIndex(index);
      if (onSlideChange) {
        onSlideChange(slides[index], index);
      }
    },
    [currentIndex, onSlideChange, slides]
  );

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % totalSlides);
  }, [currentIndex, goToSlide, totalSlides]);

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + totalSlides) % totalSlides);
  }, [currentIndex, goToSlide, totalSlides]);

  // Autoplay timer
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, autoPlayInterval, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div className="relative w-full h-screen h-[100dvh] max-h-screen overflow-hidden bg-[#0c0907] select-none">
      {/* 1. Full-Screen Slideshow Image Layers with Smooth CSS Crossfade */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const isPrevious = idx === prevIndex;

          if (!isActive && !isPrevious) return null;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-[7000ms] ease-out motion-safe:scale-[1.03]"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          );
        })}
      </div>

      {/* 2. Architectural Overlay Gradients (Ensures text is crisp without dimming photography) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Top subtle vignette */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 via-black/35 to-transparent" />
        
        {/* Bottom deep atmospheric vignette for slide plaque */}
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#0a0806]/95 via-[#0a0806]/60 to-transparent" />
        
        {/* Side contextual gradient for login panel contrast */}
        <div className="absolute inset-y-0 right-0 w-full md:w-[62%] lg:w-[50%] bg-gradient-to-l from-[#0e0a07]/85 via-[#0e0a07]/45 to-transparent" />
      </div>

      {/* 3. Main Stage Content: Login Card Elegantly Positioned Over the Slideshow */}
      <div className="relative z-20 w-full h-full flex flex-col justify-between px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 pointer-events-none overflow-hidden">
        {/* Top Bar: Brand Watermark */}
        <header className="flex items-center justify-between w-full pointer-events-auto flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-heritage-antique-gold/50 bg-[#16100c]/80 flex items-center justify-center shadow-lg backdrop-blur-sm">
              <span className="font-cormorant font-bold text-base text-heritage-antique-gold leading-none">
                सं
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-cormorant font-semibold text-base sm:text-lg tracking-[0.25em] uppercase text-heritage-warm-ivory drop-shadow-sm leading-tight">
                Samskruthi
              </span>
              <span className="text-[9px] tracking-[0.2em] uppercase font-sans text-heritage-antique-gold/90 -mt-0.5">
                National Heritage Portal
              </span>
            </div>
          </div>
        </header>

        {/* Center Canvas: Children (The Second Login Design Card) */}
        <div className="w-full flex-1 flex items-center justify-end my-auto pointer-events-auto min-h-0">
          {children}
        </div>

        {/* Bottom Museum Plaque & Slideshow Controls */}
        <footer className="w-full flex flex-col md:flex-row items-end md:items-center justify-between gap-2.5 pt-1 pointer-events-auto flex-shrink-0">
          {/* Museum Caption Plaque (Bottom Left) */}
          <div className="max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded border border-heritage-antique-gold/30 bg-[#1a130e]/85 backdrop-blur-md text-[10px] font-sans font-medium tracking-wider uppercase text-heritage-antique-gold mb-1 shadow-sm">
              <span>{currentSlide.category}</span>
            </div>

            <h2 className="font-cormorant text-lg sm:text-xl lg:text-2xl font-medium text-heritage-warm-ivory tracking-wide leading-tight drop-shadow-md">
              {currentSlide.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs font-sans text-stone-300 drop-shadow-sm">
              <span className="inline-flex items-center gap-1 text-heritage-warm-ivory/90 text-xs">
                <MapPin className="w-3 h-3 text-heritage-antique-gold" />
                {currentSlide.location}
              </span>
              <span className="inline-flex items-center gap-1 text-stone-400 text-xs">
                <Calendar className="w-3 h-3 text-heritage-antique-gold/80" />
                {currentSlide.era}
              </span>
            </div>

            {/* Expandable Historical Snippet */}
            {isDetailsOpen && (
              <p className="mt-1.5 text-xs font-sans text-stone-300 leading-relaxed bg-[#140e0a]/95 p-2.5 rounded-lg border border-heritage-antique-gold/20 max-w-lg shadow-xl backdrop-blur-md">
                {currentSlide.description}
              </p>
            )}

            <div className="flex items-center gap-3 mt-1 text-[10px] text-stone-400 font-sans">
              <button
                onClick={() => setIsDetailsOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 hover:text-heritage-antique-gold transition-colors underline decoration-heritage-antique-gold/40 underline-offset-2"
                aria-label="Toggle details about this heritage photograph"
              >
                <Info className="w-3 h-3 text-heritage-antique-gold" />
                {isDetailsOpen ? 'Hide description' : 'Historical notes'}
              </button>
              <span className="text-stone-600">•</span>
              <span className="inline-flex items-center gap-1 text-stone-400">
                <Camera className="w-2.5 h-2.5 text-stone-500" />
                {currentSlide.credit}
              </span>
            </div>
          </div>

          {/* Slideshow Progress Indicators (Bottom Right) */}
          <div className="flex flex-col items-end gap-2">
            {/* 20 Slide Progress Indicators */}
            <div className="flex items-center gap-1 sm:gap-1.5" role="tablist" aria-label="Slideshow slide selectors">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => goToSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-7 sm:w-8 bg-heritage-antique-gold shadow-[0_0_8px_rgba(197,160,89,0.7)]'
                      : 'w-2 bg-stone-600/70 hover:bg-stone-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}: ${s.title}`}
                  aria-selected={idx === currentIndex}
                />
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
