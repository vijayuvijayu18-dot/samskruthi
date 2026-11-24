import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe } from 'lucide-react';
import { CONTINENTS } from '../../data/categories';
import { SectionHeading } from '../ui/SectionHeading';
import { SafeImage } from '../ui/SafeImage';

export const ContinentsSection: React.FC = () => {
  const [activeContinent, setActiveContinent] = useState(CONTINENTS[0].slug);

  const current = CONTINENTS.find((c) => c.slug === activeContinent) || CONTINENTS[0];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-heritage-surface/60 border-t border-white/5 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-heritage-peacock/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            badge="Geographical Horizons"
            title="Explore Heritage Across Every Continent"
            subtitle="From the Sahara to the Andes, the Aegean Sea to Pacific archipelagos: discover humanity’s collective cultural geography."
          />

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-xs font-bold text-heritage-gold hover:underline uppercase tracking-wider self-start md:self-end"
            data-cursor="link"
          >
            <span>Open All Geographical Filters</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Continents Pill Selector */}
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start border-b border-white/10 pb-4">
          {CONTINENTS.map((c) => {
            const isActive = activeContinent === c.slug;
            return (
              <button
                key={c.slug}
                onClick={() => setActiveContinent(c.slug)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-heritage-gold text-heritage-darker font-bold shadow-lg shadow-heritage-gold/20 scale-105'
                    : 'bg-black/30 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
                data-cursor="link"
              >
                <span>{c.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/20 text-heritage-darker font-mono' : 'bg-white/10 text-slate-400'}`}>
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Continent Feature Showcase */}
        <div className="bg-heritage-darker/90 border border-heritage-gold/30 rounded-3xl overflow-hidden p-6 sm:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs text-heritage-gold font-bold uppercase tracking-widest">
              <Globe className="w-4 h-4" />
              <span>Continental Heritage Focus</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-serif font-black text-white">
              {current.name}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {current.description}
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="text-heritage-gold font-bold block text-base font-serif">{current.count}+</span>
                <span className="text-slate-400">Documented Sites</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="text-emerald-400 font-bold block text-base font-serif">Verified</span>
                <span className="text-slate-400">Archival Records</span>
              </div>
            </div>

            <div className="pt-3">
              <Link
                to={`/explore?continent=${current.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-heritage-gold text-heritage-darker font-bold text-xs uppercase tracking-wider hover:bg-heritage-gold-light transition-all shadow-md active:scale-95"
                data-cursor="link"
              >
                <span>Discover {current.name} Heritage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 h-72 sm:h-96 rounded-2xl overflow-hidden border border-white/10 relative group shadow-xl">
            <SafeImage
              src={current.image}
              alt={`${current.name} Cultural Heritage Landscape`}
              fallbackTitle={`${current.name} Heritage`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-heritage-darker/90 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-200 bg-heritage-darker/80 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <span className="text-heritage-gold font-semibold block">{current.name} Landscape Survey</span>
              <span className="text-slate-400 text-[11px]">Explore ancient monuments, living arts, and indigenous archives</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
