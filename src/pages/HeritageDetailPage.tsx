import React, { useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
  MapPin, Calendar, ShieldCheck, 
  Share2, Check, ExternalLink, Sparkles, PlusCircle, ArrowRight, Info, Globe, AlertTriangle
} from 'lucide-react';
import { HeritageService } from '../services/heritageService';
import { Lightbox } from '../components/ui/Lightbox';
import { SafeImage } from '../components/ui/SafeImage';
import type { HeritageImage } from '../types/heritage';

export const HeritageDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const item = useMemo(() => (slug ? HeritageService.getBySlug(slug) : undefined), [slug]);
  
  const [lightboxImage, setLightboxImage] = useState<HeritageImage | null>(null);
  const [copied, setCopied] = useState(false);

  if (!item) {
    return <Navigate to="/explore" replace />;
  }

  const relatedItems = HeritageService.getRelated(item);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="pt-24 pb-24 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Lightbox Modal for Archival Images */}
      {lightboxImage && (
        <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-heritage-gold transition-colors">Home</Link>
        <span>/</span>
        <Link to="/explore" className="hover:text-heritage-gold transition-colors">Explore</Link>
        <span>/</span>
        <Link to={`/explore?continent=${encodeURIComponent(item.continent)}`} className="hover:text-heritage-gold transition-colors">
          {item.continent}
        </Link>
        <span>/</span>
        <Link to={`/category/${item.category}`} className="hover:text-heritage-gold capitalize transition-colors">
          {item.category.replace('-', ' ')}
        </Link>
        <span>/</span>
        <span className="text-heritage-gold font-medium truncate max-w-xs">{item.title}</span>
      </nav>

      {/* Editorial Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={`/explore?continent=${encodeURIComponent(item.continent)}`}
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/20 hover:border-heritage-gold/50 transition-colors"
          >
            {item.continent}
          </Link>

          <Link
            to={`/category/${item.category}`}
            className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-heritage-gold/15 text-heritage-gold border border-heritage-gold/30 hover:bg-heritage-gold/25 transition-colors"
          >
            {item.category.replace('-', ' ')}
          </Link>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{item.preservationStatus}</span>
          </span>

          {item.isEndangered && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Endangered Heritage Priority</span>
            </span>
          )}

          <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
            <Calendar className="w-3.5 h-3.5 text-heritage-gold" />
            <span>{item.period}</span>
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-white tracking-tight leading-tight">
            {item.title}
          </h1>
          {item.nativeTitle && (
            <div className="text-xl sm:text-2xl text-heritage-gold/90 italic">
              {item.nativeTitle}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-b border-white/10 pb-6 text-xs text-slate-300">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-heritage-gold font-semibold">
              <Globe className="w-4 h-4" />
              <span>{item.region}, {item.country}</span>
            </span>
            <span>•</span>
            <span>Languages: {item.languages.join(', ')}</span>
            <span>•</span>
            <span className="capitalize">Type: {item.heritageType}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg bg-heritage-surface hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              aria-label="Share this heritage record"
              data-cursor="link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Share Entry'}</span>
            </button>
            <Link
              to={`/contribute?slug=${item.slug}`}
              className="px-3 py-1.5 rounded-lg bg-heritage-gold hover:bg-heritage-gold-light text-heritage-darker font-bold flex items-center gap-1.5 transition-colors"
              data-cursor="link"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Information</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Parallax Banner & Image Caption with SafeImage */}
      <div className="space-y-3">
        <div 
          className="relative rounded-3xl overflow-hidden border border-heritage-gold/30 shadow-2xl max-h-[560px] cursor-pointer group"
          onClick={() => setLightboxImage(item.primaryImage)}
          data-cursor="view"
        >
          <SafeImage
            src={item.primaryImage.src}
            alt={item.primaryImage.alt}
            title={item.title}
            categoryBadge={item.category}
            country={item.country}
            className="w-full h-[400px] sm:h-[520px] object-cover group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 pointer-events-none" />
          
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pointer-events-none">
            <div className="max-w-2xl bg-heritage-darker/80 backdrop-blur-md p-4 rounded-xl border border-white/10 pointer-events-auto">
              <p className="text-xs sm:text-sm text-slate-200">
                {item.primaryImage.caption || item.primaryImage.alt}
              </p>
              <span className="text-[11px] text-slate-400 block mt-1">
                Credit: {item.primaryImage.credit} • License: {item.primaryImage.license}
              </span>
            </div>

            <span className="bg-heritage-gold text-heritage-darker text-xs font-bold px-3 py-1.5 rounded-full shadow-lg pointer-events-auto">
              Click to Enlarge ⤢
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Content Layout: Left Narrative, Right Key Facts Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Narrative (8 Cols) */}
        <div className="lg:col-span-8 space-y-10">
          {/* Executive Overview */}
          <div className="bg-heritage-surface/60 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-heritage-gold" />
              <span>Historical Overview</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:text-heritage-gold first-letter:mr-2 first-letter:float-left">
              {item.shortDescription}
            </p>
          </div>

          {/* Full Cultural Narrative */}
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-white border-b border-white/10 pb-3">
              Cultural & Historical Chronicle
            </h2>
            <div className="text-sm sm:text-base text-slate-300 leading-relaxed space-y-4 font-sans">
              {item.fullDescription.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Cultural Significance Banner */}
          <div className="bg-gradient-to-r from-heritage-saffron/15 via-heritage-surface to-heritage-gold/10 border-l-4 border-heritage-gold rounded-r-2xl p-6 space-y-2">
            <h3 className="font-serif font-bold text-base text-heritage-gold flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>Living Cultural Significance</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              "{item.culturalSignificance}"
            </p>
          </div>

          {/* Archival Photography Gallery */}
          {item.galleryImages && item.galleryImages.length > 0 && (
            <div className="space-y-6 pt-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-xl font-serif font-bold text-white">
                  Archival Photography & Detail Studies ({item.galleryImages.length})
                </h2>
                <span className="text-xs text-slate-400">Click any image for inspection view</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {item.galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative h-44 rounded-xl overflow-hidden border border-white/10 cursor-pointer group shadow-md"
                    onClick={() => setLightboxImage(img)}
                    data-cursor="view"
                  >
                    <SafeImage
                      src={img.src}
                      alt={img.alt}
                      title={img.caption || item.title}
                      categoryBadge={item.category}
                      country={item.country}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs text-white bg-black/70 px-3 py-1 rounded-full font-semibold">
                        View Details
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags cloud */}
          <div className="pt-4 flex flex-wrap gap-2">
            {item.tags.map((tg) => (
              <Link
                key={tg}
                to={`/explore?tag=${encodeURIComponent(tg)}`}
                className="text-xs px-3 py-1.5 rounded-lg bg-black/40 hover:bg-heritage-gold hover:text-heritage-darker text-slate-400 border border-white/10 transition-colors"
              >
                #{tg}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Key Facts Sidebar (4 Cols) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-heritage-surface border border-heritage-gold/30 rounded-2xl p-6 shadow-xl space-y-6 sticky top-28">
            <h3 className="font-serif font-bold text-lg text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-heritage-gold" />
              <span>Archival Metadata</span>
            </h3>

            <dl className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <dt className="text-slate-400 font-medium">Continent</dt>
                <dd className="text-white font-semibold text-right">{item.continent}</dd>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <dt className="text-slate-400 font-medium">Country / Nation</dt>
                <dd className="text-white font-semibold text-right">{item.country}</dd>
              </div>

              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <dt className="text-slate-400 font-medium">Heritage Type</dt>
                <dd className="text-white font-semibold text-right capitalize">{item.heritageType}</dd>
              </div>

              {item.keyFacts.map((fact, i) => (
                <div key={i} className="flex justify-between border-b border-white/5 pb-2.5">
                  <dt className="text-slate-400 font-medium">{fact.label}</dt>
                  <dd className="text-white font-semibold text-right max-w-[60%]">{fact.value}</dd>
                </div>
              ))}

              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <dt className="text-slate-400 font-medium">Languages</dt>
                <dd className="text-white font-semibold text-right">{item.languages.join(', ')}</dd>
              </div>

              {item.coordinates && (
                <div className="flex justify-between border-b border-white/5 pb-2.5">
                  <dt className="text-slate-400 font-medium">GIS Coordinates</dt>
                  <dd className="text-heritage-gold font-mono font-semibold text-right">
                    {item.coordinates.lat.toFixed(4)}°, {item.coordinates.lng.toFixed(4)}°
                  </dd>
                </div>
              )}
            </dl>

            {/* Spatial Mini Map Action */}
            {item.coordinates && (
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <MapPin className="w-4 h-4" />
                  <span>Mapped in Global GIS Registry</span>
                </div>
                <Link
                  to={`/map?slug=${item.slug}`}
                  className="w-full py-2.5 rounded-lg bg-heritage-surface hover:bg-white/10 border border-heritage-gold/40 text-heritage-gold font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  data-cursor="link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Locate on World Heritage Map</span>
                </Link>
              </div>
            )}

            {/* Contribute Note */}
            <div className="pt-2 text-center">
              <Link
                to={`/contribute?slug=${item.slug}`}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-heritage-saffron to-heritage-gold hover:from-heritage-saffron-deep hover:to-heritage-gold-light text-heritage-darker font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
                data-cursor="link"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Lore or Photos</span>
              </Link>
              <span className="text-[10px] text-slate-500 block mt-2">
                Open citizen global heritage documentation
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Related Entries Strip */}
      {relatedItems.length > 0 && (
        <section className="pt-16 border-t border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-white">
              Related Global Heritage Records
            </h2>
            <Link
              to="/explore"
              className="text-xs font-semibold text-heritage-gold hover:underline flex items-center gap-1"
              data-cursor="link"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedItems.map((rel) => (
              <Link
                key={rel.id}
                to={`/heritage/${rel.slug}`}
                className="bg-heritage-surface border border-white/10 rounded-2xl overflow-hidden hover:border-heritage-gold/40 transition-all group flex flex-col justify-between"
                data-cursor="link"
              >
                <div className="h-44 overflow-hidden relative">
                  <SafeImage
                    src={rel.primaryImage.src}
                    alt={rel.primaryImage.alt}
                    title={rel.title}
                    categoryBadge={rel.category}
                    country={rel.country}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-heritage-darker/80 px-2 py-0.5 rounded text-[10px] text-heritage-gold font-semibold">
                    {rel.continent}
                  </div>
                  <span className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                    {rel.period}
                  </span>
                </div>
                <div className="p-5 space-y-1">
                  <span className="text-[10px] text-heritage-gold uppercase tracking-wider font-semibold">
                    {rel.country} • {rel.category.replace('-', ' ')}
                  </span>
                  <h4 className="font-serif font-bold text-base text-white group-hover:text-heritage-gold transition-colors">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {rel.shortDescription}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
