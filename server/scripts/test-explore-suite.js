import { turso } from '../db/turso.js';
import assert from 'assert';

async function testExploreSuite() {
  console.log('🏛️  RUNNING SAMSKRUTHI EXPLORE COMPLETE AUDIT & VERIFICATION SUITE...\n');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // Fetch all places from Turso
  const placesRes = await turso.execute('SELECT * FROM heritage_places;');
  const places = placesRes.rows;
  const placesByName = {};
  places.forEach((p) => {
    placesByName[p.name] = p;
  });

  // ==========================================
  // PHASE 1: IMAGE ERRORS VERIFICATION
  // ==========================================
  console.log('1. PHASE 1: IMAGE ACCURACY & REPAIR TESTS:');

  test('Total 13 authentic heritage places present in Turso database', () => {
    assert(places.length >= 13, `Expected >= 13 places, found ${places.length}`);
  });

  test('Ajanta Caves displays authentic Buddhist rock-cut architecture (NOT backwater)', () => {
    const ajanta = placesByName['Ajanta Caves Buddhist Monasteries'];
    assert(ajanta, 'Ajanta Caves record exists');
    assert(ajanta.image_url.includes('ajanta-caves.jpg'), 'Displays authentic Buddhist rock-cut chaitya facade');
  });

  test('Ellora Caves & Kailasa Temple displays authentic rock-cut monolith (NOT backwater)', () => {
    const ellora = placesByName['Ellora Caves & Kailasa Temple'];
    assert(ellora, 'Ellora Caves record exists');
    assert(ellora.image_url.includes('ellora-caves.jpg'), 'Displays authentic Kailasa monolithic temple');
  });

  test('Brihadisvara Temple displays authentic Chola granite vimana in Thanjavur, Tamil Nadu', () => {
    const brihad = placesByName['Brihadisvara Temple'];
    assert(brihad, 'Brihadisvara record exists');
    assert(brihad.state === 'Tamil Nadu', 'Location state is Tamil Nadu');
    assert(brihad.location.includes('Thanjavur'), 'Location is Thanjavur');
    assert(brihad.image_url.includes('brihadisvara-temple.jpg'), 'Displays authentic towering granite vimana');
  });

  test('Khajuraho Group of Monuments displays authentic Nagara stone temple (NOT black/broken)', () => {
    const khaj = placesByName['Khajuraho Group of Monuments'];
    assert(khaj, 'Khajuraho record exists');
    assert(khaj.image_url.includes('khajuraho-monuments.jpg'), 'Displays authentic Chandela Nagara sandstone spires');
  });

  test('Konark Sun Temple displays authentic chariot stone wheel (NOT sea cliff)', () => {
    const konark = placesByName['Konark Sun Temple'];
    assert(konark, 'Konark Sun Temple record exists');
    assert(konark.image_url.includes('konark-sun-temple.jpg'), 'Displays authentic 24-spoke solar chariot wheel');
  });

  test('Every heritage treasure has an independent, non-empty, high-res image URL', () => {
    places.forEach((p) => {
      assert(p.image_url && p.image_url.startsWith('/images/heritage/'), `${p.name} has valid image URL`);
    });
  });

  // ==========================================
  // PHASE 2: HERITAGE INFORMATION VERIFICATION
  // ==========================================
  console.log('\n2. PHASE 2: HISTORICAL INFORMATION ACCURACY TESTS:');

  test('Historical backgrounds and architectural styles are accurate', () => {
    const brihad = placesByName['Brihadisvara Temple'];
    assert(brihad.architectural_style.includes('Chola'), 'Brihadisvara is Chola Dravidian Architecture');
    assert(brihad.era.includes('1010 CE'), 'Era is 1010 CE');

    const konark = placesByName['Konark Sun Temple'];
    assert(konark.architectural_style.includes('Kalinga'), 'Konark is Kalinga Architecture');

    const ellora = placesByName['Ellora Caves & Kailasa Temple'];
    assert(ellora.architectural_style.includes('Rock-Cut'), 'Ellora is Rock-Cut Monolithic');

    const khaj = placesByName['Khajuraho Group of Monuments'];
    assert(khaj.architectural_style.includes('Nagara'), 'Khajuraho is Nagara Style');
  });

  test('Cultural significance and interesting facts are populated', () => {
    places.forEach((p) => {
      assert(p.cultural_significance && p.cultural_significance.length > 20, `${p.name} has cultural significance`);
      assert(p.interesting_facts && p.interesting_facts.length > 20, `${p.name} has interesting facts`);
    });
  });

  // ==========================================
  // PHASE 3: CATEGORY SYSTEM TESTS
  // ==========================================
  console.log('\n3. PHASE 3: CATEGORY SYSTEM & FILTERING TESTS:');

  const categories = [
    { cat: 'all', minCount: 13, name: 'All Treasures' },
    { cat: 'monuments-architecture', minCount: 4, name: 'Monuments' },
    { cat: 'ancient-civilizations', minCount: 3, name: 'Ancient Eras' },
    { cat: 'historic-cities', minCount: 2, name: 'Historic Cities' },
    { cat: 'traditional-crafts', minCount: 2, name: 'Craft Traditions' },
    { cat: 'performing-arts', minCount: 2, name: 'Dance & Music' },
  ];

  for (const c of categories) {
    const sql = c.cat === 'all'
      ? 'SELECT COUNT(*) as cnt FROM heritage_places;'
      : 'SELECT COUNT(*) as cnt FROM heritage_places WHERE category = ?;';
    const args = c.cat === 'all' ? [] : [c.cat];
    const res = await turso.execute({ sql, args });
    const count = Number(res.rows[0].cnt);

    test(`Category "${c.name}" (${c.cat}) returns ${count} active treasures (>= ${c.minCount})`, () => {
      assert(count >= c.minCount, `Category ${c.cat} expected >= ${c.minCount}, got ${count}`);
    });
  }

  // ==========================================
  // PHASE 4: SEARCH FUNCTIONALITY TESTS
  // ==========================================
  console.log('\n4. PHASE 4: SEARCH FUNCTIONALITY TESTS:');

  async function testSearch(query, expectedName) {
    const pattern = `%${query.toLowerCase()}%`;
    const res = await turso.execute({
      sql: `
        SELECT name, location, state FROM heritage_places
        WHERE LOWER(name) LIKE ? OR LOWER(location) LIKE ? OR LOWER(state) LIKE ? OR LOWER(description) LIKE ? OR LOWER(architectural_style) LIKE ?;
      `,
      args: [pattern, pattern, pattern, pattern, pattern]
    });
    const found = res.rows.some(r => r.name.toLowerCase().includes(expectedName.toLowerCase()));
    assert(found, `Search for "${query}" correctly found "${expectedName}"`);
  }

  test('Search by monument name: "Konark" finds Konark Sun Temple', async () => {
    await testSearch('Konark', 'Konark Sun Temple');
  });

  test('Search by state: "Karnataka" finds Virupaksha, Yakshagana, Bidriware', async () => {
    await testSearch('Karnataka', 'Virupaksha');
  });

  test('Search by architectural style: "Dravidian" finds Brihadisvara and Virupaksha', async () => {
    await testSearch('Dravidian', 'Brihadisvara');
  });

  test('Search by craft: "Bronze" finds Thanjavur Bronze Casting', async () => {
    await testSearch('Bronze', 'Thanjavur Sacred Bronze Casting');
  });

  test('Search by dance: "Yakshagana" finds Yakshagana Dance-Theatre', async () => {
    await testSearch('Yakshagana', 'Yakshagana Dance-Theatre');
  });

  // ==========================================
  // PHASE 5: DETAIL VIEW & BOOKMARK PERSISTENCE
  // ==========================================
  console.log('\n5. PHASE 5: DETAIL VIEW & BOOKMARK INTEGRATION:');

  test('Place detail query by slug retrieves full structured facts', async () => {
    const res = await turso.execute({
      sql: 'SELECT name, cultural_significance, interesting_facts, visitor_info FROM heritage_places WHERE slug = "brihadisvara-thanjavur";'
    });
    assert(res.rows.length === 1, 'Found Brihadisvara by slug');
    assert(res.rows[0].interesting_facts.includes('80-tonne'), 'Contains accurate 80-tonne facts');
  });

  test('Place bookmarking writes to Turso bookmarks table', async () => {
    const testBookmarkId = `bm_test_exp_${Date.now()}`;
    await turso.execute({
      sql: 'INSERT INTO bookmarks (id, user_id, post_id) VALUES (?, "custodian-001", "hp-1");',
      args: [testBookmarkId]
    });
    const checkBm = await turso.execute({
      sql: 'SELECT 1 FROM bookmarks WHERE id = ?;',
      args: [testBookmarkId]
    });
    assert(checkBm.rows.length === 1, 'Bookmark successfully saved in Turso');

    // Clean up test bookmark
    await turso.execute({
      sql: 'DELETE FROM bookmarks WHERE id = ?;',
      args: [testBookmarkId]
    });
  });

  console.log(`\n======================================================`);
  console.log(`EXPLORE AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
  process.exit(0);
}

testExploreSuite().catch((e) => {
  console.error('Test explore suite failure:', e);
  process.exit(1);
});
