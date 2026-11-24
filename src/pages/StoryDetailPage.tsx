import React, { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, Mic, Volume2, 
  Quote, ArrowRight, Globe 
} from 'lucide-react';
import { HeritageService } from '../services/heritageService';
import { COMMUNITY_STORIES } from '../data/storiesData';
import { AudioPlayerMock } from '../components/ui/AudioPlayerMock';
import { SafeImage } from '../components/ui/SafeImage';

export const StoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const story = useMemo(() => (slug ? HeritageService.getStoryBySlug(slug) : undefined), [slug]);

  if (!story) {
    return <Navigate to="/stories" replace />;
  }

  // Next / Previous navigation
  const currentIndex = COMMUNITY_STORIES.findIndex((s) => s.id === story.id);
  const nextStory = COMMUNITY_STORIES[(currentIndex + 1) % COMMUNITY_STORIES.length];

  return (
    <div className="pt-24 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Back button */}
      <Link
        to="/stories"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-heritage-gold transition-colors"
        data-cursor="link"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Oral Histories</span>
      </Link>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5" />
            <span>Oral History Record</span>
          </span>
          <span className="text-slate-400">• Recorded in {story.recordedYear} • {story.continent}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-white tracking-tight leading-tight">
          {story.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-white/10 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <span className="text-heritage-saffron font-bold text-sm">{story.narrator}</span>
            <span>•</span>
            <span className="text-slate-400">{story.narratorRole}</span>
          </div>

          <div className="flex items-center gap-2 text-heritage-gold">
            <Globe className="w-3.5 h-3.5" />
            <span>{story.location}, {story.country}</span>
          </div>
        </div>
      </div>

      {/* Audio Waveform Player */}
      <div className="bg-heritage-surface border border-heritage-gold/30 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-heritage-gold font-bold">
            <Volume2 className="w-4 h-4" />
            <span>Verbatim Field Recording</span>
          </span>
          <span>{story.language}</span>
        </div>
        <AudioPlayerMock title={story.title} duration={story.duration} />
      </div>

      {/* Narrator Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <SafeImage
          src={story.image.src}
          alt={story.image.alt}
          title={story.narrator}
          categoryBadge="oral-histories"
          country={story.country}
          className="w-full h-80 sm:h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-heritage-darker via-transparent to-transparent opacity-90 pointer-events-none" />
        <div className="absolute bottom-4 left-4 right-4 bg-heritage-darker/90 backdrop-blur-md p-4 rounded-xl border border-white/10 text-xs text-slate-300">
          <p className="font-medium text-white">{story.image.caption || story.image.alt}</p>
          <span className="text-[11px] text-slate-400 block mt-1">
            Credit: {story.image.credit} • License: {story.image.license}
          </span>
        </div>
      </div>

      {/* Featured Excerpt Quote */}
      <div className="bg-heritage-surface/60 border-l-4 border-heritage-gold rounded-r-2xl p-6 relative">
        <Quote className="w-6 h-6 text-heritage-gold/40 absolute top-4 right-4" />
        <p className="text-base sm:text-lg text-slate-200 italic font-serif leading-relaxed">
          "{story.excerpt}"
        </p>
      </div>

      {/* Full Transcript Body */}
      <div className="space-y-6 text-slate-200 text-sm sm:text-base leading-relaxed font-sans">
        <h2 className="text-2xl font-serif font-bold text-white border-b border-white/10 pb-3">
          Verbatim Recital & Field Notes
        </h2>
        {story.fullStory.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {/* Tags */}
      <div className="pt-4 flex flex-wrap gap-2">
        {story.tags.map((t) => (
          <span key={t} className="text-xs px-3 py-1 rounded bg-black/40 text-slate-400 border border-white/5">
            #{t}
          </span>
        ))}
      </div>

      {/* Next Story Recommendation */}
      <div className="pt-10 border-t border-white/10 flex justify-between items-center">
        <Link
          to="/stories"
          className="text-xs text-slate-400 hover:text-white"
        >
          ← All Oral Histories
        </Link>

        {nextStory && (
          <Link
            to={`/stories/${nextStory.slug}`}
            className="flex items-center gap-2 text-xs font-bold text-heritage-gold hover:underline"
            data-cursor="link"
          >
            <span>Next: {nextStory.title}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
