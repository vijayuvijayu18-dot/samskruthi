import express from 'express';
import bcrypt from 'bcryptjs';
import { turso } from '../db/turso.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendPasswordChangedEmail, sendAccountDeletedEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * 1, 2, 5, 7. GET /api/user/profile
 * Returns detailed user profile, connected accounts, and account metadata
 */
router.get('/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const userRes = await turso.execute({
      sql: `
        SELECT id, email, full_name, username, avatar_url, role, bio, google_id, 
               is_verified, email_verified_at, created_at, last_login_at
        FROM users 
        WHERE id = ?;
      `,
      args: [userId],
    });

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const u = userRes.rows[0];

    // Fetch linked providers
    const provRes = await turso.execute({
      sql: 'SELECT provider, created_at FROM auth_providers WHERE user_id = ?;',
      args: [userId],
    });

    const providers = provRes.rows.map((r) => String(r.provider));
    const hasPassword = !providers.includes('google') || providers.includes('local');

    // Count user contributions & relationships
    const [postsCountRes, followersRes, followingRes] = await Promise.all([
      turso.execute({
        sql: 'SELECT COUNT(*) as count FROM posts WHERE user_id = ?;',
        args: [userId],
      }),
      turso.execute({
        sql: 'SELECT COUNT(*) as count FROM follows WHERE following_id = ?;',
        args: [userId],
      }),
      turso.execute({
        sql: 'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?;',
        args: [userId],
      }),
    ]);

    const profileData = {
      id: String(u.id),
      name: String(u.full_name || ''),
      email: String(u.email || ''),
      username: String(u.username || ''),
      avatar: String(u.avatar_url || ''),
      role: String(u.role || 'Heritage Member'),
      bio: String(u.bio || 'Custodian of Indian Heritage and Culture'),
      isVerified: Boolean(u.is_verified),
      emailVerifiedAt: u.email_verified_at ? String(u.email_verified_at) : null,
      createdAt: String(u.created_at || ''),
      lastLoginAt: u.last_login_at ? String(u.last_login_at) : null,
      connectedAccounts: {
        google: !!u.google_id || providers.includes('google'),
        password: hasPassword,
      },
      stats: {
        postsCount: Number(postsCountRes.rows[0]?.count || 0),
        followersCount: Number(followersRes.rows[0]?.count || 0),
        followingCount: Number(followingRes.rows[0]?.count || 0),
      },
    };

    res.json({
      ...profileData,
      user: profileData,
    });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ error: 'Failed to retrieve profile data' });
  }
});

/**
 * 3. PUT /api/user/profile
 * Edit profile (full name, username, bio, avatar)
 */
