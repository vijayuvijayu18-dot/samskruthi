import express from 'express';
import { turso } from '../db/turso.js';
import { authenticateToken } from '../middleware/auth.js';
import { createNotification } from '../services/notificationService.js';

const router = express.Router();

/**
 * GET /api/follows/suggested
 * Suggests real registered custodians with actual follower counts
 */
router.get('/suggested', async (req, res) => {
  const currentUserId = req.headers.authorization ? getUserIdFromToken(req.headers.authorization) : null;

  try {
    let result;
    if (currentUserId) {
      result = await turso.execute({
        sql: `
          SELECT 
            u.id, u.full_name AS name, u.username, u.avatar_url AS avatarUrl, u.role, u.bio,
            (SELECT COUNT(*) FROM follows f WHERE f.following_id = u.id) AS followersCount,
            EXISTS(SELECT 1 FROM follows f WHERE f.follower_id = ? AND f.following_id = u.id) AS isFollowing
          FROM users u
          WHERE u.id != ? AND u.is_verified = 1
          ORDER BY followersCount DESC, u.created_at DESC
          LIMIT 10;
        `,
        args: [currentUserId, currentUserId],
      });
    } else {
      result = await turso.execute(`
        SELECT 
          u.id, u.full_name AS name, u.username, u.avatar_url AS avatarUrl, u.role, u.bio,
          (SELECT COUNT(*) FROM follows f WHERE f.following_id = u.id) AS followersCount,
          0 AS isFollowing
        FROM users u
        WHERE u.is_verified = 1
        ORDER BY followersCount DESC, u.created_at DESC
        LIMIT 10;
      `);
    }

    const accounts = result.rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      handle: `@${String(row.username || 'custodian')}`,
      avatarUrl: String(row.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
      role: String(row.role || 'Heritage Member'),
      followersCount: formatCount(Number(row.followersCount || 0)) + ' followers',
      rawFollowersCount: Number(row.followersCount || 0),
      isFollowing: Boolean(row.isFollowing),
    }));

    res.json(accounts);
  } catch (err) {
    console.error('Fetch suggested error:', err);
    res.status(500).json({ error: 'Failed to load suggested custodians' });
  }
});

/**
 * POST /api/follows/:userId
 * Toggle follow/unfollow for target user
 */
router.post('/:userId', authenticateToken, async (req, res) => {
  const targetUserId = req.params.userId;
  const followerId = req.user.id;

  if (targetUserId === followerId) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  try {
    const existing = await turso.execute({
      sql: 'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?;',
      args: [followerId, targetUserId],
    });

    if (existing.rows.length > 0) {
      // Unfollow
      await turso.execute({
        sql: 'DELETE FROM follows WHERE follower_id = ? AND following_id = ?;',
        args: [followerId, targetUserId],
      });

      const countRes = await turso.execute({
        sql: 'SELECT COUNT(*) as count FROM follows WHERE following_id = ?;',
        args: [targetUserId],
      });

      return res.json({
        following: false,
        followersCount: Number(countRes.rows[0]?.count || 0),
      });
    } else {
      // Follow
      await turso.execute({
        sql: 'INSERT INTO follows (follower_id, following_id) VALUES (?, ?);',
        args: [followerId, targetUserId],
      });

      const countRes = await turso.execute({
        sql: 'SELECT COUNT(*) as count FROM follows WHERE following_id = ?;',
        args: [targetUserId],
      });

      // Send real notification to followed user
      await createNotification({
        recipientUserId: targetUserId,
        actorUserId: followerId,
        type: 'follow',
        title: 'New Follower',
        message: `${req.user.name || 'A custodian'} started following your heritage journey.`,
        data: { followerId },
      });

      return res.json({
        following: true,
        followersCount: Number(countRes.rows[0]?.count || 0),
      });
    }
  } catch (err) {
    console.error('Follow toggle error:', err);
    res.status(500).json({ error: 'Failed to update follow relationship' });
  }
});

/**
 * GET /api/follows/status/:userId
 * Check follow status between current user and target user
 */
router.get('/status/:userId', authenticateToken, async (req, res) => {
  const targetUserId = req.params.userId;
  const followerId = req.user.id;

  try {
    const result = await turso.execute({
      sql: 'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?;',
      args: [followerId, targetUserId],
    });
    res.json({ isFollowing: result.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

function formatCount(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace('.0', '') + 'K';
  }
  return num.toString();
}

function getUserIdFromToken(authHeader) {
  try {
    const token = authHeader.replace('Bearer ', '');
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      return payload.id || null;
    }
  } catch {
    return null;
  }
  return null;
}

export default router;
