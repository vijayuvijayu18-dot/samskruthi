import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, X, Grid, List, MapPin, 
  ArrowRight, Tag, Globe, AlertTriangle 
} from 'lucide-react';
import { HeritageService } from '../services/heritageService';
import { HERITAGE_CATEGORIES, CONTINENTS } from '../data/categories';
import { HERITAGE_ITEMS } from '../data/heritageData';
import { SafeImage } from '../components/ui/SafeImage';
import type { HeritageCategorySlug, Continent } from '../types/heritage';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read state from URL query
  const queryParam = searchParams.get('q') || '';
  const categoryParam = (searchParams.get('category') || 'all') as HeritageCategorySlug | 'all';
  const continentParam = (searchParams.get('continent') || 'all') as Continent | 'all';
  const countryParam = searchParams.get('country') || 'all';
  const typeParam = (searchParams.get('type') || 'all') as 'all' | 'tangible' | 'intangible' | 'cultural-landscape';
  const endangeredParam = searchParams.get('endangered') === 'true';
  const sortParam = (searchParams.get('sort') || 'relevance') as 'relevance' | 'title-asc' | 'title-desc' | 'period-asc';
  const tagParam = searchParams.get('tag') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<HeritageCategorySlug | 'all'>(categoryParam);
  const [selectedContinent, setSelectedContinent] = useState<Continent | 'all'>(continentParam);
  const [selectedCountry, setSelectedCountry] = useState<string>(countryParam);
  const [selectedType, setSelectedType] = useState<string>(typeParam);
  const [filterEndangered, setFilterEndangered] = useState<boolean>(endangeredParam);
  const [sortBy, setSortBy] = useState<string>(sortParam);
  const [selectedTag, setSelectedTag] = useState<string>(tagParam);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Keep state synced if URL parameters change
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedCategory((searchParams.get('category') || 'all') as HeritageCategorySlug | 'all');
    setSelectedContinent((searchParams.get('continent') || 'all') as Continent | 'all');
    setSelectedCountry(searchParams.get('country') || 'all');
    setSelectedType(searchParams.get('type') || 'all');
    setFilterEndangered(searchParams.get('endangered') === 'true');
    setSortBy(searchParams.get('sort') || 'relevance');
    setSelectedTag(searchParams.get('tag') || '');
  }, [searchParams]);

  // Update URL params helper
  const updateFilters = (newParams: Record<string, string | boolean>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (!value || value === 'all' || String(value) === 'false') {
        updated.delete(key);
      } else {
        updated.set(key, String(value));
      }
    });
    setSearchParams(updated);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateFilters({ q: val });
  };

  const handleCategoryChange = (cat: HeritageCategorySlug | 'all') => {
    setSelectedCategory(cat);
    updateFilters({ category: cat });
  };

  const handleContinentChange = (cont: Continent | 'all') => {
    setSelectedContinent(cont);
    // Reset country when continent changes
    setSelectedCountry('all');
    updateFilters({ continent: cont, country: 'all' });
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    updateFilters({ country });
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    updateFilters({ type });
  };

  const handleEndangeredToggle = () => {
    const nextVal = !filterEndangered;
    setFilterEndangered(nextVal);
    updateFilters({ endangered: nextVal });
  };

  const handleSortChange = (st: string) => {
    setSortBy(st);
    updateFilters({ sort: st });
  };

  const handleTagClick = (tag: string) => {
    const nextTag = selectedTag === tag ? '' : tag;
    setSelectedTag(nextTag);
    updateFilters({ tag: nextTag });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedContinent('all');
    setSelectedCountry('all');
    setSelectedType('all');
    setFilterEndangered(false);
    setSortBy('relevance');
    setSelectedTag('');
    setSearchParams({});
  };

  // Distinct countries and tags
  const availableCountries = useMemo(() => {
    if (selectedContinent !== 'all') {
      const itemsInContinent = HERITAGE_ITEMS.filter((i) => i.continent === selectedContinent);
      return Array.from(new Set(itemsInContinent.map((i) => i.country))).sort();
    }
    return HeritageService.getAvailableCountries();
  }, [selectedContinent]);

  const allTags = useMemo(() => HeritageService.getAllTags().slice(0, 16), []);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return HeritageService.getAll({
      query: searchQuery,
      category: selectedCategory,
      continent: selectedContinent,
      country: selectedCountry,
      heritageType: selectedType as any,
      isEndangered: filterEndangered ? true : undefined,
      sortBy: sortBy as any,
      tags: selectedTag ? [selectedTag] : undefined,
    });
  }, [searchQuery, selectedCategory, selectedContinent, selectedCountry, selectedType, filterEndangered, sortBy, selectedTag]);

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedContinent !== 'all' ||
    selectedCountry !== 'all' ||
    selectedType !== 'all' ||
    filterEndangered ||
    selectedTag ||
    sortBy !== 'relevance'
  );

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-heritage-surface border border-heritage-gold/30 text-xs text-heritage-gold font-semibold uppercase tracking-widest shadow-md">
          <Globe className="w-3.5 h-3.5" />
          <span>Universal Heritage Repository</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-black text-white tracking-tight">
          Explore World Cultural Heritage
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
          Search across ancient civilizations, architectural monuments, indigenous oral traditions, living folk crafts, and cultural landscapes from all six continents.
        </p>
      </div>

      {/* Control Bar: Search + Continent + Stream Filters */}
      <div className="bg-heritage-surface/90 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
        {/* Main Search Input & Sorters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:flex-1">
            <Search className="w-5 h-5 text-heritage-gold absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search civilizations, monuments, rituals, countries (e.g. Machu Picchu, Timbuktu, Petra, Flamenco)..."
              className="w-full bg-black/40 border border-white/15 focus:border-heritage-gold rounded-xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Selectors Bar */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Country Selector */}
            <div className="relative flex-1 md:w-44">
              <select
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                aria-label="Filter by Country"
                className="w-full bg-black/40 border border-white/15 focus:border-heritage-gold rounded-xl px-3.5 py-3.5 text-xs text-white focus:outline-none appearance-none"
              >
                <option value="all">All Countries</option>
                {availableCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Heritage Type Selector */}
            <div className="relative flex-1 md:w-36">
              <select
                value={selectedType}
                onChange={(e) => handleTypeChange(e.target.value)}
                aria-label="Filter by Type"
                className="w-full bg-black/40 border border-white/15 focus:border-heritage-gold rounded-xl px-3.5 py-3.5 text-xs text-white focus:outline-none appearance-none"
              >
                <option value="all">All Types</option>
                <option value="tangible">Tangible</option>
                <option value="intangible">Intangible</option>
                <option value="cultural-landscape">Landscapes</option>
              </select>
            </div>

            {/* Sorter Selector */}
            <div className="relative flex-1 md:w-40">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                aria-label="Sort records"
                className="w-full bg-black/40 border border-white/15 focus:border-heritage-gold rounded-xl px-3.5 py-3.5 text-xs text-white focus:outline-none appearance-none"
              >
                <option value="relevance">Sort: Curated</option>
                <option value="title-asc">Title: A to Z</option>
                <option value="title-desc">Title: Z to A</option>
                <option value="period-asc">Era / Antiquity</option>
              </select>
            </div>

            {/* Endangered Filter Button */}
            <button
              onClick={handleEndangeredToggle}
              className={`px-3.5 py-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                filterEndangered
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                  : 'bg-black/40 text-slate-300 border-white/15 hover:border-amber-500/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Endangered</span>
            </button>

            {/* Grid / List Mode Toggle */}
            <div className="hidden sm:flex items-center border border-white/15 rounded-xl overflow-hidden bg-black/30 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-heritage-gold text-heritage-darker' : 'text-slate-400 hover:text-white'
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-heritage-gold text-heritage-darker' : 'text-slate-400 hover:text-white'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Continents Filter Buttons */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Filter by Continent:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleContinentChange('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedContinent === 'all'
                  ? 'bg-heritage-gold text-heritage-darker shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              All Continents ({HERITAGE_ITEMS.length})
            </button>
            {CONTINENTS.map((cont) => {
              const count = HERITAGE_ITEMS.filter((i) => i.continent === cont.name).length;
              const isSelected = selectedContinent === cont.name;
              return (
                <button
                  key={cont.name}
                  onClick={() => handleContinentChange(cont.name as Continent)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-heritage-gold text-heritage-darker font-bold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  <span>{cont.name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories Pills Filter */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Filter by Heritage Stream:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-heritage-terracotta text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              All Streams
            </button>
            {HERITAGE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-heritage-terracotta text-white font-bold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  <span>{cat.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Curated Tags Filter */}
        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-2">
            <Tag className="w-3 h-3 text-heritage-gold" />
            <span>Key Themes:</span>
          </span>
          {allTags.map((tag) => {
            const isTagActive = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                  isTagActive
                    ? 'bg-heritage-saffron text-heritage-darker font-bold'
                    : 'bg-black/30 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Status Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="font-bold text-white">{filteredItems.length}</span> documented global heritage records
          {hasActiveFilters && ' matching active criteria'}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-heritage-gold hover:underline font-semibold"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* Items Container */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-heritage-surface/40 rounded-3xl border border-white/10 p-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-xl text-white">No Matching Heritage Entries Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            We couldn't find any records matching "{searchQuery}". Try selecting another continent, clearing the filter, or searching broader terms like "monument", "ritual", or "craft".
          </p>
          <button
            onClick={clearAllFilters}
            className="px-5 py-2.5 rounded-full bg-heritage-gold text-heritage-darker font-bold text-xs shadow-md"
          >
            Clear Search Criteria
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="bg-heritage-surface/80 rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between hover:border-heritage-gold/40 hover:shadow-2xl transition-all duration-300 group"
            >
              <div>
                {/* Image Banner with SafeImage */}
                <div className="relative h-56 overflow-hidden">
                  <SafeImage
                    src={item.primaryImage.src}
                    alt={item.primaryImage.alt}
                    title={item.title}
                    categoryBadge={item.category}
                    country={item.country}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-heritage-surface via-transparent to-transparent pointer-events-none" />

                  {/* Continent & Category Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
                    <span className="bg-heritage-darker/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-heritage-gold border border-white/10">
                      {item.continent}
                    </span>
                    {item.isEndangered && (
                      <span className="bg-amber-500/90 backdrop-blur-md px-2 py-1 rounded-full text-[9px] font-bold text-heritage-darker uppercase tracking-wider">
                        Endangered
                      </span>
                    )}
                  </div>

                  {/* Period tag */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-slate-300 font-mono pointer-events-none">
                    {item.period}
                  </div>

                  {/* Location badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-slate-200 pointer-events-none">
                    <MapPin className="w-3.5 h-3.5 text-heritage-gold" />
                    <span>{item.region}, {item.country}</span>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-6 space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-lg text-white group-hover:text-heritage-gold transition-colors leading-snug">
                      {item.title}
                    </h3>
                    {item.nativeTitle && (
                      <span className="block text-xs text-heritage-gold/80 italic">
                        {item.nativeTitle}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {item.shortDescription}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {item.tags.slice(0, 3).map((tg) => (
                      <span
                        key={tg}
                        className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-slate-400 border border-white/5"
                      >
                        #{tg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Link */}
              <div className="p-6 pt-0 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {item.languages.slice(0, 2).join(' • ')}
                </span>
                <Link
                  to={`/heritage/${item.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-heritage-gold hover:text-heritage-gold-light group/link"
                  data-cursor="link"
                >
                  <span>Explore Entry</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* List Mode View */
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="bg-heritage-surface/80 rounded-2xl border border-white/10 p-5 hover:border-heritage-gold/40 transition-all flex flex-col md:flex-row gap-6 items-center justify-between group"
            >
              <div className="flex flex-col sm:flex-row gap-5 items-center w-full md:w-3/4">
                <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden flex-shrink-0 relative">
                  <SafeImage
                    src={item.primaryImage.src}
                    alt={item.primaryImage.alt}
                    title={item.title}
                    categoryBadge={item.category}
                    country={item.country}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-black/80 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                    {item.period}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-heritage-gold bg-heritage-gold/10 px-2 py-0.5 rounded">
                      {item.continent}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.region}, {item.country}
                    </span>
                    {item.isEndangered && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        Endangered
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-lg text-white group-hover:text-heritage-gold transition-colors">
                    {item.title}{' '}
                    {item.nativeTitle && (
                      <span className="text-xs text-heritage-gold/80 font-normal ml-1 italic">
                        ({item.nativeTitle})
                      </span>
                    )}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    {item.shortDescription}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tg) => (
                      <span key={tg} className="text-[10px] text-slate-400 bg-black/40 px-2 py-0.5 rounded">
                        #{tg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto flex justify-end">
                <Link
                  to={`/heritage/${item.slug}`}
                  className="px-5 py-2.5 rounded-xl bg-heritage-surface hover:bg-heritage-gold hover:text-heritage-darker border border-heritage-gold/30 text-heritage-gold font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap"
                  data-cursor="link"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
