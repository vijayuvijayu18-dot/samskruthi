import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HeritageSidebar } from '../components/dashboard/HeritageSidebar';
import { HeritageTopNav } from '../components/dashboard/HeritageTopNav';
import { HeritageStories } from '../components/dashboard/HeritageStories';
import { HeritageFeedPost } from '../components/dashboard/HeritageFeedPost';
import { HeritageRightSidebar } from '../components/dashboard/HeritageRightSidebar';
import { CreatePostModal } from '../components/dashboard/CreatePostModal';
import { CreateStoryModal } from '../components/dashboard/CreateStoryModal';
import { UserProfileModal } from '../components/profile/UserProfileModal';
import { LocationPermissionModal } from '../components/dashboard/LocationPermissionModal';
import { ReelsTab } from '../components/dashboard/tabs/ReelsTab';
import { ExploreTab } from '../components/dashboard/tabs/ExploreTab';
import { HeritageMapTab } from '../components/dashboard/tabs/HeritageMapTab';
import { CommunitiesTab } from '../components/dashboard/tabs/CommunitiesTab';
import { MessagesTab } from '../components/dashboard/tabs/MessagesTab';
import { NotificationsTab } from '../components/dashboard/tabs/NotificationsTab';
import { ProfileTab } from '../components/dashboard/tabs/ProfileTab';
import { INITIAL_POSTS_DATA, type HeritagePost } from '../data/socialFeedData';
import { apiService } from '../services/api';

