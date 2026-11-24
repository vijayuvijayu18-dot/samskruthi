import express from 'express';
import { turso } from '../db/turso.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/bookmarks/:postId
 * Toggle bookmarking a post
 */
router.post('/:postId', authenticateToken, async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;

  try {
    const existing = await turso.execute({
      sql: 'SELECT id FROM bookmarks WHERE user_id = ? AND post_id = ?;',
      args: [userId, postId],
    });

    if (existing.rows.length > 0) {
      await turso.execute({
        sql: 'DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?;',
        args: [userId, postId],
      });
      return res.json({ saved: false });
    } else {
      const bookmarkId = `bm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await turso.execute({
        sql: 'INSERT INTO bookmarks (id, user_id, post_id) VALUES (?, ?, ?);',
        args: [bookmarkId, userId, postId],
      });
      return res.json({ saved: true });
    }
  } catch (err) {
    console.error('Bookmark toggle error:', err);
    res.status(500).json({ error: 'Failed to update saved collection' });
  }
});

/**
 * GET /api/bookmarks
 * Fetch all saved posts for the current user
 */
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await turso.execute({
      sql: `
        SELECT 
          p.id, p.location, p.media_url AS mediaUrl, p.caption, p.hashtags,
          p.likes_count AS likesCount, p.comments_count AS commentsCount,
          p.shares_count AS sharesCount, p.created_at AS createdAt,
          u.full_name AS authorName, u.username AS authorUsername, u.avatar_url AS authorAvatar,
          u.is_verified AS isVerified,
          b.created_at AS savedAt
        FROM bookmarks b
        JOIN posts p ON b.post_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC;
      `,
      args: [userId],
    });

    const posts = result.rows.map((row) => ({
      id: String(row.id),
      location: String(row.location),
      mediaUrl: String(row.mediaUrl),
      caption: String(row.caption),
      hashtags: row.hashtags ? String(row.hashtags).split(',') : [],
      likesCount: Number(row.likesCount || 0),
      commentsCount: Number(row.commentsCount || 0),
      sharesCount: Number(row.sharesCount || 0),
      createdAt: String(row.createdAt),
      authorName: String(row.authorName || 'IndianHeritage'),
      authorUsername: String(row.authorUsername || 'indianheritage'),
      authorAvatar: String(row.authorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'),
      isVerified: Boolean(row.isVerified),
      isSaved: true,
      comments: [],
    }));

    res.json(posts);
  } catch (err) {
    console.error('Fetch saved posts error:', err);
    res.status(500).json({ error: 'Failed to load saved posts' });
  }
});

export default router;
