import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Sparkles } from 'lucide-react';

export const ContributeCTASection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-heritage-darker via-heritage-surface/60 to-heritage-darker relative overflow-hidden border-t border-heritage-gold/20">
      {/* Kolam / Rangoli Motif Ambient Background */}
      <div className="absolute inset-0 bg-kolam-grid opacity-10 pointer-events-none" />

      {/* Decorative gradient flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-heritage-saffron/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 text-center space-y-8">
        {/* Emblem Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-heritage-surface border border-heritage-gold/30 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-heritage-gold" />
          <span className="text-xs uppercase tracking-widest font-semibold text-heritage-gold">
            Global Preservation Network
          </span>
          <span className="text-xs text-slate-400 border-l border-white/10 pl-2">
            Open Cultural Archive
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-white tracking-tight leading-tight">
            Every Community Holds a Story Worth Preserving. <br />
            <span className="text-gradient-heritage">Help Us Safeguard Global Heritage.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Do you possess an oral narrative from an elder, knowledge of an endangered craftsmanship technique, a rare historical photograph, or a local monument from anywhere in the world?
          </p>
        </div>

        {/* 3 Step Process Card Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-4">
          <div className="bg-heritage-darker/80 border border-white/10 rounded-2xl p-6 relative group hover:border-heritage-gold/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-heritage-terracotta/20 border border-heritage-terracotta/40 flex items-center justify-center text-heritage-terracotta mb-4 font-bold text-sm">
              01
            </div>
            <h4 className="font-serif font-bold text-base text-white mb-1">
              Select Continent & Stream
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Classify your record across Africa, Asia, Europe, Americas, or Oceania into monuments, oral traditions, crafts, or languages.
            </p>
          </div>

          <div className="bg-heritage-darker/80 border border-white/10 rounded-2xl p-6 relative group hover:border-heritage-gold/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-heritage-gold/20 border border-heritage-gold/40 flex items-center justify-center text-heritage-gold mb-4 font-bold text-sm">
              02
            </div>
            <h4 className="font-serif font-bold text-base text-white mb-1">
              Provide Lore & Archival Media
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload photographs or audio recordings, contextualize historical dates, cultural custodians, and geospatial coordinates.
            </p>
          </div>

          <div className="bg-heritage-darker/80 border border-white/10 rounded-2xl p-6 relative group hover:border-heritage-gold/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 font-bold text-sm">
              03
            </div>
            <h4 className="font-serif font-bold text-base text-white mb-1">
              Open Archival Registry
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Preview your contribution in real time and store it in the decentralized community registry for global preservation.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <Link
            to="/contribute"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-heritage-saffron via-amber-500 to-heritage-gold hover:from-heritage-saffron-deep hover:to-heritage-gold-light text-heritage-darker font-black text-sm tracking-wide shadow-2xl transition-all hover:scale-105 active:scale-95"
            data-cursor="link"
            data-cursor-label="Contribute"
          >
            <PlusCircle className="w-5 h-5 fill-current opacity-80" />
            <span>Open Global Contribution Form</span>
          </Link>
          <span className="block text-xs text-slate-400 mt-3">
            Open-access, non-commercial cultural heritage preservation platform
          </span>
        </div>
      </div>
    </section>
  );
};
