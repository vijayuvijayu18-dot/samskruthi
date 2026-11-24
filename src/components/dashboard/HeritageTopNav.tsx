import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Bookmark,
  User as UserIcon,
  LogOut,
  Edit3,
  MapPin,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';

interface HeritageTopNavProps {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
  onNotificationsClick?: () => void;
  onBookmarksClick?: () => void;
  onProfileClick?: () => void;
  onEditProfileClick?: () => void;
}

export const HeritageTopNav: React.FC<HeritageTopNavProps> = ({
  onSearchChange,
  searchQuery = '',
  onNotificationsClick,
  onBookmarksClick,
  onProfileClick,
  onEditProfileClick,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatarError, setAvatarError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  useEffect(() => {
    apiService.getUnreadNotificationCount().then(setUnreadCount).catch(() => {});
  }, []);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const handleOpenProfile = () => {
    setIsDropdownOpen(false);
    if (onProfileClick) onProfileClick();
  };

  const handleOpenEditProfile = () => {
    setIsDropdownOpen(false);
    if (onEditProfileClick) {
      onEditProfileClick();
    } else if (onProfileClick) {
      onProfileClick();
    }
  };

  const handleOpenBookmarks = () => {
    setIsDropdownOpen(false);
    if (onBookmarksClick) onBookmarksClick();
  };

  return (
    <header className="sticky top-0 z-20 w-full bg-[#f7f2ea]/95 backdrop-blur-md px-6 py-3.5 border-b border-[#e6dcce] flex items-center justify-between gap-4 select-none flex-shrink-0">
      {/* Search Input Bar */}
      <div className="relative flex-1 max-w-lg">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8c7b6d]">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder="Search culture, places, chroniclers..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#ede6d8] border border-transparent focus:border-[#c5a059] focus:bg-white text-[#2c221a] placeholder-[#8c7b6d] text-sm font-sans focus:outline-none transition-all shadow-inner"
        />
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell with Badge */}
        <button
          onClick={onNotificationsClick}
          className="relative p-2 rounded-lg text-[#5c4a3b] hover:text-[#1a120c] hover:bg-[#ede6d8] transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Saved / Bookmarks */}
        <button
          onClick={onBookmarksClick}
          className="p-2 rounded-lg text-[#5c4a3b] hover:text-[#1a120c] hover:bg-[#ede6d8] transition-colors"
          aria-label="Saved collections"
          title="Saved Heritage Collections"
        >
          <Bookmark className="w-5 h-5" />
        </button>

        {/* User Profile Avatar with Interactive Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-xl hover:bg-[#ede6d8] transition-all focus:outline-none group"
            aria-label="User Account Menu"
            title="Account Options & Logout"
          >
            {user?.avatar && !avatarError ? (
              <img
                src={user.avatar}
                alt={user.name}
                onError={() => setAvatarError(true)}
                className="w-9 h-9 rounded-full object-cover border-2 border-[#c5a059] shadow-sm group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#201712] border-2 border-[#c5a059] flex items-center justify-center text-[#d4af37] font-semibold text-sm shadow-sm group-hover:scale-105 transition-transform">
                {user ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#996515]' : ''}`} />
          </button>

          {/* Rich Profile Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#fcfaf6] rounded-2xl border border-[#c5a059]/40 shadow-2xl py-2 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User Header */}
              <div className="px-4 py-3 border-b border-[#e8dfd3]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#241a12] border border-[#c5a059]/60 flex items-center justify-center text-[#d4af37] font-serif font-bold text-base flex-shrink-0 overflow-hidden">
                    {user?.avatar && !avatarError ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user ? user.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif font-bold text-sm text-[#241a12] truncate">
                      {user?.name || 'Custodian'}
                    </p>
                    <p className="text-[11px] font-sans text-stone-500 truncate">
                      @{user?.username || 'custodian'}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-[#996515] bg-[#f2ebd9] px-2 py-0.5 rounded-md w-fit">
                  <ShieldCheck className="w-3 h-3 text-[#996515]" />
                  <span>{user?.role || 'Heritage Member'}</span>
                </div>
              </div>

              {/* Menu Navigation Options */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={handleOpenProfile}
                  className="w-full px-4 py-2.5 text-xs font-sans text-stone-700 hover:bg-[#f4efe6] hover:text-[#996515] flex items-center gap-3 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-stone-500" />
                  <span className="font-medium">My Profile</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="w-full px-4 py-2.5 text-xs font-sans text-stone-700 hover:bg-[#f4efe6] hover:text-[#996515] flex items-center gap-3 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-stone-500" />
                  <span className="font-medium">Edit Profile & Bio</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenBookmarks}
                  className="w-full px-4 py-2.5 text-xs font-sans text-stone-700 hover:bg-[#f4efe6] hover:text-[#996515] flex items-center gap-3 transition-colors"
                >
                  <Bookmark className="w-4 h-4 text-stone-500" />
                  <span className="font-medium">Saved Collections</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/map');
                  }}
                  className="w-full px-4 py-2.5 text-xs font-sans text-stone-700 hover:bg-[#f4efe6] hover:text-[#996515] flex items-center gap-3 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-stone-500" />
                  <span className="font-medium">Heritage Map</span>
                </button>
              </div>

              {/* Divider & Prominent Logout Option */}
              <div className="pt-1 mt-1 border-t border-[#e8dfd3]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-xs font-sans font-semibold text-rose-700 hover:bg-rose-50 hover:text-rose-800 flex items-center gap-3 transition-colors group"
                >
                  <LogOut className="w-4 h-4 text-rose-500 group-hover:text-rose-700" />
                  <span>Log Out of Samskruthi</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
