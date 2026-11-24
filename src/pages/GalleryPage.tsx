import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Filter, ArrowRight, Eye } from 'lucide-react';
import { HeritageService } from '../services/heritageService';
import { HERITAGE_CATEGORIES } from '../data/categories';
import type { HeritageCategorySlug, HeritageImage } from '../types/heritage';
import { Lightbox } from '../components/ui/Lightbox';
import { SafeImage } from '../components/ui/SafeImage';

export const GalleryPage: React.FC = () => {
  const allPhotos = useMemo(() => HeritageService.getAllGalleryPhotos(), []);
  const [selectedCategory, setSelectedCategory] = useState<HeritageCategorySlug | 'all'>('all');
  const [activeLightboxImage, setActiveLightboxImage] = useState<HeritageImage | null>(null);

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'all') return allPhotos;
    return allPhotos.filter((p) => p.category === selectedCategory);
  }, [allPhotos, selectedCategory]);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Lightbox Overlay */}
      {activeLightboxImage && (
        <Lightbox image={activeLightboxImage} onClose={() => setActiveLightboxImage(null)} />
      )}

      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-heritage-surface border border-heritage-gold/30 text-xs text-heritage-gold font-semibold uppercase tracking-widest">
          <Camera className="w-3.5 h-3.5" />
          <span>Visual Preservation Archive</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-black text-white tracking-tight">
          Historical Photographs & Artistry
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
          A high-fidelity photographic survey capturing 19th-century glass-plate negatives, intricate stone reliefs, living craft masters, and festive processions.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="bg-heritage-surface/80 border border-white/10 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-heritage-gold" />
            <span>Filter Archive:</span>
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-heritage-gold text-heritage-darker shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            All Archival Frames ({allPhotos.length})
          </button>
          {HERITAGE_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-heritage-gold text-heritage-darker font-bold shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              {cat.title.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredPhotos.length} Photos
        </div>
      </div>

      {/* Archival Masonry Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map((photo, index) => {
          // Add rhythmic height variations for editorial masonry effect
          const isLarge = index % 5 === 0;

          return (
            <div
              key={photo.id}
              className={`group relative rounded-2xl overflow-hidden border border-white/10 bg-heritage-surface/90 shadow-xl hover:border-heritage-gold/50 transition-all duration-300 flex flex-col justify-between ${
                isLarge ? 'sm:col-span-2 lg:col-span-2' : ''
              }`}
            >
              <div
                className={`relative overflow-hidden cursor-pointer ${
                  isLarge ? 'h-80 sm:h-96' : 'h-64'
                }`}
                onClick={() => setActiveLightboxImage(photo.image)}
                data-cursor="view"
              >
                <SafeImage
                  src={photo.image.src}
                  alt={photo.image.alt}
                  title={photo.title}
                  categoryBadge={photo.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity pointer-events-none" />

                {/* Top tags */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="bg-heritage-darker/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-heritage-gold uppercase tracking-wider border border-white/10">
                    {photo.category.replace('-', ' ')}
                  </span>
                  <span className="bg-black/60 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                    {photo.period}
                  </span>
                </div>

                {/* Hover Quick Action */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="bg-heritage-gold text-heritage-darker text-xs font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Archival Specimen</span>
                  </span>
                </div>

                {/* Bottom Image Info Overlay */}
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-white group-hover:text-heritage-gold transition-colors line-clamp-1">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                    {photo.image.caption || photo.image.alt}
                  </p>
                </div>
              </div>

              {/* Card Footer with Details & Source Link */}
              <div className="p-4 bg-heritage-surface/90 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="truncate max-w-[200px]">
                  Credit: {photo.image.credit}
                </span>

                <Link
                  to={`/heritage/${photo.slug}`}
                  className="text-heritage-gold hover:underline font-semibold flex items-center gap-1 flex-shrink-0"
                  data-cursor="link"
                >
                  <span>Go to Record</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
