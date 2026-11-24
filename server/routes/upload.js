import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.query.category || req.body.category || 'posts';
    const validCategories = ['posts', 'reels', 'stories', 'avatars', 'communities'];
    const targetFolder = validCategories.includes(category) ? category : 'posts';
    const uploadPath = path.join(__dirname, '..', 'uploads', targetFolder);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const cleanExt = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}${cleanExt}`;
    cb(null, uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF, MP4, WebM`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 60 * 1024 * 1024, // 60MB max
  },
});

// POST /api/upload
router.post('/', authenticateToken, upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No media file was uploaded' });
  }

  const category = req.query.category || req.body.category || 'posts';
  const validCategory = ['posts', 'reels', 'stories', 'avatars', 'communities'].includes(category)
    ? category
    : 'posts';
  const relativeUrl = `/uploads/${validCategory}/${req.file.filename}`;
  const fullUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;

  res.json({
    success: true,
    url: fullUrl,
    relativeUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
    category: validCategory,
  });
});

export default router;
