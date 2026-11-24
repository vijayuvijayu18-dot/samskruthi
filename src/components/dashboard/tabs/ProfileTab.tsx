import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Heart,
  MessageCircle,
  Bookmark,
  Edit3,
  Grid,
  CheckCircle2,
  LogOut,
  Shield,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { apiService, type HeritagePost } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

interface ProfileTabProps {
  userId?: string;
  onEditProfileClick?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  userId,
  onEditProfileClick,
}) => {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const targetId = userId || currentUser?.id || 'me';
  const isOwnProfile = !userId || userId === currentUser?.id || userId === 'me';

  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'about' | 'security'>('posts');
  const [posts, setPosts] = useState<HeritagePost[]>([]);
  const [savedPosts, setSavedPosts] = useState<HeritagePost[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    loadProfileData();
    setAvatarError(false);
  }, [targetId]);

  const loadProfileData = async () => {
    try {
      if (isOwnProfile && currentUser) {
        const prof = await apiService.getProfile();
        setProfile(prof);
        setFollowersCount(prof.stats?.followersCount || 0);

        // Load own posts & saved posts
        const allPosts = await apiService.getPosts();
        setPosts(allPosts.filter((p) => p.userId === currentUser.id));

        const saved = await apiService.getBookmarks();
        setSavedPosts(saved);
      } else {
        const pub = await apiService.getPublicProfile(targetId);
        setProfile(pub);
        setFollowersCount(pub.stats?.followersCount || 0);
        setIsFollowing(pub.isFollowing || false);
        setPosts(pub.posts || []);
      }
    } catch (err) {
      console.warn('Profile load error:', err);
    }
  };

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      const res = await apiService.toggleFollow(profile.id);
      setIsFollowing(res.following);
      setFollowersCount(res.followersCount);
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayUser = profile || currentUser;

  return (
    <div className="w-full max-w-4xl mx-auto py-2 text-left space-y-6">
      {/* Cover Banner & Profile Card */}
      <div className="rounded-3xl overflow-hidden bg-[#fcfaf6] border border-[#e8dfd3] shadow-sm">
        {/* Cover Photo with Authentic Fallback */}
        <div className="h-44 sm:h-56 bg-stone-900 relative overflow-hidden">
          <img
            src={profile?.coverImage || '/images/heritage/virupaksha-temple-hampi.jpg'}
            alt="Heritage Cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/heritage/virupaksha-temple-hampi.jpg';
            }}
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#241a12]/80 via-transparent to-black/20" />
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-[#241a12] flex items-center justify-center">
                {displayUser?.avatar && !avatarError ? (
                  <img
                    src={displayUser.avatar}
                    alt={displayUser?.name || 'Custodian'}
                    onError={() => setAvatarError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#241a12] text-[#d4af37] border border-[#c5a059]/40 flex items-center justify-center font-serif font-bold text-4xl shadow-inner">
                    {displayUser?.name ? displayUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={onEditProfileClick}
                    className="px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b89047] text-[#16100c] text-xs font-sans font-bold shadow-sm transition-all flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4 stroke-[2.5]" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-sans font-bold shadow-xs transition-all flex items-center gap-1.5"
                    title="Log Out of your Samskruthi account"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={`px-6 py-2.5 rounded-xl text-xs font-sans font-bold shadow-sm transition-all ${
                    isFollowing
                      ? 'bg-[#ede6d8] text-[#5e4b3c] hover:bg-[#e4dbcc]'
                      : 'bg-[#c5a059] hover:bg-[#b89047] text-[#16100c]'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow Custodian'}
                </button>
              )}
            </div>
          </div>

          {/* Name & Bio */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-2xl text-[#241a12]">
                {displayUser?.name || 'Custodian of Indian Heritage'}
              </h2>
              {displayUser?.isVerified && (
                <CheckCircle2 className="w-5 h-5 text-[#0284c7] fill-[#0284c7]/20" />
              )}
            </div>

            <p className="text-xs font-sans text-stone-500 font-medium">
              @{displayUser?.username || 'custodian'} •{' '}
              <span className="text-[#996515] font-semibold">{displayUser?.role || 'Heritage Member'}</span>
            </p>

            <p className="text-xs font-sans text-stone-700 max-w-2xl leading-relaxed pt-1">
              {displayUser?.bio || 'Custodian of Indian Heritage and Culture'}
            </p>

            {/* Location & Join Date */}
            <div className="flex items-center gap-4 text-xs text-stone-500 pt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#c5a059]" />
                India
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
                Joined {displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'Nov 2026'}
              </span>
            </div>
          </div>

          {/* Followers & Posts Counters */}
          <div className="flex items-center gap-8 pt-5 border-t border-[#e8dfd3] mt-5">
            <div>
              <span className="block font-serif font-bold text-lg text-[#241a12]">
                {posts.length}
              </span>
              <span className="text-xs text-stone-500 font-sans">Posts</span>
            </div>
            <div>
              <span className="block font-serif font-bold text-lg text-[#241a12]">
                {followersCount}
              </span>
              <span className="text-xs text-stone-500 font-sans">Followers</span>
            </div>
            <div>
              <span className="block font-serif font-bold text-lg text-[#241a12]">
                {profile?.stats?.followingCount || 0}
              </span>
              <span className="text-xs text-stone-500 font-sans">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clearly Visible Tab Options */}
      <div className="flex items-center gap-2 border-b border-[#e8dfd3] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans font-bold transition-all ${
            activeTab === 'posts'
              ? 'bg-[#2b1f15] text-[#e6ca85] shadow-xs'
              : 'text-stone-600 hover:bg-[#f4efe6]'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Cultural Posts ({posts.length})</span>
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans font-bold transition-all ${
              activeTab === 'saved'
                ? 'bg-[#2b1f15] text-[#e6ca85] shadow-xs'
                : 'text-stone-600 hover:bg-[#f4efe6]'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Collections ({savedPosts.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans font-bold transition-all ${
            activeTab === 'about'
              ? 'bg-[#2b1f15] text-[#e6ca85] shadow-xs'
              : 'text-stone-600 hover:bg-[#f4efe6]'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>About Custodian</span>
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-[#2b1f15] text-[#e6ca85] shadow-xs'
                : 'text-stone-600 hover:bg-[#f4efe6]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Account & Security</span>
          </button>
        )}
      </div>

      {/* TAB CONTENT: POSTS */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group rounded-2xl overflow-hidden bg-[#fcfaf6] border border-[#e8dfd3] shadow-sm hover:border-[#c5a059] transition-all text-left"
            >
              <div className="aspect-[4/3] bg-stone-900 overflow-hidden relative">
                <img
                  src={post.mediaUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#d4af37]" />
                  {post.location}
                </span>
              </div>

              <div className="p-3.5">
                <p className="text-xs font-sans text-stone-700 line-clamp-2 leading-relaxed mb-2">
                  {post.caption}
                </p>
                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    {post.likesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-sky-500" />
                    {post.commentsCount}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="col-span-full p-12 text-center bg-[#fcfaf6] rounded-2xl border border-[#e8dfd3]">
              <Sparkles className="w-8 h-8 text-[#d4af37] mx-auto mb-2 opacity-70" />
              <p className="text-sm font-sans font-semibold text-stone-700">No cultural posts published yet.</p>
              <p className="text-xs text-stone-500 mt-1">Share stories, photographs, or architectural chronicles of ancient Bharat.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SAVED COLLECTIONS */}
      {activeTab === 'saved' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {savedPosts.map((post) => (
            <div
              key={post.id}
              className="group rounded-2xl overflow-hidden bg-[#fcfaf6] border border-[#e8dfd3] shadow-sm hover:border-[#c5a059] transition-all text-left"
            >
              <div className="aspect-[4/3] bg-stone-900 overflow-hidden relative">
                <img
                  src={post.mediaUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#d4af37]" />
                  {post.location}
                </span>
              </div>

              <div className="p-3.5">
                <p className="text-xs font-sans text-stone-700 line-clamp-2 leading-relaxed mb-2">
                  {post.caption}
                </p>
                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    {post.likesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-sky-500" />
                    {post.commentsCount}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {savedPosts.length === 0 && (
            <div className="col-span-full p-12 text-center bg-[#fcfaf6] rounded-2xl border border-[#e8dfd3]">
              <Bookmark className="w-8 h-8 text-[#d4af37] mx-auto mb-2 opacity-70" />
              <p className="text-sm font-sans font-semibold text-stone-700">No saved collections yet.</p>
              <p className="text-xs text-stone-500 mt-1">Bookmark heritage monuments, temples, or cultural chronicles to view them here.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ABOUT */}
      {activeTab === 'about' && (
        <div className="p-6 bg-[#fcfaf6] rounded-2xl border border-[#e8dfd3] space-y-5 text-left">
          <div>
            <h3 className="font-serif font-bold text-base text-[#241a12]">Custodian Biography</h3>
            <p className="text-xs text-stone-700 font-sans leading-relaxed mt-1">
              {displayUser?.bio || 'Custodian of Indian Heritage and Culture'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#e8dfd3]">
            <div>
              <p className="text-[11px] font-sans font-bold text-stone-500 uppercase tracking-wider">Heritage Role</p>
              <p className="text-sm font-semibold text-[#996515] mt-0.5">{displayUser?.role || 'Heritage Member'}</p>
            </div>
            <div>
              <p className="text-[11px] font-sans font-bold text-stone-500 uppercase tracking-wider">Verification Status</p>
              <p className="text-sm font-semibold text-emerald-800 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified Cultural Custodian
              </p>
            </div>
            <div>
              <p className="text-[11px] font-sans font-bold text-stone-500 uppercase tracking-wider">Region / Homeland</p>
              <p className="text-sm font-semibold text-stone-800 mt-0.5">India (Bharat)</p>
            </div>
            <div>
              <p className="text-[11px] font-sans font-bold text-stone-500 uppercase tracking-wider">Member Since</p>
              <p className="text-sm font-semibold text-stone-800 mt-0.5">
                {displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' }) : 'November 2026'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ACCOUNT & SECURITY */}
      {activeTab === 'security' && (
        <div className="p-6 bg-[#fcfaf6] rounded-2xl border border-[#e8dfd3] space-y-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8dfd3]">
            <div>
              <h3 className="font-serif font-bold text-base text-[#241a12]">Account Management & Security</h3>
              <p className="text-xs text-stone-500 mt-0.5">Update credentials, profile bio, privacy settings, and sign-out</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={onEditProfileClick}
              className="p-4 rounded-xl bg-white border border-[#e8dfd3] hover:border-[#c5a059] text-left transition-all group shadow-2xs"
            >
              <Edit3 className="w-5 h-5 text-[#996515] mb-1.5 group-hover:scale-105 transition-transform" />
              <p className="font-serif font-bold text-sm text-[#241a12]">Edit Custodian Details</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Change display name, handle, bio, and profile avatar</p>
            </button>

            <button
              onClick={onEditProfileClick}
              className="p-4 rounded-xl bg-white border border-[#e8dfd3] hover:border-[#c5a059] text-left transition-all group shadow-2xs"
            >
              <Shield className="w-5 h-5 text-emerald-700 mb-1.5 group-hover:scale-105 transition-transform" />
              <p className="font-serif font-bold text-sm text-[#241a12]">Password & Security</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Update password and review active session history</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
