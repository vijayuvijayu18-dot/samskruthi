import express from 'express';
import { turso } from '../db/turso.js';
import { authenticateToken } from '../middleware/auth.js';
import { createNotification } from '../services/notificationService.js';

const router = express.Router();

/**
 * GET /api/communities
 * List all cultural communities
 */
router.get('/', async (req, res) => {
  const currentUserId = req.headers.authorization ? getUserIdFromToken(req.headers.authorization) : null;

  try {
    const result = await turso.execute(`
      SELECT 
        c.id, c.name, c.slug, c.description, c.category, c.avatar_url AS avatarUrl,
        c.banner_url AS bannerUrl, c.creator_id AS creatorId, c.member_count AS memberCount,
        c.rules, c.created_at AS createdAt,
        u.full_name AS creatorName, u.username AS creatorUsername
      FROM communities c
      LEFT JOIN users u ON c.creator_id = u.id
      ORDER BY c.member_count DESC, c.created_at DESC;
    `);

    let joinedCommunityIds = new Set();
    if (currentUserId) {
      const joinedRes = await turso.execute({
        sql: 'SELECT community_id FROM community_members WHERE user_id = ?;',
        args: [currentUserId],
      });
      joinedCommunityIds = new Set(joinedRes.rows.map((r) => String(r.community_id)));
    }

    const communities = result.rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      slug: String(row.slug),
      description: String(row.description),
      category: String(row.category),
      avatarUrl: String(row.avatarUrl || 'https://images.unsplash.com/photo-1600100397608-f010f4439c1e?auto=format&fit=crop&w=300&q=80'),
      bannerUrl: String(row.bannerUrl || 'https://images.unsplash.com/photo-1600100397608-f010f4439c1e?auto=format&fit=crop&w=1200&q=80'),
      creatorId: String(row.creatorId),
      creatorName: String(row.creatorName || 'Heritage Guild'),
      memberCount: Number(row.memberCount || 1),
      rules: String(row.rules || ''),
      createdAt: String(row.createdAt),
      isMember: joinedCommunityIds.has(String(row.id)),
    }));

    res.json(communities);
  } catch (err) {
    console.error('Fetch communities error:', err);
    res.status(500).json({ error: 'Failed to load communities' });
  }
});

/**
 * POST /api/communities
 * Create a new heritage community
 */
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { name, description, category, avatarUrl, bannerUrl, rules } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: 'Community name and description are required' });
  }

  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const communityId = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    // Check slug uniqueness
    const existing = await turso.execute({
      sql: 'SELECT id FROM communities WHERE slug = ?;',
      args: [slug],
    });
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'A community with a similar name already exists' });
    }

    await turso.execute({
      sql: `
        INSERT INTO communities (id, name, slug, description, category, avatar_url, banner_url, creator_id, member_count, rules)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?);
      `,
      args: [
        communityId,
        name.trim(),
        slug,
        description.trim(),
        category || 'Heritage Guild',
        avatarUrl || 'https://images.unsplash.com/photo-1600100397608-f010f4439c1e?auto=format&fit=crop&w=300&q=80',
        bannerUrl || 'https://images.unsplash.com/photo-1600100397608-f010f4439c1e?auto=format&fit=crop&w=1200&q=80',
        userId,
        rules || 'Uphold Indian cultural integrity and authentic historical research.',
      ],
    });

    // Add creator as admin member
    await turso.execute({
      sql: `INSERT INTO community_members (community_id, user_id, role) VALUES (?, ?, 'admin');`,
      args: [communityId, userId],
    });

    res.status(201).json({
      success: true,
      id: communityId,
      name,
      slug,
      message: 'Community founded successfully',
    });
  } catch (err) {
    console.error('Create community error:', err);
    res.status(500).json({ error: 'Failed to create community' });
  }
});

/**
 * POST /api/communities/:id/join
 * Join or leave a community
 */
router.post('/:id/join', authenticateToken, async (req, res) => {
  const communityId = req.params.id;
  const userId = req.user.id;

  try {
    const existing = await turso.execute({
      sql: 'SELECT community_id FROM community_members WHERE community_id = ? AND user_id = ?;',
      args: [communityId, userId],
    });

    if (existing.rows.length > 0) {
      // Leave community
      await turso.execute({
        sql: 'DELETE FROM community_members WHERE community_id = ? AND user_id = ?;',
        args: [communityId, userId],
      });
      await turso.execute({
        sql: 'UPDATE communities SET member_count = MAX(1, member_count - 1) WHERE id = ?;',
        args: [communityId],
      });
      return res.json({ joined: false });
    } else {
      // Join community
      await turso.execute({
        sql: `INSERT INTO community_members (community_id, user_id, role) VALUES (?, ?, 'member');`,
        args: [communityId, userId],
      });
      await turso.execute({
        sql: 'UPDATE communities SET member_count = member_count + 1 WHERE id = ?;',
        args: [communityId],
      });

      // Notify community creator
      const comm = await turso.execute({
        sql: 'SELECT creator_id, name FROM communities WHERE id = ?;',
        args: [communityId],
      });
      if (comm.rows.length > 0) {
        await createNotification({
          recipientUserId: String(comm.rows[0].creator_id),
          actorUserId: userId,
          type: 'join_community',
          title: 'New Community Member',
          message: `${req.user.name || 'A custodian'} joined ${comm.rows[0].name}.`,
          data: { communityId },
        });
      }

      return res.json({ joined: true });
    }
  } catch (err) {
    console.error('Join community error:', err);
    res.status(500).json({ error: 'Failed to update community membership' });
  }
});

/**
 * GET /api/communities/:id/members
 * List members of a community
 */
router.get('/:id/members', async (req, res) => {
  const communityId = req.params.id;
  try {
    const result = await turso.execute({
      sql: `
        SELECT cm.role, cm.joined_at AS joinedAt,
               u.id AS userId, u.full_name AS name, u.username, u.avatar_url AS avatar, u.role AS userRole
        FROM community_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.community_id = ?
        ORDER BY cm.role = 'admin' DESC, cm.joined_at ASC;
      `,
      args: [communityId],
    });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch community members' });
  }
});

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
