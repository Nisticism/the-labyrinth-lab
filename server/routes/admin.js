const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const fssync = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const store = require('../lib/gallery-store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const PUBLIC_IMAGES_DIR = path.join(__dirname, '..', '..', 'public', 'images');

// ---------- Login (rate-limited, no auth required) ----------

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
});

router.post('/login', loginLimiter, async (req, res) => {
  const { password } = req.body || {};
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password required' });
  }
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    return res.status(500).json({ error: 'Server is not configured (no admin password)' });
  }
  const ok = await bcrypt.compare(password, hash);
  if (!ok) return res.status(401).json({ error: 'Invalid password' });

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

router.get('/verify', requireAuth, (_req, res) => res.json({ ok: true }));

// ---------- Gallery mutations (auth required) ----------

// Replace the entire gallery config. Used for reorder + delete via UI.
// Performs basic shape validation, then preserves any image files that were
// removed (caller is expected to call DELETE /image to delete files explicitly).
router.put('/gallery', requireAuth, async (req, res) => {
  const incoming = req.body;
  if (!Array.isArray(incoming)) {
    return res.status(400).json({ error: 'Body must be an array of categories' });
  }
  for (const cat of incoming) {
    if (!cat || typeof cat.id !== 'string' || typeof cat.title !== 'string' || !Array.isArray(cat.images)) {
      return res.status(400).json({ error: 'Each category needs id, title, and images[]' });
    }
    for (const img of cat.images) {
      if (typeof img !== 'string' || !img.startsWith('/images/')) {
        return res.status(400).json({ error: 'Each image path must start with /images/' });
      }
    }
  }

  try {
    await store.withLock(() => store.write(incoming));
    res.json({ ok: true });
  } catch (err) {
    console.error('[admin] write failed:', err.message);
    res.status(500).json({ error: 'Failed to write gallery config' });
  }
});

// Delete a single image: removes the file from disk AND drops it from every
// category in the config. Body: { path: '/images/foo/bar.jpg' }
router.delete('/image', requireAuth, async (req, res) => {
  const { path: imgPath } = req.body || {};
  if (typeof imgPath !== 'string' || !imgPath.startsWith('/images/')) {
    return res.status(400).json({ error: 'path must start with /images/' });
  }

  // Resolve to disk path and verify it stays inside public/images.
  const rel = imgPath.replace(/^\/images\//, '');
  const fullPath = path.join(PUBLIC_IMAGES_DIR, rel);
  if (!fullPath.startsWith(PUBLIC_IMAGES_DIR + path.sep) && fullPath !== PUBLIC_IMAGES_DIR) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  try {
    await store.withLock(async () => {
      const data = await store.read();
      for (const cat of data) {
        cat.images = cat.images.filter((p) => p !== imgPath);
      }
      await store.write(data);
    });

    if (fssync.existsSync(fullPath)) {
      await fs.unlink(fullPath).catch((err) => {
        console.warn('[admin] could not delete file', fullPath, err.message);
      });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('[admin] delete failed:', err.message);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// ---------- Upload ----------

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const EXT_FOR_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function sanitizeCategoryId(id) {
  return /^[a-z0-9-]+$/i.test(id) ? id : null;
}

function safeFilename(original, mime) {
  const ext = EXT_FOR_MIME[mime] || path.extname(original || '').toLowerCase() || '.jpg';
  const base = (original || 'upload')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'upload';
  const stamp = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  return `${base}-${stamp}${ext}`;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, _file, cb) => {
      const catId = sanitizeCategoryId(req.params.categoryId);
      if (!catId) return cb(new Error('Invalid category id'));
      const dir = path.join(PUBLIC_IMAGES_DIR, catId);
      try {
        await fs.mkdir(dir, { recursive: true });
        cb(null, dir);
      } catch (err) { cb(err); }
    },
    filename: (_req, file, cb) => cb(null, safeFilename(file.originalname, file.mimetype)),
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB per file
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error('Unsupported file type'));
    }
    cb(null, true);
  },
});

router.post(
  '/upload/:categoryId',
  requireAuth,
  (req, res, next) => {
    upload.array('images', 30)(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  async (req, res) => {
    const catId = sanitizeCategoryId(req.params.categoryId);
    if (!catId) return res.status(400).json({ error: 'Invalid category id' });

    const files = req.files || [];
    if (files.length === 0) return res.status(400).json({ error: 'No files received' });

    const newPaths = files.map((f) => `/images/${catId}/${f.filename}`);

    try {
      await store.withLock(async () => {
        const data = await store.read();
        let cat = data.find((c) => c.id === catId);
        if (!cat) {
          cat = { id: catId, title: catId, images: [] };
          data.push(cat);
        }
        cat.images.push(...newPaths);
        await store.write(data);
      });
      res.json({ ok: true, added: newPaths });
    } catch (err) {
      console.error('[admin] upload commit failed:', err.message);
      res.status(500).json({ error: 'Failed to update gallery config after upload' });
    }
  }
);

module.exports = router;
