import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, X, Plus } from 'lucide-react';
import { STORIES_DATA, type HeritageStory } from '../../data/socialFeedData';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface HeritageStoriesProps {
  onStoryClick?: (story: HeritageStory) => void;
  onAddStoryClick?: () => void;
}

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=300&q=80';
const FALLBACK_MEDIA = 'https://images.unsplash.com/photo-1600100397608-f010f4439c1e?auto=format&fit=crop&w=1200&q=80';
const STORY_DURATION_MS = 5000;

export const HeritageStories: React.FC<HeritageStoriesProps> = ({
  onAddStoryClick,
}) => {
  const { user } = useAuth();
  const [stories, setStories] = useState<HeritageStory[]>(STORIES_DATA);
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const liveStories = await apiService.getStories();
      if (liveStories && liveStories.length > 0) {
        // Ensure "Your Story" is preserved at position 0
        const userStoryPlaceholder: HeritageStory = {
          id: 'story-your-story',
          title: 'Your Story',
          category: 'user',
          avatarUrl: user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          mediaUrl: user?.avatar || 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80',
        };

        const otherStories = liveStories.filter(
          (s) => s.id !== 'story-your-story' && s.title !== 'Your Story'
        );

        setStories([userStoryPlaceholder, ...otherStories]);
      }
    } catch {
      setStories(STORIES_DATA);
    }
  };

  // Story progress timer
  useEffect(() => {
    if (activeStoryIdx === null || isPaused) return;

    setProgress(0);
    const intervalTime = 50;
    const step = (intervalTime / STORY_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeStoryIdx, isPaused]);

  const handleStorySelect = (story: HeritageStory, idx: number) => {
    if ((story.id === 'story-1' || story.id === 'story-your-story' || story.title === 'Your Story') && onAddStoryClick) {
      onAddStoryClick();
      return;
    }
    setActiveStoryIdx(idx);
    setProgress(0);
    apiService.viewStory(story.id);
  };

  const activeStory = activeStoryIdx !== null ? stories[activeStoryIdx] : null;

  const handleNext = () => {
    if (activeStoryIdx !== null && activeStoryIdx < stories.length - 1) {
      const nextIdx = activeStoryIdx + 1;
      setActiveStoryIdx(nextIdx);
      setProgress(0);
      apiService.viewStory(stories[nextIdx].id);
    } else {
      setActiveStoryIdx(null);
      setProgress(0);
    }
  };

  const handlePrev = () => {
    if (activeStoryIdx !== null && activeStoryIdx > 0) {
      const prevIdx = activeStoryIdx - 1;
      setActiveStoryIdx(prevIdx);
      setProgress(0);
      apiService.viewStory(stories[prevIdx].id);
    } else {
      setProgress(0);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="relative bg-[#fcfaf6] rounded-2xl p-4 border border-[#e8dfd3] shadow-sm mb-6 select-none text-left group/strip">
        {/* Scroll Left Button */}
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 border border-[#d8ccbd] shadow-md flex items-center justify-center text-[#5c4633] hover:text-[#1a120c] hover:border-[#c5a059] opacity-0 group-hover/strip:opacity-100 transition-opacity focus:outline-none"
          aria-label="Scroll stories left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Story Items Strip */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
        >
          {stories.map((story, idx) => {
            const isUser = story.id === 'story-1' || story.id === 'story-your-story' || story.title === 'Your Story';
            const displayAvatar = isUser && user?.avatar ? user.avatar : story.avatarUrl || FALLBACK_AVATAR;

            return (
              <button
                key={story.id}
                onClick={() => handleStorySelect(story, idx)}
                className="flex flex-col items-center gap-2 flex-shrink-0 group focus:outline-none"
              >
                {/* Circular Avatar with Authentic Golden Ring */}
                <div className="relative">
                  <div className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-full p-[2.5px] border-2 border-[#c5a059] transition-transform duration-200 group-hover:scale-105">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#241a12] p-0.5 flex items-center justify-center">
                      {isUser && !user?.avatar ? (
                        <div className="w-full h-full rounded-full bg-[#3d2b1f] text-[#fef08a] flex items-center justify-center font-bold text-lg font-serif">
                          {user?.name ? user.name[0].toUpperCase() : 'U'}
                        </div>
                      ) : (
                        <img
                          src={displayAvatar}
                          alt={story.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                          }}
                          className="w-full h-full object-cover rounded-full"
                          loading="lazy"
                        />
                      )}
                    </div>
                  </div>

                  {/* Plus badge for Your Story */}
                  {isUser && (
                    <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#c5a059] border-2 border-white flex items-center justify-center text-[#16100c] shadow-sm">
                      <Plus className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <span className="text-xs font-sans font-medium text-[#423225] group-hover:text-[#1a120c] transition-colors max-w-[70px] truncate text-center">
                  {story.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 border border-[#d8ccbd] shadow-md flex items-center justify-center text-[#5c4633] hover:text-[#1a120c] hover:border-[#c5a059] opacity-0 group-hover/strip:opacity-100 transition-opacity focus:outline-none"
          aria-label="Scroll stories right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Story Viewer Modal with Authentic Segmented Progress Indicators */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div
            className="relative w-full max-w-md rounded-2xl overflow-hidden bg-[#16100c] border border-[#c5a059]/40 shadow-2xl flex flex-col aspect-[9/16] max-h-[780px]"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* 1. Segmented Progress Bars Header */}
            <div className="absolute top-0 inset-x-0 pt-3 px-3 z-30 flex items-center gap-1.5">
              {stories.map((s, i) => {
                let fillPercent = 0;
                if (i < (activeStoryIdx || 0)) fillPercent = 100;
                else if (i === activeStoryIdx) fillPercent = progress;

                return (
                  <div
                    key={s.id}
                    className="flex-1 h-1 bg-white/25 rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* 2. Top Info Bar */}
            <div className="absolute top-6 inset-x-0 p-4 z-20 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent">
              <div className="flex items-center gap-2.5">
                <img
                  src={activeStory.avatarUrl || FALLBACK_AVATAR}
                  alt={activeStory.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                  }}
                  className="w-8 h-8 rounded-full border border-[#c5a059] object-cover"
                />
                <div>
                  <span className="text-sm font-sans font-bold text-white drop-shadow-sm block leading-tight">
                    {activeStory.title}
                  </span>
                  <span className="text-[10px] text-[#e6ca85] uppercase tracking-wider font-semibold">
                    {activeStory.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveStoryIdx(null);
                    setProgress(0);
                  }}
                  className="p-1 rounded-full text-white/80 hover:text-white bg-black/40 border border-white/20 transition-colors"
                  aria-label="Close story"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 3. Media Canvas */}
            <div className="w-full h-full relative flex items-center justify-center bg-black">
              {activeStory.mediaUrl.endsWith('.mp4') ? (
                <video
                  src={activeStory.mediaUrl}
                  autoPlay
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={activeStory.mediaUrl || FALLBACK_MEDIA}
                  alt={activeStory.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_MEDIA;
                  }}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Left Tap Zone for Previous */}
            <div
              onClick={handlePrev}
              className="absolute left-0 top-16 bottom-0 w-1/3 z-10 cursor-pointer"
            />

            {/* Right Tap Zone for Next */}
            <div
              onClick={handleNext}
              className="absolute right-0 top-16 bottom-0 w-1/3 z-10 cursor-pointer"
            />

            {/* Navigation Chevron Buttons */}
            {activeStoryIdx !== null && activeStoryIdx > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 border border-white/20 transition-all"
                aria-label="Previous story"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {activeStoryIdx !== null && activeStoryIdx < stories.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 border border-white/20 transition-all"
                aria-label="Next story"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
