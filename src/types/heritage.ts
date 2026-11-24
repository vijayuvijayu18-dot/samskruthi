export type Continent = 
  | 'Africa'
  | 'Asia'
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Oceania';

export type HeritageCategorySlug = 
  | 'ancient-civilizations'
  | 'monuments-architecture'
  | 'historic-cities'
  | 'traditional-crafts'
  | 'performing-arts'
  | 'languages-literature'
  | 'oral-histories'
  | 'festivals-celebrations'
  | 'indigenous-knowledge'
  | 'historical-archives'
  | 'food-heritage'
  | 'maritime-industrial';

export interface CategoryInfo {
  slug: HeritageCategorySlug;
  title: string;
  shortTitle: string;
  description: string;
  accentColor: string;
  secondaryColor: string;
  iconName: string;
  featuredImage: string;
  layoutType: 'timeline' | 'process' | 'calendar' | 'performance' | 'script' | 'narrative' | 'slider' | 'library';
  count: number;
}

export interface HeritageImage {
  src: string;
  alt: string;
  caption?: string;
  credit: string;
  license: string;
  period?: string;
  sourceUrl?: string;
}

export interface HeritageItem {
  id: string;
  slug: string;
  title: string;
  nativeTitle?: string;
  category: HeritageCategorySlug;
  continent: Continent;
  country: string;
  region: string;
  period: string; // e.g. "c. 2560 BCE", "15th Century CE"
  heritageType: 'tangible' | 'intangible' | 'cultural-landscape';
  shortDescription: string;
  fullDescription: string;
  culturalSignificance: string;
  keyFacts: {
    label: string;
    value: string;
  }[];
  tags: string[];
  languages: string[];
  primaryImage: HeritageImage;
  galleryImages: HeritageImage[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  relatedIds: string[];
  preservationStatus: 'UNESCO World Heritage' | 'Intangible Cultural Heritage' | 'Protected Landmark' | 'Endangered Tradition' | 'Community Archived';
  isEndangered?: boolean;
  featured?: boolean;
}

export interface CommunityStory {
  id: string;
  slug: string;
  title: string;
  narrator: string;
  narratorRole: string;
  continent: Continent;
  country: string;
  location: string;
  category: HeritageCategorySlug;
  recordedYear: string;
  excerpt: string;
  fullStory: string;
  duration: string;
  language: string;
  image: HeritageImage;
  tags: string[];
}

export interface ContributionDraft {
  category: HeritageCategorySlug;
  continent: Continent;
  country: string;
  title: string;
  nativeTitle?: string;
  location: string;
  period: string;
  heritageType: 'tangible' | 'intangible' | 'cultural-landscape';
  description: string;
  culturalSignificance?: string;
  languages: string;
  tags: string;
  contributorName: string;
  contributorEmail: string;
  licenseConsent: boolean;
  images: {
    name: string;
    size: number;
    type: string;
    previewUrl?: string;
  }[];
}
