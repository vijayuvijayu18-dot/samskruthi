import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { HeritageService } from '../../services/heritageService';
import { SectionHeading } from '../ui/SectionHeading';
import { SafeImage } from '../ui/SafeImage';

export const SpotlightSection: React.FC = () => {
  const featured = HeritageService.getFeatured();
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeItem = featured[currentIndex] || featured[0];

  const handleNext = () => setCurrentIndex((currentIndex + 1) % featured.length);
  const handlePrev = () => setCurrentIndex((currentIndex - 1 + featured.length) % featured.length);

  if (!activeItem) return null;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-heritage-darker relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        <SectionHeading
          badge="Curated Global Spotlight"
          title="Masterpieces of Humanity"
          subtitle="A rotating international showcase of monuments, ancient citadels, and living traditions from across six continents."
        />

        {/* Cinematic Spotlight Banner Box */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-heritage-gold/30 bg-heritage-surface shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            {/* Left Imagery (Large cinematic display) */}
            <div className="lg:col-span-7 relative overflow-hidden min-h-[340px] lg:min-h-full group">
              <SafeImage
                src={activeItem.primaryImage.src}
                alt={activeItem.title}
                fallbackTitle={activeItem.title}
                fallbackCategory={activeItem.country}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-heritage-darker via-transparent to-transparent opacity-85" />

              {/* Status Badge in Photo */}
              <div className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-heritage-darker/90 border border-heritage-gold/40 text-xs font-semibold text-heritage-gold backdrop-blur-md shadow-lg">
                <Award className="w-4 h-4 text-heritage-gold" />
                <span>{activeItem.preservationStatus}</span>
              </div>

              {/* Continent Badge */}
              <div className="absolute bottom-6 left-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-white/20 text-xs text-white backdrop-blur-md">
                <Globe className="w-3.5 h-3.5 text-heritage-gold" />
                <span>{activeItem.continent} • {activeItem.country}</span>
              </div>
            </div>

            {/* Right Information Panel */}
            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between space-y-6 bg-heritage-surface">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-heritage-gold font-semibold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-heritage-gold" />
                  <span>{activeItem.category.replace('-', ' ')}</span>
                  <span className="text-slate-400 border-l border-white/10 pl-2">
                    {activeItem.country}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-snug">
                    {activeItem.title}
                  </h3>
                  {activeItem.nativeTitle && (
                    <span className="block text-sm text-heritage-gold/80 italic font-serif">
                      {activeItem.nativeTitle}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans line-clamp-4">
                  {activeItem.shortDescription}
                </p>

                {/* Key Facts Microgrid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Historical Era</span>
                    <span className="text-xs font-serif font-bold text-slate-200 block truncate">{activeItem.period}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Geographic Zone</span>
                    <span className="text-xs font-serif font-bold text-slate-200 block truncate">{activeItem.region}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions and Carousel Controllers */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <Link
                  to={`/heritage/${activeItem.slug}`}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-heritage-gold hover:text-heritage-gold-light group transition-colors"
                  data-cursor="link"
                >
                  <span>Examine Detailed Record</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Left / Right Carousel Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous spotlight"
                    className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors"
                    data-cursor="link"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-slate-400 px-1">
                    {currentIndex + 1} / {featured.length}
                  </span>
                  <button
                    onClick={handleNext}
                    aria-label="Next spotlight"
                    className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-colors"
                    data-cursor="link"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
