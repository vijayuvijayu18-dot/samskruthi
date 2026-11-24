import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="max-w-md mx-auto space-y-6">
        {/* Decorative Motif */}
        <div className="w-20 h-20 rounded-full bg-heritage-surface border border-heritage-gold/30 flex items-center justify-center mx-auto text-heritage-gold shadow-2xl">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '20s' }} />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-heritage-gold font-bold">
            Status 404 • Lost in the Sands of Time
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-black text-white">
            Inscription Unfound
          </h1>
          <p className="font-kannada text-lg text-heritage-gold/80 font-bold">
            ಕ್ಷಮಿಸಿ, ಈ ಪುಟವು ಲಭ್ಯವಿಲ್ಲ
          </p>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed pt-2">
            The parchment or stone carving you are searching for does not exist in our digital repository, or may have been relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/"
            className="px-6 py-3 rounded-full bg-heritage-gold text-heritage-darker font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:bg-heritage-gold-light transition-colors"
            data-cursor="link"
          >
            <Home className="w-4 h-4" />
            <span>Return to Sanctuary</span>
          </Link>
          <Link
            to="/explore"
            className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            data-cursor="link"
          >
            <Search className="w-4 h-4" />
            <span>Search Archive</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
