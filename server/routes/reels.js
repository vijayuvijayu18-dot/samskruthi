import express from 'express';
import { turso } from '../db/turso.js';
import { authenticateToken } from '../middleware/auth.js';
import { createNotification } from '../services/notificationService.js';

const router = express.Router();

/**
 * GET /api/reels
 * Retrieves reels stream with creator profiles and like status
 */
router.get('/', async (req, res) => {
  const currentUserId = req.headers.authorization ? getUserIdFromToken(req.headers.authorization) : null;

  try {
    const result = await turso.execute(`
      SELECT 
        r.id,
        r.user_id AS userId,
        r.caption,
        r.video_url AS videoUrl,
        r.thumb_url AS thumbUrl,
        r.location,
        r.audio_title AS audioTitle,
        r.views_count AS viewsCount,
        r.likes_count AS likesCount,
        r.comments_count AS commentsCount,
        r.shares_count AS sharesCount,
        r.created_at AS createdAt,
        u.full_name AS creatorName,
        u.username AS creatorUsername,
        u.avatar_url AS creatorAvatar,
        u.is_verified AS isVerified
      FROM reels r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC;
    `);

    let likedReelIds = new Set();
    if (currentUserId) {
      const likesRes = await turso.execute({
        sql: 'SELECT reel_id FROM reel_likes WHERE user_id = ?;',
        args: [currentUserId],
      });
      likedReelIds = new Set(likesRes.rows.map((r) => String(r.reel_id)));
    }

    const reels = result.rows.map((row) => ({
      id: String(row.id),
      userId: String(row.userId),
      caption: String(row.caption),
      videoUrl: String(row.videoUrl),
      thumbUrl: String(row.thumbUrl || ''),
      location: String(row.location || 'India'),
      audioTitle: String(row.audioTitle || 'Traditional Ragas'),
      viewsCount: Number(row.viewsCount || 0),
      likesCount: Number(row.likesCount || 0),
      commentsCount: Number(row.commentsCount || 0),
      sharesCount: Number(row.sharesCount || 0),
      createdAt: String(row.createdAt),
      creatorName: String(row.creatorName || 'Heritage Creator'),
      creatorUsername: String(row.creatorUsername || 'creator'),
      creatorAvatar: String(row.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
      isVerified: Boolean(row.isVerified),
      isLiked: likedReelIds.has(String(row.id)),
    }));

    res.json(reels);
  } catch (err) {
    console.error('Fetch reels error:', err);
    res.status(500).json({ error: 'Failed to retrieve reels from database' });
  }
});

/**
 * POST /api/reels
 * Publish a new reel video
 */
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { caption, videoUrl, thumbUrl, location, audioTitle } = req.body;

  if (!caption || !videoUrl) {
    return res.status(400).json({ error: 'Caption and videoUrl are required' });
  }

  const reelId = `reel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    await turso.execute({
      sql: `
        INSERT INTO reels (id, user_id, caption, video_url, thumb_url, location, audio_title, views_count, likes_count, comments_count, shares_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0);
      `,
      args: [
        reelId,
        userId,
        caption.trim(),
        videoUrl.trim(),
        thumbUrl ? thumbUrl.trim() : null,
        location ? location.trim() : 'India',
        audioTitle ? audioTitle.trim() : 'Traditional Ragas',
      ],
    });

    res.status(201).json({
      success: true,
      id: reelId,
      message: 'Cultural Reel published successfully',
    });
  } catch (err) {
    console.error('Create reel error:', err);
    res.status(500).json({ error: 'Failed to publish reel' });
  }
});

/**
 * POST /api/reels/:id/view
 * Increment reel view count
 */
router.post('/:id/view', async (req, res) => {
  const reelId = req.params.id;
  try {
    await turso.execute({
      sql: 'UPDATE reels SET views_count = views_count + 1 WHERE id = ?;',
      args: [reelId],
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to increment views' });
  }
});

/**
 * POST /api/reels/:id/like
 * Toggle like for a reel
 */
router.post('/:id/like', authenticateToken, async (req, res) => {
  const reelId = req.params.id;
  const userId = req.user.id;

  try {
    const existing = await turso.execute({
      sql: 'SELECT reel_id FROM reel_likes WHERE reel_id = ? AND user_id = ?;',
      args: [reelId, userId],
    });

    if (existing.rows.length > 0) {
      await turso.execute({
        sql: 'DELETE FROM reel_likes WHERE reel_id = ? AND user_id = ?;',
        args: [reelId, userId],
      });
      await turso.execute({
        sql: 'UPDATE reels SET likes_count = MAX(0, likes_count - 1) WHERE id = ?;',
        args: [reelId],
      });
      return res.json({ liked: false });
    } else {
      await turso.execute({
        sql: 'INSERT INTO reel_likes (reel_id, user_id) VALUES (?, ?);',
        args: [reelId, userId],
      });
      await turso.execute({
        sql: 'UPDATE reels SET likes_count = likes_count + 1 WHERE id = ?;',
        args: [reelId],
      });

      // Notify reel creator
      const reelOwner = await turso.execute({
        sql: 'SELECT user_id FROM reels WHERE id = ?;',
        args: [reelId],
      });
      if (reelOwner.rows.length > 0) {
        await createNotification({
          recipientUserId: String(reelOwner.rows[0].user_id),
          actorUserId: userId,
          type: 'like_reel',
          title: 'Reel Liked',
          message: `${req.user.name || 'Someone'} appreciated your cultural reel.`,
          data: { reelId },
        });
      }

      return res.json({ liked: true });
    }
  } catch (err) {
    console.error('Like reel error:', err);
    res.status(500).json({ error: 'Failed to update reel like' });
  }
});

/**
 * POST /api/reels/:id/comments
 * Add comment to reel
 */
router.post('/:id/comments', authenticateToken, async (req, res) => {
  const reelId = req.params.id;
  const userId = req.user.id;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Comment text cannot be empty' });
  }

  const commentId = `rc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    await turso.execute({
      sql: 'INSERT INTO reel_comments (id, reel_id, user_id, text) VALUES (?, ?, ?, ?);',
      args: [commentId, reelId, userId, text.trim()],
    });
    await turso.execute({
      sql: 'UPDATE reels SET comments_count = comments_count + 1 WHERE id = ?;',
      args: [reelId],
    });

    // Notify reel owner
    const reelOwner = await turso.execute({
      sql: 'SELECT user_id FROM reels WHERE id = ?;',
      args: [reelId],
    });
    if (reelOwner.rows.length > 0) {
      await createNotification({
        recipientUserId: String(reelOwner.rows[0].user_id),
        actorUserId: userId,
        type: 'comment_reel',
        title: 'New Reel Comment',
        message: `${req.user.name || 'A custodian'} commented on your cultural reel.`,
        data: { reelId, commentId },
      });
    }

    res.status(201).json({
      success: true,
      comment: {
        id: commentId,
        text: text.trim(),
        authorName: req.user.name,
        authorAvatar: req.user.avatar,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Comment reel error:', err);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

/**
 * GET /api/reels/:id/comments
 * Fetch comments for a reel
 */
router.get('/:id/comments', async (req, res) => {
  const reelId = req.params.id;
  try {
    const result = await turso.execute({
      sql: `
        SELECT c.id, c.text, c.created_at AS createdAt,
               u.full_name AS authorName, u.username AS authorUsername, u.avatar_url AS authorAvatar
        FROM reel_comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.reel_id = ?
        ORDER BY c.created_at DESC;
      `,
      args: [reelId],
    });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reel comments' });
  }
});

// Helper for optional auth extraction
function getUserIdFromToken(authHeader) {
  try {
    const token = authHeader.replace('Bearer ', '');
    const jwt = import('jsonwebtoken');
    // Basic decode
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
