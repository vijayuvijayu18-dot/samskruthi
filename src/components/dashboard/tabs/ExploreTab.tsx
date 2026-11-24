import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Users,
  BookOpen,
  Compass,
  X,
  Bookmark,
  Share2,
  Calendar,
  Sparkles,
  Info,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { apiService } from '../../../services/api';

interface ExploreTabProps {
  onSelectPlace?: (place: any) => void;
  onSelectUser?: (user: any) => void;
  onSelectCommunity?: (community: any) => void;
  onNavigateToMap?: (place: any) => void;
}

const FALLBACK_HERITAGE_IMAGE = '/images/heritage/virupaksha-temple-hampi.jpg';

const CATEGORIES = [
  { id: 'all', label: 'All Treasures', title: 'All Living Heritage Treasures' },
  { id: 'monuments-architecture', label: 'Monuments', title: 'Sacred Temples & Monumental Sanctuaries' },
  { id: 'ancient-civilizations', label: 'Ancient Eras', title: 'Ancient Eras & Archaeological Citadels' },
  { id: 'historic-cities', label: 'Historic Cities', title: 'Historic & Living Heritage Cities' },
  { id: 'traditional-crafts', label: 'Craft Traditions', title: 'Master Craft Traditions & Living Metallurgy' },
  { id: 'performing-arts', label: 'Dance & Music', title: 'Classical Dance & Music Traditions' },
];

const SEARCH_SUGGESTIONS = [
  '#KonarkChariot',
  '#HampiRuins',
  '#BrihadisvaraGranite',
  '#KailasaMonolith',
  '#AjantaCaves',
  '#DholaviraHarappan',
  '#VaranasiGhats',
  '#CholaBronzes',
  '#Yakshagana',
  '#Kathakali',
  '#KhajurahoNagara',
  '#Bidriware',
];

