import express from 'express';
import { turso } from '../db/turso.js';
import { authenticateToken } from '../middleware/auth.js';
import { createNotification } from '../services/notificationService.js';

const router = express.Router();

/**
 * GET /api/messages/users
 * Search registered custodians to start a conversation with
 */
router.get('/users', authenticateToken, async (req, res) => {
  const currentUserId = req.user.id;
  const q = req.query.q ? String(req.query.q).toLowerCase().trim() : '';

  try {
    let result;
    if (q) {
      result = await turso.execute({
        sql: `
          SELECT id, full_name AS name, username, avatar_url AS avatar, role, bio
          FROM users
          WHERE id != ? AND (LOWER(full_name) LIKE ? OR LOWER(username) LIKE ?)
          LIMIT 20;
        `,
        args: [currentUserId, `%${q}%`, `%${q}%`],
      });
    } else {
      result = await turso.execute({
        sql: `
          SELECT id, full_name AS name, username, avatar_url AS avatar, role, bio
          FROM users
          WHERE id != ?
          LIMIT 20;
        `,
        args: [currentUserId],
      });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Search message users error:', err);
    res.status(500).json({ error: 'Failed to search custodians' });
  }
});

/**
 * GET /api/messages/conversations
 * Get all conversations for the authenticated user
 */
router.get('/conversations', authenticateToken, async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const result = await turso.execute({
      sql: `
        SELECT 
          c.id, c.user1_id AS user1Id, c.user2_id AS user2Id,
          c.last_message AS lastMessage, c.last_message_at AS lastMessageAt,
          CASE WHEN c.user1_id = ? THEN u2.id ELSE u1.id END AS partnerId,
          CASE WHEN c.user1_id = ? THEN u2.full_name ELSE u1.full_name END AS partnerName,
          CASE WHEN c.user1_id = ? THEN u2.username ELSE u1.username END AS partnerUsername,
          CASE WHEN c.user1_id = ? THEN u2.avatar_url ELSE u1.avatar_url END AS partnerAvatar,
          (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.recipient_id = ? AND m.is_read = 0) AS unreadCount
        FROM conversations c
        JOIN users u1 ON c.user1_id = u1.id
        JOIN users u2 ON c.user2_id = u2.id
        WHERE c.user1_id = ? OR c.user2_id = ?
        ORDER BY c.last_message_at DESC;
      `,
      args: [
        currentUserId,
        currentUserId,
        currentUserId,
        currentUserId,
        currentUserId,
        currentUserId,
        currentUserId,
      ],
    });

    res.json(result.rows);
  } catch (err) {
    console.error('Fetch conversations error:', err);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

/**
 * GET /api/messages/conversations/:id
 * Retrieve message history for a conversation and mark as read
 */
router.get('/conversations/:id', authenticateToken, async (req, res) => {
  const conversationId = req.params.id;
  const currentUserId = req.user.id;

  try {
    // Verify membership
    const convCheck = await turso.execute({
      sql: 'SELECT id, user1_id, user2_id FROM conversations WHERE id = ?;',
      args: [conversationId],
    });

    if (convCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conv = convCheck.rows[0];
    if (conv.user1_id !== currentUserId && conv.user2_id !== currentUserId) {
      return res.status(403).json({ error: 'Unauthorized to view this conversation' });
    }

    // Mark unread messages directed to this user as read
    await turso.execute({
      sql: 'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND recipient_id = ?;',
      args: [conversationId, currentUserId],
    });

    const messages = await turso.execute({
      sql: `
        SELECT 
          m.id, m.sender_id AS senderId, m.recipient_id AS recipientId,
          m.text, m.media_url AS mediaUrl, m.is_read AS isRead, m.created_at AS createdAt,
          u.full_name AS senderName, u.avatar_url AS senderAvatar
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ?
        ORDER BY m.created_at ASC;
      `,
      args: [conversationId],
    });

    res.json(messages.rows);
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ error: 'Failed to load message history' });
  }
});

/**
 * POST /api/messages
 * Send a message to another custodian (starts conversation if none exists)
 */
router.post('/', authenticateToken, async (req, res) => {
  const senderId = req.user.id;
  const { recipientId, text, mediaUrl } = req.body;

  if (!recipientId || (!text && !mediaUrl)) {
    return res.status(400).json({ error: 'Recipient and message text or media are required' });
  }

  if (senderId === recipientId) {
    return res.status(400).json({ error: 'Cannot send messages to yourself' });
  }

  try {
    // Find or create conversation with sorted user IDs for consistency
    const [u1, u2] = [senderId, recipientId].sort();

    let conv = await turso.execute({
      sql: 'SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?;',
      args: [u1, u2],
    });

    let conversationId;
    if (conv.rows.length === 0) {
      conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await turso.execute({
        sql: `
          INSERT INTO conversations (id, user1_id, user2_id, last_message, last_message_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP);
        `,
        args: [conversationId, u1, u2, text ? text.substring(0, 100) : 'Sent media attachment'],
      });
    } else {
      conversationId = String(conv.rows[0].id);
      await turso.execute({
        sql: 'UPDATE conversations SET last_message = ?, last_message_at = CURRENT_TIMESTAMP WHERE id = ?;',
        args: [text ? text.substring(0, 100) : 'Sent media attachment', conversationId],
      });
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await turso.execute({
      sql: `
        INSERT INTO messages (id, conversation_id, sender_id, recipient_id, text, media_url, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP);
      `,
      args: [messageId, conversationId, senderId, recipientId, text ? text.trim() : '', mediaUrl || null],
    });

    // Send real notification to recipient
    await createNotification({
      recipientUserId: recipientId,
      actorUserId: senderId,
      type: 'message',
      title: 'New Message',
      message: `${req.user.name || 'A custodian'} sent you a message: "${text ? text.substring(0, 40) : 'attachment'}"`,
      data: { conversationId, messageId },
    });

    res.status(201).json({
      success: true,
      messageId,
      conversationId,
      text: text ? text.trim() : '',
      mediaUrl: mediaUrl || null,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to deliver message' });
  }
});

export default router;
