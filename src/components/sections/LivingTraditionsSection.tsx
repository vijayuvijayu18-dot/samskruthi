import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe } from 'lucide-react';
import { HeritageService } from '../../services/heritageService';
import { SectionHeading } from '../ui/SectionHeading';
import { SafeImage } from '../ui/SafeImage';

export const LivingTraditionsSection: React.FC = () => {
  const livingItems = HeritageService.getIntangible().slice(0, 4);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-heritage-surface/40 border-t border-white/5 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-heritage-purple/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            badge="Living Cultural Commons"
            title="Intangible Cultural Heritage & Living Arts"
            subtitle="Rituals, theatrical epics, musical poetry, and indigenous craftsmanship passed by hand and voice through living generations."
          />

          <Link
            to="/explore?type=intangible"
            className="inline-flex items-center gap-2 text-xs font-bold text-heritage-gold hover:underline uppercase tracking-wider self-start md:self-end"
            data-cursor="link"
          >
            <span>Explore All Living Traditions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4-Item Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {livingItems.map((item) => (
            <article
              key={item.id}
              className="bg-heritage-surface border border-white/10 rounded-2xl overflow-hidden hover:border-heritage-gold/50 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-56 overflow-hidden">
                  <SafeImage
                    src={item.primaryImage.src}
                    alt={item.title}
                    fallbackTitle={item.title}
                    fallbackCategory={item.country}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-heritage-surface via-transparent to-black/30" />
                  
                  {/* Continent & Country Pill */}
                  <div className="absolute top-3 left-3 bg-heritage-darker/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-heritage-gold border border-white/10 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>{item.country}</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-[11px] text-slate-300">
                    <span className="font-semibold text-white block truncate">{item.region}</span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-heritage-saffron block">
                    {item.category.replace('-', ' ')}
                  </span>

                  <h4 className="font-serif font-bold text-base text-white group-hover:text-heritage-gold transition-colors leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {item.shortDescription}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-medium">
                  {item.preservationStatus}
                </span>
                <Link
                  to={`/heritage/${item.slug}`}
                  className="text-xs font-bold text-heritage-gold hover:underline flex items-center gap-1"
                  data-cursor="link"
                >
                  <span>Experience</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
