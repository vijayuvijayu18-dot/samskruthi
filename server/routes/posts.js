import express from 'express';
import { turso } from '../db/turso.js';
import { authenticateToken } from '../middleware/auth.js';
import { createNotification } from '../services/notificationService.js';

const router = express.Router();

/**
 * GET /api/posts
 * Read: Retrieves feed posts with author profiles, real comments, and user-specific like/saved state
 */
router.get('/', async (req, res) => {
  const currentUserId = req.headers.authorization ? getUserIdFromToken(req.headers.authorization) : null;

  try {
    const result = await turso.execute(`
      SELECT 
        p.id,
        p.user_id AS userId,
        p.location,
        p.media_url AS mediaUrl,
        p.caption,
        p.hashtags,
        p.likes_count AS likesCount,
        p.comments_count AS commentsCount,
        p.shares_count AS sharesCount,
        p.created_at AS createdAt,
        u.full_name AS authorName,
        COALESCE(u.username, 'indianheritage') AS authorUsername,
        u.avatar_url AS authorAvatar,
        u.is_verified AS isVerified
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC;
    `);

    // Fetch user-specific likes and bookmarks if logged in
    let likedPostIds = new Set();
    let savedPostIds = new Set();

    if (currentUserId) {
      const [likesRes, bookmarksRes] = await Promise.all([
        turso.execute({
          sql: 'SELECT post_id FROM likes WHERE user_id = ?;',
          args: [currentUserId],
        }),
        turso.execute({
          sql: 'SELECT post_id FROM bookmarks WHERE user_id = ?;',
          args: [currentUserId],
        }),
      ]);
      likedPostIds = new Set(likesRes.rows.map((r) => String(r.post_id)));
      savedPostIds = new Set(bookmarksRes.rows.map((r) => String(r.post_id)));
    }

    // Fetch comments for all posts
    const commentsRes = await turso.execute(`
      SELECT 
        c.id, c.post_id AS postId, c.text, c.created_at AS createdAt,
        u.full_name AS author, u.avatar_url AS avatarUrl
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC;
    `);

    const commentsByPost = {};
    for (const c of commentsRes.rows) {
      const pid = String(c.postId);
      if (!commentsByPost[pid]) commentsByPost[pid] = [];
      commentsByPost[pid].push({
        id: String(c.id),
        author: String(c.author || 'Custodian'),
        avatarUrl: String(c.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'),
        text: String(c.text),
        timeAgo: 'Recently',
      });
    }

    const posts = result.rows.map((row) => {
      const pid = String(row.id);
      return {
        id: pid,
        userId: String(row.userId),
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
        isLiked: likedPostIds.has(pid),
        isSaved: savedPostIds.has(pid),
        comments: commentsByPost[pid] || [],
      };
    });

    res.json(posts);
  } catch (err) {
    console.error('Fetch posts error:', err);
    res.status(500).json({ error: 'Failed to retrieve posts from Turso' });
  }
});

/**
 * POST /api/posts
 * Create: Publishes a new heritage post connected to authenticated user
 */
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { location, mediaUrl, caption, hashtags } = req.body;

  if (!location || !mediaUrl || !caption) {
    return res.status(400).json({ error: 'Missing required post parameters' });
  }

  try {
    const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const formattedHashtags = Array.isArray(hashtags) ? hashtags.join(',') : hashtags || '';

    await turso.execute({
      sql: `
        INSERT INTO posts (id, user_id, location, media_url, caption, hashtags, likes_count, comments_count, shares_count)
        VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0);
      `,
      args: [postId, userId, location.trim(), mediaUrl.trim(), caption.trim(), formattedHashtags],
    });

    res.status(201).json({
      success: true,
      id: postId,
      userId,
      location,
      mediaUrl,
      caption,
      hashtags: Array.isArray(hashtags) ? hashtags : formattedHashtags.split(','),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      authorName: req.user.name,
      authorAvatar: req.user.avatar,
      authorUsername: req.user.username || 'custodian',
      isVerified: Boolean(req.user.is_verified),
      isLiked: false,
      isSaved: false,
      comments: [],
    });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Failed to publish post to Turso' });
  }
});

/**
 * DELETE /api/posts/:id
 * Delete post (owner check)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    const post = await turso.execute({
      sql: 'SELECT user_id FROM posts WHERE id = ?;',
      args: [postId],
    });

    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    await turso.execute({
      sql: 'DELETE FROM posts WHERE id = ?;',
      args: [postId],
    });

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

/**
 * POST /api/posts/:id/like
 * Update: Toggles like status, updates counter, and generates real notification
 */
router.post('/:id/like', authenticateToken, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    const existing = await turso.execute({
      sql: 'SELECT id FROM likes WHERE post_id = ? AND user_id = ?;',
      args: [postId, userId],
    });

    if (existing.rows.length > 0) {
      // Remove Like
      await turso.execute({
        sql: 'DELETE FROM likes WHERE post_id = ? AND user_id = ?;',
        args: [postId, userId],
      });
      await turso.execute({
        sql: 'UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?;',
        args: [postId],
      });
      return res.json({ liked: false });
    } else {
      // Add Like
      const likeId = `like_${Date.now()}`;
      await turso.execute({
        sql: 'INSERT INTO likes (id, post_id, user_id) VALUES (?, ?, ?);',
        args: [likeId, postId, userId],
      });
      await turso.execute({
        sql: 'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?;',
        args: [postId],
      });

      // Send real notification to post author
      const postOwner = await turso.execute({
        sql: 'SELECT user_id FROM posts WHERE id = ?;',
        args: [postId],
      });
      if (postOwner.rows.length > 0) {
        await createNotification({
          recipientUserId: String(postOwner.rows[0].user_id),
          actorUserId: userId,
          type: 'like_post',
          title: 'Post Liked',
          message: `${req.user.name || 'A custodian'} liked your cultural post.`,
          data: { postId },
        });
      }

      return res.json({ liked: true });
    }
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ error: 'Failed to update like status' });
  }
});

/**
 * POST /api/posts/:id/comments
 * Create: Adds a comment to a post and generates notification
 */
router.post('/:id/comments', authenticateToken, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Missing comment text' });
  }

  try {
    const commentId = `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await turso.execute({
      sql: 'INSERT INTO comments (id, post_id, user_id, text) VALUES (?, ?, ?, ?);',
      args: [commentId, postId, userId, text.trim()],
    });
    await turso.execute({
      sql: 'UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?;',
      args: [postId],
    });

    // Send real notification to post owner
    const postOwner = await turso.execute({
      sql: 'SELECT user_id FROM posts WHERE id = ?;',
      args: [postId],
    });
    if (postOwner.rows.length > 0) {
      await createNotification({
        recipientUserId: String(postOwner.rows[0].user_id),
        actorUserId: userId,
        type: 'comment_post',
        title: 'New Comment',
        message: `${req.user.name || 'A custodian'} commented on your post: "${text.substring(0, 40)}"`,
        data: { postId, commentId },
      });
    }

    res.status(201).json({
      success: true,
      comment: {
        id: commentId,
        author: req.user.name,
        avatarUrl: req.user.avatar,
        text: text.trim(),
        timeAgo: 'Just now',
      },
    });
  } catch (err) {
    console.error('Comment error:', err);
    res.status(500).json({ error: 'Failed to add comment' });
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
