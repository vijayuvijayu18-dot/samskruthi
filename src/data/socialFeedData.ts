export interface HeritageStory {
  id: string;
  title: string;
  category: string;
  avatarUrl: string;
  mediaUrl: string;
}

export interface CommentItem {
  id: string;
  author: string;
  avatarUrl?: string;
  text: string;
  timeAgo: string;
}

export interface HeritagePost {
  id: string;
  userId?: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  isVerified: boolean;
  location: string;
  mediaUrl: string;
  caption: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  timeAgo?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  comments: CommentItem[];
}

export interface SuggestedAccount {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  followersCount: string;
  isFollowing?: boolean;
}

export interface TrendingTopic {
  id: string;
  tag: string;
}

// Exactly the 5 verified cultural stories with accurate photographs
export const STORIES_DATA: HeritageStory[] = [
  {
    id: 'story-1',
    title: 'Your Story',
    category: 'user',
    avatarUrl: '/images/heritage/virupaksha-temple-hampi.jpg',
    mediaUrl: '/images/heritage/virupaksha-temple-hampi.jpg',
  },
  {
    id: 'story-2',
    title: 'Festivals',
    category: 'festivals',
    // Authentic Diwali earthen deepam lamps
    avatarUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=300&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'story-3',
    title: 'Temples',
    category: 'temples',
    // Authentic ancient monolithic temple architecture
    avatarUrl: '/images/heritage/brihadisvara-temple.jpg',
    mediaUrl: '/images/heritage/brihadisvara-temple.jpg',
  },
  {
    id: 'story-4',
    title: 'Dance',
    category: 'dance',
    // Authentic classical Kathakali / Bharatanatyam tradition
    avatarUrl: '/images/heritage/kathakali-dance-drama.jpg',
    mediaUrl: '/images/heritage/kathakali-dance-drama.jpg',
  },
  {
    id: 'story-5',
    title: 'Culture',
    category: 'culture',
    // Authentic Varanasi Ganga Aarti living ritual tradition
    avatarUrl: '/images/heritage/varanasi-ghats-kashi.jpg',
    mediaUrl: '/images/heritage/varanasi-ghats-kashi.jpg',
  },
];

// Initial feed post matching Konark Sun Temple with authentic chariot stone wheel
export const INITIAL_POSTS_DATA: HeritagePost[] = [
  {
    id: 'post-konark-001',
    userId: 'custodian-001',
    authorName: 'IndianHeritage',
    authorUsername: 'indianheritage',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    isVerified: true,
    location: 'Konark, Odisha',
    mediaUrl: '/images/heritage/konark-sun-temple.jpg',
    caption: 'The 13th-century Sun Temple at Konark, sculpted as a monumental celestial chariot with 24 intricately carved stone wheels acting as sundials aligned with cosmic solar movements.',
    hashtags: ['#Konark', '#SunTemple', '#KalingaArchitecture', '#OdishaHeritage'],
    likesCount: 14200,
    commentsCount: 312,
    sharesCount: 890,
    isLiked: false,
    isSaved: false,
    comments: [
      {
        id: 'c-1',
        author: 'Dr. R. Meenakshi',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80',
        text: 'Notice the spokes of the 24 wheels: each acts as a sundial where the shadow of the axle pinpoints the exact time to the minute.',
        timeAgo: '2h ago'
      }
    ],
  },
];

// Verified registered accounts with distinct, reliable CDN avatars
export const SUGGESTED_ACCOUNTS_DATA: SuggestedAccount[] = [
  {
    id: 'custodian-002',
    name: 'Dr. R. Meenakshi',
    handle: '@chola_epigraphs',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    followersCount: '4 followers',
    isFollowing: false,
  },
  {
    id: 'custodian-003',
    name: 'Karnataka Heritage Trust',
    handle: '@karnatakaculture',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    followersCount: '4 followers',
    isFollowing: false,
  },
  {
    id: 'custodian-004',
    name: 'Aditya Varma',
    handle: '@temple_trails',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    followersCount: '4 followers',
    isFollowing: false,
  },
  {
    id: 'custodian-005',
    name: 'Ananya Deshmukh',
    handle: '@festivals_of_india',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    followersCount: '4 followers',
    isFollowing: false,
  },
];

// Exactly the 5 trending topics shown in user reference design
export const TRENDING_TOPICS_DATA: TrendingTopic[] = [
  { id: 't1', tag: '#Hampi' },
  { id: 't2', tag: '#KannadaCulture' },
  { id: 't3', tag: '#Dasara' },
  { id: 't4', tag: '#IndianHeritage' },
  { id: 't5', tag: '#Tradition' },
];
