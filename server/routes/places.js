import express from 'express';
import { turso } from '../db/turso.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function mapRowToPlace(row) {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    category: String(row.category),
    continent: String(row.continent || 'Asia'),
    country: String(row.country || 'India'),
    state: String(row.state || ''),
    city: String(row.city || ''),
    location: String(row.location),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    era: String(row.era),
    description: String(row.description),
    imageUrl: String(row.image_url),
    architecturalStyle: String(row.architectural_style || 'Heritage Architecture'),
    visitorInfo: String(row.visitor_info || 'Open to cultural visitors'),
    culturalSignificance: String(row.cultural_significance || ''),
    interestingFacts: String(row.interesting_facts || ''),
    unescoStatus: String(row.unesco_status || 'Cultural Heritage Landmark'),
    heritageType: String(row.heritage_type || 'tangible'),
    sourceUrl: String(row.source_url || ''),
    isVerified: Boolean(row.is_verified ?? true),
  };
}

/**
 * GET /api/places
 * Fetch heritage map locations from Turso with continent, country, category, search filters
 */
router.get('/', async (req, res) => {
  const { category, continent, country, state, q } = req.query;

  try {
    let sql = 'SELECT * FROM heritage_places WHERE 1=1';
    const args = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      args.push(category);
    }

    if (continent && continent !== 'all') {
      sql += ' AND continent = ?';
      args.push(continent);
    }

    if (country && country !== 'all') {
      sql += ' AND country = ?';
      args.push(country);
    }

    if (state && state !== 'all') {
      sql += ' AND state = ?';
      args.push(state);
    }

    if (q) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(location) LIKE ? OR LOWER(country) LIKE ? OR LOWER(city) LIKE ? OR LOWER(description) LIKE ?)';
      const queryStr = `%${String(q).toLowerCase()}%`;
      args.push(queryStr, queryStr, queryStr, queryStr, queryStr);
    }

    sql += ' ORDER BY country ASC, name ASC;';

    const result = await turso.execute({ sql, args });
    const places = result.rows.map(mapRowToPlace);

    res.json(places);
  } catch (err) {
    console.error('Fetch places error:', err);
    res.status(500).json({ error: 'Failed to load heritage map places' });
  }
});

/**
 * GET /api/places/nearby
 * Geodetic nearby heritage discovery using Haversine distance
 */
router.get('/nearby', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = parseFloat(req.query.radius || '100'); // default 100km
  const category = req.query.category;

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Valid latitude and longitude are required' });
  }

  try {
    let sql = 'SELECT * FROM heritage_places WHERE 1=1';
    const args = [];
    if (category && category !== 'all') {
      sql += ' AND category = ?';
      args.push(category);
    }

    const result = await turso.execute({ sql, args });
    const places = result.rows.map(mapRowToPlace);

    // Compute distance and filter by radius
    const placesWithDistance = places.map((place) => {
      const distance = calculateHaversineDistance(lat, lng, place.latitude, place.longitude);
      return {
        ...place,
        distanceKm: distance,
      };
    });

    // If radius is <= 0 or 'all', do not limit by radius; otherwise filter
    const filtered = radius > 0 
      ? placesWithDistance.filter((p) => p.distanceKm <= radius)
      : placesWithDistance;

    // Sort by nearest first
    filtered.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      origin: { lat, lng },
      radiusKm: radius,
      totalFound: filtered.length,
      places: filtered,
    });
  } catch (err) {
    console.error('Nearby places error:', err);
    res.status(500).json({ error: 'Failed to calculate nearby heritage places' });
  }
});

/**
 * GET /api/places/:slug
 * Fetch place by slug or ID
 */
router.get('/:slug', async (req, res) => {
  const slug = req.params.slug;
  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM heritage_places WHERE slug = ? OR id = ?;',
      args: [slug, slug],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Heritage place not found' });
    }

    res.json(mapRowToPlace(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load heritage place details' });
  }
});

export default router;
