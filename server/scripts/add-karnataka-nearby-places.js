import { turso } from '../db/turso.js';

async function addNearbyKarnatakaPlaces() {
  console.log('📍 Adding authentic Karnataka & Bengaluru nearby heritage places to Turso...');

  const places = [
    {
      id: 'hp-in-bangalore-fort',
      name: 'Tipu Sultan’s Summer Palace & Bangalore Fort',
      slug: 'tipu-sultan-summer-palace-bangalore',
      category: 'forts-palaces',
      continent: 'Asia',
      country: 'India',
      state: 'Karnataka',
      city: 'Bengaluru',
      location: 'Albert Victor Road, Chamrajpet, Bengaluru',
      latitude: 12.9592,
      longitude: 77.5738,
      era: '1537–1791 CE (Kempe Gowda & Tipu Sultan)',
      description: 'An exquisite two-story teakwood palace adorned with carved pillars, floral frescoes, and fluted arches, standing beside the historic stone bastions of the 16th-century Bangalore Fort.',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Tipu_Sultan%27s_Summer_Palace%2C_Bangalore.jpg/1280px-Tipu_Sultan%27s_Summer_Palace%2C_Bangalore.jpg',
      architectural_style: 'Indo-Islamic Teakwood Architecture',
      visitor_info: 'Open daily 8:30 AM – 5:30 PM. Centrally located in Old Bengaluru.',
      cultural_significance: 'Historic seat of administration for the Kingdom of Mysore in Bengaluru, preserving original 18th-century royal teak woodwork.',
      interesting_facts: 'Constructed entirely of seasoned East Indian teak wood with mortar and stone plinths; features four delicate balconies from which Tipu Sultan held court.',
      unesco_status: 'National Monument of Archaeological Importance (ASI)',
      heritage_type: 'tangible',
      source_url: 'https://asibengalurucircle.in',
    },
    {
      id: 'hp-in-channapatna-toys',
      name: 'Channapatna Lacquerware & Wooden Toy Craft',
      slug: 'channapatna-lacquerware-craft',
      category: 'traditional-crafts',
      continent: 'Asia',
      country: 'India',
      state: 'Karnataka',
      city: 'Channapatna',
      location: 'Ramanagara District, Bangalore-Mysore Highway',
      latitude: 12.6518,
      longitude: 77.2089,
      era: '18th Century CE to Present (Tipu Sultan Royal Patronage)',
      description: 'Celebrated traditional woodturning craft utilizing soft ivory-wood (Aale Mara) and natural vegetable dyes extracted from turmeric, indigo, and kumkum, coated with shellac.',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Wooden_toys.JPG/1280px-Wooden_toys.JPG',
      architectural_style: 'GI-Protected Indigenous Woodturning & Lacquering',
      visitor_info: 'Artisan cooperative workshops open daily for cultural craft tours.',
      cultural_significance: 'Recognized with Geographical Indication (GI) status; celebrated globally as the "Gombegala Ooru" (Town of Toys).',
      interesting_facts: 'The vibrant golden and crimson colors are 100% non-toxic, derived entirely from organic vegetable dyes applied with screw-pine leaf polish while spinning on lathes.',
      unesco_status: 'Geographical Indication (GI) Registered Craft',
      heritage_type: 'intangible',
      source_url: 'https://karnatakagovernment.in',
    },
    {
      id: 'hp-in-mysore-palace',
      name: 'Mysore Palace (Amba Vilas)',
      slug: 'mysore-palace-amba-vilas',
      category: 'forts-palaces',
      continent: 'Asia',
      country: 'India',
      state: 'Karnataka',
      city: 'Mysuru',
      location: 'Sayyaji Rao Road, Central Mysuru',
      latitude: 12.3051,
      longitude: 76.6551,
      era: '1897–1912 CE (Wadiyar Dynasty, Henry Irwin)',
      description: 'The monumental three-story stone palace of the Wadiyar Maharajas, blending Indo-Saracenic, Rajput, and Gothic styles with marble domes, stained glass, and silver throne doors.',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Mysore_Palace_Morning.jpg/1280px-Mysore_Palace_Morning.jpg',
      architectural_style: 'Indo-Saracenic Royal Palace Architecture',
      visitor_info: 'Open daily 10:00 AM – 5:30 PM. Illumination on Sundays and festive evenings.',
      cultural_significance: 'Epicenter of Mysore Dasara festivities, classical Carnatic royal music patronage, and Karnataka sovereign heritage.',
      interesting_facts: 'During festive evenings, the entire grand facade is illuminated by precisely 97,000 incandescent golden light bulbs, visible across the Mysuru plateau.',
      unesco_status: 'Protected Heritage Monument of Karnataka',
      heritage_type: 'tangible',
      source_url: 'https://mysorepalace.karnataka.gov.in',
    },
    {
      id: 'hp-in-halebidu-temple',
      name: 'Hoysaleswara Temple at Halebidu',
      slug: 'hoysaleswara-temple-halebidu',
      category: 'ancient-temples',
      continent: 'Asia',
      country: 'India',
      state: 'Karnataka',
      city: 'Halebidu',
      location: 'Hassan District, Southern Karnataka',
      latitude: 13.2133,
      longitude: 75.9942,
      era: '1121–1160 CE (Hoysala Empire, King Vishnuvardhana)',
      description: 'A chloritic schist (soapstone) masterpiece featuring twin sanctums (Dvikuta) adorned with thousands of relief friezes of celestial dancers, mythological beasts, and epic narratives.',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Hoysaleshwara_temple_in_Monsoon.JPG/1280px-Hoysaleshwara_temple_in_Monsoon.JPG',
      architectural_style: 'Hoysala Star-Shaped Stepped Vimana Architecture',
      visitor_info: 'Open daily 6:30 AM – 6:30 PM. Inscribed on UNESCO World Heritage list in 2023.',
      cultural_significance: 'Inscribed as part of the Sacred Ensembles of the Hoysalas; represents the pinnacle of micro-carved medieval Indian sculpture.',
      interesting_facts: 'No two relief sculptures among the tens of thousands around the perimeter wall are identical. The artists signed their names on stone pedestals in Old Kannada script.',
      unesco_status: 'UNESCO World Heritage Site (2023, Sacred Ensembles of the Hoysalas)',
      heritage_type: 'tangible',
      source_url: 'https://whc.unesco.org/en/list/1670',
    },
  ];

  for (const place of places) {
    await turso.execute({
      sql: `
        INSERT OR REPLACE INTO heritage_places (
          id, name, slug, category, continent, country, state, city, location,
          latitude, longitude, era, description, image_url, architectural_style,
          visitor_info, cultural_significance, interesting_facts, unesco_status,
          heritage_type, source_url, is_verified
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, 1
        );
      `,
      args: [
        place.id,
        place.name,
        place.slug,
        place.category,
        place.continent,
        place.country,
        place.state,
        place.city,
        place.location,
        place.latitude,
        place.longitude,
        place.era,
        place.description,
        place.image_url,
        place.architectural_style,
        place.visitor_info,
        place.cultural_significance,
        place.interesting_facts,
        place.unesco_status,
        place.heritage_type,
        place.source_url,
      ],
    });
    console.log(`+ Added: ${place.name} (${place.city}) -> Lat: ${place.latitude}, Lng: ${place.longitude}`);
  }

  const count = await turso.execute('SELECT COUNT(*) as c FROM heritage_places;');
  console.log(`✅ Total heritage places in Turso now: ${count.rows[0].c}`);
}

addNearbyKarnatakaPlaces().catch(console.error);
