import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Compass } from 'lucide-react';
import { HeritageService } from '../../services/heritageService';
import type { HeritageItem } from '../../types/heritage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HeritageItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      const hits = HeritageService.getAll({ query: query.trim() });
      setResults(hits.slice(0, 6));
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (slug: string) => {
    onClose();
    navigate(`/heritage/${slug}`);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Heritage Search"
      className="fixed inset-0 z-[100000] flex items-start justify-center pt-20 px-4 sm:px-6 bg-heritage-darker/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-heritage-surface border border-heritage-gold/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-heritage-dark/60">
          <Search className="w-5 h-5 text-heritage-gold" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search monuments, festivals, crafts, folk dances, languages..."
            className="flex-1 bg-transparent border-none text-white placeholder-slate-400 text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-white"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-white/5 border border-white/10 rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-white/5">
          {query.trim() && results.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Compass className="w-10 h-10 text-heritage-gold/40 mx-auto mb-2 animate-bounce" />
              <p className="text-slate-300 font-medium">No heritage entries found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Try keywords like "Hampi", "Yakshagana", "Bidriware", "Dasara", or "Water".</p>
            </div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.slug)}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
                data-cursor="link"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.primaryImage.src}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover border border-white/10"
                  />
                  <div>
                    <h5 className="font-serif font-bold text-white group-hover:text-heritage-gold transition-colors text-sm sm:text-base">
                      {item.title}
                    </h5>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {item.region}, {item.country} ({item.continent}) • {item.period}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-heritage-gold group-hover:translate-x-1 transition-all" />
              </div>
            ))
          ) : (
            <div className="py-6 px-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">Popular Searches</span>
              <div className="flex flex-wrap gap-2">
                {['Hampi', 'Yakshagana', 'Belur', 'Channapatna', 'Dasara', 'Kere Tank', 'Halmidi', 'Bidriware'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-heritage-gold/20 hover:text-heritage-gold text-slate-300 transition-colors border border-white/5"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-heritage-darker text-xs text-slate-400 flex items-center justify-between">
          <span>Search verified digital archive</span>
          <button
            onClick={() => {
              onClose();
              navigate('/explore');
            }}
            className="text-heritage-gold hover:underline"
          >
            Go to Explore & Filter Page &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
