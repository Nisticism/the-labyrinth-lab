require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const galleryRouter = require('./routes/gallery');
const adminRouter = require('./routes/admin');
const contactRouter = require('./routes/contact');

const PORT = parseInt(process.env.PORT, 10) || 4000;
const ROOT = path.join(__dirname, '..');

const app = express();

// In production, the React app and API are same-origin so CSP is fine to enable.
// We disable a couple of helmet defaults that conflict with serving images.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-site' },
}));

// CORS: allow dev frontend (CRA on :3000) to call the API on :4000.
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: corsOrigins, credentials: false }));

app.use(express.json({ limit: '1mb' }));

// Static: public/ (raw images and other public assets).
app.use(express.static(path.join(ROOT, 'public'), {
  maxAge: '7d',
  setHeaders: (res, file) => {
    if (file.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  },
}));

// API routes
app.use('/api/gallery', galleryRouter);
app.use('/api/admin', adminRouter);
app.use('/api/contact', contactRouter);

// Static: built React app (only present after `npm run build`).
const buildDir = path.join(ROOT, 'build');
app.use(express.static(buildDir, {
  maxAge: '1h',
  setHeaders: (res, file) => {
    if (file.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  },
}));

// SPA fallback: any non-API GET serves index.html so React Router can handle it.
app.get(/^\/(?!api\/).*/, (req, res, next) => {
  const indexFile = path.join(buildDir, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) next();
  });
});

app.use((err, _req, res, _next) => {
  console.error('[server] unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  if (!process.env.JWT_SECRET) console.warn('[server] WARNING: JWT_SECRET is not set');
  if (!process.env.ADMIN_PASSWORD_HASH) console.warn('[server] WARNING: ADMIN_PASSWORD_HASH is not set; admin login will fail');
});
