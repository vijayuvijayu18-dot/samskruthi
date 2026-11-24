import { HERITAGE_ITEMS } from '../data/heritageData';
import { COMMUNITY_STORIES } from '../data/storiesData';
import type { HeritageItem, HeritageCategorySlug, CommunityStory, Continent } from '../types/heritage';

export interface HeritageFilterOptions {
  query?: string;
  category?: HeritageCategorySlug | 'all';
  continent?: Continent | 'all';
  country?: string;
  period?: string;
  heritageType?: 'tangible' | 'intangible' | 'cultural-landscape' | 'all';
  isEndangered?: boolean;
  tags?: string[];
  sortBy?: 'relevance' | 'title-asc' | 'title-desc' | 'period-asc' | 'country';
}

export const HeritageService = {
  /**
   * Retrieve all heritage entries with optional filtering and sorting
   */
  getAll: (options?: HeritageFilterOptions): HeritageItem[] => {
    let items = [...HERITAGE_ITEMS];

    if (!options) return items;

    // 1. Continent Filter
    if (options.continent && options.continent !== 'all') {
      items = items.filter((item) => item.continent === options.continent);
    }

    // 2. Category Filter
    if (options.category && options.category !== 'all') {
      items = items.filter((item) => item.category === options.category);
    }

    // 3. Country Filter
    if (options.country && options.country !== 'all') {
      items = items.filter((item) => item.country.toLowerCase() === options.country?.toLowerCase());
    }

    // 4. Heritage Type (Tangible / Intangible)
    if (options.heritageType && options.heritageType !== 'all') {
      items = items.filter((item) => item.heritageType === options.heritageType);
    }

    // 5. Endangered Filter
    if (options.isEndangered !== undefined) {
      items = items.filter((item) => item.isEndangered === options.isEndangered);
    }

    // 6. Text Query Filter
    if (options.query && options.query.trim().length > 0) {
      const q = options.query.toLowerCase().trim();
      items = items.filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          (item.nativeTitle && item.nativeTitle.toLowerCase().includes(q)) ||
          item.shortDescription.toLowerCase().includes(q) ||
          item.fullDescription.toLowerCase().includes(q) ||
          item.country.toLowerCase().includes(q) ||
          item.region.toLowerCase().includes(q) ||
          item.continent.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          item.languages.some((lang) => lang.toLowerCase().includes(q))
        );
      });
    }

    // 7. Tags Filter
    if (options.tags && options.tags.length > 0) {
      items = items.filter((item) =>
        options.tags!.some((t) => item.tags.map((tg) => tg.toLowerCase()).includes(t.toLowerCase()))
      );
    }

    // 8. Sorting
    if (options.sortBy) {
      if (options.sortBy === 'title-asc') {
        items.sort((a, b) => a.title.localeCompare(b.title));
      } else if (options.sortBy === 'title-desc') {
        items.sort((a, b) => b.title.localeCompare(a.title));
      } else if (options.sortBy === 'country') {
        items.sort((a, b) => a.country.localeCompare(b.country));
      } else if (options.sortBy === 'period-asc') {
        items.sort((a, b) => a.period.localeCompare(b.period));
      }
    }

    return items;
  },

  /**
   * Find a single entry by slug or ID
   */
  getBySlug: (slug: string): HeritageItem | undefined => {
    return HERITAGE_ITEMS.find((item) => item.slug === slug || item.id === slug);
  },

  /**
   * Get items by continent
   */
  getByContinent: (continent: Continent): HeritageItem[] => {
    return HERITAGE_ITEMS.filter((item) => item.continent === continent);
  },

  /**
   * Get all items belonging to a specific category
   */
  getByCategory: (category: HeritageCategorySlug): HeritageItem[] => {
    return HERITAGE_ITEMS.filter((item) => item.category === category);
  },

  /**
   * Get curated featured highlights across the world
   */
  getFeatured: (): HeritageItem[] => {
    return HERITAGE_ITEMS.filter((item) => item.featured);
  },

  /**
   * Get endangered or vulnerable heritage
   */
  getEndangered: (): HeritageItem[] => {
    return HERITAGE_ITEMS.filter((item) => item.isEndangered || item.preservationStatus === 'Endangered Tradition');
  },

  /**
   * Get living / intangible heritage
   */
  getIntangible: (): HeritageItem[] => {
    return HERITAGE_ITEMS.filter((item) => item.heritageType === 'intangible');
  },

  /**
   * Get related heritage entries
   */
  getRelated: (item: HeritageItem): HeritageItem[] => {
    return HERITAGE_ITEMS.filter(
      (i) =>
        item.relatedIds.includes(i.id) ||
        (i.continent === item.continent && i.id !== item.id) ||
        (i.category === item.category && i.id !== item.id)
    ).slice(0, 3);
  },

  /**
   * Distinct list of available countries
   */
  getAvailableCountries: (): string[] => {
    const countries = new Set(HERITAGE_ITEMS.map((item) => item.country));
    return Array.from(countries).sort();
  },

  /**
   * Distinct list of available continents
   */
  getAvailableContinents: (): Continent[] => {
    const continents = new Set(HERITAGE_ITEMS.map((item) => item.continent));
    return Array.from(continents).sort();
  },

  /**
   * Distinct list of all tags for filter chips
   */
  getAllTags: (): string[] => {
    const tags = new Set<string>();
    HERITAGE_ITEMS.forEach((item) => item.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  },

  /**
   * Oral Histories & Stories helpers
   */
  getAllStories: (): CommunityStory[] => {
    return COMMUNITY_STORIES;
  },

  getStoryBySlug: (slug: string): CommunityStory | undefined => {
    return COMMUNITY_STORIES.find((s) => s.slug === slug || s.id === slug);
  },

  /**
   * All historical photographs across all items
   */
  getAllGalleryPhotos: () => {
    const photos: {
      id: string;
      title: string;
      category: HeritageCategorySlug;
      country: string;
      continent: Continent;
      period: string;
      image: {
        src: string;
        alt: string;
        caption?: string;
        credit: string;
        license: string;
      };
      slug: string;
    }[] = [];

    HERITAGE_ITEMS.forEach((item) => {
      photos.push({
        id: `${item.id}-primary`,
        title: item.title,
        category: item.category,
        country: item.country,
        continent: item.continent,
        period: item.period,
        image: item.primaryImage,
        slug: item.slug,
      });

      item.galleryImages.forEach((img, idx) => {
        photos.push({
          id: `${item.id}-gallery-${idx}`,
          title: `${item.title} (Archival Detail)`,
          category: item.category,
          country: item.country,
          continent: item.continent,
          period: item.period,
          image: img,
          slug: item.slug,
        });
      });
    });

    return photos;
  },
};
