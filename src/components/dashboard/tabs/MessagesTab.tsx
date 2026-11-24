import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, MessageCircle } from 'lucide-react';
import { apiService, type HeritageConversation, type HeritageMessage } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export const MessagesTab: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<HeritageConversation[]>([]);
  const [activeConv, setActiveConv] = useState<HeritageConversation | null>(null);
  const [messages, setMessages] = useState<HeritageMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchUsers, setSearchUsers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv.id);
    }
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const data = await apiService.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConv) {
        setActiveConv(data[0]);
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const data = await apiService.getConversationMessages(convId);
      setMessages(data);
    } catch (err) {
      console.warn('Failed to load messages:', err);
    }
  };

  const handleUserSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchUsers([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await apiService.searchMessageUsers(query);
      setSearchUsers(results);
    } catch {
      setSearchUsers([]);
    }
  };

  const startConversationWithUser = async (targetUser: any) => {
    // Check if conversation already exists
    const existing = conversations.find(
      (c) => c.partnerId === targetUser.id || c.user1Id === targetUser.id || c.user2Id === targetUser.id
    );

    if (existing) {
      setActiveConv(existing);
      setSearchQuery('');
      setSearchUsers([]);
      setIsSearching(false);
      return;
    }

    // Temporary active conversation until first message is sent
    const tempConv: HeritageConversation = {
      id: `new_${targetUser.id}`,
      user1Id: user?.id || '',
      user2Id: targetUser.id,
      partnerId: targetUser.id,
      partnerName: targetUser.name,
      partnerUsername: targetUser.username,
      partnerAvatar: targetUser.avatar,
      lastMessage: 'Start a heritage dialogue...',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };

    setActiveConv(tempConv);
    setMessages([]);
    setSearchQuery('');
    setSearchUsers([]);
    setIsSearching(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Optimistic message
    const tempMsg: HeritageMessage = {
      id: `tmp_${Date.now()}`,
      senderId: user?.id || '',
      recipientId: activeConv.partnerId,
      senderName: user?.name || 'You',
      senderAvatar: user?.avatar || '',
      text,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await apiService.sendMessage(activeConv.partnerId, text);
      if (res.conversationId && activeConv.id.startsWith('new_')) {
        await loadConversations();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-140px)] flex rounded-2xl overflow-hidden border border-[#e8dfd3] shadow-lg bg-[#fcfaf6] text-left">
      {/* Left Conversations Sidebar */}
      <div className="w-80 md:w-96 border-r border-[#e8dfd3] flex flex-col bg-[#fdfbf8]">
        {/* Search Input */}
        <div className="p-4 border-b border-[#e8dfd3]">
          <h2 className="font-serif font-bold text-lg text-[#241a12] mb-2">
            Sanctuary Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleUserSearch(e.target.value)}
              placeholder="Search custodians to message..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#f2ebd9] border border-[#d6c7b4] text-[#241a12] focus:outline-none focus:border-[#c5a059]"
            />
          </div>
        </div>

        {/* Search Results Dropdown or Active Conversations */}
        <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            <div className="p-2 space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase px-2 py-1 block">
                Custodians ({searchUsers.length})
              </span>
              {searchUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => startConversationWithUser(u)}
                  className="w-full p-2.5 rounded-xl hover:bg-[#f2ebd9] flex items-center gap-3 transition-colors text-left"
                >
                  <img
                    src={u.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80'}
                    alt={u.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#c5a059]/40"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-[#241a12] leading-tight">{u.name}</h4>
                    <span className="text-[11px] text-stone-500">@{u.username}</span>
                  </div>
                </button>
              ))}

              {searchUsers.length === 0 && (
                <p className="text-center text-xs text-stone-500 py-6">No custodians found</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#f0e7db]">
              {conversations.map((c) => {
                const isActive = activeConv?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConv(c)}
                    className={`w-full p-3.5 flex items-center gap-3 transition-colors text-left ${
                      isActive ? 'bg-[#f0e7db]' : 'hover:bg-[#f8f4ec]'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={c.partnerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80'}
                        alt={c.partnerName}
                        className="w-11 h-11 rounded-full object-cover border border-[#c5a059]"
                      />
                      {c.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-sans font-bold text-xs text-[#241a12] truncate">
                          {c.partnerName}
                        </h4>
                      </div>
                      <p className="text-[11px] text-stone-600 truncate mt-0.5">{c.lastMessage}</p>
                    </div>
                  </button>
                );
              })}

              {conversations.length === 0 && (
                <div className="p-8 text-center text-xs text-stone-500">
                  <MessageCircle className="w-8 h-8 mx-auto text-stone-400 mb-2 opacity-50" />
                  <p>No conversations yet.</p>
                  <p className="text-[11px] text-stone-400 mt-1">Search a custodian above to start a message.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Messages Thread */}
      <div className="flex-1 flex flex-col bg-[#fcfaf6]">
        {activeConv ? (
          <>
            {/* Thread Header */}
            <div className="p-4 bg-[#fdfbf8] border-b border-[#e8dfd3] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={activeConv.partnerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80'}
                  alt={activeConv.partnerName}
                  className="w-9 h-9 rounded-full object-cover border border-[#c5a059]"
                />
                <div>
                  <h3 className="font-sans font-bold text-sm text-[#241a12]">
                    {activeConv.partnerName}
                  </h3>
                  <span className="text-[11px] text-stone-500">@{activeConv.partnerUsername}</span>
                </div>
              </div>
            </div>

            {/* Messages Scroll Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => {
                const isMe = m.senderId === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2.5 rounded-2xl text-xs font-sans leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-[#2b1f15] text-[#f7f2ea] rounded-br-xs'
                          : 'bg-[#ede4d5] text-[#241a12] rounded-bl-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[9px] text-stone-400 mt-1 px-1">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#fdfbf8] border-t border-[#e8dfd3] flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activeConv.partnerName}...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#f2ebd9] border border-[#d6c7b4] text-[#241a12] text-xs focus:outline-none focus:border-[#c5a059]"
              />
              <button
                type="submit"
                disabled={isSending || !inputText.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b89047] text-[#16100c] text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
            <MessageCircle className="w-12 h-12 stroke-[1.2] mb-3 text-[#c5a059]" />
            <h3 className="font-serif font-bold text-base text-[#241a12]">No Conversation Selected</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">
              Select an existing dialogue from the left or search a registered custodian to discuss cultural heritage.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
