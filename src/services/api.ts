/**
 * Frontend API Service for SAMSKRUTHI
 * Communicates with the secure backend server (Turso DB proxy)
 * Strictly keeps database credentials off the client bundle.
 */

import { HERITAGE_SLIDES, type HeritageSlide } from '../data/slideshowData';
import {
  INITIAL_POSTS_DATA,
  STORIES_DATA,
  type HeritagePost,
  type HeritageStory,
  type SuggestedAccount,
} from '../data/socialFeedData';

export type { HeritagePost, HeritageStory, SuggestedAccount };

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('samskruthi_token') || sessionStorage.getItem('samskruthi_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface HeritageReel {
  id: string;
  userId: string;
  caption: string;
  videoUrl: string;
  thumbUrl: string;
  location: string;
  audioTitle: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  isVerified: boolean;
  isLiked?: boolean;
}

export interface HeritageCommunity {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  avatarUrl: string;
  bannerUrl: string;
  creatorId: string;
  creatorName: string;
  memberCount: number;
  rules: string;
  createdAt: string;
  isMember?: boolean;
}

export interface HeritageConversation {
  id: string;
  user1Id: string;
  user2Id: string;
  partnerId: string;
  partnerName: string;
  partnerUsername: string;
  partnerAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface HeritageMessage {
  id: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  mediaUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface HeritageNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

export interface HeritagePlace {
  id: string;
  name: string;
  slug: string;
  category: string;
  continent?: string;
  country?: string;
  state?: string;
  city?: string;
  location: string;
  latitude: number;
  longitude: number;
  era: string;
  description: string;
  imageUrl: string;
  architecturalStyle: string;
  visitorInfo: string;
  culturalSignificance?: string;
  interestingFacts?: string;
  unescoStatus?: string;
  heritageType?: string;
  sourceUrl?: string;
  isVerified?: boolean;
  distanceKm?: number;
}

export const apiService = {
  /**
   * Check backend server & Turso connection health
   */
  async checkHealth(): Promise<{ healthy: boolean; database: string }> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('Health check failed');
      const data = await res.json();
      return { healthy: true, database: data.database };
    } catch {
      return { healthy: false, database: 'Local Offline Mode' };
    }
  },

  // ==========================================
  // MEDIA UPLOAD
  // ==========================================

