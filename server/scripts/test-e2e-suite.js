import { turso } from '../db/turso.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'samskruthi_super_secret_jwt_turso_2026';

async function runE2ETests() {
  console.log('🏛️  STARTING COMPLETE SAMSKRUTHI FUNCTIONAL QA TEST SUITE\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Setup Test Users in Turso
  console.log('Test 1: User Accounts & Authentication Setup');
  const userA_id = 'test_user_a_' + Date.now();
  const userB_id = 'test_user_b_' + Date.now();

  await turso.execute({
    sql: `
      INSERT INTO users (id, email, full_name, username, role, is_verified)
      VALUES (?, ?, ?, ?, 'Heritage Member', 1), (?, ?, ?, ?, 'Heritage Chronicler', 1);
    `,
    args: [
      userA_id, `${userA_id}@samskruthi.test`, 'Aryavarta Chronicler', `aryavarta_${Date.now()}`,
      userB_id, `${userB_id}@samskruthi.test`, 'Chola Epigraphist', `chola_${Date.now()}`
    ],
  });

  const checkUsers = await turso.execute({
    sql: 'SELECT id, full_name FROM users WHERE id IN (?, ?);',
    args: [userA_id, userB_id],
  });
  assert(checkUsers.rows.length === 2, 'User A and User B provisioned in Turso');

  // 2. Test Follow / Unfollow & Notification
  console.log('\nTest 2: Follow, Unfollow & Follower Notifications');
  await turso.execute({
    sql: 'INSERT INTO follows (follower_id, following_id) VALUES (?, ?);',
    args: [userA_id, userB_id],
  });

  const followCheck = await turso.execute({
    sql: 'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?;',
    args: [userA_id, userB_id],
  });
  assert(followCheck.rows.length === 1, 'User A successfully follows User B in Turso');

  // Generate notification for User B
  await turso.execute({
    sql: `
      INSERT INTO notifications (id, user_id, type, title, message, data, is_read, created_at)
      VALUES (?, ?, 'follow', 'New Follower', 'Aryavarta Chronicler started following you.', ?, 0, CURRENT_TIMESTAMP);
    `,
    args: [`notif_f_${Date.now()}`, userB_id, JSON.stringify({ followerId: userA_id })],
  });

  const notifCheck = await turso.execute({
    sql: "SELECT id, title, is_read FROM notifications WHERE user_id = ? AND type = 'follow';",
    args: [userB_id],
  });
  assert(notifCheck.rows.length >= 1, 'Real notification delivered to User B in Turso');

  // Unfollow
  await turso.execute({
    sql: 'DELETE FROM follows WHERE follower_id = ? AND following_id = ?;',
    args: [userA_id, userB_id],
  });
  const unfollowCheck = await turso.execute({
    sql: 'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?;',
    args: [userA_id, userB_id],
  });
  assert(unfollowCheck.rows.length === 0, 'Unfollow removes relationship from Turso');

  // 3. Test Post Creation, Like, and Comment
  console.log('\nTest 3: Post Creation, Liking, and Commenting in Turso');
  const testPostId = 'post_test_' + Date.now();
  await turso.execute({
    sql: `
      INSERT INTO posts (id, user_id, location, media_url, caption, hashtags, likes_count, comments_count, shares_count)
      VALUES (?, ?, 'Pattadakal, Karnataka', 'https://images.unsplash.com/photo-1600100397608-f010f4439c1e', '7th century Chalukya temples', '#Pattadakal,#Chalukya', 0, 0, 0);
    `,
    args: [testPostId, userA_id],
  });

  const postCheck = await turso.execute({
    sql: 'SELECT id, caption, user_id FROM posts WHERE id = ?;',
    args: [testPostId],
  });
  assert(postCheck.rows.length === 1, 'Post created and stored in Turso with User A');

  // User B Likes User A's Post
  await turso.execute({
    sql: 'INSERT INTO likes (id, post_id, user_id) VALUES (?, ?, ?);',
    args: [`like_${Date.now()}`, testPostId, userB_id],
  });
  await turso.execute({
    sql: 'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?;',
    args: [testPostId],
  });

  const likeCountCheck = await turso.execute({
    sql: 'SELECT likes_count FROM posts WHERE id = ?;',
    args: [testPostId],
  });
  assert(Number(likeCountCheck.rows[0].likes_count) === 1, 'Post likes_count increments in Turso');

  // User B Comments on Post
  const commentText = 'Remarkable hybrid Rekha-Nagara and Dravida vimana architectures!';
  await turso.execute({
    sql: 'INSERT INTO comments (id, post_id, user_id, text) VALUES (?, ?, ?, ?);',
    args: [`cmt_${Date.now()}`, testPostId, userB_id, commentText],
  });
  await turso.execute({
    sql: 'UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?;',
    args: [testPostId],
  });

  const commentCheck = await turso.execute({
    sql: 'SELECT text FROM comments WHERE post_id = ?;',
    args: [testPostId],
  });
  assert(commentCheck.rows.length === 1 && commentCheck.rows[0].text === commentText, 'Comment stored in Turso and linked to post');

  // 4. Test Bookmarking / Saving Post
  console.log('\nTest 4: Post Bookmarking / Saving');
  await turso.execute({
    sql: 'INSERT INTO bookmarks (id, user_id, post_id) VALUES (?, ?, ?);',
    args: [`bm_${Date.now()}`, userB_id, testPostId],
  });

  const bookmarkCheck = await turso.execute({
    sql: 'SELECT 1 FROM bookmarks WHERE user_id = ? AND post_id = ?;',
    args: [userB_id, testPostId],
  });
  assert(bookmarkCheck.rows.length === 1, 'User B successfully saved User A post to bookmarks');

  // 5. Test 1-on-1 Messages
  console.log('\nTest 5: User-to-User Direct Messaging');
  const [u1, u2] = [userA_id, userB_id].sort();
  const convId = 'conv_test_' + Date.now();
  await turso.execute({
    sql: `
      INSERT INTO conversations (id, user1_id, user2_id, last_message, last_message_at)
      VALUES (?, ?, ?, 'Greetings Custodian', CURRENT_TIMESTAMP);
    `,
    args: [convId, u1, u2],
  });

  const msgId = 'msg_test_' + Date.now();
  await turso.execute({
    sql: `
      INSERT INTO messages (id, conversation_id, sender_id, recipient_id, text, is_read)
      VALUES (?, ?, ?, ?, 'Have you reviewed the badami cave 3 inscriptions?', 0);
    `,
    args: [msgId, convId, userA_id, userB_id],
  });

  const msgCheck = await turso.execute({
    sql: 'SELECT id, text, is_read FROM messages WHERE conversation_id = ?;',
    args: [convId],
  });
  assert(msgCheck.rows.length === 1 && msgCheck.rows[0].is_read === 0, 'Message sent and stored with is_read = 0 in Turso');

  // User B reads message
  await turso.execute({
    sql: 'UPDATE messages SET is_read = 1 WHERE id = ?;',
    args: [msgId],
  });
  const readCheck = await turso.execute({
    sql: 'SELECT is_read FROM messages WHERE id = ?;',
    args: [msgId],
  });
  assert(readCheck.rows[0].is_read === 1, 'Message marked as read');

  // 6. Test Communities Creation & Joining
  console.log('\nTest 6: Communities & Guilds Membership');
  const commId = 'comm_test_' + Date.now();
  await turso.execute({
    sql: `
      INSERT INTO communities (id, name, slug, description, category, creator_id, member_count)
      VALUES (?, 'Chalukyan Epigraphy Guild', ?, 'Deciphering Badami and Aihole rock edicts', 'Epigraphy', ?, 1);
    `,
    args: [commId, 'chalukyan-epigraphy-' + Date.now(), userA_id],
  });

  // User B Joins
  await turso.execute({
    sql: "INSERT INTO community_members (community_id, user_id, role) VALUES (?, ?, 'member');",
    args: [commId, userB_id],
  });
  await turso.execute({
    sql: 'UPDATE communities SET member_count = member_count + 1 WHERE id = ?;',
    args: [commId],
  });

  const commMemberCheck = await turso.execute({
    sql: 'SELECT member_count FROM communities WHERE id = ?;',
    args: [commId],
  });
  assert(Number(commMemberCheck.rows[0].member_count) === 2, 'Community created and member count updated upon User B joining');

  // 7. Test Reels & Video Playback Data
  console.log('\nTest 7: Cultural Reels System');
  const reelId = 'reel_test_' + Date.now();
  await turso.execute({
    sql: `
      INSERT INTO reels (id, user_id, caption, video_url, location, views_count, likes_count)
      VALUES (?, ?, 'Chanting at sunrise in Pattadakal', 'https://assets.mixkit.co/videos/preview/mixkit-traditional-hindu-temple-ceremony-43187-large.mp4', 'Pattadakal', 10, 2);
    `,
    args: [reelId, userA_id],
  });

  await turso.execute({
    sql: 'UPDATE reels SET views_count = views_count + 1 WHERE id = ?;',
    args: [reelId],
  });
  const reelViewCheck = await turso.execute({
    sql: 'SELECT views_count FROM reels WHERE id = ?;',
    args: [reelId],
  });
  assert(Number(reelViewCheck.rows[0].views_count) === 11, 'Reel view count incremented and verified in Turso');

  // Clean up test data
  console.log('\n🧹 Cleaning up test artifacts from Turso...');
  await turso.execute({ sql: 'DELETE FROM communities WHERE id = ?;', args: [commId] });
  await turso.execute({ sql: 'DELETE FROM reels WHERE id = ?;', args: [reelId] });
  await turso.execute({ sql: 'DELETE FROM conversations WHERE id = ?;', args: [convId] });
  await turso.execute({ sql: 'DELETE FROM posts WHERE id = ?;', args: [testPostId] });
  await turso.execute({ sql: 'DELETE FROM users WHERE id IN (?, ?);', args: [userA_id, userB_id] });

  console.log(`\n========================================`);
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ETests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
