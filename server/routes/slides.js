import express from 'express';
import { turso } from '../db/turso.js';

const router = express.Router();

/**
 * GET /api/slides
 * Reads the 20 authentic heritage monuments from Turso
 */
router.get('/', async (req, res) => {
  try {
    const result = await turso.execute(`
      SELECT 
        id,
        display_order AS displayOrder,
        title,
        category,
        location,
        era,
        description,
        image_url AS imageUrl,
        thumb_url AS thumbUrl,
        credit
      FROM slideshow_monuments
      ORDER BY display_order ASC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Fetch slides error:', err);
    res.status(500).json({ error: 'Failed to retrieve slides from Turso' });
  }
});

export default router;
