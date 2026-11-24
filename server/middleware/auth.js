import jwt from 'jsonwebtoken';
import { turso } from '../db/turso.js';

const JWT_SECRET = process.env.JWT_SECRET || 'samskruthi_super_secret_jwt_turso_2026';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload: missing user identifier.' });
    }

    // Verify session in Turso sessions table if sessionId is present
    if (decoded.sessionId) {
      const sessionResult = await turso.execute({
        sql: `
          SELECT id, is_active, expires_at 
          FROM sessions 
          WHERE id = ? AND user_id = ?;
        `,
        args: [decoded.sessionId, userId],
      });

      if (sessionResult.rows.length === 0 || !sessionResult.rows[0].is_active) {
        return res.status(401).json({ error: 'Session has been invalidated or expired. Please sign in again.' });
      }

      const expiresAt = new Date(sessionResult.rows[0].expires_at);
      if (expiresAt < new Date()) {
        return res.status(401).json({ error: 'Session has expired. Please sign in again.' });
      }
    }

    req.user = { ...decoded, id: userId, userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}