export const HeritageDashboardPage: React.FC = () => {
  const location = useLocation();

  const getTabFromPath = () => {
    const path = location.pathname.replace('/', '');
    if (['explore', 'reels', 'map', 'communities', 'messages', 'notifications', 'profile'].includes(path)) {
      return path;
    }
    return 'home';
  };

  const [posts, setPosts] = useState<HeritagePost[]>(INITIAL_POSTS_DATA);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLocationPromptOpen, setIsLocationPromptOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(getTabFromPath);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | undefined>(undefined);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const deduplicatePosts = (postList: HeritagePost[]): HeritagePost[] => {
    const seen = new Set<string>();
    return postList.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  };

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  // Load live posts from Turso Cloud Database on mount
  useEffect(() => {
    loadLivePosts();
  }, []);

  const loadLivePosts = async () => {
    setIsLoadingPosts(true);
    try {
      const livePosts = await apiService.getPosts();
      if (livePosts && livePosts.length > 0) {
        setPosts(deduplicatePosts(livePosts));
      }
    } catch (err) {
      console.warn('Posts load error:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMorePosts) return;
    setIsLoadingMore(true);
    try {
      const morePosts = await apiService.getPosts();
      if (morePosts && morePosts.length > 0) {
        setPosts((prev) => {
          const combined = deduplicatePosts([...prev, ...morePosts]);
          if (combined.length === prev.length) {
            setHasMorePosts(false);
          }
          return combined;
        });
      } else {
        setHasMorePosts(false);
      }
    } catch {
      setHasMorePosts(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handlePostCreated = (newPost: HeritagePost) => {
    setPosts((prev) => deduplicatePosts([newPost, ...prev]));
  };

  const handleTopicFilter = (tag: string) => {
    setSearchQuery(tag);
    setActiveTab('home');
  };

  const handleSelectCustodian = (userId: string) => {
    setSelectedProfileUserId(userId);
    setActiveTab('profile');
  };

  const filteredPosts = searchQuery.trim()
    ? posts.filter(
        (p) =>
          p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.hashtags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : posts;

  return (
    <div className={`bg-[#f7f2ea] text-[#2c2016] flex ${activeTab === 'map' ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {/* 1. Left Dark Walnut Sidebar matching approved visual identity */}
      <HeritageSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedProfileUserId(undefined);
          setActiveTab(tab);
        }}
        onProfileClick={() => {
          setSelectedProfileUserId(undefined);
          setActiveTab('profile');
        }}
        onCreatePostClick={() => setIsCreatePostModalOpen(true)}
      />

      {/* 2. Main Content Canvas */}
      <div className={`flex-1 flex flex-col min-w-0 ${activeTab === 'map' ? 'h-screen overflow-hidden' : ''}`}>
        {/* Top Search & Profile Bar */}
        <HeritageTopNav
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (activeTab !== 'home' && activeTab !== 'explore') {
              setActiveTab('home');
            }
          }}
          onProfileClick={() => {
            setSelectedProfileUserId(undefined);
            setActiveTab('profile');
          }}
          onNotificationsClick={() => setActiveTab('notifications')}
          onBookmarksClick={() => {
            setSelectedProfileUserId(undefined);
            setActiveTab('profile');
          }}
          onEditProfileClick={() => setIsProfileModalOpen(true)}
        />

        {/* 3. Main Dynamic Content Body */}
        <main
          className={`flex-1 flex justify-center ${
            activeTab === 'map'
              ? 'p-2 sm:p-2.5 w-full flex-1 min-h-0 overflow-hidden'
              : 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-8'
          }`}
        >
          {/* TAB 1: HOME FEED */}
          {activeTab === 'home' && (
            <>
              {/* Center Feed Column */}
              <div className="flex-1 max-w-2xl min-w-0">
                {/* Heritage Story Highlights Carousel */}
                <HeritageStories onAddStoryClick={() => setIsCreateStoryModalOpen(true)} />

                {/* Cultural Posts Stream */}
                <div className="space-y-6">
                  {/* Loading Skeletons */}
                  {isLoadingPosts && posts.length === 0 && (
                    <div className="space-y-6">
                      {[1, 2].map((n) => (
                        <div
                          key={n}
                          className="bg-[#fcfaf6] rounded-2xl border border-[#e8dfd3] p-5 shadow-sm space-y-4 animate-pulse"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-stone-300" />
                            <div className="space-y-2">
                              <div className="w-32 h-3.5 bg-stone-300 rounded" />
                              <div className="w-20 h-2.5 bg-stone-200 rounded" />
                            </div>
                          </div>
                          <div className="w-full aspect-[16/10] bg-stone-200 rounded-xl" />
                          <div className="space-y-2">
                            <div className="w-full h-3 bg-stone-200 rounded" />
                            <div className="w-3/4 h-3 bg-stone-200 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rendered Posts */}
                  {filteredPosts.map((post) => (
                    <HeritageFeedPost
                      key={post.id}
                      post={post}
                      onFollowToggle={() => {
                        // Refreshes status organically
                      }}
                    />
                  ))}

                  {/* Empty State */}
                  {!isLoadingPosts && filteredPosts.length === 0 && (
                    <div className="p-12 text-center bg-[#fcfaf6] rounded-2xl border border-[#e8dfd3] shadow-sm">
                      <p className="text-sm font-sans font-medium text-stone-700">
                        {searchQuery.trim()
                          ? `No heritage chronicles found matching "${searchQuery}".`
                          : 'No published cultural chronicles yet.'}
                      </p>
                      {searchQuery.trim() ? (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="mt-3 px-4 py-1.5 rounded-full bg-[#f2ebd9] border border-[#d6c7b4] text-xs font-semibold text-[#996515] hover:bg-[#ebe2cd] transition-all"
                        >
                          Clear Search Filter
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsCreatePostModalOpen(true)}
                          className="mt-3 px-5 py-2 rounded-full bg-[#c5a059] text-[#16100c] text-xs font-semibold shadow-sm hover:bg-[#b89047] transition-all"
                        >
                          Publish First Chronicle
                        </button>
                      )}
                    </div>
                  )}

                  {/* Infinite Scroll / Load More Footer */}
                  {!isLoadingPosts && filteredPosts.length > 0 && !searchQuery.trim() && (
                    <div className="pt-2 pb-6 text-center">
                      {hasMorePosts ? (
                        <button
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                          className="px-6 py-2 rounded-full bg-[#f4efe6] hover:bg-[#ebe2cd] border border-[#d6c7b4] text-xs font-sans font-semibold text-[#342416] transition-all shadow-sm disabled:opacity-60"
                        >
                          {isLoadingMore ? 'Loading Chronicles...' : 'Load More Historical Chronicles'}
                        </button>
                      ) : (
                        <p className="text-xs text-stone-400 font-sans tracking-wide">
                          ✦ You have reached the end of the cultural archive feed ✦
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar: Live Suggested Accounts & Trending Topics */}
              <HeritageRightSidebar
                onTopicClick={handleTopicFilter}
                onSelectUser={handleSelectCustodian}
              />
            </>
          )}

          {/* TAB 2: EXPLORE */}
          {activeTab === 'explore' && (
            <ExploreTab
              onSelectPlace={() => setActiveTab('map')}
              onSelectUser={(u) => handleSelectCustodian(u.id)}
              onSelectCommunity={() => setActiveTab('communities')}
              onNavigateToMap={() => setActiveTab('map')}
            />
          )}

          {/* TAB 3: REELS */}
          {activeTab === 'reels' && <ReelsTab />}

          {/* TAB 4: HERITAGE MAP */}
          {activeTab === 'map' && <HeritageMapTab />}

          {/* TAB 5: COMMUNITIES */}
          {activeTab === 'communities' && <CommunitiesTab />}

          {/* TAB 6: MESSAGES */}
          {activeTab === 'messages' && <MessagesTab />}

          {/* TAB 7: NOTIFICATIONS */}
          {activeTab === 'notifications' && <NotificationsTab />}

          {/* TAB 8: PROFILE */}
          {activeTab === 'profile' && (
            <ProfileTab
              userId={selectedProfileUserId}
              onEditProfileClick={() => setIsProfileModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Interactive Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Interactive Create 24h Story Modal */}
      <CreateStoryModal
        isOpen={isCreateStoryModalOpen}
        onClose={() => setIsCreateStoryModalOpen(false)}
        onStoryCreated={() => {
          // Trigger refresh
          loadLivePosts();
        }}
      />

      {/* Professional User Profile & Security Management Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Post-Login GPS & Location Permission Modal */}
      <LocationPermissionModal
        isOpen={isLocationPromptOpen}
        onClose={() => setIsLocationPromptOpen(false)}
      />
    </div>
  );
};
