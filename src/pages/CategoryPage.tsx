import React, { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, MapPin, Calendar, PlusCircle, Globe 
} from 'lucide-react';
import { getCategoryBySlug, HERITAGE_CATEGORIES } from '../data/categories';
import { HeritageService } from '../services/heritageService';
import { SafeImage } from '../components/ui/SafeImage';
import type { HeritageCategorySlug } from '../types/heritage';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = useMemo(() => (slug ? getCategoryBySlug(slug) : undefined), [slug]);

  if (!category) {
    return <Navigate to="/explore" replace />;
  }

  const items = HeritageService.getByCategory(category.slug as HeritageCategorySlug);

  return (
    <div className="pt-24 pb-24 space-y-16">
      {/* Category Editorial Hero Banner */}
      <section className="relative min-h-[45vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-heritage-darker border-b border-white/10">
        {/* Background Image with Opacity & Gradient Tint */}
        <div className="absolute inset-0 z-0">
          <SafeImage
            src={category.featuredImage}
            alt={category.title}
            title={category.title}
            categoryBadge={category.slug}
            country="Global"
            className="w-full h-full object-cover opacity-20 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-heritage-darker via-heritage-darker/80 to-transparent" />
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${category.accentColor}, transparent 70%)`,
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto w-full relative z-10 text-center space-y-6">
          {/* Breadcrumb back link */}
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-heritage-gold transition-colors"
            data-cursor="link"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Streams</span>
          </Link>

          {/* Badge */}
          <div className="flex flex-col items-center gap-2">
            <span
              className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
              style={{
                color: category.secondaryColor,
                borderColor: `${category.accentColor}66`,
                backgroundColor: `${category.accentColor}22`,
              }}
            >
              Heritage Stream • {category.slug.replace('-', ' ')}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-white tracking-tight">
            {category.title}
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {category.description}
          </p>

          {/* Category Microstats */}
          <div className="pt-4 flex items-center justify-center gap-8 text-xs text-slate-300">
            <div>
              <span className="font-serif font-bold text-xl text-white block">
                {items.length}
              </span>
              <span>Documented Records</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <span className="font-serif font-bold text-xl text-heritage-gold block">
                {category.layoutType.toUpperCase()}
              </span>
              <span>Archival Format</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <span className="font-serif font-bold text-xl text-emerald-400 block">
                Global
              </span>
              <span>Preservation Scope</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Records Section with Stream-Tailored Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">
              Archive Catalog ({items.length})
            </h2>
            <p className="text-xs text-slate-400">
              Displaying specialized global records for {category.title}
            </p>
          </div>

          <Link
            to={`/contribute?category=${category.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-heritage-surface hover:bg-white/10 border border-heritage-gold/40 text-heritage-gold text-xs font-semibold transition-all shadow-md self-start sm:self-auto"
            data-cursor="link"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Entry to {category.title}</span>
          </Link>
        </div>

        {/* Specialized Layout Rendering */}
        {category.layoutType === 'timeline' ? (
          /* Timeline Layout */
          <div className="relative border-l-2 border-heritage-gold/30 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-12">
            {items.map((item) => (
              <div key={item.id} className="relative group">
                <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-5 h-5 rounded-full bg-heritage-darker border-4 border-heritage-gold flex items-center justify-center group-hover:scale-125 transition-transform" />

                <div className="bg-heritage-surface/80 rounded-2xl border border-white/10 p-6 sm:p-8 hover:border-heritage-gold/40 transition-all flex flex-col lg:flex-row gap-6">
                  <div className="w-full lg:w-72 h-52 rounded-xl overflow-hidden flex-shrink-0 relative">
                    <SafeImage
                      src={item.primaryImage.src}
                      alt={item.primaryImage.alt}
                      title={item.title}
                      categoryBadge={item.category}
                      country={item.country}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-xs text-heritage-gold font-mono">
                      {item.period}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-heritage-gold font-semibold">
                        <MapPin className="w-3.5 h-3.5" />
                        {item.region}, {item.country} ({item.continent})
                      </span>
                    </div>

                    <h3 className="text-2xl font-serif font-bold text-white group-hover:text-heritage-gold transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {item.shortDescription}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-2">
                      {item.tags.map((t) => (
                        <span key={t} className="text-[11px] bg-black/40 text-slate-400 px-2.5 py-1 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Link
                        to={`/heritage/${item.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-bold text-heritage-gold hover:underline"
                        data-cursor="link"
                      >
                        <span>Examine Record & Archival Analysis</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : category.layoutType === 'calendar' ? (
          /* Calendar / Festival Seasonal Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-heritage-surface/80 rounded-2xl border border-white/10 overflow-hidden hover:border-heritage-gold/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-60 overflow-hidden">
                    <SafeImage
                      src={item.primaryImage.src}
                      alt={item.primaryImage.alt}
                      title={item.title}
                      categoryBadge={item.category}
                      country={item.country}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-heritage-surface via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-3 left-3 bg-heritage-saffron px-3 py-1 rounded-full text-xs font-bold text-heritage-darker shadow-md flex items-center gap-1.5 pointer-events-none">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.period}</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-heritage-gold">
                      <Globe className="w-3.5 h-3.5" />
                      <span>{item.region}, {item.country}</span>
                    </div>

                    <h3 className="text-xl font-serif font-bold text-white group-hover:text-heritage-gold transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{item.culturalSignificance ? 'Living Tradition' : 'Community Ritual'}</span>
                  <Link
                    to={`/heritage/${item.slug}`}
                    className="text-xs font-bold text-heritage-gold hover:underline flex items-center gap-1"
                    data-cursor="link"
                  >
                    <span>View Lore & Archive</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Default Rich Grid Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-heritage-surface/80 rounded-2xl border border-white/10 overflow-hidden hover:border-heritage-gold/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-52 overflow-hidden">
                    <SafeImage
                      src={item.primaryImage.src}
                      alt={item.primaryImage.alt}
                      title={item.title}
                      categoryBadge={item.category}
                      country={item.country}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-heritage-surface via-transparent to-transparent pointer-events-none" />
                    <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[11px] text-heritage-gold font-mono border border-white/10 pointer-events-none">
                      {item.period}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-heritage-gold" />
                      <span>{item.region}, {item.country}</span>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-white group-hover:text-heritage-gold transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {item.shortDescription}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {item.tags.slice(0, 3).map((tg) => (
                        <span key={tg} className="text-[10px] bg-black/40 text-slate-400 px-2 py-0.5 rounded">
                          #{tg}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-sans">
                    {item.languages[0]}
                  </span>
                  <Link
                    to={`/heritage/${item.slug}`}
                    className="text-xs font-bold text-heritage-gold hover:underline flex items-center gap-1"
                    data-cursor="link"
                  >
                    <span>Read Record</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Other Categories Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10">
        <h3 className="text-sm uppercase tracking-widest font-semibold text-slate-400 mb-6">
          Explore Other Heritage Streams
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {HERITAGE_CATEGORIES.filter((c) => c.slug !== category.slug).map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="p-3 rounded-xl bg-heritage-surface border border-white/5 hover:border-heritage-gold/40 text-xs text-slate-300 hover:text-white transition-all flex flex-col justify-between"
              data-cursor="link"
            >
              <span className="font-semibold block">{c.title}</span>
              <span className="text-[10px] text-heritage-gold mt-1 block">
                {c.slug.replace('-', ' ')}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
