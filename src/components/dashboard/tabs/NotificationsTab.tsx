import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Heart, MessageCircle, UserPlus, Users, CheckCheck } from 'lucide-react';
import { apiService, type HeritageNotification } from '../../../services/api';

export const NotificationsTab: React.FC = () => {
  const [notifications, setNotifications] = useState<HeritageNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await apiService.getNotifications();
      setNotifications(data);
      const count = await apiService.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (err) {
      console.warn('Load notifications error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await apiService.markAllNotificationsRead();
    } catch {
      // ignore
    }
  };

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await apiService.markNotificationRead(id);
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiService.deleteNotification(id);
    } catch {
      // ignore
    }
  };

  const getIcon = (type: string) => {
    if (type.includes('like')) return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
    if (type.includes('comment')) return <MessageCircle className="w-4 h-4 text-sky-500" />;
    if (type.includes('follow')) return <UserPlus className="w-4 h-4 text-[#c5a059]" />;
    if (type.includes('community')) return <Users className="w-4 h-4 text-emerald-600" />;
    return <Bell className="w-4 h-4 text-[#c5a059]" />;
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-2 text-left space-y-4">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="font-serif font-bold text-2xl text-[#241a12]">
            Notifications
          </h2>
          <p className="text-xs font-sans text-stone-500">
            Heritage interactions, appreciations, and community dispatches
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f4efe6] hover:bg-[#ebe3d4] text-[#342416] text-xs font-semibold border border-[#d6c7b4] transition-all"
          >
            <CheckCheck className="w-4 h-4 text-[#c5a059]" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications Feed */}
      <div className="space-y-2.5">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.isRead && handleMarkRead(n.id)}
            className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
              n.isRead
                ? 'bg-[#fcfaf6] border-[#e8dfd3]'
                : 'bg-[#f6eee2] border-[#c5a059]/60 shadow-sm'
            }`}
          >
            <div className="p-2 rounded-xl bg-white border border-[#e8dfd3] shadow-xs flex-shrink-0">
              {getIcon(n.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-sans font-bold text-xs text-[#241a12]">{n.title}</h4>
                <span className="text-[10px] text-stone-400">
                  {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-xs font-sans text-stone-700 mt-0.5 leading-relaxed">
                {n.message}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(n.id);
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 transition-colors"
              aria-label="Delete notification"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="p-12 text-center bg-[#fcfaf6] rounded-2xl border border-[#e8dfd3]">
            <Bell className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-sans text-stone-600">No notifications yet.</p>
            <p className="text-xs text-stone-400 mt-1">
              You will receive updates when custodians appreciate your posts or follow your journey.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
