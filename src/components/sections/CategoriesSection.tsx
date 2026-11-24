import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { HERITAGE_CATEGORIES } from '../../data/categories';
import { SectionHeading } from '../ui/SectionHeading';
import { SafeImage } from '../ui/SafeImage';

export const CategoriesSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>(HERITAGE_CATEGORIES[0].slug);

  const activeCat = HERITAGE_CATEGORIES.find((c) => c.slug === activeCategory) || HERITAGE_CATEGORIES[0];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-heritage-dark relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            badge="Universal Taxonomy"
            title="Twelve Streams of Human Heritage"
            subtitle="Explore distinct expressions of civilization, from ancient monuments and indigenous wisdom to oral memories and master craftsmanship."
          />

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-xs font-bold text-heritage-gold hover:underline uppercase tracking-wider self-start md:self-end"
            data-cursor="link"
          >
            <span>Browse Full Index</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Dynamic Horizontal Expander on Desktop */}
        <div className="hidden lg:grid grid-cols-12 gap-6 items-stretch">
          {/* Left Category Selector Pills */}
          <div className="col-span-4 bg-heritage-surface/80 rounded-3xl border border-white/10 p-3 flex flex-col gap-1 max-h-[560px] overflow-y-auto custom-scrollbar">
            {HERITAGE_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  onMouseEnter={() => setActiveCategory(cat.slug)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-heritage-gold text-heritage-darker font-bold shadow-md'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                  data-cursor="link"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: isActive ? '#080c16' : cat.accentColor }}
                    />
                    <span className="text-xs tracking-wide">{cat.title}</span>
                  </div>
                  <span className={`text-[11px] font-mono ${isActive ? 'text-heritage-darker' : 'text-slate-400'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Immersive Preview Display */}
          <div className="col-span-8 bg-heritage-surface/90 rounded-3xl border border-heritage-gold/30 p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="relative h-64 rounded-2xl overflow-hidden border border-white/10 mb-6 group">
              <SafeImage
                src={activeCat.featuredImage}
                alt={activeCat.title}
                fallbackTitle={activeCat.title}
                fallbackCategory={activeCat.shortTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-heritage-darker via-transparent to-transparent opacity-80" />
              <div className="absolute top-4 left-4 bg-heritage-darker/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-heritage-gold border border-white/10">
                {activeCat.shortTitle}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-serif font-black text-white">
                {activeCat.title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-sans max-w-2xl">
                {activeCat.description}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <span className="text-xs text-slate-400">
                  Archival format: <span className="font-mono text-heritage-gold capitalize">{activeCat.layoutType}</span>
                </span>
                <Link
                  to={`/category/${activeCat.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-heritage-gold text-heritage-darker font-bold text-xs uppercase tracking-wider hover:bg-heritage-gold-light transition-all shadow-md"
                  data-cursor="link"
                >
                  <span>Open {activeCat.shortTitle} Stream</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
          {HERITAGE_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="bg-heritage-surface border border-white/10 hover:border-heritage-gold/40 rounded-2xl p-5 transition-all group flex flex-col justify-between space-y-4 shadow-lg"
              data-cursor="link"
            >
              <div className="flex items-center justify-between">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.accentColor }}
                />
                <span className="text-xs font-mono text-heritage-gold">{cat.count} Records</span>
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-white group-hover:text-heritage-gold transition-colors">
                  {cat.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {cat.description}
                </p>
              </div>
              <span className="text-xs text-heritage-gold font-semibold flex items-center gap-1">
                <span>Explore Stream</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
