import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { turso } from './db/turso.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import postRoutes from './routes/posts.js';
import storyRoutes from './routes/stories.js';
import slideRoutes from './routes/slides.js';
import reelRoutes from './routes/reels.js';
import communityRoutes from './routes/communities.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import followRoutes from './routes/follows.js';
import bookmarkRoutes from './routes/bookmarks.js';
import placeRoutes from './routes/places.js';
import exploreRoutes from './routes/explore.js';
import uploadRoutes from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve local media uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve static images statically from public/images
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// API Health Check & Turso connectivity status
app.get('/api/health', async (req, res) => {
  try {
    const test = await turso.execute("SELECT 1 as alive, datetime('now') as now;");
    res.json({
      status: 'healthy',
      database: 'Turso Cloud Database (libSQL)',
      region: 'AWS Mumbai (ap-south-1)',
      timestamp: test.rows[0].now,
    });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      database: 'Turso Disconnected',
      error: err.message,
    });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/slides', slideRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/upload', uploadRoutes);

app.listen(PORT, () => {
  console.log(`🏛️  SAMSKRUTHI Backend Server running on port ${PORT}`);
  console.log(`⚡ Connected to Turso Cloud Database: libsql://samskruthi-uvijay.aws-ap-south-1.turso.io`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
});
