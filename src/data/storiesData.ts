import type { CommunityStory } from '../types/heritage';

export const COMMUNITY_STORIES: CommunityStory[] = [
  {
    id: 'story-peru-weaver',
    slug: 'whispering-threads-of-chinchero-andes',
    title: 'The Whispering Spindles of Chinchero',
    narrator: 'Mama Doña Asunción Quispe',
    narratorRole: 'Elder Master Weaver & Natural Dye Custodian',
    continent: 'South America',
    country: 'Peru',
    location: 'Chinchero, Sacred Valley, Cusco',
    category: 'traditional-crafts',
    recordedYear: '2023',
    excerpt: 'When we shear the alpaca, we do not simply take wool. We sing to the mountain (Apu) so the thread stays strong against the Andean wind.',
    fullStory: `I learned to spin wool using the drop spindle (Phusk’a) when I was seven years old, walking with my mother across the high pastures beneath the snow of Veronica. In Chinchero, our textiles are books without paper. 

Every design—the double-headed condor (Kuntur), the water cascade, the eye of the puma—is mapped in the weaver's memory. We do not use chemical powders; we boil cochineal insects from the prickly pear cactus with lemon juice and salt from the Maras pans to create over twenty shades of scarlet and crimson. 

Many young people move down to the hotels in Cusco, but the girls in our village cooperative are coming back. When you touch a hand-spun lliklla blanket, you are holding months of patient dialogue between our fingers and the sacred earth.`,
    duration: '5 min 12 sec',
    language: 'Cusco Quechua (with English Translation)',
    image: {
      src: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=80',
      alt: 'Artisan hands working on traditional backstrap loom in high altitude village',
      caption: 'Doña Asunción adjusting warp threads on her wooden backstrap loom in Chinchero.',
      credit: 'Center for Traditional Textiles of Cusco',
      license: 'CC BY 4.0',
    },
    tags: ['Quechua', 'Andean Weaving', 'Natural Dyes', 'Chinchero', 'Living Craft'],
  },
  {
    id: 'story-mali-griot',
    slug: 'voice-of-the-kora-griot-mali',
    title: 'Voice of the 21-String Kora: The Sahel Lineage',
    narrator: 'Baba Mamadou Kouyaté',
    narratorRole: 'Hereditary Jeli (Griot Historian) & Kora Master',
    continent: 'Africa',
    country: 'Mali',
    location: 'Ségou, Niger River Basin',
    category: 'performing-arts',
    recordedYear: '2024',
    excerpt: 'In Europe you have libraries made of stone and paper. In the Sahel, when an elder passes away without speaking, a library burns to ashes.',
    fullStory: `My family has served as oral historians (Jelis) since the time of Sunjata Keita in the 13th-century Mali Empire. The kora I play has twenty-one strings made from fishing line stretched over a calabash gourd covered in cowhide. 

To become a master, a student must memorize thousands of genealogical praise poems, peace treaties, and historical accounts of migrations across the Sahel. Before electricity came to our riverside towns, disputes between villages were resolved not in courtrooms, but when the Jeli reminded the elders of the promises their great-grandfathers made under the Baobab tree. 

My sacred duty is to make sure our children know that Africa's true history was never silent—it was sung with dignity and grace along the flowing currents of the Niger.`,
    duration: '6 min 45 sec',
    language: 'Bambara (with French & English Subtitles)',
    image: {
      src: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
      alt: 'West African musical elder holding traditional stringed instrument along riverbank',
      caption: 'Baba Mamadou holding his calabash kora near the banks of the Niger River in Ségou.',
      credit: 'West African Oral Archives Project',
      license: 'CC BY-SA 4.0',
    },
    tags: ['Griot', 'Kora', 'Mali', 'Oral History', 'Sahel Lore'],
  },
  {
    id: 'story-japan-lacquer',
    slug: 'seventy-layers-of-urushi-kyoto',
    title: 'Seventy Layers of Urushi: Sixty Years of Sap and Stone',
    narrator: 'Kenjiro Matsuoka',
    narratorRole: 'Living National Craft Master of Urushi Lacquerware',
    continent: 'Asia',
    country: 'Japan',
    location: 'Kamigyo-ku, Kyoto',
    category: 'traditional-crafts',
    recordedYear: '2022',
    excerpt: 'Urushi is not paint. It is the blood of the lacquer tree. It does not dry with heat; it hardens only in moist air and complete darkness.',
    fullStory: `I entered my father's Kyoto workshop in 1961 as an apprentice. The sap of the toxic poison oak tree (Urushi) burns the bare skin of newcomers, but with years of intimacy, your skin learns to welcome its perfume. 

A ceremonial tea caddy (Natsume) requires up to seventy microscopic coats of sap, each polished with mountain charcoal and water before the next can be applied. In modern factories, machines bake synthetic plastics in three minutes. But a genuine Urushi vessel will survive for eight hundred years without flaking or fading. 

When you drink green tea from an antique bowl, you are resting your lips against the patient breath of trees that lived before your grandparents were born.`,
    duration: '4 min 50 sec',
    language: 'Japanese (with English Translation)',
    image: {
      src: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=1200&q=80',
      alt: 'Master artisan in traditional workshop applying gold dust to fine wooden lacquer bowl',
      caption: 'Master Matsuoka polishing a ceremonial tea bowl in his historic Kyoto studio.',
      credit: 'Kyoto Traditional Craft Institute',
      license: 'CC BY 4.0',
    },
    tags: ['Urushi', 'Kyoto', 'Lacquerware', 'Craft Master', 'Japan'],
  },
  {
    id: 'story-haida-cedar',
    slug: 'the-spirit-in-the-cedar-haida-gwaii',
    title: 'The Breath Inside the Cedar: Carving Ancestral Crests',
    narrator: 'Chief Guujaaw & Raven Clan Carvers',
    narratorRole: 'Hereditary Carver & First Nations Elder',
    continent: 'North America',
    country: 'Canada',
    location: 'Old Massett, Haida Gwaii',
    category: 'indigenous-knowledge',
    recordedYear: '2024',
    excerpt: 'Before our adze touches the trunk of a eight-hundred-year-old red cedar, we stand around the base and introduce ourselves to the tree.',
    fullStory: `For the Haida people, the Western red cedar is not lumber—it is our ancestral elder. It provides our ocean-going war canoes, our monumental clan poles, our bark clothing, and the roof boards that shelter our longhouses against Pacific winter gales. 

When you carve a monumental pole, you do not force an eagle into the timber; you uncover the eagle that was already resting within the growth rings of the wood. In the 19th century, colonial laws banned our potlatch ceremonies and missionaries burned our poles. 

Today, we are standing tall once again. When our young apprentices help raise a forty-foot pole using only ropes, muscle, and song, the entire village weeps with pride because we know the roots of Haida Gwaii are unbreakable.`,
    duration: '5 min 35 sec',
    language: 'X̲aayda Kil (Haida) & English',
    image: {
      src: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
      alt: 'Indigenous elder speaking near monumental coastal cedar trees in rainforest',
      caption: 'Carving workshop elders discussing ancestral crest lines in Haida Gwaii.',
      credit: 'Council of the Haida Nation Archives',
      license: 'CC BY-SA 4.0',
    },
    tags: ['Haida Gwaii', 'Cedar Carving', 'Indigenous Sovereignty', 'Totem Poles'],
  },
];
