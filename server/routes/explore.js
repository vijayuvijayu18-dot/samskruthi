import express from 'express';
import { turso } from '../db/turso.js';

const router = express.Router();

/**
 * GET /api/explore
 * Unified heritage discovery feed
 */
router.get('/', async (req, res) => {
  const category = req.query.category || 'all';

  try {
    // 1. Featured Heritage Places
    let placesQuery = `
      SELECT 
        id, name, slug, category, state, location, 
        image_url AS imageUrl, image_url,
        era, description, architectural_style AS architecturalStyle,
        visitor_info AS visitorInfo, cultural_significance AS culturalSignificance,
        interesting_facts AS interestingFacts, latitude, longitude
      FROM heritage_places
    `;
    const placesArgs = [];
    if (category !== 'all') {
      placesQuery += ' WHERE category = ?';
      placesArgs.push(category);
    }
    placesQuery += ' ORDER BY name ASC LIMIT 50;';

    const placesRes = await turso.execute({ sql: placesQuery, args: placesArgs });

    // 2. Verified Heritage Creators
    const creatorsRes = await turso.execute(`
      SELECT 
        u.id, u.full_name AS name, u.username, u.avatar_url AS avatarUrl, u.role, u.bio,
        (SELECT COUNT(*) FROM follows f WHERE f.following_id = u.id) AS followersCount
      FROM users u
      WHERE u.is_verified = 1
      ORDER BY followersCount DESC, u.created_at DESC
      LIMIT 6;
    `);

    // 3. Trending Posts
    const postsRes = await turso.execute(`
      SELECT 
        p.id, p.location, p.media_url AS mediaUrl, p.caption, p.hashtags,
        p.likes_count AS likesCount, p.comments_count AS commentsCount,
        u.full_name AS authorName, u.username AS authorUsername, u.avatar_url AS authorAvatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.likes_count DESC, p.created_at DESC
      LIMIT 6;
    `);

    // 4. Communities
    const communitiesRes = await turso.execute(`
      SELECT id, name, slug, description, category, avatar_url AS avatarUrl, member_count AS memberCount
      FROM communities
      ORDER BY member_count DESC
      LIMIT 4;
    `);

    res.json({
      places: placesRes.rows,
      creators: creatorsRes.rows.map((r) => ({
        ...r,
        handle: `@${r.username || 'custodian'}`,
      })),
      trendingPosts: postsRes.rows.map((r) => ({
        ...r,
        hashtags: r.hashtags ? String(r.hashtags).split(',') : [],
      })),
      communities: communitiesRes.rows,
      trendingTopics: [
        { id: 'tt-1', tag: '#HampiArchitecture', count: '14.2K shares' },
        { id: 'tt-2', tag: '#KonarkSolarChariot', count: '9.8K shares' },
        { id: 'tt-3', tag: '#CholaBronzeCraft', count: '7.4K shares' },
        { id: 'tt-4', tag: '#YakshaganaTraditions', count: '6.1K shares' },
        { id: 'tt-5', tag: '#KailashMonolith', count: '11.5K shares' },
      ],
    });
  } catch (err) {
    console.error('Explore discovery error:', err);
    res.status(500).json({ error: 'Failed to load explore discovery stream' });
  }
});

/**
 * GET /api/explore/search
 * Global multi-entity search
 */
router.get('/search', async (req, res) => {
  const q = req.query.q ? String(req.query.q).toLowerCase().trim() : '';

  if (!q) {
    return res.json({ users: [], places: [], posts: [], communities: [] });
  }

  const queryPattern = `%${q}%`;

  try {
    const [usersRes, placesRes, postsRes, commRes] = await Promise.all([
      turso.execute({
        sql: `
          SELECT id, full_name AS name, username, avatar_url AS avatar, role
          FROM users
          WHERE LOWER(full_name) LIKE ? OR LOWER(username) LIKE ?
          LIMIT 8;
        `,
        args: [queryPattern, queryPattern],
      }),
      turso.execute({
        sql: `
          SELECT 
            id, name, slug, location, state, 
            image_url AS imageUrl, image_url, category,
            era, description, architectural_style AS architecturalStyle,
            visitor_info AS visitorInfo, cultural_significance AS culturalSignificance,
            interesting_facts AS interestingFacts, latitude, longitude
          FROM heritage_places
          WHERE LOWER(name) LIKE ? OR LOWER(location) LIKE ? OR LOWER(state) LIKE ? OR LOWER(description) LIKE ? OR LOWER(architectural_style) LIKE ? OR LOWER(era) LIKE ? OR LOWER(category) LIKE ?
          LIMIT 16;
        `,
        args: [queryPattern, queryPattern, queryPattern, queryPattern, queryPattern, queryPattern, queryPattern],
      }),
      turso.execute({
        sql: `
          SELECT p.id, p.caption, p.location, p.media_url AS mediaUrl, u.full_name AS authorName
          FROM posts p
          JOIN users u ON p.user_id = u.id
          WHERE LOWER(p.caption) LIKE ? OR LOWER(p.location) LIKE ? OR LOWER(p.hashtags) LIKE ?
          LIMIT 8;
        `,
        args: [queryPattern, queryPattern, queryPattern],
      }),
      turso.execute({
        sql: `
          SELECT id, name, slug, category, avatar_url AS avatarUrl, member_count AS memberCount
          FROM communities
          WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?
          LIMIT 8;
        `,
        args: [queryPattern, queryPattern, queryPattern],
      }),
    ]);

    res.json({
      users: usersRes.rows,
      places: placesRes.rows,
      posts: postsRes.rows,
      communities: commRes.rows,
    });
  } catch (err) {
    console.error('Unified search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