router.put('/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { name, username, bio, avatar } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Full name cannot be empty' });
  }

  try {
    const cleanUsername = username ? username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '') : null;

    // Check username uniqueness if changed
    if (cleanUsername) {
      const checkUname = await turso.execute({
        sql: 'SELECT id FROM users WHERE username = ? AND id != ?;',
        args: [cleanUsername, userId],
      });
      if (checkUname.rows.length > 0) {
        return res.status(400).json({ error: 'Username is already taken by another custodian' });
      }
    }

    await turso.execute({
      sql: `
        UPDATE users 
        SET full_name = ?,
            username = COALESCE(?, username),
            bio = ?,
            avatar_url = COALESCE(?, avatar_url),
            updated_at = datetime('now')
        WHERE id = ?;
      `,
      args: [name.trim(), cleanUsername, bio || '', avatar || null, userId],
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: userId,
        name: name.trim(),
        username: cleanUsername,
        bio,
        avatar,
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * 4. PUT /api/user/change-password
 * Change password for password-based accounts
 */
router.put('/change-password', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  try {
    const userRes = await turso.execute({
      sql: 'SELECT id, email, full_name, password_hash FROM users WHERE id = ?;',
      args: [userId],
    });

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRes.rows[0];

    // If user has existing password, verify currentPassword
    if (user.password_hash) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required' });
      }
      const isMatch = await bcrypt.compare(currentPassword, String(user.password_hash));
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password does not match' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await turso.execute({
      sql: `UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?;`,
      args: [newHash, userId],
    });

    // Ensure 'local' provider is registered
    await turso.execute({
      sql: `INSERT OR IGNORE INTO auth_providers (id, user_id, provider, provider_user_id) VALUES (?, ?, 'local', ?);`,
      args: [`prov_${Date.now()}`, userId, user.email],
    }).catch(() => {});

    // Send password changed security notification
    sendPasswordChangedEmail({
      to: String(user.email),
      name: String(user.full_name || 'Custodian'),
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Password successfully changed. Confirmation alert dispatched to your email.',
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

/**
 * 6. GET /api/user/login-history
 * Retrieves login history audit trail
 */
router.get('/login-history', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const historyRes = await turso.execute({
      sql: `
        SELECT id, login_method, ip_address, user_agent, status, created_at
        FROM login_history
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 20;
      `,
      args: [userId],
    });

    const history = historyRes.rows.map((r) => ({
      id: String(r.id),
      method: String(r.login_method),
      ip: String(r.ip_address || '127.0.0.1'),
      device: String(r.user_agent || 'Browser'),
      status: String(r.status),
      timestamp: String(r.created_at),
    }));

    res.json(history);
  } catch (err) {
    console.error('Login history error:', err);
    res.status(500).json({ error: 'Failed to retrieve login history' });
  }
});

/**
 * 8. DELETE /api/user/account
 * Permanent account deletion with confirmation
 */
router.delete('/account', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { confirmationText, password } = req.body;

  if (confirmationText !== 'DELETE') {
    return res.status(400).json({ error: 'Please enter "DELETE" to confirm account termination' });
  }

  try {
    const userRes = await turso.execute({
      sql: 'SELECT email, full_name, password_hash FROM users WHERE id = ?;',
      args: [userId],
    });

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRes.rows[0];

    // If password-based account, verify password for security
    if (user.password_hash && password) {
      const isMatch = await bcrypt.compare(password, String(user.password_hash));
      if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect password. Account deletion aborted.' });
      }
    }

    // Cascaded deletion in Turso
    await turso.execute({ sql: 'DELETE FROM sessions WHERE user_id = ?;', args: [userId] });
    await turso.execute({ sql: 'DELETE FROM auth_providers WHERE user_id = ?;', args: [userId] });
    await turso.execute({ sql: 'DELETE FROM password_resets WHERE user_id = ?;', args: [userId] });
    await turso.execute({ sql: 'DELETE FROM email_verifications WHERE user_id = ?;', args: [userId] });
    await turso.execute({ sql: 'DELETE FROM notifications WHERE user_id = ?;', args: [userId] });
    await turso.execute({ sql: 'DELETE FROM likes WHERE user_id = ?;', args: [userId] });
    await turso.execute({ sql: 'DELETE FROM comments WHERE user_id = ?;', args: [userId] });
    await turso.execute({ sql: 'DELETE FROM posts WHERE user_id = ?;', args: [userId] });
    await turso.execute({ sql: 'DELETE FROM users WHERE id = ?;', args: [userId] });

    // Send confirmation email
    sendAccountDeletedEmail({
      to: String(user.email),
      name: String(user.full_name || 'Custodian'),
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Account and associated records have been permanently deleted.',
    });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

/**
 * 9. GET /api/user/export-data
 * GDPR compliant export of all user profile, post, comment, and activity data
 */
router.get('/export-data', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const userRes = await turso.execute({
      sql: 'SELECT id, email, full_name, username, avatar_url, role, bio, is_verified, created_at, last_login_at FROM users WHERE id = ?;',
      args: [userId],
    });

    const postsRes = await turso.execute({
      sql: 'SELECT id, location, media_url, caption, hashtags, likes_count, comments_count, created_at FROM posts WHERE user_id = ?;',
      args: [userId],
    });

    const commentsRes = await turso.execute({
      sql: 'SELECT id, post_id, text, created_at FROM comments WHERE user_id = ?;',
      args: [userId],
    });

    const historyRes = await turso.execute({
      sql: 'SELECT login_method, ip_address, user_agent, status, created_at FROM login_history WHERE user_id = ? LIMIT 50;',
      args: [userId],
    });

    const exportData = {
      archive: 'Samskruthi Digital Cultural Heritage Archive',
      exportedAt: new Date().toISOString(),
      profile: userRes.rows[0] || {},
      contributions: {
        posts: postsRes.rows,
        comments: commentsRes.rows,
      },
      securityAndAudit: {
        recentLogins: historyRes.rows,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=samskruthi_data_${userId}.json`);
    res.json(exportData);
  } catch (err) {
    console.error('Export data error:', err);
    res.status(500).json({ error: 'Failed to export user archive data' });
  }
});

/**
 * GET /api/user/public/:idOrUsername
 * Public profile of any registered custodian with their posts and follower count
 */
router.get('/public/:idOrUsername', async (req, res) => {
  const idOrUsername = req.params.idOrUsername;
  const currentUserId = req.headers.authorization ? getUserIdFromToken(req.headers.authorization) : null;

  try {
    const userRes = await turso.execute({
      sql: `
        SELECT id, full_name AS name, username, avatar_url AS avatar, role, bio, created_at AS createdAt, is_verified AS isVerified
        FROM users
        WHERE id = ? OR username = ?;
      `,
      args: [idOrUsername, idOrUsername.toLowerCase()],
    });

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Custodian profile not found' });
    }

    const u = userRes.rows[0];
    const targetUserId = String(u.id);

    const [followersRes, followingRes, postsRes, isFollowingRes] = await Promise.all([
      turso.execute({
        sql: 'SELECT COUNT(*) as count FROM follows WHERE following_id = ?;',
        args: [targetUserId],
      }),
      turso.execute({
        sql: 'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?;',
        args: [targetUserId],
      }),
      turso.execute({
        sql: `
          SELECT id, location, media_url AS mediaUrl, caption, hashtags, likes_count AS likesCount, comments_count AS commentsCount, created_at AS createdAt
          FROM posts
          WHERE user_id = ?
          ORDER BY created_at DESC;
        `,
        args: [targetUserId],
      }),
      currentUserId
        ? turso.execute({
            sql: 'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?;',
            args: [currentUserId, targetUserId],
          })
        : Promise.resolve({ rows: [] }),
    ]);

    res.json({
      id: targetUserId,
      name: String(u.name || ''),
      username: String(u.username || ''),
      avatar: String(u.avatar || ''),
      coverImage: 'https://images.unsplash.com/photo-1600100397608-f010f4439c1e?auto=format&fit=crop&w=1400&q=80',
      role: String(u.role || 'Heritage Member'),
      bio: String(u.bio || 'Custodian of Indian Heritage and Culture'),
      isVerified: Boolean(u.isVerified),
      createdAt: String(u.createdAt || ''),
      stats: {
        postsCount: postsRes.rows.length,
        followersCount: Number(followersRes.rows[0]?.count || 0),
        followingCount: Number(followingRes.rows[0]?.count || 0),
      },
      isFollowing: isFollowingRes.rows.length > 0,
      posts: postsRes.rows.map((p) => ({
        id: String(p.id),
        location: String(p.location),
        mediaUrl: String(p.mediaUrl),
        caption: String(p.caption),
        hashtags: p.hashtags ? String(p.hashtags).split(',') : [],
        likesCount: Number(p.likesCount || 0),
        commentsCount: Number(p.commentsCount || 0),
        createdAt: String(p.createdAt),
      })),
    });
  } catch (err) {
    console.error('Fetch public profile error:', err);
    res.status(500).json({ error: 'Failed to retrieve custodian profile' });
  }
});

/**
 * GET /api/user/posts
 * Fetch current authenticated user's posts
 */
router.get('/posts', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const postsRes = await turso.execute({
      sql: `
        SELECT id, location, media_url AS mediaUrl, caption, hashtags, likes_count AS likesCount, comments_count AS commentsCount, created_at AS createdAt
        FROM posts
        WHERE user_id = ?
        ORDER BY created_at DESC;
      `,
      args: [userId],
    });
    res.json(postsRes.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load user posts' });
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
