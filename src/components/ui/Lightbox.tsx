import React, { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import type { HeritageImage } from '../../types/heritage';

export interface LightboxProps {
  isOpen?: boolean;
  onClose: () => void;
  image?: HeritageImage | null;
  images?: HeritageImage[];
  currentIndex?: number;
  onNavigate?: (newIndex: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen = true,
  onClose,
  image,
  images,
  currentIndex: externalIndex,
  onNavigate,
}) => {
  const [internalIndex, setInternalIndex] = useState(0);

  // Normalize images list
  const imageList: HeritageImage[] = images || (image ? [image] : []);
  const activeIndex = externalIndex !== undefined ? externalIndex : internalIndex;
  const currentImage = imageList[activeIndex];

  const handleNavigate = useCallback((newIndex: number) => {
    if (onNavigate) {
      onNavigate(newIndex);
    } else {
      setInternalIndex(newIndex);
    }
  }, [onNavigate]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && imageList.length > 1) {
        handleNavigate((activeIndex - 1 + imageList.length) % imageList.length);
      }
      if (e.key === 'ArrowRight' && imageList.length > 1) {
        handleNavigate((activeIndex + 1) % imageList.length);
      }
    },
    [isOpen, onClose, handleNavigate, activeIndex, imageList.length]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !currentImage) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image Lightbox Viewer"
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-heritage-darker/95 backdrop-blur-md p-4 sm:p-6 md:p-10 select-none animate-fadeIn"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close Lightbox"
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:ring-2 focus:ring-heritage-gold"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev Navigation */}
      {imageList.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate((activeIndex - 1 + imageList.length) % imageList.length);
          }}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-heritage-gold/80 hover:text-heritage-dark text-white transition-all backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Navigation */}
      {imageList.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate((activeIndex + 1) % imageList.length);
          }}
          aria-label="Next image"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-heritage-gold/80 hover:text-heritage-dark text-white transition-all backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Central Content Card */}
      <div
        className="relative max-w-5xl max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-xl border border-heritage-gold/30 shadow-2xl bg-heritage-surface">
          <img
            src={currentImage.src}
            alt={currentImage.alt}
            className="max-h-[70vh] w-auto object-contain mx-auto transition-transform duration-300"
          />
        </div>

        {/* Caption & Metadata Bar */}
        <div className="mt-4 w-full bg-heritage-surface/90 border border-white/10 rounded-lg p-4 text-slate-200 text-sm backdrop-blur-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <p className="font-semibold text-white">{currentImage.caption || currentImage.alt}</p>
            {currentImage.period && (
              <span className="text-xs text-heritage-gold mr-3">Period: {currentImage.period}</span>
            )}
            <span className="text-xs text-slate-400">Credit: {currentImage.credit}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{currentImage.license || 'Open Cultural License'}</span>
          </div>
        </div>

        {/* Counter */}
        {imageList.length > 1 && (
          <div className="mt-2 text-xs text-slate-400 font-mono tracking-wider">
            {activeIndex + 1} / {imageList.length}
          </div>
        )}
      </div>
    </div>
  );
};

