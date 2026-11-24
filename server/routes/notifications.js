import express from 'express';
import { turso } from '../db/turso.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Fetch user's notification history
 */
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await turso.execute({
      sql: `
        SELECT id, type, title, message, data, is_read AS isRead, created_at AS createdAt
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50;
      `,
      args: [userId],
    });

    const notifications = result.rows.map((row) => ({
      id: String(row.id),
      type: String(row.type),
      title: String(row.title),
      message: String(row.message),
      data: row.data ? JSON.parse(String(row.data)) : {},
      isRead: Boolean(row.isRead),
      createdAt: String(row.createdAt),
    }));

    res.json(notifications);
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

/**
 * GET /api/notifications/unread-count
 * Return number of unread notifications
 */
router.get('/unread-count', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await turso.execute({
      sql: 'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0;',
      args: [userId],
    });
    res.json({ unreadCount: Number(result.rows[0]?.count || 0) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to count unread notifications' });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', authenticateToken, async (req, res) => {
  const notifId = req.params.id;
  const userId = req.user.id;

  try {
    await turso.execute({
      sql: 'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?;',
      args: [notifId, userId],
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all user notifications as read
 */
router.put('/read-all', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    await turso.execute({
      sql: 'UPDATE notifications SET is_read = 1 WHERE user_id = ?;',
      args: [userId],
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  const notifId = req.params.id;
  const userId = req.user.id;

  try {
    await turso.execute({
      sql: 'DELETE FROM notifications WHERE id = ? AND user_id = ?;',
      args: [notifId, userId],
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
