import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';

interface AudioPlayerMockProps {
  title: string;
  duration?: string;
  narrator?: string;
}

export const AudioPlayerMock: React.FC<AudioPlayerMockProps> = ({
  title,
  duration = '4:35',
  narrator,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1.2;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  // Generate deterministic wave heights
  const waveHeights = [24, 38, 55, 70, 42, 60, 85, 95, 65, 48, 75, 90, 60, 35, 50, 80, 100, 75, 45, 65, 85, 70, 50, 30, 60, 80, 45, 25];

  return (
    <div className="bg-heritage-surface/90 border border-heritage-gold/25 rounded-xl p-4 sm:p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-heritage-saffron">Oral Archive Audio Recording (Demo UI)</span>
          <h4 className="text-sm sm:text-base font-serif font-bold text-white line-clamp-1">{title}</h4>
          {narrator && <p className="text-xs text-slate-400">Narrator: {narrator}</p>}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-heritage-gold bg-heritage-gold/10 px-2 py-1 rounded">
          <Volume2 className="w-3.5 h-3.5" />
          <span>{duration}</span>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div 
        className="h-14 bg-heritage-dark/80 rounded-lg p-2.5 flex items-center gap-1 cursor-pointer overflow-hidden border border-white/5 relative"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const newProgress = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
          setProgress(newProgress);
        }}
      >
        {waveHeights.map((h, i) => {
          const barProgress = (i / waveHeights.length) * 100;
          const isPassed = barProgress <= progress;
          return (
            <div
              key={i}
              className={`flex-1 rounded-full transition-all duration-150 ${
                isPassed
                  ? 'bg-gradient-to-t from-heritage-saffron to-heritage-gold'
                  : 'bg-slate-700/60'
              } ${isPlaying && isPassed ? 'scale-y-110' : ''}`}
              style={{ height: `${h}%` }}
            />
          );
        })}

        {/* Progress indicator line */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-glow transition-all pointer-events-none"
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="flex items-center gap-1.5 bg-heritage-gold hover:bg-heritage-gold-light text-heritage-darker font-semibold px-3 py-1.5 rounded-full transition-all shadow-md active:scale-95"
            aria-label={isPlaying ? 'Pause audio recording' : 'Play audio recording'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Listen'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Restart audio track"
            title="Restart track"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="text-slate-400 font-mono">
          {Math.floor((progress / 100) * 4)}:
          {String(Math.floor(((progress / 100) * 275) % 60)).padStart(2, '0')} / {duration}
        </span>
      </div>
    </div>
  );
};