export const ExploreTab: React.FC<ExploreTabProps> = ({
  onSelectUser,
  onSelectCommunity,
  onNavigateToMap,
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [discoveryData, setDiscoveryData] = useState<{
    places: any[];
    creators: any[];
    trendingPosts: any[];
    communities: any[];
    trendingTopics: any[];
  }>({
    places: [],
    creators: [],
    trendingPosts: [],
    communities: [],
    trendingTopics: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    users: any[];
    places: any[];
    posts: any[];
    communities: any[];
  } | null>(null);

  // Selected monument for rich Detail View Modal
  const [selectedMonument, setSelectedMonument] = useState<any | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  useEffect(() => {
    loadDiscovery(activeCategory);
  }, [activeCategory]);

  const loadDiscovery = async (cat: string) => {
    setIsLoading(true);
    try {
      const data = await apiService.getExploreDiscovery(cat);
      setDiscoveryData(data);
    } catch (err) {
      console.warn('Explore load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      const results = await apiService.unifiedSearch(query);
      setSearchResults(results);
    } catch {
      setSearchResults({ users: [], places: [], posts: [], communities: [] });
    }
  };

  const handleSuggestionClick = (tag: string) => {
    const clean = tag.replace('#', '');
    handleSearch(clean);
  };

  const openMonumentDetail = (monument: any) => {
    setSelectedMonument(monument);
    setIsBookmarked(false);
    setShareFeedback(false);
  };

  const handleBookmarkToggle = async () => {
    if (!selectedMonument) return;
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    try {
      await apiService.toggleBookmark(selectedMonument.id);
    } catch {
      setIsBookmarked(!nextState);
    }
  };

  const handleShare = async () => {
    if (!selectedMonument) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Samskruthi | ${selectedMonument.name}`,
          text: `${selectedMonument.name} (${selectedMonument.state}) - ${selectedMonument.description}`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2000);
    }
  };

  const currentCategoryConfig =
    CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  const relatedPlaces = selectedMonument
    ? discoveryData.places.filter(
        (p) =>
          p.id !== selectedMonument.id &&
          (p.category === selectedMonument.category || p.state === selectedMonument.state)
      )
    : [];

  return (
    <div className="w-full max-w-5xl mx-auto py-2 text-left space-y-6">
      {/* 1. Explore Banner & Search Header */}
      <div>
        <h2 className="font-serif font-bold text-2xl text-[#241a12] mb-1">
          Explore India's Living Heritage
        </h2>
        <p className="text-xs font-sans text-stone-500 mb-4">
          Uncover ancient monolithic sanctuaries, sacred architectural marvels, living craft metallurgy, and classical traditions.
        </p>

        {/* Global Search Box with Clear Button */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search monuments, temples, Harappan cities, crafts, or chroniclers..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#fcfaf6] border border-[#e8dfd3] text-[#241a12] text-sm shadow-sm focus:outline-none focus:border-[#c5a059] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults(null);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-700 bg-stone-200/60 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Suggestions Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-1">
          <span className="text-[11px] font-sans font-semibold text-[#8c7b6d] flex-shrink-0 mr-1">
            Suggestions:
          </span>
          {SEARCH_SUGGESTIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleSuggestionClick(tag)}
              className="px-2.5 py-1 rounded-md text-xs font-sans font-medium bg-[#f4efe6] hover:bg-[#ebe2cd] text-[#5c4633] border border-[#d6c7b4] flex-shrink-0 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Category Filter Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setActiveCategory(c.id);
              setSearchResults(null);
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-sans font-medium whitespace-nowrap transition-all ${
              activeCategory === c.id
                ? 'bg-[#2b1f15] text-[#e6ca85] shadow-inner font-semibold'
                : 'bg-[#fcfaf6] border border-[#e8dfd3] text-stone-600 hover:bg-[#f3ede2]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 3. Search Results View */}
      {searchResults ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#e8dfd3] pb-3">
            <h3 className="font-serif font-bold text-lg text-[#241a12]">
              Search Results for "{searchQuery}"
            </h3>
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults(null);
              }}
              className="text-xs font-sans font-semibold text-[#996515] hover:underline"
            >
              Clear Search
            </button>
          </div>

          {/* Places Results */}
          {searchResults.places.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                Heritage Monuments & Treasures ({searchResults.places.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.places.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => openMonumentDetail(p)}
                    className="p-3.5 bg-[#fcfaf6] border border-[#e8dfd3] rounded-2xl flex gap-3.5 cursor-pointer hover:border-[#c5a059] transition-all shadow-sm group"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-900 flex-shrink-0">
                      <img
                        src={p.imageUrl || FALLBACK_HERITAGE_IMAGE}
                        alt={p.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_HERITAGE_IMAGE;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-serif font-bold text-sm text-[#241a12] group-hover:text-[#996515] transition-colors truncate">
                        {p.name}
                      </h5>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-[#c5a059] flex-shrink-0" />
                        <span>{p.location || p.state}</span>
                      </p>
                      <p className="text-[11px] text-[#996515] font-sans font-semibold mt-1">
                        {p.era || 'Historical Heritage'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custodians Results */}
          {searchResults.users.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                Verified Chroniclers ({searchResults.users.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => onSelectUser && onSelectUser(u)}
                    className="p-3 bg-[#fcfaf6] border border-[#e8dfd3] rounded-2xl flex items-center gap-3 cursor-pointer hover:border-[#c5a059] transition-all shadow-sm"
                  >
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#c5a059]/40"
                    />
                    <div>
                      <h5 className="font-sans font-bold text-xs text-[#241a12]">{u.name}</h5>
                      <p className="text-[11px] text-stone-500">@{u.username || 'custodian'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results Message */}
          {searchResults.places.length === 0 && searchResults.users.length === 0 && (
            <div className="p-12 text-center bg-[#fcfaf6] rounded-2xl border border-[#e8dfd3] shadow-sm">
              <Compass className="w-10 h-10 text-stone-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-sans font-medium text-stone-700">
                No heritage treasures or chroniclers found matching "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults(null);
                }}
                className="mt-3 px-4 py-1.5 rounded-full bg-[#f2ebd9] border border-[#d6c7b4] text-xs font-semibold text-[#996515] hover:bg-[#ebe2cd] transition-all"
              >
                Clear Search & View All Treasures
              </button>
            </div>
          )}
        </div>
      ) : (
        /* 4. Default Category Discovery Stream */
        <div className="space-y-8">
          {/* Main Heritage Places Grid */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="font-serif font-bold text-base text-[#241a12] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#c5a059]" />
                <span>{currentCategoryConfig.title}</span>
              </h3>
              <span className="text-xs font-sans font-medium text-stone-500">
                {discoveryData.places.length}{' '}
                {activeCategory === 'all'
                  ? 'Total Treasures'
                  : activeCategory === 'traditional-crafts'
                  ? 'Craft Traditions'
                  : activeCategory === 'performing-arts'
                  ? 'Performing Arts'
                  : 'Monuments Catalogued'}
              </span>
            </div>

            {/* Loading Skeletons */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="rounded-2xl overflow-hidden bg-[#fcfaf6] border border-[#e8dfd3] p-4 space-y-3 animate-pulse"
                  >
                    <div className="aspect-[16/10] bg-stone-200 rounded-xl" />
                    <div className="w-3/4 h-4 bg-stone-300 rounded" />
                    <div className="w-1/2 h-3 bg-stone-200 rounded" />
                    <div className="w-full h-3 bg-stone-200 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Monument Cards Grid */}
            {!isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoveryData.places.map((place) => (
                  <div
                    key={place.id}
                    onClick={() => openMonumentDetail(place)}
                    className="group rounded-2xl overflow-hidden bg-[#fcfaf6] border border-[#e8dfd3] shadow-sm hover:border-[#c5a059] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Frame with State Badge */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                        <img
                          src={place.imageUrl || FALLBACK_HERITAGE_IMAGE}
                          alt={`${place.name} located in ${place.state}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_HERITAGE_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/65 backdrop-blur-sm text-[#e6ca85] text-xs font-sans font-medium px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1 shadow-sm">
                          <MapPin className="w-3 h-3 text-[#d4af37]" />
                          <span>{place.state}</span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4">
                        <h4 className="font-serif font-bold text-sm text-[#241a12] group-hover:text-[#996515] transition-colors leading-snug">
                          {place.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] font-sans text-stone-500 mt-1 mb-2">
                          <Calendar className="w-3 h-3 text-[#c5a059]" />
                          <span className="truncate">{place.era}</span>
                        </div>
                        <p className="text-xs font-sans text-stone-600 line-clamp-2 leading-relaxed">
                          {place.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer Tag */}
                    <div className="px-4 pb-3.5 pt-0 flex items-center justify-between text-[11px] text-[#996515] font-sans font-semibold border-t border-[#f0e8dc] mt-2 pt-2">
                      <span className="truncate max-w-[180px]">
                        {place.architecturalStyle || 'Ancient Indian Heritage'}
                      </span>
                      <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Explore <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State for category */}
            {!isLoading && discoveryData.places.length === 0 && (
              <div className="p-12 text-center bg-[#fcfaf6] rounded-2xl border border-[#e8dfd3] shadow-sm">
                <Compass className="w-10 h-10 text-stone-400 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-sans font-medium text-stone-700">
                  No treasures found in this category.
                </p>
                <button
                  onClick={() => setActiveCategory('all')}
                  className="mt-3 px-4 py-1.5 rounded-full bg-[#c5a059] text-[#16100c] text-xs font-semibold shadow-sm hover:bg-[#b89047] transition-all"
                >
                  View All Treasures
                </button>
              </div>
            )}
          </div>

          {/* 5. Verified Custodians Section (Only on 'All Treasures') */}
          {activeCategory === 'all' && discoveryData.creators.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="font-serif font-bold text-base text-[#241a12] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#c5a059]" />
                  <span>Verified Heritage Custodians</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {discoveryData.creators.map((creator) => (
                  <div
                    key={creator.id}
                    onClick={() => onSelectUser && onSelectUser(creator)}
                    className="p-3 bg-[#fcfaf6] border border-[#e8dfd3] rounded-2xl flex flex-col items-center text-center hover:border-[#c5a059] transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="w-14 h-14 rounded-full p-0.5 border-2 border-[#c5a059] overflow-hidden mb-2 group-hover:scale-105 transition-transform">
                      <img
                        src={creator.avatarUrl}
                        alt={creator.name}
                        className="w-full h-full object-cover rounded-full"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="font-sans font-bold text-xs text-[#241a12] truncate w-full">
                      {creator.name}
                    </h4>
                    <p className="text-[10px] text-stone-500 font-sans truncate w-full">
                      {creator.handle}
                    </p>
                    <span className="mt-2 text-[10px] text-[#996515] font-semibold bg-[#f4efe6] px-2 py-0.5 rounded-full border border-[#d6c7b4]">
                      {creator.followersCount} followers
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Cultural Guilds Section (Only on 'All Treasures') */}
          {activeCategory === 'all' && discoveryData.communities.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="font-serif font-bold text-base text-[#241a12] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#c5a059]" />
                  <span>Featured Cultural Guilds</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {discoveryData.communities.map((comm) => (
                  <div
                    key={comm.id}
                    onClick={() => onSelectCommunity && onSelectCommunity(comm)}
                    className="p-4 bg-[#fcfaf6] border border-[#e8dfd3] rounded-2xl flex gap-3.5 hover:border-[#c5a059] transition-all cursor-pointer shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-900 border border-[#c5a059]/40 flex-shrink-0">
                      <img
                        src={comm.avatarUrl}
                        alt={comm.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-sm text-[#241a12] truncate">
                        {comm.name}
                      </h4>
                      <span className="text-[11px] text-[#996515] font-sans font-medium block truncate">
                        {comm.category} • {comm.memberCount} custodians
                      </span>
                      <p className="text-xs font-sans text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                        {comm.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. MONUMENT DETAIL VIEW MODAL */}
      {selectedMonument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#fcfaf6] border border-[#c5a059]/50 shadow-2xl overflow-hidden my-auto text-left max-h-[92vh] flex flex-col">
            {/* Top Close Button */}
            <button
              onClick={() => setSelectedMonument(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors focus:outline-none shadow-md"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Container */}
            <div className="overflow-y-auto flex-1">
              {/* Header Image Canvas with Badges */}
              <div className="relative aspect-[16/9] w-full bg-stone-900">
                <img
                  src={selectedMonument.imageUrl || FALLBACK_HERITAGE_IMAGE}
                  alt={selectedMonument.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_HERITAGE_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Badges on image */}
                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                  <div className="text-white space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#c5a059] text-[#16100c] text-[10px] font-sans font-bold uppercase tracking-wider">
                      {selectedMonument.state}
                    </span>
                    <h3 className="font-serif font-bold text-2xl drop-shadow-md text-white">
                      {selectedMonument.name}
                    </h3>
                    <p className="text-xs text-amber-200/90 font-sans flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>{selectedMonument.location}</span>
                      <span>•</span>
                      <span>{selectedMonument.era}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="px-6 py-3 bg-[#f2ebd9] border-b border-[#e2d6c3] flex items-center justify-between gap-3">
                <span className="text-xs font-sans font-semibold text-[#6e5845]">
                  Architectural Style: <strong className="text-[#2b1f15]">{selectedMonument.architecturalStyle || 'Ancient Indian'}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {/* Bookmark Button */}
                  <button
                    onClick={handleBookmarkToggle}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
                      isBookmarked
                        ? 'bg-[#c5a059] text-[#16100c] font-semibold'
                        : 'bg-white border border-[#d6c7b4] text-[#342416] hover:bg-stone-50'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium bg-white border border-[#d6c7b4] text-[#342416] hover:bg-stone-50 relative transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                    {shareFeedback && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#16100c] text-white text-[10px] rounded-md shadow-md whitespace-nowrap">
                        Link copied!
                      </span>
                    )}
                  </button>

                  {/* View on Map CTA */}
                  {onNavigateToMap && (
                    <button
                      onClick={() => {
                        setSelectedMonument(null);
                        onNavigateToMap(selectedMonument);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans font-semibold bg-[#2b1f15] text-[#e6ca85] hover:bg-[#1a120c] transition-all shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View on Map</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Narrative Content Body */}
              <div className="p-6 space-y-6">
                {/* Historical Overview */}
                <div>
                  <h4 className="font-serif font-bold text-base text-[#241a12] mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#c5a059]" />
                    <span>Historical Overview & Background</span>
                  </h4>
                  <p className="text-xs sm:text-sm font-sans text-stone-700 leading-relaxed">
                    {selectedMonument.description}
                  </p>
                </div>

                {/* Cultural Significance */}
                {selectedMonument.culturalSignificance && (
                  <div className="p-4 rounded-2xl bg-[#f7f2ea] border border-[#e6dcce]">
                    <h5 className="font-serif font-bold text-xs uppercase tracking-wider text-[#996515] mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Cultural Significance & Engineering Marvel</span>
                    </h5>
                    <p className="text-xs font-sans text-stone-700 leading-relaxed">
                      {selectedMonument.culturalSignificance}
                    </p>
                  </div>
                )}

                {/* Fascinating Facts */}
                {selectedMonument.interestingFacts && (
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#241a12] mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-[#c5a059]" />
                      <span>Fascinating Architectural & Archaeological Facts</span>
                    </h4>
                    <p className="text-xs sm:text-sm font-sans text-stone-700 leading-relaxed">
                      {selectedMonument.interestingFacts}
                    </p>
                  </div>
                )}

                {/* Visitor Information */}
                {selectedMonument.visitorInfo && (
                  <div className="text-xs font-sans text-stone-500 pt-2 border-t border-[#e8dfd3]">
                    <strong>Visitor Guidelines:</strong> {selectedMonument.visitorInfo}
                  </div>
                )}

                {/* Related Monuments */}
                {relatedPlaces.length > 0 && (
                  <div className="pt-4 border-t border-[#e8dfd3]">
                    <h5 className="font-serif font-bold text-sm text-[#241a12] mb-3">
                      Related Heritage Treasures
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {relatedPlaces.slice(0, 2).map((rp) => (
                        <div
                          key={rp.id}
                          onClick={() => setSelectedMonument(rp)}
                          className="p-3 rounded-2xl bg-[#f4efe6] border border-[#e2d6c3] flex items-center gap-3 cursor-pointer hover:border-[#c5a059] transition-all group"
                        >
                          <img
                            src={rp.imageUrl || FALLBACK_HERITAGE_IMAGE}
                            alt={rp.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div className="min-w-0">
                            <h6 className="font-serif font-bold text-xs text-[#241a12] truncate group-hover:text-[#996515]">
                              {rp.name}
                            </h6>
                            <p className="text-[10px] text-stone-500 truncate">{rp.state} • {rp.era}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
