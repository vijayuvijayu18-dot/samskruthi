import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  Film,
  MapPin,
  Users,
  MessageCircle,
  Bell,
  User,
  Edit3,
  LogOut,
} from 'lucide-react';
import { MandalaEmblem } from '../common/MandalaEmblem';
import { useAuth } from '../../context/AuthContext';

interface HeritageSidebarProps {
  onCreatePostClick?: () => void;
  onProfileClick?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const HeritageSidebar: React.FC<HeritageSidebarProps> = ({
  onCreatePostClick,
  onProfileClick,
  activeTab = 'home',
  onTabChange,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'explore', label: 'Explore', icon: Compass, path: '/explore' },
    { id: 'reels', label: 'Reels', icon: Film, path: '/reels' },
    { id: 'map', label: 'Heritage Map', icon: MapPin, path: '/map' },
    { id: 'communities', label: 'Communities', icon: Users, path: '/communities' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  const handleItemClick = (id: string) => {
    if (id === 'profile' && onProfileClick) {
      onProfileClick();
      return;
    }
    if (onTabChange) {
      onTabChange(id);
    }
  };

  return (
    <aside className="w-64 xl:w-72 h-screen sticky top-0 bg-[#1a130e] text-[#e8dfd3] flex flex-col justify-between p-5 border-r border-[#2d2218] select-none z-30">
      <div className="space-y-6">
        {/* Brand Logo & Title matching user screenshot */}
        <Link
          to="/"
          className="flex items-center gap-3 px-2 group focus:outline-none"
          aria-label="Samskruthi Home"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <MandalaEmblem className="w-8 h-8 drop-shadow-sm text-[#d4af37]" />
          </div>
          <span className="font-cormorant font-bold text-xl tracking-[0.25em] text-[#d4af37] uppercase">
            Samskruthi
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1" aria-label="Sidebar Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              (activeTab === item.id) ||
              (item.id === 'map' && location.pathname === '/map') ||
              (item.id === 'explore' && location.pathname === '/explore');

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-sans font-medium transition-all ${
                  isActive
                    ? 'bg-[#2b1f15] text-[#e6ca85] shadow-inner font-semibold'
                    : 'text-[#c2b4a3] hover:bg-[#241a12] hover:text-[#f3ede2]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-[#d4af37]' : 'text-[#a39482]'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Create Post CTA */}
      <div className="pt-4 border-t border-[#2d2218] space-y-3">
        <button
          onClick={onCreatePostClick}
          className="w-full py-3 px-4 rounded-xl bg-[#c5a059] hover:bg-[#b89047] active:scale-[0.99] text-[#16100c] font-sans font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Edit3 className="w-4 h-4 stroke-[2.5]" />
          <span>Create Post</span>
        </button>

        {/* Active User Badge & Logout Option */}
        {user && (
          <div className="pt-1 space-y-1.5">
            <button
              type="button"
              onClick={onProfileClick}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-[#241a12] hover:bg-[#2c1f15] border border-[#38281b] transition-all text-left group"
              title="View your profile"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#1a130e] border border-[#c5a059]/50 flex items-center justify-center text-[#d4af37] text-xs font-bold overflow-hidden flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[#f3ede2] group-hover:text-[#e6ca85]">
                    {user.name}
                  </p>
                  <p className="truncate text-[10px] text-stone-400">
                    @{user.username || 'custodian'}
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-sans font-medium text-stone-400 hover:text-rose-300 hover:bg-rose-950/30 border border-stone-800/70 hover:border-rose-900/50 transition-all"
              title="Sign Out of Samskruthi"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-400 group-hover:text-rose-400" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
