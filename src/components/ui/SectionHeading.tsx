import React from 'react';

export interface SectionHeadingProps {
  badge?: string;
  indicBadge?: string;
  indicWord?: string;
  title: string;
  indicTitle?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  accentColor?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  indicBadge,
  indicWord,
  title,
  indicTitle,
  subtitle,
  align = 'center',
  accentColor,
}) => {
  const isCenter = align === 'center';
  const effectiveIndicBadge = indicBadge || indicWord;

  return (
    <div className={`mb-12 md:mb-16 ${isCenter ? 'text-center mx-auto max-w-3xl' : 'max-w-2xl'}`}>
      {/* Decorative Badge */}
      {(badge || effectiveIndicBadge) && (
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-heritage-gold/25 bg-heritage-surface/80 backdrop-blur-sm mb-4 shadow-sm ${isCenter ? 'mx-auto' : ''}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-heritage-gold animate-pulse" />
          {badge && <span className="text-xs uppercase tracking-widest font-semibold text-heritage-gold">{badge}</span>}
          {effectiveIndicBadge && (
            <span className="text-xs font-kannada text-slate-400 border-l border-white/10 pl-2">
              {effectiveIndicBadge}
            </span>
          )}
        </div>
      )}

      {/* Main Title */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-100 tracking-tight leading-tight">
        {title}
      </h2>

      {/* Indic Secondary Flourish */}
      {indicTitle && (
        <p className="mt-2 text-sm sm:text-base font-kannada text-heritage-gold/80 italic font-medium">
          {indicTitle}
        </p>
      )}

      {/* Architectural Line Motif */}
      <div className={`flex items-center gap-3 my-4 ${isCenter ? 'justify-center' : 'justify-start'}`}>
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-heritage-gold/40" />
        <div className="w-2 h-2 rotate-45 border border-heritage-gold bg-heritage-saffron/40" style={accentColor ? { borderColor: accentColor } : undefined} />
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-heritage-gold/40" />
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

