import { turso } from '../db/turso.js';

async function testSuite() {
  console.log('🧪 Testing Backend Endpoints & Turso Cloud DB operations...');

  // 1. Places check
  const places = await turso.execute('SELECT COUNT(*) as c FROM heritage_places;');
  console.log('✅ Heritage Places count:', places.rows[0].c);

  // 2. Communities check
  const comms = await turso.execute('SELECT COUNT(*) as c FROM communities;');
  console.log('✅ Communities count:', comms.rows[0].c);

  // 3. Reels check
  const reels = await turso.execute('SELECT COUNT(*) as c FROM reels;');
  console.log('✅ Reels count:', reels.rows[0].c);

  // 4. Stories check
  const stories = await turso.execute('SELECT COUNT(*) as c FROM stories;');
  console.log('✅ Stories count:', stories.rows[0].c);

  // 5. Follows check
  const follows = await turso.execute('SELECT COUNT(*) as c FROM follows;');
  console.log('✅ Follows count:', follows.rows[0].c);

  console.log('🎉 All Database Tables Active & Connected!');
}

testSuite().catch(console.error);
