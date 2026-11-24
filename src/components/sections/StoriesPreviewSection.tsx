import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mic, MapPin, Quote } from 'lucide-react';
import { COMMUNITY_STORIES } from '../../data/storiesData';
import { SectionHeading } from '../ui/SectionHeading';
import { AudioPlayerMock } from '../ui/AudioPlayerMock';
import { SafeImage } from '../ui/SafeImage';

export const StoriesPreviewSection: React.FC = () => {
  const featuredStories = COMMUNITY_STORIES.slice(0, 3);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-heritage-darker relative overflow-hidden border-t border-white/5">
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-heritage-emerald/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-heritage-gold/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            badge="Living Voices Archive"
            title="Oral Histories & Community Memories"
            subtitle="Firsthand recollections from Andean master weavers, Sahelian kora griots, Kyoto lacquer masters, and Pacific Northwest First Nations carvers."
          />

          <Link
            to="/stories"
            className="inline-flex items-center gap-2 text-xs font-bold text-heritage-gold hover:underline uppercase tracking-wider self-start md:self-end"
            data-cursor="link"
          >
            <span>Explore All Oral Histories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredStories.map((story) => (
            <article
              key={story.id}
              className="bg-heritage-surface/80 rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between hover:border-heritage-gold/40 transition-all duration-300 hover:shadow-xl group"
            >
              <div>
                {/* Visual Header */}
                <div className="relative h-52 overflow-hidden">
                  <SafeImage
                    src={story.image.src}
                    alt={story.image.alt}
                    fallbackTitle={story.title}
                    fallbackCategory={story.country}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-heritage-surface via-transparent to-black/40" />

                  <div className="absolute top-3 left-3 bg-heritage-darker/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-heritage-gold border border-white/10 flex items-center gap-1.5">
                    <Mic className="w-3 h-3" />
                    <span>{story.duration}</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-black/60 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                    {story.continent}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-xs text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-heritage-gold" />
                      {story.location}, {story.country}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{story.recordedYear}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white group-hover:text-heritage-gold transition-colors leading-snug">
                      {story.title}
                    </h3>
                    <p className="text-xs text-heritage-saffron font-medium mt-1">
                      {story.narrator} • <span className="text-slate-400">{story.narratorRole}</span>
                    </p>
                  </div>

                  {/* Excerpt with stylized quote */}
                  <div className="relative bg-black/20 p-3.5 rounded-xl border border-white/5">
                    <Quote className="w-4 h-4 text-heritage-gold/40 absolute -top-2 -left-1" />
                    <p className="text-xs text-slate-300 italic pl-2 leading-relaxed font-sans">
                      "{story.excerpt}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulated Audio Waveform Bar */}
              <div className="p-6 pt-0">
                <AudioPlayerMock title={story.title} duration={story.duration} />
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-sans">
                    {story.language}
                  </span>
                  <Link
                    to={`/stories/${story.slug}`}
                    className="text-xs font-semibold text-heritage-gold hover:underline flex items-center gap-1"
                    data-cursor="link"
                  >
                    <span>Read Full Record</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
