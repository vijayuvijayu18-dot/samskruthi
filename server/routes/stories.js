import express from 'express';
import { turso } from '../db/turso.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/stories
 * Reads active 24-hour stories and featured cultural heritage stories from Turso
 */
router.get('/', async (req, res) => {
  try {
    const result = await turso.execute(`
      SELECT 
        s.id, s.title, s.category, s.avatar_url AS avatarUrl, s.media_url AS mediaUrl,
        s.user_id AS userId, s.created_at AS createdAt, s.expires_at AS expiresAt,
        (SELECT COUNT(*) FROM story_views sv WHERE sv.story_id = s.id) AS viewCount
      FROM stories s
      WHERE s.expires_at IS NULL OR s.expires_at > CURRENT_TIMESTAMP
      ORDER BY s.display_order ASC, s.created_at DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Fetch stories error:', err);
    res.status(500).json({ error: 'Failed to retrieve stories' });
  }
});

/**
 * POST /api/stories
 * Upload / Publish a 24-hour Story
 */
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { title, category, mediaUrl, avatarUrl } = req.body;

  if (!mediaUrl) {
    return res.status(400).json({ error: 'Story media URL is required' });
  }

  const storyId = `st_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  // 24-hour expiration
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  try {
    await turso.execute({
      sql: `
        INSERT INTO stories (id, user_id, title, category, avatar_url, media_url, display_order, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?);
      `,
      args: [
        storyId,
        userId,
        title ? title.trim() : req.user.name,
        category || 'story',
        avatarUrl || req.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        mediaUrl.trim(),
        expiresAt,
      ],
    });

    res.status(201).json({
      success: true,
      id: storyId,
      title: title || req.user.name,
      mediaUrl,
      expiresAt,
      message: 'Story live for 24 hours',
    });
  } catch (err) {
    console.error('Create story error:', err);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

/**
 * POST /api/stories/:id/view
 * Track story view
 */
router.post('/:id/view', authenticateToken, async (req, res) => {
  const storyId = req.params.id;
  const viewerId = req.user.id;

  try {
    const viewId = `sv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await turso.execute({
      sql: 'INSERT OR IGNORE INTO story_views (id, story_id, viewer_id) VALUES (?, ?, ?);',
      args: [viewId, storyId, viewerId],
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record story view' });
  }
});

/**
 * DELETE /api/stories/:id
 * Delete own story
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  const storyId = req.params.id;
  const userId = req.user.id;

  try {
    const story = await turso.execute({
      sql: 'SELECT user_id FROM stories WHERE id = ?;',
      args: [storyId],
    });

    if (story.rows.length === 0) {
      return res.status(404).json({ error: 'Story not found' });
    }

    if (story.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this story' });
    }

    await turso.execute({
      sql: 'DELETE FROM stories WHERE id = ?;',
      args: [storyId],
    });

    res.json({ success: true, message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

export default router;
