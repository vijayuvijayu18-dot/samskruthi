import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  CheckCircle2,
  Send,
} from 'lucide-react';
import type { HeritagePost } from '../../data/socialFeedData';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface HeritageFeedPostProps {
  post: HeritagePost;
  onFollowToggle?: (authorUsername: string) => void;
  isFollowing?: boolean;
}

const FALLBACK_POST_IMAGE = 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=85';

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'Recently';
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffSec) || diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const HeritageFeedPost: React.FC<HeritageFeedPostProps> = ({
  post,
  onFollowToggle,
  isFollowing: initialFollowing = false,
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [shareFeedback, setShareFeedback] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleLike = async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await apiService.toggleLike(post.id);
    } catch {
      // Revert if error
      setIsLiked(!nextLiked);
      setLikesCount((prev) => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  const handleSaveToggle = async () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      await apiService.toggleBookmark(post.id);
    } catch {
      setIsSaved(!nextSaved);
    }
  };

  const handleFollowClick = async () => {
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);

    if (post.userId) {
      try {
        await apiService.toggleFollow(post.userId);
      } catch {
        setIsFollowing(!nextFollowing);
      }
    }

    if (onFollowToggle) {
      onFollowToggle(post.authorUsername);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const text = newComment.trim();
    setIsSubmittingComment(true);

    // Optimistic comment item
    const item = {
      id: `c-${Date.now()}`,
      author: user?.name || 'You',
      avatarUrl: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      text,
      timeAgo: 'Just now',
    };

    setCommentsList([item, ...commentsList]);
    setNewComment('');

    try {
      await apiService.addComment(post.id, text);
    } catch (err: any) {
      console.warn('Comment failed:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Samskruthi - ${post.location}`,
          text: post.caption,
          url: window.location.href,
        });
        return;
      } catch (err) {
        // Fallback to clipboard if share was cancelled or failed
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2000);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return count.toString();
  };

  return (
    <article className="bg-[#fcfaf6] rounded-2xl border border-[#e8dfd3] shadow-sm overflow-hidden mb-6 transition-all text-left">
      {/* 1. Post Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden p-0.5 border border-[#c5a059]/50 bg-[#241a12]">
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';
              }}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-bold text-sm text-[#241a12]">
                {post.authorName}
              </span>
              {post.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-[#0284c7] fill-[#0284c7]/20" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#7e6d5e] font-sans -mt-0.5">
              <span>{post.location}</span>
              <span>•</span>
              <span>{formatTimeAgo((post as any).createdAt || post.timeAgo)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Follow Pill Button */}
          {user?.id !== post.userId && (
            <button
              onClick={handleFollowClick}
              className={`px-4 py-1 rounded-full text-xs font-sans font-medium transition-all ${
                isFollowing
                  ? 'bg-[#ede6d8] text-[#5e4b3c] hover:bg-[#e4dbcc]'
                  : 'bg-[#f4efe6] hover:bg-[#ebe3d4] border border-[#d6c7b4] text-[#342416] font-semibold'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          {/* Three dots options */}
          <button
            className="p-1 rounded-full text-[#7e6d5e] hover:text-[#241a12] transition-colors"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Post Media Canvas */}
      <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden">
        {post.mediaUrl.endsWith('.mp4') ? (
          <video src={post.mediaUrl} controls className="w-full h-full object-cover" />
        ) : (
          <img
            src={post.mediaUrl}
            alt={post.caption}
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_POST_IMAGE;
            }}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      {/* 3. Post Actions Bar */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-5 text-[#2c2016]">
            {/* Heart / Like Button */}
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 hover:text-[#c5a059] transition-all group focus:outline-none"
              aria-label="Like post"
            >
              <Heart
                className={`w-6 h-6 transition-transform group-active:scale-75 ${
                  isLiked
                    ? 'text-rose-600 fill-rose-600'
                    : 'text-[#241910] group-hover:text-[#c5a059]'
                }`}
              />
              <span className="font-sans text-xs font-bold text-[#241910]">
                {formatCount(likesCount)}
              </span>
            </button>

            {/* Comment Trigger */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 hover:text-[#c5a059] transition-all group focus:outline-none"
              aria-label="View comments"
            >
              <MessageCircle className="w-6 h-6 text-[#241910] group-hover:text-[#c5a059] transition-transform group-active:scale-75" />
              <span className="font-sans text-xs font-bold text-[#241910]">
                {formatCount(commentsList.length || post.commentsCount)}
              </span>
            </button>

            {/* Share Trigger */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-[#c5a059] transition-all group relative focus:outline-none"
              aria-label="Share post"
            >
              <Share2 className="w-6 h-6 text-[#241910] group-hover:text-[#c5a059] transition-transform group-active:scale-75" />
              <span className="font-sans text-xs font-bold text-[#241910]">
                {formatCount(post.sharesCount)}
              </span>
              {shareFeedback && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#16100c] text-white text-[10px] rounded-md shadow-md whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>
          </div>

          {/* Bookmark Trigger */}
          <button
            onClick={handleSaveToggle}
            className="hover:text-[#c5a059] transition-all group focus:outline-none"
            aria-label="Save to heritage collections"
          >
            <Bookmark
              className={`w-6 h-6 transition-transform group-active:scale-75 ${
                isSaved
                  ? 'text-[#c5a059] fill-[#c5a059]'
                  : 'text-[#241910] group-hover:text-[#c5a059]'
              }`}
            />
          </button>
        </div>

        {/* 4. Caption & Cultural Tags */}
        <div className="space-y-1">
          <p className="font-sans text-sm text-[#241910] leading-relaxed">
            <span className="font-bold mr-2">{post.authorName}</span>
            {post.caption}
          </p>

          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="font-sans text-xs text-[#996515] font-semibold hover:underline cursor-pointer"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 5. Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-[#e8dfd3] space-y-3">
            {/* Comments List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {commentsList.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-stone-300 flex-shrink-0">
                    <img
                      src={c.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                      alt={c.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 bg-[#f4efe6] p-2.5 rounded-xl border border-[#e2d6c3]">
                    <span className="font-bold text-[#241a12] mr-1.5">{c.author}</span>
                    <span className="text-stone-700">{c.text}</span>
                  </div>
                </div>
              ))}

              {commentsList.length === 0 && (
                <p className="text-center text-xs text-stone-500 py-3">
                  No comments yet. Be the first to share your reflection!
                </p>
              )}
            </div>

            {/* Add Comment Input Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your reflection on this heritage..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#f2ebd9] border border-[#d6c7b4] text-[#241a12] focus:outline-none focus:border-[#c5a059]"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="px-4 py-2 rounded-xl bg-[#c5a059] hover:bg-[#b89047] text-[#16100c] text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
};
