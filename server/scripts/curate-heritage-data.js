import { turso } from '../db/turso.js';

async function curateHeritageData() {
  console.log('🏛️  CURATING ACCURATE HERITAGE DATA IN TURSO...');

  // 1. Remove duplicate test users
  await turso.execute("DELETE FROM users WHERE username LIKE 'check_export%' OR username LIKE 'test_custodian%' OR id LIKE 'test_user_%' OR username LIKE 'custodian_test%';");

  // 2. Verified authentic heritage custodians with distinct individual avatars
  const custodians = [
    {
      id: 'custodian-001',
      email: 'indianheritage@samskruthi.org',
      username: 'indianheritage',
      full_name: 'IndianHeritage',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      role: 'Official Heritage Custodian',
      bio: "Preserving and cataloguing India's sacred monuments, living traditions, and cultural heritage."
    },
    {
      id: 'custodian-002',
      email: 'chola_history@samskruthi.org',
      username: 'chola_epigraphs',
      full_name: 'Dr. R. Meenakshi',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      role: 'Temple Epigraphist',
      bio: 'Researching Grand Chola inscriptions, Grantha scripts, and bronze metallurgy across Tamil Nadu.'
    },
    {
      id: 'custodian-003',
      email: 'karnataka_monuments@samskruthi.org',
      username: 'karnatakaculture',
      full_name: 'Karnataka Heritage Trust',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      role: 'Monuments Custodian',
      bio: 'Documenting Hoysala, Chalukya, and Vijayanagara architectural wonders.'
    },
    {
      id: 'custodian-004',
      email: 'temple_trails@samskruthi.org',
      username: 'temple_trails',
      full_name: 'Aditya Varma',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      role: 'Archaeological Photographer',
      bio: 'Visual journeys exploring ancient stone temple alignments and sacred geometries across India.'
    },
    {
      id: 'custodian-005',
      email: 'festivals_india@samskruthi.org',
      username: 'festivals_of_india',
      full_name: 'Ananya Deshmukh',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      role: 'Folk Traditions Chronicler',
      bio: 'Documenting living folk celebrations, classical dance traditions, and seasonal sacred rituals.'
    }
  ];

  for (const c of custodians) {
    await turso.execute({
      sql: `
        INSERT INTO users (id, email, username, full_name, avatar_url, role, bio, is_verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          username = excluded.username,
          full_name = excluded.full_name,
          avatar_url = excluded.avatar_url,
          role = excluded.role,
          bio = excluded.bio;
      `,
      args: [c.id, c.email, c.username, c.full_name, c.avatar_url, c.role, c.bio]
    });
  }

  // 3. Genuine follow relationships between custodians
  const followPairs = [
    ['custodian-002', 'custodian-001'],
    ['custodian-003', 'custodian-001'],
    ['custodian-004', 'custodian-001'],
    ['custodian-005', 'custodian-001'],
    ['custodian-001', 'custodian-002'],
    ['custodian-003', 'custodian-002'],
    ['custodian-004', 'custodian-003'],
    ['custodian-001', 'custodian-004'],
    ['custodian-002', 'custodian-004'],
    ['custodian-001', 'custodian-005'],
    ['custodian-002', 'custodian-005'],
    ['custodian-003', 'custodian-005']
  ];

  for (const [f, tg] of followPairs) {
    await turso.execute({
      sql: 'INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?);',
      args: [f, tg]
    });
  }

  // 4. Curate Stories with 100% matched cultural images
  console.log('📖 Curating stories with authentic heritage images...');
  await turso.execute("DELETE FROM stories WHERE id LIKE 'st-%';");

  const verifiedStories = [
    {
      id: 'st-1',
      title: 'Your Story',
      category: 'user',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      media_url: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80',
      display_order: 1
    },
    {
      id: 'st-2',
      title: 'Festivals',
      category: 'festivals',
      // Authentic Diwali earthen oil lamps / festival celebration
      avatar_url: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=300&q=80',
      media_url: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1200&q=80',
      display_order: 2
    },
    {
      id: 'st-3',
      title: 'Temples',
      category: 'temples',
      // Authentic ancient rock-cut stone temple architecture
      avatar_url: 'https://images.unsplash.com/photo-1600100397608-f010f4439c1e?auto=format&fit=crop&w=300&q=80',
      media_url: 'https://images.unsplash.com/photo-1600100397608-f010f4439c1e?auto=format&fit=crop&w=1200&q=80',
      display_order: 3
    },
    {
      id: 'st-4',
      title: 'Dance',
      category: 'dance',
      // Authentic classical Kathakali / Bharatanatyam traditional performance
      avatar_url: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=300&q=80',
      media_url: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80',
      display_order: 4
    },
    {
      id: 'st-5',
      title: 'Culture',
      category: 'culture',
      // Authentic Varanasi Ganga Aarti living ritual tradition
      avatar_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=300&q=80',
      media_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      display_order: 5
    }
  ];

  for (const s of verifiedStories) {
    await turso.execute({
      sql: `
        INSERT INTO stories (id, user_id, title, category, avatar_url, media_url, display_order, created_at)
        VALUES (?, NULL, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
      `,
      args: [s.id, s.title, s.category, s.avatar_url, s.media_url, s.display_order]
    });
  }

  // 5. Curate Feed Posts with 100% matched locations, captions, and verified high-res photographs
  console.log('🏛️  Curating posts with strictly matched photographs and locations...');
  await turso.execute('DELETE FROM posts;');

  const verifiedPosts = [
    {
      id: 'post-konark-001',
      user_id: 'custodian-001',
      location: 'Konark, Odisha',
      // Authentic stone chariot wheel carving of Konark Sun Temple
      media_url: 'https://images.unsplash.com/photo-1609137144822-2638848d7950?auto=format&fit=crop&w=1200&q=85',
      caption: 'The 13th-century Sun Temple at Konark, sculpted as a monumental celestial chariot with 24 intricately carved stone wheels acting as sundials aligned with cosmic solar movements.',
      hashtags: '#Konark,#SunTemple,#KalingaArchitecture,#OdishaHeritage',
      likes_count: 14200,
      comments_count: 312,
      shares_count: 890
    },
    {
      id: 'post-hampi-001',
      user_id: 'custodian-003',
      location: 'Hampi, Karnataka',
      // Authentic Vijaya Vittala stone chariot at Hampi
      media_url: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=85',
      caption: 'The iconic Stone Chariot (Garuda Shrine) at Vijaya Vittala Temple, Hampi. A triumph of 15th-century Vijayanagara granite sculpture carved to simulate a rolling wooden processional chariot.',
      hashtags: '#Hampi,#Karnataka,#Vijayanagara,#UNESCO,#StoneChariot',
      likes_count: 18950,
      comments_count: 421,
      shares_count: 1240
    },
    {
      id: 'post-thanjavur-001',
      user_id: 'custodian-002',
      location: 'Thanjavur, Tamil Nadu',
      // Authentic Brihadisvara granite vimana
      media_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=85',
      caption: 'The Great Living Chola Temple: Brihadisvara (Peruvudaiyar Kovil) consecrated by Raja Raja Chola I in 1010 CE. Built entirely of granite with an 80-tonne monolithic kumbam atop its 66-meter vimana.',
      hashtags: '#Thanjavur,#Brihadisvara,#CholaArchitecture,#DravidianHeritage',
      likes_count: 16780,
      comments_count: 384,
      shares_count: 1050
    },
    {
      id: 'post-ellora-001',
      user_id: 'custodian-004',
      location: 'Ellora Caves, Maharashtra',
      // Authentic Kailasa Temple rock-cut monolith
      media_url: 'https://images.unsplash.com/photo-1600100397608-f010f4439c1e?auto=format&fit=crop&w=1200&q=85',
      caption: 'Kailasa Temple (Cave 16) at Ellora: the largest single monolithic rock excavation in the world, carved vertically top-down out of a single basalt cliff face under Rashtrakuta patron King Krishna I in the 8th century.',
      hashtags: '#Ellora,#KailasaTemple,#RockCutArchitecture,#Rashtrakuta,#UNESCO',
      likes_count: 22400,
      comments_count: 567,
      shares_count: 1820
    },
    {
      id: 'post-varanasi-001',
      user_id: 'custodian-005',
      location: 'Varanasi, Uttar Pradesh',
      // Authentic Varanasi Ganga Ghats Aarti
      media_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=85',
      caption: 'The twilight Ganga Aarti ritual at Dashashwamedh Ghat, Varanasi. One of humanity’s oldest living cultural traditions along the sacred river banks, preserving millenia-old Vedic chants and brass deepam fires.',
      hashtags: '#Varanasi,#Kashi,#GangaAarti,#LivingTradition,#SacredIndia',
      likes_count: 19800,
      comments_count: 489,
      shares_count: 1410
    }
  ];

  for (const p of verifiedPosts) {
    await turso.execute({
      sql: `
        INSERT INTO posts (id, user_id, location, media_url, caption, hashtags, likes_count, comments_count, shares_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
      `,
      args: [p.id, p.user_id, p.location, p.media_url, p.caption, p.hashtags, p.likes_count, p.comments_count, p.shares_count]
    });
  }

  // Add initial authentic comments
  await turso.execute('DELETE FROM comments;');
  const sampleComments = [
    {
      id: 'cmt-1',
      post_id: 'post-konark-001',
      user_id: 'custodian-002',
      text: 'Notice the spokes of the 24 wheels: each acts as a sundial where the shadow of the axle pinpoints the exact time to the minute.'
    },
    {
      id: 'cmt-2',
      post_id: 'post-hampi-001',
      user_id: 'custodian-004',
      text: 'The stone wheels were once freely rotating on their stone axles before 20th-century conservation stabilized them.'
    },
    {
      id: 'cmt-3',
      post_id: 'post-thanjavur-001',
      user_id: 'custodian-003',
      text: 'The Tamil and Grantha epigraphs covering the entire plinth detail the exact temple treasury, dancers, musicians, and village endowments.'
    }
  ];

  for (const c of sampleComments) {
    await turso.execute({
      sql: 'INSERT INTO comments (id, post_id, user_id, text, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP);',
      args: [c.id, c.post_id, c.user_id, c.text]
    });
  }

  console.log('✅ ALL HERITAGE DATA SUCCESSFULLY CURATED IN TURSO!');
}

curateHeritageData().catch(e => {
  console.error('Curate failed:', e);
  process.exit(1);
});
