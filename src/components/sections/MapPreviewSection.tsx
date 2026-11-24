import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Globe } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';

export const MapPreviewSection: React.FC = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-heritage-dark relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            badge="Geographical GIS Cartography"
            title="Interactive World Heritage Map"
            subtitle="Pinpoint monumental wonders, living cultural sanctuaries, and indigenous territories across every continent."
          />

          <Link
            to="/map"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-heritage-surface hover:bg-white/10 border border-heritage-gold/30 hover:border-heritage-gold text-heritage-gold font-semibold text-xs sm:text-sm transition-all shadow-md self-start md:self-end"
            data-cursor="link"
          >
            <Compass className="w-4 h-4" />
            <span>Launch Full World Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Spatial Preview Canvas Container */}
        <div className="relative rounded-3xl overflow-hidden border border-heritage-gold/25 bg-heritage-surface/90 shadow-2xl">
          {/* Top Decorative Map Grid Header */}
          <div className="px-6 py-4 bg-heritage-darker/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>6 Continents Active</span>
              </div>
              <span className="text-xs text-slate-400 hidden sm:inline">
                OpenStreetMap Real GPS Coordinates
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-heritage-terracotta" />
                <span>Ancient Citadels</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-heritage-emerald" />
                <span>Indigenous Landscapes</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-heritage-peacock" />
                <span>Living Maritime/Tradition</span>
              </span>
            </div>
          </div>

          {/* Graphical Global Map Backdrop Graphic */}
          <div className="relative h-[440px] bg-heritage-darker overflow-hidden flex items-center justify-center">
            {/* World Grid Lines Overlay */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-heritage-darker via-transparent to-heritage-darker/60" />

            {/* Stylized World Representative Hotspot Pins */}
            <div className="absolute inset-0 p-8 sm:p-12">
              <div className="relative w-full h-full">
                {/* Pin 1: Giza, Africa */}
                <div className="absolute top-[38%] left-[54%] -translate-x-1/2 -translate-y-1/2 group">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-8 h-8 rounded-full bg-heritage-terracotta/30 animate-ping" />
                    <span className="w-5 h-5 rounded-full bg-heritage-terracotta border-2 border-white flex items-center justify-center shadow-lg text-white text-[10px] font-bold">
                      1
                    </span>
                  </div>
                  <div className="mt-1 bg-heritage-surface/95 border border-heritage-gold/30 rounded-lg px-2.5 py-1 shadow-xl backdrop-blur-md whitespace-nowrap hidden sm:block">
                    <span className="text-xs font-serif font-bold text-white block">Giza Plateau</span>
                    <span className="text-[10px] text-heritage-gold">Egypt • 2560 BCE</span>
                  </div>
                </div>

                {/* Pin 2: Machu Picchu, South America */}
                <div className="absolute top-[68%] left-[28%] -translate-x-1/2 -translate-y-1/2 group">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-8 h-8 rounded-full bg-heritage-emerald/30 animate-ping" />
                    <span className="w-5 h-5 rounded-full bg-heritage-emerald border-2 border-white flex items-center justify-center shadow-lg text-white text-[10px] font-bold">
                      2
                    </span>
                  </div>
                  <div className="mt-1 bg-heritage-surface/95 border border-heritage-gold/30 rounded-lg px-2.5 py-1 shadow-xl backdrop-blur-md whitespace-nowrap hidden sm:block">
                    <span className="text-xs font-serif font-bold text-white block">Machu Picchu</span>
                    <span className="text-[10px] text-emerald-400">Peru • Incan Andes</span>
                  </div>
                </div>

                {/* Pin 3: Acropolis, Europe */}
                <div className="absolute top-[34%] left-[50%] -translate-x-1/2 -translate-y-1/2 group">
                  <div className="relative flex items-center justify-center">
                    <span className="w-5 h-5 rounded-full bg-heritage-gold border-2 border-white flex items-center justify-center shadow-lg text-heritage-darker text-[10px] font-bold">
                      3
                    </span>
                  </div>
                  <div className="mt-1 bg-heritage-surface/95 border border-heritage-gold/30 rounded-lg px-2.5 py-1 shadow-xl backdrop-blur-md whitespace-nowrap hidden sm:block">
                    <span className="text-xs font-serif font-bold text-white block">Parthenon</span>
                    <span className="text-[10px] text-amber-300">Greece • Classical</span>
                  </div>
                </div>

                {/* Pin 4: Angkor Wat, Asia */}
                <div className="absolute top-[52%] left-[74%] -translate-x-1/2 -translate-y-1/2 group">
                  <div className="relative flex items-center justify-center">
                    <span className="w-5 h-5 rounded-full bg-heritage-peacock border-2 border-white flex items-center justify-center shadow-lg text-white text-[10px] font-bold">
                      4
                    </span>
                  </div>
                  <div className="mt-1 bg-heritage-surface/95 border border-heritage-gold/30 rounded-lg px-2.5 py-1 shadow-xl backdrop-blur-md whitespace-nowrap hidden sm:block">
                    <span className="text-xs font-serif font-bold text-white block">Angkor Wat</span>
                    <span className="text-[10px] text-teal-300">Cambodia • Khmer</span>
                  </div>
                </div>

                {/* Pin 5: Rapa Nui, Oceania */}
                <div className="absolute top-[75%] left-[18%] -translate-x-1/2 -translate-y-1/2 group">
                  <div className="relative flex items-center justify-center">
                    <span className="w-5 h-5 rounded-full bg-heritage-purple border-2 border-white flex items-center justify-center shadow-lg text-white text-[10px] font-bold">
                      5
                    </span>
                  </div>
                  <div className="mt-1 bg-heritage-surface/95 border border-heritage-gold/30 rounded-lg px-2.5 py-1 shadow-xl backdrop-blur-md whitespace-nowrap hidden sm:block">
                    <span className="text-xs font-serif font-bold text-white block">Rapa Nui</span>
                    <span className="text-[10px] text-purple-300">Polynesian Moai</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Action Overlay Center Card */}
            <div className="relative z-20 text-center max-w-md mx-auto p-6 rounded-2xl bg-heritage-darker/90 backdrop-blur-xl border border-heritage-gold/30 shadow-2xl">
              <Globe className="w-8 h-8 text-heritage-gold mx-auto mb-2 animate-pulse" />
              <h3 className="font-serif font-bold text-xl text-white">
                Explore the Global Spatial Archive
              </h3>
              <p className="text-xs text-slate-300 mt-2 mb-4 leading-relaxed font-sans">
                Browse our high-accuracy Leaflet world map with verified geographical coordinates, continental filters, and curated historical context cards.
              </p>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-heritage-saffron to-heritage-gold text-heritage-darker font-bold text-xs uppercase tracking-wider hover:from-heritage-saffron-deep hover:to-heritage-gold-light transition-all shadow-lg active:scale-95"
                data-cursor="link"
              >
                <span>Launch Interactive World Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
