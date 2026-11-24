import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Volume2, Globe, Quote, ArrowRight, PlusCircle } from 'lucide-react';
import { COMMUNITY_STORIES } from '../data/storiesData';
import { AudioPlayerMock } from '../components/ui/AudioPlayerMock';
import { SafeImage } from '../components/ui/SafeImage';

export const StoriesPage: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const allTags = useMemo(() => {
    const set = new Set<string>();
    COMMUNITY_STORIES.forEach((s) => s.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, []);

  const filteredStories = useMemo(() => {
    if (selectedTag === 'all') return COMMUNITY_STORIES;
    return COMMUNITY_STORIES.filter((s) => s.tags.includes(selectedTag));
  }, [selectedTag]);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-heritage-surface border border-heritage-gold/30 text-xs text-heritage-gold font-semibold uppercase tracking-widest shadow-md">
          <Mic className="w-3.5 h-3.5" />
          <span>Global Oral Heritage & Living Memories</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-black text-white tracking-tight">
          Voices of the Ancestors & Elders
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
          Firsthand recitals from Andean potato seed keepers, West African Manding griots, Kyoto woodblock master artisans, and Pacific Northwest indigenous totem carvers.
        </p>
      </div>

      {/* Filter Chips & Action Bar */}
      <div className="bg-heritage-surface/80 border border-white/10 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-slate-400 mr-2">Filter by Lore:</span>
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedTag === 'all'
                ? 'bg-heritage-gold text-heritage-darker shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            All Recordings ({COMMUNITY_STORIES.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedTag === tag
                  ? 'bg-heritage-gold text-heritage-darker font-bold shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        <Link
          to="/contribute?category=oral-histories"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-heritage-gold text-heritage-darker font-bold text-xs shadow-md hover:bg-heritage-gold-light transition-colors"
          data-cursor="link"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Record an Elder’s Voice</span>
        </Link>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredStories.map((story) => (
          <article
            key={story.id}
            className="bg-heritage-surface/90 border border-white/10 rounded-2xl overflow-hidden hover:border-heritage-gold/40 transition-all duration-300 shadow-xl flex flex-col justify-between group"
          >
            <div>
              {/* Image banner with SafeImage */}
              <div className="relative h-64 overflow-hidden">
                <SafeImage
                  src={story.image.src}
                  alt={story.image.alt}
                  title={story.title}
                  categoryBadge="oral-histories"
                  country={story.country}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-heritage-surface via-transparent to-black/40 pointer-events-none" />

                <div className="absolute top-3 left-3 bg-heritage-darker/90 backdrop-blur-md px-3 py-1 rounded-full text-xs text-heritage-gold font-medium border border-white/10 flex items-center gap-1.5 pointer-events-none">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{story.duration}</span>
                </div>

                <div className="absolute top-3 right-3 bg-black/60 px-2.5 py-1 rounded text-xs text-slate-300 font-mono pointer-events-none">
                  Recorded {story.recordedYear}
                </div>

                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-slate-200 pointer-events-none">
                  <Globe className="w-3.5 h-3.5 text-heritage-gold" />
                  <span>{story.location}, {story.country} ({story.continent})</span>
                </div>
              </div>

              {/* Story Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-white group-hover:text-heritage-gold transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-xs text-heritage-saffron font-semibold mt-1">
                    {story.narrator} • <span className="text-slate-400 font-normal">{story.narratorRole}</span>
                  </p>
                </div>

                {/* Excerpt */}
                <div className="relative bg-black/30 p-4 rounded-xl border border-white/5">
                  <Quote className="w-5 h-5 text-heritage-gold/30 absolute -top-2.5 -left-1" />
                  <p className="text-xs sm:text-sm text-slate-300 italic pl-3 leading-relaxed">
                    "{story.excerpt}"
                  </p>
                </div>
              </div>
            </div>

            {/* Simulated Audio Waveform Bar & Link */}
            <div className="p-6 pt-0 space-y-4">
              <AudioPlayerMock title={story.title} duration={story.duration} />

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {story.language}
                </span>
                <Link
                  to={`/stories/${story.slug}`}
                  className="font-bold text-heritage-gold hover:underline flex items-center gap-1"
                  data-cursor="link"
                >
                  <span>Read Full Transcript & Lore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
