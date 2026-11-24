import React, { useState } from 'react';
import { Landmark, Image as ImageIcon } from 'lucide-react';

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  title?: string;
  categoryBadge?: string;
  country?: string;
  fallbackTitle?: string;
  fallbackCategory?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  title,
  categoryBadge,
  country,
  fallbackTitle,
  fallbackCategory,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const displayCategory = categoryBadge || fallbackCategory;
  const displayTitle = title || fallbackTitle || alt;

  if (hasError || !src) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-heritage-surface via-heritage-card to-heritage-darker text-slate-300 p-6 ${className}`}
        role="img"
        aria-label={alt || displayTitle || 'Cultural Heritage Asset'}
      >
        <div className="absolute inset-0 bg-kolam-grid opacity-15 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-heritage-gold/15 border border-heritage-gold/30 flex items-center justify-center text-heritage-gold">
            <Landmark className="w-6 h-6" />
          </div>
          {displayCategory && (
            <span className="text-[10px] uppercase font-bold tracking-widest text-heritage-gold">
              {displayCategory}
            </span>
          )}
          <span className="text-xs font-serif font-semibold text-slate-200 max-w-[200px] line-clamp-2">
            {displayTitle || 'Heritage Visual Archive'}
          </span>
          {country && (
            <span className="text-[10px] text-slate-400 font-mono">
              {country} • Archival Record
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-heritage-surface animate-pulse flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-heritage-gold/30" />
        </div>
      )}
      <img
        src={src}
        alt={alt || displayTitle || 'Cultural Heritage'}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};

