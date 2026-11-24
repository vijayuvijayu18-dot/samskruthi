import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import {
  TRENDING_TOPICS_DATA,
  SUGGESTED_ACCOUNTS_DATA,
  type SuggestedAccount,
} from '../../data/socialFeedData';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface HeritageRightSidebarProps {
  onTopicClick?: (tag: string) => void;
  onSelectUser?: (userId: string) => void;
}

export const HeritageRightSidebar: React.FC<HeritageRightSidebarProps> = ({
  onTopicClick,
  onSelectUser,
}) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<SuggestedAccount[]>([]);

  useEffect(() => {
    loadSuggested();
  }, [user?.id]);

  const loadSuggested = async () => {
    try {
      const data = await apiService.getSuggestedAccounts();
      if (data && data.length > 0) {
        // Exclude currently logged in user & prevent duplicates
        const seen = new Set<string>();
        const filtered = data.filter((a) => {
          if (user?.id && a.id === user.id) return false;
          if (seen.has(a.id)) return false;
          seen.add(a.id);
          return true;
        });
        setAccounts(filtered);
      } else {
        setAccounts(SUGGESTED_ACCOUNTS_DATA.filter((a) => a.id !== user?.id));
      }
    } catch (err) {
      console.warn('Suggested accounts load error:', err);
      setAccounts(SUGGESTED_ACCOUNTS_DATA.filter((a) => a.id !== user?.id));
    }
  };

  const handleFollowToggle = async (acc: SuggestedAccount) => {
    const prevFollowing = acc.isFollowing;
    const nextFollowing = !prevFollowing;

    // Optimistic UI update
    setAccounts((list) =>
      list.map((a) => {
        if (a.id === acc.id) {
          const currentCount = parseInt(a.followersCount) || 0;
          const nextCount = nextFollowing ? currentCount + 1 : Math.max(0, currentCount - 1);
          return {
            ...a,
            isFollowing: nextFollowing,
            followersCount: `${nextCount} followers`,
          };
        }
        return a;
      })
    );

    try {
      const res = await apiService.toggleFollow(acc.id);
      if (res && typeof res.followersCount === 'number') {
        setAccounts((list) =>
          list.map((a) =>
            a.id === acc.id
              ? {
                  ...a,
                  isFollowing: res.following,
                  followersCount: `${res.followersCount} followers`,
                }
              : a
          )
        );
      }
    } catch {
      // Revert if API fails
      setAccounts((list) =>
        list.map((a) => (a.id === acc.id ? { ...a, isFollowing: prevFollowing } : a))
      );
    }
  };

  return (
    <aside className="w-80 xl:w-96 p-5 space-y-6 select-none hidden lg:block text-left">
      {/* 1. Suggested Accounts Widget (Live from Turso Cloud DB) */}
      <div className="bg-[#fcfaf6] rounded-2xl p-5 border border-[#e8dfd3] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans font-bold text-sm text-[#2b1f15]">
            Suggested Accounts
          </h3>
          <span className="text-[11px] font-sans text-[#996515] font-semibold">Verified</span>
        </div>

        <div className="space-y-3.5">
          {accounts.map((acc) => (
            <div key={acc.id} className="flex items-center justify-between">
              <div
                onClick={() => onSelectUser && onSelectUser(acc.id)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden p-0.5 border border-[#c5a059]/50 bg-[#241a12] flex-shrink-0 flex items-center justify-center">
                  <img
                    src={acc.avatarUrl}
                    alt={acc.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = `<span class="text-[#d4af37] font-bold text-sm">${acc.name.charAt(0).toUpperCase()}</span>`;
                      }
                    }}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-sans font-semibold text-xs text-[#241910] leading-tight truncate group-hover:text-[#996515] transition-colors">
                    {acc.name}
                  </h4>
                  <p className="font-sans text-[11px] text-[#78695b] truncate">
                    {acc.followersCount}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleFollowToggle(acc)}
                className={`px-3.5 py-1 rounded-full text-xs font-sans font-medium transition-all ${
                  acc.isFollowing
                    ? 'bg-[#ede6d8] text-[#5e4b3c] hover:bg-[#e4dbcc]'
                    : 'bg-[#f4efe6] hover:bg-[#ebe3d4] border border-[#d6c7b4] text-[#342416] font-semibold'
                }`}
              >
                {acc.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}

          {accounts.length === 0 && (
            <p className="text-xs text-stone-500 text-center py-2">
              All active custodians connected!
            </p>
          )}
        </div>
      </div>

      {/* 2. Trending Topics Widget */}
      <div className="bg-[#fcfaf6] rounded-2xl p-5 border border-[#e8dfd3] shadow-sm">
        <h3 className="font-sans font-bold text-sm text-[#2b1f15] mb-3.5">
          Trending Cultural Topics
        </h3>

        <div className="space-y-2.5">
          {TRENDING_TOPICS_DATA.map((item) => (
            <button
              key={item.id}
              onClick={() => onTopicClick && onTopicClick(item.tag)}
              className="w-full flex items-center gap-2 text-left group transition-colors"
            >
              <Flame className="w-4 h-4 text-[#ea580c] flex-shrink-0" />
              <span className="font-sans text-xs font-semibold text-[#423225] group-hover:text-[#996515] transition-colors">
                {item.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Explore India's Rich Heritage Promo Card */}
      <div className="relative rounded-2xl overflow-hidden shadow-md border border-[#c5a059]/30 bg-[#16100c] text-left p-6">
        <div className="relative z-10 space-y-3">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#d4af37] text-[10px] font-sans font-bold uppercase tracking-wider">
            Living Archive
          </span>

          <h4 className="font-serif font-bold text-lg text-[#f3ede2] leading-snug">
            Preserve Bharat's Cultural Legacy
          </h4>

          <p className="font-sans text-xs text-[#c2b4a3] leading-relaxed">
            Every inscription, folk tradition, and sacred architecture is preserved forever in Turso Cloud.
          </p>
        </div>
      </div>
    </aside>
  );
};
