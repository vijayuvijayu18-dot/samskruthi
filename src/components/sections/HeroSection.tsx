import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, PlusCircle, ArrowDown, MapPin, Globe } from 'lucide-react';
import { SafeImage } from '../ui/SafeImage';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[94vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-heritage-darker">
      {/* Background Subtle Architectural Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e0a07]/60 via-transparent to-[#04070d] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        {/* Left Editorial Copy */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          {/* Universal Heritage Banner Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-heritage-surface border border-heritage-gold/30 shadow-md">
            <Globe className="w-3.5 h-3.5 text-heritage-gold" />
            <span className="text-xs uppercase tracking-widest font-semibold text-heritage-gold">
              Universal Digital Heritage Archive
            </span>
            <span className="text-xs text-slate-400 border-l border-white/10 pl-2 hidden sm:inline">
              6 Continents • Shared Humanity
            </span>
          </div>

          {/* Main Headline (Exact Required Text) */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-serif font-black tracking-tight text-white leading-[1.12]">
              Every Culture Holds a Story <br />
              <span className="text-gradient-heritage">Worth Preserving.</span>
            </h1>
          </div>

          {/* Supporting Text (Exact Required Text) */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0 font-sans">
            Explore the world's monuments, traditions, languages, memories, and cultural treasures. Discover the stories that connect humanity across generations.
          </p>

          {/* Action CTAs (Exact Required Buttons) */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
            <Link
              to="/explore"
              className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-heritage-antique-gold hover:bg-[#b58f48] text-[#16100c] font-sans font-medium text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              data-cursor="link"
              data-cursor-label="Explore"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Global Heritage</span>
            </Link>

            <Link
              to="/contribute"
              className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#18120c] hover:bg-[#221912] border border-heritage-antique-gold/30 text-heritage-warm-ivory font-sans font-medium text-sm tracking-wide transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              data-cursor="link"
              data-cursor-label="Share"
            >
              <PlusCircle className="w-4 h-4 text-heritage-antique-gold" />
              <span>Share Your Heritage</span>
            </Link>
          </div>

          {/* Global Continents Microbar */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
            <div>
              <span className="font-serif font-bold text-lg text-white block">6</span>
              <span>Continents</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div>
              <span className="font-serif font-bold text-lg text-heritage-gold block">140+</span>
              <span>Nations & Peoples</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div>
              <span className="font-serif font-bold text-lg text-emerald-400 block">12</span>
              <span>Cultural Streams</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div>
              <span className="font-serif font-bold text-lg text-cyan-400 block">Open</span>
              <span>Public Commons</span>
            </div>
          </div>
        </div>

        {/* Right Layered Hero Imagery: Asymmetric International Composition */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          {/* Subtle Rotating Compass Ring */}
          <div className="absolute inset-0 rounded-full border border-heritage-gold/20 animate-[spin_60s_linear_infinite] pointer-events-none" />

          {/* Primary Featured Card: Giza / Ancient World */}
          <div className="relative w-full max-w-md">
            <div className="overflow-hidden rounded-3xl border-2 border-heritage-gold/40 shadow-2xl bg-heritage-surface relative group">
              <SafeImage
                src="https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80"
                alt="Pyramids of Giza at twilight, Egypt"
                fallbackTitle="Great Pyramids of Giza"
                fallbackCategory="Africa • Ancient Civilizations"
                className="w-full h-[440px] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-heritage-darker via-transparent to-transparent opacity-85" />

              {/* In-Image Caption Overlay */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-heritage-darker/90 backdrop-blur-md border border-heritage-gold/30">
                <div className="flex items-center gap-1.5 text-xs text-heritage-gold font-medium mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Giza Plateau, Egypt • c. 2560 BCE</span>
                </div>
                <h3 className="font-serif font-bold text-white text-base">
                  The Great Pyramids & Sphinx
                </h3>
                <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                  Five millennia of astronomical precision and ancient Egyptian stone architecture.
                </p>
              </div>
            </div>

            {/* Overlapping Secondary Card: Machu Picchu, South America */}
            <div className="absolute -bottom-6 -left-6 bg-heritage-surface/95 border border-heritage-gold/40 rounded-2xl p-3 shadow-2xl flex items-center gap-3 backdrop-blur-md max-w-xs animate-float-slow">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                <SafeImage
                  src="https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=300&q=80"
                  alt="Machu Picchu, Peru"
                  className="w-full h-full"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-heritage-saffron block">
                  South America
                </span>
                <span className="text-xs font-serif font-bold text-white block">
                  Machu Picchu Citadel
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Incan Stone Architecture
                </span>
              </div>
            </div>

            {/* Overlapping Tertiary Card: Kyoto, Asia */}
            <div className="absolute -top-6 -right-6 bg-heritage-surface/95 border border-heritage-peacock/40 rounded-2xl p-3 shadow-2xl flex items-center gap-3 backdrop-blur-md max-w-xs hidden sm:flex">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                <SafeImage
                  src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=300&q=80"
                  alt="Kyoto wooden pagodas, Japan"
                  className="w-full h-full"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-heritage-peacock block">
                  Asia • Living Craft
                </span>
                <span className="text-xs font-serif font-bold text-white block">
                  Historic Kyoto
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Zen & Timber Joinery
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 opacity-60 hover:opacity-100 transition-opacity">
        <span className="text-[10px] tracking-widest uppercase">Explore Global Diversity</span>
        <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
      </div>
    </section>
  );
};
