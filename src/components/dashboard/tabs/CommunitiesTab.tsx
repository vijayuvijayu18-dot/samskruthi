import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { apiService, type HeritageCommunity } from '../../../services/api';

export const CommunitiesTab: React.FC = () => {
  const [communities, setCommunities] = useState<HeritageCommunity[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCommunityModal, setActiveCommunityModal] = useState<HeritageCommunity | null>(null);
  const [communityMembers, setCommunityMembers] = useState<any[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Temple Architecture');
  const [rules, setRules] = useState('Ground discussions in verified historical research and mutual respect.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      const data = await apiService.getCommunities();
      setCommunities(data);
    } catch (err) {
      console.warn('Communities load error:', err);
    }
  };

  const handleJoinToggle = async (comm: HeritageCommunity, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const prevJoined = comm.isMember;
    const nextJoined = !prevJoined;

    // Optimistic UI
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === comm.id
          ? {
              ...c,
              isMember: nextJoined,
              memberCount: nextJoined ? c.memberCount + 1 : Math.max(1, c.memberCount - 1),
            }
          : c
      )
    );

    try {
      await apiService.toggleJoinCommunity(comm.id);
    } catch {
      // Revert if failed
      setCommunities((prev) =>
        prev.map((c) => (c.id === comm.id ? { ...c, isMember: prevJoined } : c))
      );
    }
  };

  const openCommunityDetails = async (comm: HeritageCommunity) => {
    setActiveCommunityModal(comm);
    try {
      const members = await apiService.getCommunityMembers(comm.id);
      setCommunityMembers(members);
    } catch {
      setCommunityMembers([]);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setErrorMsg('Community name and description are required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await apiService.createCommunity({
        name: name.trim(),
        description: description.trim(),
        category,
        rules: rules.trim(),
      });

      setIsCreateModalOpen(false);
      setName('');
      setDescription('');
      await loadCommunities();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create community');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-2 text-left space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif font-bold text-2xl text-[#241a12]">
            Heritage Guilds & Communities
          </h2>
          <p className="text-xs font-sans text-stone-500">
            Join circles of epigraphists, temple architects, living artists, and historians
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b89047] text-[#16100c] font-sans font-semibold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Found a Guild</span>
        </button>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {communities.map((comm) => (
          <div
            key={comm.id}
            onClick={() => openCommunityDetails(comm)}
            className="group rounded-2xl overflow-hidden bg-[#fcfaf6] border border-[#e8dfd3] shadow-sm hover:border-[#c5a059] transition-all cursor-pointer flex flex-col justify-between"
          >
            {/* Banner */}
            <div className="relative h-28 bg-stone-900 overflow-hidden">
              <img
                src={comm.bannerUrl}
                alt={comm.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-[#e6ca85] text-[11px] font-sans px-3 py-0.5 rounded-full border border-white/20">
                {comm.category}
              </span>
            </div>

            {/* Avatar & Header */}
            <div className="p-5 pt-0 -mt-7 relative z-10">
              <div className="flex items-end justify-between mb-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-stone-900">
                  <img src={comm.avatarUrl} alt={comm.name} className="w-full h-full object-cover" />
                </div>

                <button
                  onClick={(e) => handleJoinToggle(comm, e)}
                  className={`px-4 py-1.5 rounded-full text-xs font-sans font-semibold transition-all ${
                    comm.isMember
                      ? 'bg-[#ede6d8] text-[#5e4b3c] hover:bg-[#e4dbcc]'
                      : 'bg-[#c5a059] hover:bg-[#b89047] text-[#16100c] shadow-sm'
                  }`}
                >
                  {comm.isMember ? 'Joined' : '+ Join Guild'}
                </button>
              </div>

              <h3 className="font-serif font-bold text-base text-[#241a12] group-hover:text-[#996515] transition-colors">
                {comm.name}
              </h3>
              <p className="text-[11px] font-sans text-stone-500 mb-2">
                Founded by {comm.creatorName} • {comm.memberCount} Custodians
              </p>

              <p className="text-xs font-sans text-stone-600 line-clamp-2 leading-relaxed">
                {comm.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Community Detail & Members Modal */}
      {activeCommunityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#fcfaf6] border border-[#c5a059]/40 shadow-2xl p-6 text-left max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8dfd3]">
              <div className="flex items-center gap-3">
                <img
                  src={activeCommunityModal.avatarUrl}
                  alt={activeCommunityModal.name}
                  className="w-10 h-10 rounded-xl object-cover border border-[#c5a059]"
                />
                <div>
                  <h3 className="font-serif font-bold text-base text-[#241a12]">
                    {activeCommunityModal.name}
                  </h3>
                  <span className="text-xs text-[#996515]">{activeCommunityModal.category}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveCommunityModal(null)}
                className="p-1 rounded-full text-stone-500 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs font-sans">
              <div>
                <h4 className="font-bold text-stone-700 uppercase tracking-wider mb-1">Charter</h4>
                <p className="text-stone-600 leading-relaxed bg-[#f4efe6] p-3 rounded-xl border border-[#e2d6c3]">
                  {activeCommunityModal.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-700 uppercase tracking-wider mb-1">Guild Rules</h4>
                <p className="text-stone-600 leading-relaxed bg-stone-100 p-3 rounded-xl">
                  {activeCommunityModal.rules || 'Uphold Indian cultural integrity and authentic historical research.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Guild Custodians ({communityMembers.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {communityMembers.map((m) => (
                    <div
                      key={m.userId}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#fdfbf8] border border-[#e8dfd3]"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={m.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80'}
                          alt={m.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-bold text-[#241a12] block">{m.name}</span>
                          <span className="text-[10px] text-stone-500">@{m.username}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#996515] uppercase bg-[#f4efe6] px-2 py-0.5 rounded-full">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleJoinToggle(activeCommunityModal)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
                    activeCommunityModal.isMember
                      ? 'bg-[#ede6d8] text-[#5e4b3c]'
                      : 'bg-[#c5a059] hover:bg-[#b89047] text-[#16100c]'
                  }`}
                >
                  {activeCommunityModal.isMember ? 'Leave Guild' : 'Join This Heritage Guild'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Found a Guild Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#fcfaf6] border border-[#c5a059]/40 shadow-2xl p-6 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8dfd3]">
              <h3 className="font-serif font-bold text-lg text-[#241a12]">
                Found a Cultural Heritage Guild
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full text-stone-500 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#423225] uppercase tracking-wider mb-1">
                  Guild Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dravidian Stone Carvers Society"
                  className="w-full p-2.5 rounded-xl bg-[#f2ebd9] border border-[#d6c7b4] text-[#241a12] text-sm focus:outline-none focus:border-[#c5a059]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#423225] uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#f2ebd9] border border-[#d6c7b4] text-[#241a12] text-xs focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="Temple Architecture">Temple Architecture</option>
                  <option value="Performing Arts">Performing Arts (Dance & Music)</option>
                  <option value="Ancient Inscriptions">Ancient Inscriptions & Epigraphy</option>
                  <option value="Handloom & Textiles">Handloom & Textiles</option>
                  <option value="Traditional Ayurvedic Arts">Traditional Ayurvedic Arts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#423225] uppercase tracking-wider mb-1">
                  Charter & Purpose
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="State the core mission of this guild..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[#f2ebd9] border border-[#d6c7b4] text-[#241a12] text-xs focus:outline-none focus:border-[#c5a059]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#423225] uppercase tracking-wider mb-1">
                  Guild Rules & Integrity
                </label>
                <input
                  type="text"
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#f2ebd9] border border-[#d6c7b4] text-[#241a12] text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-[#c5a059] hover:bg-[#b89047] text-[#16100c] font-sans font-bold text-sm shadow-md transition-all disabled:opacity-60"
                >
                  {isSubmitting ? 'Founding Guild...' : 'Establish Heritage Guild'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
