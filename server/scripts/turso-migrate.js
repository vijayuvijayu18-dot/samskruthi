import { turso } from '../db/turso.js';

async function migrate() {
  console.log('🏛️  Starting Turso Cloud Database Migration for SAMSKRUTHI...');

  try {
    // 1. Users Table
    console.log('📦 Creating users table on Turso...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        full_name TEXT NOT NULL,
        username TEXT UNIQUE,
        avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        role TEXT DEFAULT 'Heritage Member',
        bio TEXT DEFAULT 'Custodian of Indian Heritage and Culture',
        google_id TEXT UNIQUE,
        is_verified INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Slideshow Monuments Table (The 20 Authentic Treasures)
    console.log('📦 Creating slideshow_monuments table on Turso...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS slideshow_monuments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        display_order INTEGER UNIQUE NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        era TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        thumb_url TEXT NOT NULL,
        credit TEXT NOT NULL
      );
    `);

    // 3. Posts Table
    console.log('📦 Creating posts table on Turso...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        location TEXT NOT NULL,
        media_url TEXT NOT NULL,
        caption TEXT NOT NULL,
        hashtags TEXT DEFAULT '',
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        shares_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 4. Comments Table
    console.log('📦 Creating comments table on Turso...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 5. Likes Table (Compound Unique Constraint)
    console.log('📦 Creating likes table on Turso...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS likes (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (post_id, user_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 6. Stories Table
    console.log('📦 Creating stories table on Turso...');
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS stories (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        avatar_url TEXT NOT NULL,
        media_url TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('🌱 Seeding initial custodian user and verified data...');

    // Seed Custodian User
    await turso.execute({
      sql: `
        INSERT OR IGNORE INTO users (id, email, full_name, username, avatar_url, role, bio, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1);
      `,
      args: [
        'custodian-001',
        'indianheritage@samskruthi.org',
        'IndianHeritage',
        'indianheritage',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        'Official Heritage Custodian',
        'Preserving and cataloguing India sacred monuments and cultural living heritage',
      ],
    });

    // Seed Hampi Post
    await turso.execute({
      sql: `
        INSERT OR IGNORE INTO posts (id, user_id, location, media_url, caption, hashtags, likes_count, comments_count, shares_count)
        VALUES (?, ?, ?, ?, ?, ?, 12400, 243, 782);
      `,
      args: [
        'post-hampi-001',
        'custodian-001',
        'Hampi, Karnataka',
        'https://upload.wikimedia.org/wikipedia/commons/b/bb/Stone_Chariot_at_Hampi%2C_Karnataka.jpg',
        'Timeless beauty of Hampi',
        '#Hampi,#Karnataka,#Heritage',
      ],
    });

    // Seed Stories
    const stories = [
      { id: 'st-1', title: 'Your Story', category: 'user', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', media: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80', order: 1 },
      { id: 'st-2', title: 'Festivals', category: 'festivals', avatar: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/The_Rangoli_of_Lights.jpg/300px-The_Rangoli_of_Lights.jpg', media: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/The_Rangoli_of_Lights.jpg/1200px-The_Rangoli_of_Lights.jpg', order: 2 },
      { id: 'st-3', title: 'Temples', category: 'temples', avatar: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Complex_of_Virupaksha_Temple%2C_Hampi_%2804%29.jpg/300px-Complex_of_Virupaksha_Temple%2C_Hampi_%2804%29.jpg', media: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Complex_of_Virupaksha_Temple%2C_Hampi_%2804%29.jpg/1200px-Complex_of_Virupaksha_Temple%2C_Hampi_%2804%29.jpg', order: 3 },
      { id: 'st-4', title: 'Dance', category: 'dance', avatar: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Kathakali_-Play_with_Kaurava.jpg/300px-Kathakali_-Play_with_Kaurava.jpg', media: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Kathakali_-Play_with_Kaurava.jpg/1200px-Kathakali_-Play_with_Kaurava.jpg', order: 4 },
      { id: 'st-5', title: 'Culture', category: 'culture', avatar: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Yakshaganads.jpg/300px-Yakshaganads.jpg', media: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Yakshaganads.jpg/1200px-Yakshaganads.jpg', order: 5 },
    ];

    for (const s of stories) {
      await turso.execute({
        sql: `INSERT OR IGNORE INTO stories (id, title, category, avatar_url, media_url, display_order) VALUES (?, ?, ?, ?, ?, ?);`,
        args: [s.id, s.title, s.category, s.avatar, s.media, s.order],
      });
    }

    // Seed the 20 Authentic Heritage Slides
    const slides = [
      { order: 1, title: 'Virupaksha Temple & Sacred Landscape of Hampi', category: 'UNESCO World Heritage • Ancient Civilizations', location: 'Hampi, Bellary District, Karnataka', era: '7th–15th Century CE • Vijayanagara Empire', desc: 'The sacred heart of the Vijayanagara Empire on the banks of Tungabhadra, where massive granite boulder landscapes embrace centuries-old Dravidian temple towers.', img: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Complex_of_Virupaksha_Temple%2C_Hampi_%2804%29.jpg/1920px-Complex_of_Virupaksha_Temple%2C_Hampi_%2804%29.jpg', thumb: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Complex_of_Virupaksha_Temple%2C_Hampi_%2804%29.jpg/400px-Complex_of_Virupaksha_Temple%2C_Hampi_%2804%29.jpg', credit: 'Wikimedia Commons / Dey.sandip' },
      { order: 2, title: 'Taj Mahal at Dawn Reflection', category: 'UNESCO World Heritage • Mughal Architecture', location: 'Agra, Uttar Pradesh', era: '1632–1653 CE • Mughal Imperial Epoch', desc: 'An ivory-white marble mausoleum on the south bank of the Yamuna River, universally celebrated as the pinnacle of Indo-Islamic architectural symmetry.', img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=2000&q=85', thumb: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=300&q=70', credit: 'Jovyn Chamb / Unsplash' },
      { order: 3, title: 'Mysore Palace Golden Illumination', category: 'Royal Palaces & Citadels', location: 'Mysuru, Karnataka', era: '1897–1912 CE • Wadiyar Dynasty', desc: 'The legendary Amba Vilas Palace bathed in ninety-seven thousand golden incandescent bulbs during festive dusk, showcasing magnificent Indo-Saracenic royal craftsmanship.', img: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=2000&q=85', thumb: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=300&q=70', credit: 'Ashish Kumar / Unsplash' },
      { order: 4, title: 'Konark Sun Temple Celestial Chariot', category: 'UNESCO World Heritage • Kalinga Architecture', location: 'Konark, Puri District, Odisha', era: 'c. 1250 CE • Eastern Ganga Dynasty', desc: 'Conceived as a colossal celestial chariot with 24 elaborately carved stone sundial wheels, pulled across the heavens by seven spirited stone horses.', img: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Konarka_Temple.jpg/1920px-Konarka_Temple.jpg', thumb: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Konarka_Temple.jpg/400px-Konarka_Temple.jpg', credit: 'Wikimedia Commons / G-u-t' },
      { order: 5, title: 'Ajanta Caves Buddhist Rock-Cut Monasteries', category: 'UNESCO World Heritage • Rock-Cut Sanctuaries', location: 'Aurangabad, Maharashtra', era: '2nd Century BCE – 480 CE • Satavahana & Vakataka', desc: 'Horseshoe-shaped cliff sanctuaries harboring ancient Buddhist prayer halls, rock-cut stupas, and tempera murals chronicling the Jataka tales.', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Ajanta_%2863%29.jpg/1920px-Ajanta_%2863%29.jpg', thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Ajanta_%2863%29.jpg/400px-Ajanta_%2863%29.jpg', credit: 'Wikimedia Commons / Vyacheslav Argenberg' },
      { order: 6, title: 'Kailasa Monolithic Rock Temple at Ellora', category: 'UNESCO World Heritage • Monolithic Engineering', location: 'Ellora Caves, Maharashtra', era: '8th Century CE • Rashtrakuta King Krishna I', desc: 'The largest monolithic rock-cut monument on Earth, carved top-down out of a single vertical basalt cliff, removing over two hundred thousand tonnes of stone.', img: 'https://upload.wikimedia.org/wikipedia/en/f/fc/Kailash_temple_%28Ellora_cave_no_15%29_at_Verul.png', thumb: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/fc/Kailash_temple_%28Ellora_cave_no_15%29_at_Verul.png/400px-Kailash_temple_%28Ellora_cave_no_15%29_at_Verul.png', credit: 'Archaeological Survey of India / Verul' },
      { order: 7, title: 'Hampi Stone Chariot (Vittala Temple)', category: 'UNESCO World Heritage • Sacred Dravidian Architecture', location: 'Vittala Complex, Hampi, Karnataka', era: '16th Century CE • King Krishnadevaraya', desc: 'An iconic granite shrine shaped as a procession chariot dedicated to Garuda, featuring intricately sculpted axles, wheels, and monolithic stone elephants.', img: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Stone_Chariot_at_Hampi%2C_Karnataka.jpg', thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Stone_Chariot_at_Hampi%2C_Karnataka.jpg/400px-Stone_Chariot_at_Hampi%2C_Karnataka.jpg', credit: 'Wikimedia Commons / Vinoth Chandar' },
      { order: 8, title: 'Kerala Backwaters & Wooden Kettuvallam', category: 'Ecological Heritage & Maritime Landscapes', location: 'Alappuzha, Kerala', era: 'Centuries-Old Indigenous Shipcraft Tradition', desc: 'Tranquil emerald palm lagoons where ancestral wooden houseboats—assembled entirely of Anjili timber and coir knots without a single nail—glide through village waterways.', img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=2000&q=85', thumb: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=300&q=70', credit: 'Sarath P / Unsplash' },
      { order: 9, title: 'Amber Fort Golden Sandstone Citadel', category: 'UNESCO World Heritage • Hill Forts of Rajasthan', location: 'Amer, Jaipur, Rajasthan', era: '1592 CE onwards • Raja Man Singh I', desc: 'Imposing golden sandstone ramparts overlooking Maota Lake, preserving opulent courtyards, mirror-work Sheesh Mahal, and Rajput military architecture.', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2000&q=85', thumb: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=300&q=70', credit: 'Annie Spratt / Unsplash' },
      { order: 10, title: 'Varanasi Ghats & Sacred Riverfront', category: 'Living Sacred Rivers & Millennia-Old Traditions', location: 'Ahilya Ghat, Varanasi, Uttar Pradesh', era: 'Continuously Inhabited Since 1200 BCE', desc: 'Ancient tiered riverfront steps along the sacred Ganges where morning rituals, wooden riverboats, and centuries-old sandstone temples reflect on the holy waters.', img: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Ahilya_Ghat_by_the_Ganges%2C_Varanasi.jpg/1920px-Ahilya_Ghat_by_the_Ganges%2C_Varanasi.jpg', thumb: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Ahilya_Ghat_by_the_Ganges%2C_Varanasi.jpg/400px-Ahilya_Ghat_by_the_Ganges%2C_Varanasi.jpg', credit: 'Wikimedia Commons / Gerd Eichmann' },
      { order: 11, title: 'Meenakshi Amman Temple & Polychrome Gopurams', category: 'Sacred Dravidian Architecture • Historic Temple Towns', location: 'Madurai, Tamil Nadu', era: '6th Century BCE Origins • 16th–17th Century Nayak Monumental Architecture', desc: 'Fourteen monumental soaring gopuram gatehouses adorned with over thirty-three thousand vibrant, polychrome statues of deities, celestial musicians, and mythical beings.', img: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg/1920px-An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg', thumb: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg/400px-An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg', credit: 'Wikimedia Commons / Sankar 1995' },
      { order: 12, title: 'Bharatanatyam Sacred Classical Dance', category: 'Classical Performing Arts (Natya)', location: 'Tamil Nadu & Classical Indian Heritage', era: 'Codified in the Ancient Natya Shastra c. 200 BCE', desc: 'The ancient art of storytelling through sculptured postures (karanas), codified hand mudras, expressive abhinaya, and resonant bronze bell anklets.', img: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Murugashankari_Leo.jpg', thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Murugashankari_Leo.jpg/400px-Murugashankari_Leo.jpg', credit: 'Wikimedia Commons / Leo Leo' },
      { order: 13, title: 'Yakshagana Mythological Folk Theatre', category: 'Living Intangible Cultural Traditions', location: 'Coastal Karnataka (Udupi & Uttara Kannada)', era: '16th Century Bhakti & Folk Epic Tradition', desc: 'High-energy mythological folk-theatre distinguished by towering ornate headgear (pagade), facial makeup derived from natural mineral pigments, and roaring percussion.', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Yakshaganads.jpg', thumb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Yakshaganads.jpg/400px-Yakshaganads.jpg', credit: 'Wikimedia Commons / Dinesh Shenoy' },
      { order: 14, title: 'Kathakali Classical Dance-Drama of Kerala', category: 'UNESCO Intangible Heritage • Ritual Theatre', location: 'Kerala', era: '17th Century Kottarakkara Thampuran Tradition', desc: 'An all-night Sanskrit-Malayalam dance drama where artists undergo hours of Chutti face sculpting to portray noble epic heroes with mesmerizing eye movements.', img: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Kathakali_-Play_with_Kaurava.jpg/1920px-Kathakali_-Play_with_Kaurava.jpg', thumb: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Kathakali_-Play_with_Kaurava.jpg/400px-Kathakali_-Play_with_Kaurava.jpg', credit: 'Wikimedia Commons / A.Davey' },
      { order: 15, title: 'Traditional Terracotta Diyas & Festive Rangoli', category: 'Sacred Festivals & Light Traditions', location: 'Pan-Indian Cultural Heritage', era: 'Ancient Vedic Observance', desc: 'Hand-crafted clay diyas radiating warm illumination across vibrant rangoli patterns, celebrating the triumph of spiritual light over darkness.', img: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/The_Rangoli_of_Lights.jpg/1920px-The_Rangoli_of_Lights.jpg', thumb: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/The_Rangoli_of_Lights.jpg/400px-The_Rangoli_of_Lights.jpg', credit: 'Wikimedia Commons / Subhrajyoti07' },
      { order: 16, title: 'Channapatna Lacquerware & Wooden Handicrafts', category: 'GI-Protected Traditional Handicrafts', location: 'Channapatna, Ramanagara, Karnataka', era: '18th Century CE Royal Patronage • Tipu Sultan', desc: 'World-renowned ivory-wood turned handicrafts polished with natural vegetable dyes and shellac, recognized with geographical indication (GI) status.', img: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Wooden_toys.JPG/1920px-Wooden_toys.JPG', thumb: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Wooden_toys.JPG/400px-Wooden_toys.JPG', credit: 'Wikimedia Commons / Hari Prasad Nadig' },
      { order: 17, title: 'Thrissur Pooram Grand Elephant Procession', category: 'Living Temple Pageantry & Agrarian Heritage', location: 'Vadakkunnathan Temple, Thrissur, Kerala', era: 'Established 1798 CE by Sakthan Thampuran', desc: 'The Mother of all Poorams, featuring synchronized Panchavadyam drumming and the awe-inspiring Kudamattom exchange of brilliantly colored silk parasols.', img: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/Kudamatom_at_thrissur_pooram_2013_7618.JPG/1920px-Kudamatom_at_thrissur_pooram_2013_7618.JPG', thumb: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/Kudamatom_at_thrissur_pooram_2013_7618.JPG/400px-Kudamatom_at_thrissur_pooram_2013_7618.JPG', credit: 'Wikimedia Commons / Adarsh K' },
      { order: 18, title: 'Hoysaleswara Temple Sacred Stone Sculptures', category: 'UNESCO World Heritage • Sacred Hoysala Sculptures', location: 'Halebidu, Hassan District, Karnataka', era: '1121–1160 CE • Hoysala King Vishnuvardhana', desc: 'Chloritic schist soapstone masterpieces with thousands of intricate relief sculptures depicting epic scenes, celestial dancers, and filigree jewelry carved in relief.', img: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/Hoysaleshwara_temple_in_Monsoon.JPG/1920px-Hoysaleshwara_temple_in_Monsoon.JPG', thumb: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/Hoysaleshwara_temple_in_Monsoon.JPG/400px-Hoysaleshwara_temple_in_Monsoon.JPG', credit: 'Wikimedia Commons / Dineshkannambadi' },
      { order: 19, title: 'Rani ki Vav Subterranean Stepwell Architecture', category: 'UNESCO World Heritage • Maru-Gurjara Architecture', location: 'Patan, Gujarat', era: '11th Century CE • Chaulukya Queen Udayamati', desc: 'An inverted subterranean temple descending seven levels into the earth, lined with over five hundred major sculptures and intricate pillared pavilions.', img: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Rani_ki_vav_02.jpg/1920px-Rani_ki_vav_02.jpg', thumb: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Rani_ki_vav_02.jpg/400px-Rani_ki_vav_02.jpg', credit: 'Wikimedia Commons / Bernard Gagnon' },
      { order: 20, title: 'Lathmar Holi Celebration of Braj', category: 'Living Sacred Folk Festivals & Celebrations', location: 'Nandgaon & Barsana, Uttar Pradesh', era: 'Centuries-Old Cultural Heritage Tradition', desc: 'An exhilarating cultural spectacle of unity and devotion where skies fill with organic vermilion and golden turmeric gulal clouds celebrating the eternal Radha-Krishna lore.', img: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/Lathmar_Holi_2022_in_Nandgaon%2C_Uttar_Pradesh_%28edited%29.jpg/1920px-Lathmar_Holi_2022_in_Nandgaon%2C_Uttar_Pradesh_%28edited%29.jpg', thumb: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/Lathmar_Holi_2022_in_Nandgaon%2C_Uttar_Pradesh_%28edited%29.jpg/400px-Lathmar_Holi_2022_in_Nandgaon%2C_Uttar_Pradesh_%28edited%29.jpg', credit: 'Wikimedia Commons / Subrata Roy' },
    ];

    for (const slide of slides) {
      await turso.execute({
        sql: `
          INSERT OR IGNORE INTO slideshow_monuments (display_order, title, category, location, era, description, image_url, thumb_url, credit)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        args: [slide.order, slide.title, slide.category, slide.location, slide.era, slide.desc, slide.img, slide.thumb, slide.credit],
      });
    }

    console.log('🎉 Turso Cloud Database successfully migrated & seeded with 20 authentic heritage monuments!');
  } catch (err) {
    console.error('❌ Turso migration error:', err);
  }
}

migrate();
