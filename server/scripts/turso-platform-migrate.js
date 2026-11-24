import { turso } from '../db/turso.js';

async function migratePlatform() {
  console.log('🚀 Running Samskruthi Platform Schema Migration on Turso Cloud...');

  // 1. Follows Table
  console.log('📦 Creating follows table...');
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS follows (
      follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (follower_id, following_id)
    );
  `);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);`);

  // 2. Bookmarks / Saved Posts Table
  console.log('📦 Creating bookmarks table...');
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, post_id)
    );
  `);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);`);

  // 3. Reels (Short-form Videos) Table
  console.log('📦 Creating reels table...');
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS reels (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      caption TEXT NOT NULL,
      video_url TEXT NOT NULL,
      thumb_url TEXT,
      location TEXT,
      audio_title TEXT DEFAULT 'Traditional Temple Ragas',
      views_count INTEGER DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      shares_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_reels_created ON reels(created_at DESC);`);

  // 4. Reel Likes
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS reel_likes (
      reel_id TEXT NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (reel_id, user_id)
    );
  `);

  // 5. Reel Comments
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS reel_comments (
      id TEXT PRIMARY KEY,
      reel_id TEXT NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Communities Table
  console.log('📦 Creating communities table...');
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS communities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      avatar_url TEXT,
      banner_url TEXT,
      creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      member_count INTEGER DEFAULT 1,
      rules TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 7. Community Members
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS community_members (
      community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT DEFAULT 'member',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (community_id, user_id)
    );
  `);

  // 8. Conversations Table (1-on-1 direct messaging)
  console.log('📦 Creating conversations and messages tables...');
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user1_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user2_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      last_message TEXT,
      last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user1_id, user2_id)
    );
  `);

  // 9. Messages Table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      media_url TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);`);

  // 10. Heritage Places Table (Interactive Heritage Map)
  console.log('📦 Creating heritage_places table...');
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS heritage_places (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      state TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      era TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      architectural_style TEXT,
      visitor_info TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 11. Update stories table: add user_id and expires_at if not present
  console.log('📦 Updating stories table schema...');
  const storyInfo = await turso.execute(`PRAGMA table_info(stories);`);
  const storyCols = storyInfo.rows.map(r => r.name);
  if (!storyCols.includes('user_id')) {
    await turso.execute(`ALTER TABLE stories ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;`);
  }
  if (!storyCols.includes('expires_at')) {
    await turso.execute(`ALTER TABLE stories ADD COLUMN expires_at DATETIME;`);
  }

  // 12. Story Views Table
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS story_views (
      id TEXT PRIMARY KEY,
      story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
      viewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(story_id, viewer_id)
    );
  `);

  // 13. Fix broken Wikimedia URLs in stories table
  console.log('🖼️ Replacing broken Wikimedia URLs with high-resolution cultural CDN assets...');
  await turso.execute(`
    UPDATE stories 
    SET avatar_url = 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=300&q=80',
        media_url = 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1200&q=80'
    WHERE id = 'st-2' OR title = 'Festivals';
  `);
  await turso.execute(`
    UPDATE stories 
    SET avatar_url = 'https://images.unsplash.com/photo-1600100397608-f010f4439c1e?auto=format&fit=crop&w=300&q=80',
        media_url = 'https://images.unsplash.com/photo-1600100397608-f010f4439c1e?auto=format&fit=crop&w=1200&q=80'
    WHERE id = 'st-3' OR title = 'Temples';
  `);
  await turso.execute(`
    UPDATE stories 
    SET avatar_url = 'https://images.unsplash.com/photo-1545232979-fbf68fe9b10d?auto=format&fit=crop&w=300&q=80',
        media_url = 'https://images.unsplash.com/photo-1545232979-fbf68fe9b10d?auto=format&fit=crop&w=1200&q=80'
    WHERE id = 'st-4' OR title = 'Dance';
  `);
  await turso.execute(`
    UPDATE stories 
    SET avatar_url = 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=300&q=80',
        media_url = 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80'
    WHERE id = 'st-5' OR title = 'Culture';
  `);
  await turso.execute(`
    UPDATE posts
    SET media_url = 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=85'
    WHERE id = 'post-hampi-001' AND media_url LIKE '%wikimedia%';
  `);

  // 14. Seed authentic heritage places if empty
  const placeCheck = await turso.execute(`SELECT COUNT(*) as c FROM heritage_places;`);
  if (placeCheck.rows[0].c === 0) {
    console.log('📍 Seeding official heritage places into Turso...');
    const places = [
      ['hp-1', 'Virupaksha Temple & Hampi Ruins', 'hampi-ruins', 'monuments-architecture', 'Karnataka', 'Hampi, Vijayanagara', 15.3350, 76.4600, '14th-16th Century CE', 'Capital of Vijayanagara Empire known for monolithic granite carvings and UNESCO architecture.', 'https://images.unsplash.com/photo-1600100397608-f010f4439c1e?auto=format&fit=crop&w=1200&q=80', 'Dravidian Architecture', 'Open 6 AM - 6 PM daily'],
      ['hp-2', 'Konark Sun Temple', 'konark-sun-temple', 'ancient-civilizations', 'Odisha', 'Konark, Puri', 19.8876, 86.0945, '13th Century CE', 'Architectural marvel shaped as a colossal 24-wheel celestial solar chariot sculpted in khondalite rock.', 'https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80', 'Kalinga Architecture', 'Open 6 AM - 8 PM'],
      ['hp-3', 'Brihadisvara Temple', 'thanjavur-temple', 'monuments-architecture', 'Tamil Nadu', 'Thanjavur', 10.7828, 79.1318, '1010 CE', 'Great Living Chola Temple with an 80-tonne single granite block cupola vimana.', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80', 'Chola Architecture', 'Open 6 AM - 8:30 PM'],
      ['hp-4', 'Ajanta & Ellora Caves', 'ellora-caves', 'ancient-civilizations', 'Maharashtra', 'Chhatrapati Sambhajinagar', 20.0268, 75.1790, '6th-10th Century CE', 'Kailash Temple (Cave 16) is the largest monolithic rock excavation in human history.', 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80', 'Rock-cut Monolithic', 'Closed Tuesdays'],
      ['hp-5', 'Khajuraho Group of Monuments', 'khajuraho', 'monuments-architecture', 'Madhya Pradesh', 'Chhatarpur', 24.8318, 79.9199, '950-1050 CE', 'Nagara-style temples renowned for intricate architectural relief sculptures and spiritual harmony.', 'https://images.unsplash.com/photo-1545232979-fbf68fe9b10d?auto=format&fit=crop&w=1200&q=80', 'Chandela Nagara Style', 'Open Sunrise to Sunset'],
      ['hp-6', 'Varanasi Ghats & Kashi', 'varanasi-ghats', 'historic-cities', 'Uttar Pradesh', 'Varanasi', 25.3176, 82.9739, 'Over 3000 Years Old', 'The eternal living cultural capital of India with ancient continuous traditions on the banks of Ganga.', 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80', 'Ancient Riverside Ghat Architecture', 'Open 24/7']
    ];

    for (const p of places) {
      await turso.execute({
        sql: `
          INSERT INTO heritage_places (id, name, slug, category, state, location, latitude, longitude, era, description, image_url, architectural_style, visitor_info)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        args: p,
      });
    }
  }

  // 15. Seed initial authentic communities if empty
  const commCheck = await turso.execute(`SELECT COUNT(*) as c FROM communities;`);
  if (commCheck.rows[0].c === 0) {
    console.log('🏛️ Seeding official heritage communities into Turso...');
    const comms = [
      ['comm-1', 'Indian Temple Architecture', 'temple-architecture', 'Custodians dedicated to documenting Dravidian, Nagara, and Vesara stone temples.', 'Monuments', 'https://images.unsplash.com/photo-1600100397608-f010f4439c1e?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1600100397608-f010f4439c1e?auto=format&fit=crop&w=1200&q=80', 'custodian-001', 324, 'Be respectful, ground posts in authentic historical evidence, high quality photography only.'],
      ['comm-2', 'Classical Performing Arts', 'classical-arts', 'Preserving Bharatanatyam, Kathakali, Yakshagana, Carnatic & Hindustani traditions.', 'Performing Arts', 'https://images.unsplash.com/photo-1545232979-fbf68fe9b10d?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1545232979-fbf68fe9b10d?auto=format&fit=crop&w=1200&q=80', 'custodian-001', 198, 'Audio and video shares must credit the master artists and gharana.'],
      ['comm-3', 'Ancient Inscriptions & Epigraphy', 'epigraphy', 'Deciphering Brahmi, Grantha, Old Kannada, Tamil, and Devanagari stone edicts.', 'Languages', 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=300&q=80', 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80', 'custodian-001', 142, 'Include clear rubbings/photos and transliteration where possible.']
    ];

    for (const c of comms) {
      await turso.execute({
        sql: `
          INSERT INTO communities (id, name, slug, description, category, avatar_url, banner_url, creator_id, member_count, rules)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        args: c,
      });
      // Add creator as member
      await turso.execute({
        sql: `INSERT OR IGNORE INTO community_members (community_id, user_id, role) VALUES (?, ?, 'admin');`,
        args: [c[0], 'custodian-001'],
      });
    }
  }

  // 16. Seed initial official reels if empty
  const reelCheck = await turso.execute(`SELECT COUNT(*) as c FROM reels;`);
  if (reelCheck.rows[0].c === 0) {
    console.log('🎬 Seeding official cultural reels into Turso...');
    const sampleReels = [
      [
        'reel-1',
        'custodian-001',
        'Morning prayer chants resonating through the 500-year-old corridors of Virupaksha Temple #Hampi #SacredEchoes',
        'https://assets.mixkit.co/videos/preview/mixkit-traditional-hindu-temple-ceremony-43187-large.mp4',
        'https://images.unsplash.com/photo-1600100397608-f010f4439c1e?auto=format&fit=crop&w=600&q=80',
        'Hampi, Karnataka',
        'Morning Suprabhatam Raga',
        1420,
        312,
        45,
        18
      ],
      [
        'reel-2',
        'custodian-001',
        'The intricate mudras and expression in Yakshagana folk theatre of coastal Karnataka #LivingTraditions',
        'https://assets.mixkit.co/videos/preview/mixkit-indian-dance-performer-in-traditional-dress-43189-large.mp4',
        'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
        'Udupi, Karnataka',
        'Yakshagana Maddale Beats',
        980,
        210,
        34,
        9
      ],
      [
        'reel-3',
        'custodian-001',
        'The celestial sunrise hitting the Konark Sun Temple chariot wheel with mathematical precision #Odisha',
        'https://assets.mixkit.co/videos/preview/mixkit-hands-of-an-artisan-weaving-a-traditional-fabric-43194-large.mp4',
        'https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=600&q=80',
        'Konark, Odisha',
        'Surya Stotram Chants',
        2340,
        540,
        89,
        42
      ]
    ];

    for (const r of sampleReels) {
      await turso.execute({
        sql: `
          INSERT INTO reels (id, user_id, caption, video_url, thumb_url, location, audio_title, views_count, likes_count, comments_count, shares_count)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        args: r,
      });
    }
  }

  console.log('✅ Turso Platform Schema Migration completed successfully!');
}

migratePlatform().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