  async uploadMedia(file: File, category: 'posts' | 'reels' | 'stories' | 'avatars' | 'communities' = 'posts'): Promise<{ url: string; relativeUrl: string }> {
    const formData = new FormData();
    formData.append('media', file);
    formData.append('category', category);

    const res = await fetch(`${API_BASE}/upload?category=${category}`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Media upload failed');
    return data;
  },

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================

  async googleVerify(payload: { credential?: string; accessToken?: string; rememberMe?: boolean }) {
    const res = await fetch(`${API_BASE}/auth/google/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google authentication failed');
    return data;
  },

  async googleProfileSync(payload: { name: string; email: string; avatar?: string; rememberMe?: boolean }) {
    const res = await fetch(`${API_BASE}/auth/google/profile-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to sync Google profile');
    return data;
  },

  async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async resendVerification(email: string) {
    const res = await fetch(`${API_BASE}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resend verification email');
    return data;
  },

  async login(emailOrUser: string, password: string, rememberMe = true) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUser, password, rememberMe }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to request password reset');
    return data;
  },

  async resetPassword(token: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  },

  async verifyEmail(token: string) {
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Email verification failed');
    return data;
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
    } catch {
      // ignore
    }
  },

  // ==========================================
  // USER PROFILE & ACCOUNT MANAGEMENT
  // ==========================================

  async getProfile() {
    const res = await fetch(`${API_BASE}/user/profile`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user profile');
    return data;
  },

  async getPublicProfile(idOrUsername: string) {
    const res = await fetch(`${API_BASE}/user/public/${idOrUsername}`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load profile');
    return data;
  },

  async updateProfile(updates: { name: string; username?: string; bio?: string; avatar?: string }) {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/user/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to change password');
    return data;
  },

  async getLoginHistory() {
    const res = await fetch(`${API_BASE}/user/login-history`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load login history');
    return data;
  },

  async deleteAccount(confirmationText: string, password?: string) {
    const res = await fetch(`${API_BASE}/user/account`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ confirmationText, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete account');
    return data;
  },

  async exportUserData() {
    const res = await fetch(`${API_BASE}/user/export-data`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to export user archive');
    return res.json();
  },

  // ==========================================
  // POSTS & COMMUNITY FEED
  // ==========================================

  async getPosts(): Promise<HeritagePost[]> {
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        headers: { ...getAuthHeader() },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : INITIAL_POSTS_DATA;
    } catch {
      return INITIAL_POSTS_DATA;
    }
  },

  async createPost(postData: {
    location: string;
    mediaUrl: string;
    caption: string;
    hashtags?: string[];
  }): Promise<HeritagePost> {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(postData),
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  },

  async deletePost(postId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async toggleLike(postId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      const data = await res.json();
      return data.liked;
    } catch {
      return true;
    }
  },

  async addComment(postId: string, text: string): Promise<any> {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return res.json();
  },

  async toggleBookmark(postId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/bookmarks/${postId}`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
      const data = await res.json();
      return data.saved;
    } catch {
      return false;
    }
  },

  async getBookmarks(): Promise<HeritagePost[]> {
    try {
      const res = await fetch(`${API_BASE}/bookmarks`, {
        headers: { ...getAuthHeader() },
      });
      if (!res.ok) throw new Error('Failed to load bookmarks');
      return res.json();
    } catch {
      return [];
    }
  },

  // ==========================================
  // STORIES
  // ==========================================

  async getStories(): Promise<HeritageStory[]> {
    try {
      const res = await fetch(`${API_BASE}/stories`, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error('Failed to fetch stories');
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : STORIES_DATA;
    } catch {
      return STORIES_DATA;
    }
  },

  async createStory(payload: { title?: string; category?: string; mediaUrl: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create story');
    return res.json();
  },

  async viewStory(storyId: string) {
    try {
      await fetch(`${API_BASE}/stories/${storyId}/view`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
    } catch {
      // ignore
    }
  },

  async deleteStory(storyId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/stories/${storyId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // ==========================================
  // REELS (SHORT VIDEOS)
  // ==========================================

  async getReels(): Promise<HeritageReel[]> {
    const res = await fetch(`${API_BASE}/reels`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to load reels');
    return res.json();
  },

  async createReel(data: { caption: string; videoUrl: string; thumbUrl?: string; location?: string; audioTitle?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/reels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to publish reel');
    return res.json();
  },

  async toggleReelLike(reelId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/reels/${reelId}/like`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    return data.liked;
  },

  async viewReel(reelId: string) {
    try {
      await fetch(`${API_BASE}/reels/${reelId}/view`, { method: 'POST' });
    } catch {
      // ignore
    }
  },

  async getReelComments(reelId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/reels/${reelId}/comments`);
    if (!res.ok) return [];
    return res.json();
  },

  async addReelComment(reelId: string, text: string): Promise<any> {
    const res = await fetch(`${API_BASE}/reels/${reelId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Failed to post comment');
    return res.json();
  },

  // ==========================================
  // COMMUNITIES
  // ==========================================

  async getCommunities(): Promise<HeritageCommunity[]> {
    const res = await fetch(`${API_BASE}/communities`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to load communities');
    return res.json();
  },

  async createCommunity(data: { name: string; description: string; category?: string; avatarUrl?: string; bannerUrl?: string; rules?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/communities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create community');
    return result;
  },

  async toggleJoinCommunity(communityId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/communities/${communityId}/join`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    return data.joined;
  },

  async getCommunityMembers(communityId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/communities/${communityId}/members`);
    if (!res.ok) return [];
    return res.json();
  },

  // ==========================================
  // MESSAGES & CONVERSATIONS
  // ==========================================

  async searchMessageUsers(query: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/messages/users?q=${encodeURIComponent(query)}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) return [];
    return res.json();
  },

  async getConversations(): Promise<HeritageConversation[]> {
    const res = await fetch(`${API_BASE}/messages/conversations`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) return [];
    return res.json();
  },

  async getConversationMessages(conversationId: string): Promise<HeritageMessage[]> {
    const res = await fetch(`${API_BASE}/messages/conversations/${conversationId}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) return [];
    return res.json();
  },

  async sendMessage(recipientId: string, text: string, mediaUrl?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ recipientId, text, mediaUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');
    return data;
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  async getNotifications(): Promise<HeritageNotification[]> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) return [];
    return res.json();
  },

  async getUnreadNotificationCount(): Promise<number> {
    try {
      const res = await fetch(`${API_BASE}/notifications/unread-count`, {
        headers: { ...getAuthHeader() },
      });
      const data = await res.json();
      return data.unreadCount || 0;
    } catch {
      return 0;
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { ...getAuthHeader() },
    });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: { ...getAuthHeader() },
    });
  },

  async deleteNotification(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
  },

  // ==========================================
  // FOLLOWS & SUGGESTED ACCOUNTS
  // ==========================================

  async getSuggestedAccounts(): Promise<SuggestedAccount[]> {
    try {
      const res = await fetch(`${API_BASE}/follows/suggested`, {
        headers: { ...getAuthHeader() },
      });
      if (!res.ok) throw new Error('Failed to load suggestions');
      return res.json();
    } catch {
      return [];
    }
  },

  async toggleFollow(userId: string): Promise<{ following: boolean; followersCount: number }> {
    const res = await fetch(`${API_BASE}/follows/${userId}`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle follow');
    return data;
  },

  // ==========================================
  // PLACES & MAP
  // ==========================================

  async getPlaces(params: { category?: string; continent?: string; country?: string; state?: string; q?: string } = {}): Promise<HeritagePlace[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${API_BASE}/places?${query}`);
    if (!res.ok) throw new Error('Failed to load heritage places');
    return res.json();
  },

  async getNearbyPlaces(lat: number, lng: number, radiusKm = 100, category = 'all'): Promise<{
    origin: { lat: number; lng: number };
    radiusKm: number;
    totalFound: number;
    places: HeritagePlace[];
  }> {
    const query = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radius: String(radiusKm),
      category,
    }).toString();
    const res = await fetch(`${API_BASE}/places/nearby?${query}`);
    if (!res.ok) throw new Error('Failed to load nearby places');
    return res.json();
  },

  // ==========================================
  // EXPLORE & UNIFIED SEARCH
  // ==========================================

  async getExploreDiscovery(category = 'all'): Promise<any> {
    const res = await fetch(`${API_BASE}/explore?category=${encodeURIComponent(category)}`);
    if (!res.ok) throw new Error('Failed to load explore discovery');
    return res.json();
  },

  async unifiedSearch(q: string): Promise<{ users: any[]; places: any[]; posts: any[]; communities: any[] }> {
    const res = await fetch(`${API_BASE}/explore/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) return { users: [], places: [], posts: [], communities: [] };
    return res.json();
  },

  // ==========================================
  // SLIDES
  // ==========================================

  async getSlides(): Promise<HeritageSlide[]> {
    try {
      const res = await fetch(`${API_BASE}/slides`, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error('Failed to fetch from API');
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : HERITAGE_SLIDES;
    } catch {
      return HERITAGE_SLIDES;
    }
  },
};
