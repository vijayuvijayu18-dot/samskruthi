import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Upload,
  X,
  Send,
  MapPin,
  Music,
  Eye,
} from 'lucide-react';
import { apiService, type HeritageReel } from '../../../services/api';

export const ReelsTab: React.FC = () => {
  const [reels, setReels] = useState<HeritageReel[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeCommentsReel, setActiveCommentsReel] = useState<HeritageReel | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Upload Form State
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('Hampi, Karnataka');
  const [audioTitle, setAudioTitle] = useState('Morning Ragas');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      const data = await apiService.getReels();
      if (data && data.length > 0) {
        setReels(data);
      }
    } catch (err) {
      console.warn('Could not load reels from backend:', err);
    }
  };

  const handleLike = async (reel: HeritageReel, idx: number) => {
    const prevLiked = reel.isLiked;
    const nextLiked = !prevLiked;

    // Optimistic update
    setReels((prev) =>
      prev.map((r, i) =>
        i === idx
          ? {
              ...r,
              isLiked: nextLiked,
              likesCount: nextLiked ? r.likesCount + 1 : Math.max(0, r.likesCount - 1),
            }
          : r
      )
    );

    try {
      await apiService.toggleReelLike(reel.id);
    } catch {
      // Revert if failed
      setReels((prev) =>
        prev.map((r, i) => (i === idx ? { ...r, isLiked: prevLiked } : r))
      );
    }
  };

  const handleVideoClick = (idx: number) => {
    const vid = videoRefs.current[idx];
    if (!vid) return;
    if (vid.paused) {
      vid.play();
    } else {
      vid.pause();
    }
  };

  const openComments = async (reel: HeritageReel) => {
    setActiveCommentsReel(reel);
    try {
      const data = await apiService.getReelComments(reel.id);
      setComments(data);
    } catch {
      setComments([]);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommentsReel || !newCommentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await apiService.addReelComment(activeCommentsReel.id, newCommentText.trim());
      setComments((prev) => [res.comment, ...prev]);
      setNewCommentText('');
      setReels((prev) =>
        prev.map((r) =>
          r.id === activeCommentsReel.id ? { ...r, commentsCount: r.commentsCount + 1 } : r
        )
      );
    } catch (err: any) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setUploadError('Please select a valid MP4 or WebM video file');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setUploadError('');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !caption.trim()) {
      setUploadError('Video file and caption are required');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // 1. Upload video file to server
      const uploadRes = await apiService.uploadMedia(videoFile, 'reels');

      // 2. Create reel in Turso Cloud DB
      await apiService.createReel({
        caption: caption.trim(),
        videoUrl: uploadRes.url,
        location: location.trim(),
        audioTitle: audioTitle.trim(),
      });

      // 3. Reset and refresh
      setIsUploadModalOpen(false);
      setCaption('');
      setVideoFile(null);
      setVideoPreview('');
      await loadReels();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-2">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <h2 className="font-serif font-bold text-xl text-[#241a12]">
            Cultural Heritage Reels
          </h2>
          <p className="text-xs font-sans text-stone-500">
            Short-form living traditions and sacred temple architecture
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-[#b89047] text-[#16100c] font-sans font-semibold text-xs shadow-md transition-all active:scale-95"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Reel</span>
        </button>
      </div>

      {/* Reels Vertical Stream */}
      <div className="space-y-6">
        {reels.map((reel, idx) => (
          <div
            key={reel.id}
            className="relative w-full aspect-[9/16] max-h-[720px] rounded-2xl overflow-hidden bg-black border border-[#c5a059]/40 shadow-xl mx-auto flex items-center justify-center select-none"
          >
            {/* Video Player */}
            <video
              ref={(el) => {
                videoRefs.current[idx] = el;
              }}
              src={reel.videoUrl}
              loop
              autoPlay={idx === 0}
              muted={isMuted}
              playsInline
              onClick={() => handleVideoClick(idx)}
              onPlay={() => {
                apiService.viewReel(reel.id);
              }}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* Top Bar with Location and Sound Toggle */}
            <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent z-10 pointer-events-none">
              <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{reel.location}</span>
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="pointer-events-auto p-2 rounded-full bg-black/50 text-white hover:bg-black/70 border border-white/20 transition-colors"
                aria-label="Toggle mute"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#d4af37]" />}
              </button>
            </div>

            {/* Bottom Caption & Creator Info */}
            <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 text-left pointer-events-none">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-[#d4af37] p-0.5 bg-black">
                  <img
                    src={reel.creatorAvatar}
                    alt={reel.creatorName}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-sans font-bold text-white drop-shadow-sm leading-tight">
                    {reel.creatorName}
                  </h4>
                  <p className="text-[11px] font-sans text-stone-300">@{reel.creatorUsername}</p>
                </div>
              </div>

              <p className="text-xs font-sans text-stone-200 line-clamp-2 mb-2 drop-shadow-sm leading-relaxed">
                {reel.caption}
              </p>

              <div className="flex items-center gap-2 text-[11px] text-[#e6ca85] font-sans">
                <Music className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="truncate">{reel.audioTitle}</span>
              </div>
            </div>

            {/* Right Action Icons Column */}
            <div className="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-4">
              {/* Like Button */}
              <button
                onClick={() => handleLike(reel, idx)}
                className="flex flex-col items-center gap-1 text-white group focus:outline-none"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-75 ${
                    reel.isLiked
                      ? 'bg-rose-600/90 text-white'
                      : 'bg-black/45 text-white border border-white/20 hover:bg-black/70'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${reel.isLiked ? 'fill-white' : ''}`} />
                </div>
                <span className="text-[11px] font-bold text-white drop-shadow-md">
                  {reel.likesCount}
                </span>
              </button>

              {/* Comment Button */}
              <button
                onClick={() => openComments(reel)}
                className="flex flex-col items-center gap-1 text-white group focus:outline-none"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black/45 border border-white/20 backdrop-blur-md hover:bg-black/70 transition-transform active:scale-75">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-white drop-shadow-md">
                  {reel.commentsCount}
                </span>
              </button>

              {/* Views Counter */}
              <div className="flex flex-col items-center gap-1 text-white/80">
                <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black/35 border border-white/10 backdrop-blur-md">
                  <Eye className="w-4 h-4 text-[#d4af37]" />
                </div>
                <span className="text-[10px] font-semibold text-white/90 drop-shadow-md">
                  {reel.viewsCount}
                </span>
              </div>

              {/* Share Button */}
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Reel link copied to clipboard!');
                  }
                }}
                className="flex flex-col items-center gap-1 text-white group focus:outline-none"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black/45 border border-white/20 backdrop-blur-md hover:bg-black/70 transition-transform active:scale-75">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-white/90 drop-shadow-md">Share</span>
              </button>
            </div>
          </div>
        ))}

        {reels.length === 0 && (
          <div className="p-12 text-center bg-[#fcfaf6] rounded-2xl border border-[#e8dfd3]">
            <p className="text-sm font-sans text-stone-600 mb-3">
              No cultural reels available yet. Be the first to publish one!
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#c5a059] text-[#16100c] text-xs font-semibold"
            >
              Upload Video Reel
            </button>
          </div>
        )}
      </div>

      {/* Reel Comments Drawer Modal */}
      {activeCommentsReel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-[#fcfaf6] border border-[#c5a059]/40 shadow-2xl p-5 text-left max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8dfd3]">
              <h3 className="font-serif font-bold text-base text-[#241a12]">
                Reel Reflections ({comments.length})
              </h3>
              <button
                onClick={() => setActiveCommentsReel(null)}
                className="p-1 rounded-full text-stone-500 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-[200px]">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-stone-300 flex-shrink-0">
                    <img
                      src={c.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                      alt={c.authorName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 bg-[#f3ede2] p-2.5 rounded-xl border border-[#e2d6c3] text-xs">
                    <span className="font-bold text-[#241a12] mr-1.5">{c.authorName}</span>
                    <span className="text-stone-700">{c.text}</span>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-center text-xs text-stone-500 py-8">
                  No comments yet. Share your reflection on this heritage reel!
                </p>
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-[#e8dfd3] flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Add a cultural thought..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#f2ebd9] border border-[#d6c7b4] text-[#241a12] focus:outline-none focus:border-[#c5a059]"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newCommentText.trim()}
                className="px-3.5 py-2 rounded-xl bg-[#c5a059] text-[#16100c] text-xs font-semibold disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upload Reel Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#fcfaf6] border border-[#c5a059]/40 shadow-2xl p-6 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8dfd3]">
              <h3 className="font-serif font-bold text-lg text-[#241a12]">
                Publish a Cultural Heritage Reel
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-full text-stone-500 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              {/* Video File Picker */}
              <div>
                <label className="block text-xs font-semibold text-[#423225] uppercase tracking-wider mb-1">
                  Video File (MP4, WebM up to 50MB)
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleFileChange}
                  className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#c5a059] file:text-[#16100c] hover:file:bg-[#b89047] cursor-pointer"
                  required
                />
              </div>

              {videoPreview && (
                <div className="w-32 aspect-[9/16] rounded-xl overflow-hidden bg-black mx-auto border border-[#c5a059]">
                  <video src={videoPreview} className="w-full h-full object-cover" controls />
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-[#423225] uppercase tracking-wider mb-1">
                  Caption & Historical Context
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe the ancient ritual, temple ceremony, or craftsmanship..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[#f2ebd9] border border-[#d6c7b4] text-[#241a12] text-sm focus:outline-none focus:border-[#c5a059]"
                  required
                />
              </div>

              {/* Location & Audio */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#423225] uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#f2ebd9] border border-[#d6c7b4] text-[#241a12] text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#423225] uppercase tracking-wider mb-1">
                    Audio / Chants Title
                  </label>
                  <input
                    type="text"
                    value={audioTitle}
                    onChange={(e) => setAudioTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#f2ebd9] border border-[#d6c7b4] text-[#241a12] text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-3 rounded-xl bg-[#c5a059] hover:bg-[#b89047] text-[#16100c] font-sans font-bold text-sm shadow-md transition-all disabled:opacity-60"
                >
                  {isUploading ? 'Uploading & Processing Reel...' : 'Publish Cultural Reel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
