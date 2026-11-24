import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Maximize2, ArrowRight } from 'lucide-react';
import { HeritageService } from '../../services/heritageService';
import { SectionHeading } from '../ui/SectionHeading';
import { Lightbox } from '../ui/Lightbox';
import { SafeImage } from '../ui/SafeImage';
import type { HeritageImage } from '../../types/heritage';

export const PhotoGallerySection: React.FC = () => {
  const photos = HeritageService.getAllGalleryPhotos().slice(0, 6);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const imagesForLightbox: HeritageImage[] = photos.map((p) => ({
    src: p.image.src,
    alt: p.image.alt,
    caption: p.title,
    credit: p.image.credit,
    license: p.image.license,
    period: p.period,
  }));

  const openLightbox = (index: number) => {
    setActivePhotoIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-heritage-surface/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            badge="Visual Ephemera & Documents"
            title="Historical Photographs & Archival Imagery"
            subtitle="19th-century glass plate negatives, early ethnographic daguerreotypes, ancient codices, and high-resolution surveys of humanity’s cultural treasures."
            align="left"
          />

          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-heritage-gold/30 hover:border-heritage-gold bg-heritage-surface text-slate-200 hover:text-heritage-gold text-xs sm:text-sm font-semibold transition-all h-fit self-start md:self-auto shadow-md"
            data-cursor="link"
          >
            <span>View Full Visual Archive</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Editorial Collage Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => openLightbox(idx)}
              className="group relative rounded-2xl overflow-hidden bg-heritage-dark border border-heritage-gold/20 hover:border-heritage-gold/60 transition-all duration-500 shadow-xl cursor-pointer"
              data-cursor="view"
            >
              <div className="relative h-64 overflow-hidden">
                <SafeImage
                  src={item.image.src}
                  alt={item.image.alt}
                  fallbackTitle={item.title}
                  fallbackCategory={item.country}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-heritage-darker via-transparent to-transparent opacity-80" />

                {/* Country / Continent Tag */}
                <span className="absolute top-3 left-3 bg-heritage-darker/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-heritage-gold border border-white/10">
                  {item.continent} • {item.country}
                </span>

                <span className="absolute top-3 right-3 bg-black/60 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                  {item.period}
                </span>

                {/* Hover Reveal Action */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="p-3 rounded-full bg-heritage-gold text-heritage-darker shadow-2xl">
                    <Maximize2 className="w-5 h-5" />
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <h4 className="font-serif font-bold text-base text-white group-hover:text-heritage-gold transition-colors truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 truncate mt-0.5">
                    Credit: {item.image.credit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessible Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <Lightbox
          images={imagesForLightbox}
          currentIndex={activePhotoIndex}
          onNavigate={(i) => setActivePhotoIndex(i)}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </section>
  );
};
