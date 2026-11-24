import type { CategoryInfo } from '../types/heritage';

export const HERITAGE_CATEGORIES: CategoryInfo[] = [
  {
    slug: 'ancient-civilizations',
    title: 'Ancient Civilizations & Archaeology',
    shortTitle: 'Archaeology',
    description: 'Monumental pyramids, ziggurats, rock-cut necropolises, and ancient city complexes from Mesopotamia, the Nile, Mesoamerica, and the Indus.',
    accentColor: '#c85a32', // Terracotta
    secondaryColor: '#d4af37', // Gold
    iconName: 'Landmark',
    featuredImage: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80', // Pyramids of Giza
    layoutType: 'timeline',
    count: 24,
  },
  {
    slug: 'monuments-architecture',
    title: 'Historical Monuments & Architecture',
    shortTitle: 'Monuments',
    description: 'Cathedrals, stone pagodas, temple towns, imperial citadels, and timeless civil engineering feats that celebrate human architectural mastery.',
    accentColor: '#d4af37', // Gold
    secondaryColor: '#059669', // Emerald
    iconName: 'Building',
    featuredImage: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80', // Angkor Wat
    layoutType: 'timeline',
    count: 36,
  },
  {
    slug: 'historic-cities',
    title: 'Historic Cities & Cultural Landscapes',
    shortTitle: 'Cities & Landscapes',
    description: 'Living ancient capitals, terrace-farmed mountains, canal cities, and desert oases where human communities have thrived for centuries.',
    accentColor: '#0891b2', // Peacock Teal
    secondaryColor: '#c85a32', // Terracotta
    iconName: 'Map',
    featuredImage: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80', // Machu Picchu
    layoutType: 'library',
    count: 18,
  },
  {
    slug: 'indigenous-knowledge',
    title: 'Indigenous Heritage & Traditional Knowledge',
    shortTitle: 'Indigenous Wisdom',
    description: 'Ecological navigation, star-lore, ethnobotany, ancient water systems, and generational stewardship practiced by First Nations and native tribes.',
    accentColor: '#059669', // Emerald
    secondaryColor: '#f97316', // Saffron
    iconName: 'Compass',
    featuredImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80', // Sacred landscape
    layoutType: 'library',
    count: 19,
  },
  {
    slug: 'traditional-crafts',
    title: 'Traditional Arts & Master Craftsmanship',
    shortTitle: 'Master Crafts',
    description: 'Living artisan guilds: Murano glassmaking, Japanese lacquer, Zapotec wool weaving, Bidri inlay, Persian carpets, and Yoruba beadwork.',
    accentColor: '#c85a32', // Terracotta
    secondaryColor: '#0891b2', // Peacock
    iconName: 'Palette',
    featuredImage: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=80', // Handloom weaving
    layoutType: 'process',
    count: 22,
  },
  {
    slug: 'performing-arts',
    title: 'Folk Music, Theatre & Performing Arts',
    shortTitle: 'Performing Arts',
    description: 'Intangible performing traditions: Spanish flamenco, Indonesian Wayang puppetry, Noh theatre, Celtic pipes, and African polyrhythms.',
    accentColor: '#7e22ce', // Purple
    secondaryColor: '#f97316', // Saffron
    iconName: 'Music',
    featuredImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80', // Performance
    layoutType: 'performance',
    count: 20,
  },
  {
    slug: 'languages-literature',
    title: 'Classical Languages & Literature',
    shortTitle: 'Literature & Epigraphs',
    description: 'Ancient scripts, Nordic sagas, Mayan glyphs, Sanskrit hymns, Arabic calligraphy, and classical literary anthologies.',
    accentColor: '#312e81', // Indigo
    secondaryColor: '#fdfbf7', // Cream
    iconName: 'BookOpen',
    featuredImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=1200&q=80', // Ancient manuscripts
    layoutType: 'script',
    count: 15,
  },
  {
    slug: 'oral-histories',
    title: 'Oral Histories & Community Memories',
    shortTitle: 'Oral Memories',
    description: 'Verbatim elder accounts, folklore, maritime ballads, displaced community recollections, and songs passed across generations.',
    accentColor: '#059669', // Emerald
    secondaryColor: '#d4af37', // Gold
    iconName: 'Mic',
    featuredImage: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80', // Elder portrait
    layoutType: 'narrative',
    count: 16,
  },
  {
    slug: 'festivals-celebrations',
    title: 'Festivals & Sacred Celebrations',
    shortTitle: 'Festivals',
    description: 'Inti Raymi in Peru, Day of the Dead in Oaxaca, Venice Carnival, Gerewol in the Sahel, and sacred regional community gatherings.',
    accentColor: '#f97316', // Saffron
    secondaryColor: '#4a044e', // Plum
    iconName: 'Flame',
    featuredImage: 'https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=1200&q=80', // Lanterns & celebration
    layoutType: 'calendar',
    count: 21,
  },
  {
    slug: 'historical-archives',
    title: 'Historical Photographs & Documents',
    shortTitle: 'Visual Archives',
    description: '19th-century glass plate negatives, early ethnographic daguerreotypes, explorer journals, and rare archival cartography.',
    accentColor: '#9a3412', // Rich sepia
    secondaryColor: '#d4af37', // Gold
    iconName: 'Camera',
    featuredImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1200&q=80', // Vintage book / map
    layoutType: 'slider',
    count: 28,
  },
  {
    slug: 'food-heritage',
    title: 'Culinary Heritage & Foodways',
    shortTitle: 'Food Heritage',
    description: 'Ancient sourdough fermentations, Andean potato biodiversity, Georgian Qvevri winemaking, and traditional seasonal harvest banquets.',
    accentColor: '#ea580c', // Saffron-deep
    secondaryColor: '#059669', // Emerald
    iconName: 'Utensils',
    featuredImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80', // Traditional food
    layoutType: 'process',
    count: 14,
  },
  {
    slug: 'maritime-industrial',
    title: 'Maritime & Industrial Heritage',
    shortTitle: 'Maritime & Trade',
    description: 'Ancient dhow sailing routes of the Indian Ocean, Nordic wooden boatbuilding, Silk Road caravanserai, and industrial craft mills.',
    accentColor: '#0891b2', // Peacock
    secondaryColor: '#312e81', // Indigo
    iconName: 'Anchor',
    featuredImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', // Maritime waters & coast
    layoutType: 'timeline',
    count: 12,
  },
];

