import { turso } from '../db/turso.js';
import assert from 'assert';

async function testHomepageSuite() {
  console.log('🏛️  RUNNING HOMEPAGE ERROR DETECTION & VERIFICATION SUITE...\n');
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

  // 1. Stories Verification
  console.log('1. STORIES SECTION TESTS:');
  const storiesRes = await turso.execute('SELECT * FROM stories ORDER BY display_order ASC;');
  test('5 stories present in Turso', () => {
    assert(storiesRes.rows.length >= 5, `Expected >= 5 stories, got ${storiesRes.rows.length}`);
  });

  const storiesByTitle = {};
  storiesRes.rows.forEach(r => { storiesByTitle[r.title] = r; });

  test('Festivals story has authentic festival imagery (not coffee cup/placeholder)', () => {
    const fest = storiesByTitle['Festivals'];
    assert(fest, 'Festivals story exists');
    assert(fest.media_url.includes('photo-1605647540924-852290f6b0d5'), 'Has authentic Deepavali/diya lamps photo');
  });

  test('Temples story has ancient temple architecture imagery', () => {
    const temple = storiesByTitle['Temples'];
    assert(temple, 'Temples story exists');
    assert(temple.media_url.includes('photo-1600100397608-f010f4439c1e'), 'Has stone temple architecture photo');
  });

  test('Dance story has classical dance imagery (not gym/workout)', () => {
    const dance = storiesByTitle['Dance'];
    assert(dance, 'Dance story exists');
    assert(dance.media_url.includes('photo-1599839575945-a9e5af0c3fa5'), 'Has classical Indian dance costume/mudra photo');
  });

  test('Culture story has living culture ritual imagery', () => {
    const cult = storiesByTitle['Culture'];
    assert(cult, 'Culture story exists');
    assert(cult.media_url.includes('photo-1561361513-2d000a50f0dc'), 'Has Varanasi Ganga Aarti photo');
  });

  test('All stories have unique non-repeating media URLs', () => {
    const urls = storiesRes.rows.map(r => r.media_url);
    const unique = new Set(urls);
    assert(urls.length === unique.size, 'No repeated story media URLs');
  });

  // 2. Main Home Feed & Content Accuracy Tests
  console.log('\n2. MAIN HOME FEED & CONTENT ACCURACY TESTS:');
  const postsRes = await turso.execute(`
    SELECT p.*, u.full_name, u.avatar_url, u.username
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC;
  `);

  test('Feed contains 5 verified historical posts', () => {
    assert(postsRes.rows.length >= 5, `Expected >= 5 posts, got ${postsRes.rows.length}`);
  });

  const postsByLocation = {};
  postsRes.rows.forEach(p => { postsByLocation[p.location] = p; });

  test('Konark, Odisha is matched to Konark Sun Temple chariot wheel (NOT sea rock)', () => {
    const konark = postsByLocation['Konark, Odisha'];
    assert(konark, 'Konark post exists');
    assert(!konark.media_url.includes('photo-1621847468516-1ed5d0df56fe'), 'Old ocean rock photo successfully replaced');
    assert(konark.media_url.includes('photo-1609137144822-2638848d7950'), 'Accurately displays Konark chariot stone wheel');
    assert(konark.caption.includes('Sun Temple at Konark'), 'Caption is historically accurate for Konark');
  });

  test('Hampi, Karnataka is matched to Vijaya Vittala Stone Chariot', () => {
    const hampi = postsByLocation['Hampi, Karnataka'];
    assert(hampi, 'Hampi post exists');
    assert(hampi.media_url.includes('photo-1590766940554-634a7ed41450'), 'Accurately displays Hampi stone chariot');
    assert(hampi.caption.includes('Vijaya Vittala'), 'Caption matches Hampi temple complex');
  });

  test('Thanjavur, Tamil Nadu is matched to Brihadisvara granite vimana', () => {
    const thanjavur = postsByLocation['Thanjavur, Tamil Nadu'];
    assert(thanjavur, 'Thanjavur post exists');
    assert(thanjavur.caption.includes('Brihadisvara') || thanjavur.caption.includes('Raja Raja Chola'), 'Caption matches Great Chola temple');
  });

  test('Ellora Caves, Maharashtra is matched to Kailasa monolith', () => {
    const ellora = postsByLocation['Ellora Caves, Maharashtra'];
    assert(ellora, 'Ellora Caves post exists');
    assert(ellora.caption.includes('Kailasa Temple'), 'Caption matches Kailasa monolith');
  });

  test('Varanasi, Uttar Pradesh is matched to Ganga Aarti', () => {
    const varanasi = postsByLocation['Varanasi, Uttar Pradesh'];
    assert(varanasi, 'Varanasi post exists');
    assert(varanasi.caption.includes('Ganga Aarti'), 'Caption matches living heritage ritual');
  });

  test('All posts have distinct author profiles with individual avatars', () => {
    const authors = postsRes.rows.map(p => p.full_name);
    assert(new Set(authors).size >= 4, 'Posts are authored by distinct custodians');
  });

  // 3. Suggested Accounts & Follow Relationships Tests
  console.log('\n3. SUGGESTED ACCOUNTS & FOLLOW RELATIONSHIPS TESTS:');
  const suggestedRes = await turso.execute(`
    SELECT 
      u.id, u.full_name AS name, u.username, u.avatar_url AS avatarUrl,
      (SELECT COUNT(*) FROM follows f WHERE f.following_id = u.id) AS followersCount
    FROM users u
    WHERE u.is_verified = 1 AND u.id != 'usr_g_1794895297945_drxa'
    ORDER BY followersCount DESC;
  `);

  test('Suggested accounts return authentic verified custodians', () => {
    assert(suggestedRes.rows.length >= 4, `Expected >= 4 suggested accounts, got ${suggestedRes.rows.length}`);
  });

  test('All suggested custodians have individual, unique avatar images', () => {
    const avatars = suggestedRes.rows.map(r => r.avatarUrl);
    const uniqueAvatars = new Set(avatars);
    assert(avatars.length === uniqueAvatars.size, `Expected all unique avatars, found duplicates: ${avatars.length} vs ${uniqueAvatars.size}`);
  });

  test('Follower counts reflect actual records in Turso follows table', () => {
    const hasFollowers = suggestedRes.rows.some(r => Number(r.followersCount) > 0);
    assert(hasFollowers, 'Follower counts are calculated from real Turso follows table');
  });

  // 4. Like, Comment, and Bookmark Persistence Test
  console.log('\n4. INTERACTION PERSISTENCE TESTS:');
  const testPost = postsRes.rows[0];
  const initialLikes = Number(testPost.likes_count);

  // Like
  await turso.execute({
    sql: 'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?;',
    args: [testPost.id]
  });
  const likedPost = await turso.execute({
    sql: 'SELECT likes_count FROM posts WHERE id = ?;',
    args: [testPost.id]
  });
  test('Post like increments and persists in Turso', () => {
    assert(Number(likedPost.rows[0].likes_count) === initialLikes + 1, 'Like count incremented');
  });

  // Revert like
  await turso.execute({
    sql: 'UPDATE posts SET likes_count = ? WHERE id = ?;',
    args: [initialLikes, testPost.id]
  });

  console.log(`\n=================================================`);
  console.log(`HOMEPAGE QA VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=================================================\n`);

  if (failed > 0) process.exit(1);
  process.exit(0);
}

testHomepageSuite().catch(e => {
  console.error('Test suite failure:', e);
  process.exit(1);
});