export const CONTINENTS: { name: string; slug: string; description: string; count: number; image: string }[] = [
  {
    name: 'Africa',
    slug: 'Africa',
    description: 'Nubian monuments, Swahili coastal trading towns, Dogon architecture, and living oral griot traditions.',
    count: 28,
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Asia',
    slug: 'Asia',
    description: 'Ancient temple cities, silk road networks, tea ceremonies, and living performing arts from East to West Asia.',
    count: 42,
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Europe',
    slug: 'Europe',
    description: 'Classical Hellenic and Roman ruins, medieval stone quarters, Renaissance workshops, and Nordic maritime lore.',
    count: 34,
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'North America',
    slug: 'North America',
    description: 'Zapotec and Maya archaeological centers, indigenous Pacific Northwest woodcarving, and ancestral pueblos.',
    count: 22,
    image: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'South America',
    slug: 'South America',
    description: 'Incan Qhapaq Ñan stone highways, high-Andean agricultural terraces, Amazonian oral lore, and colonial plazas.',
    count: 26,
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Oceania',
    slug: 'Oceania',
    description: 'Polynesian celestial navigation, Rapa Nui megaliths, Aboriginal Australian rock art, and Maori living arts.',
    count: 18,
    image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80',
  },
];

export const getCategoryBySlug = (slug: string): CategoryInfo | undefined => {
  return HERITAGE_CATEGORIES.find((cat) => cat.slug === slug);
};
