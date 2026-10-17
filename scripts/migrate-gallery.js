// One-time migration: convert src/helpers/galleryData.js into data/gallery-config.json.
// Safe to re-run only if data/gallery-config.json does NOT exist (refuses to overwrite).

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src', 'helpers', 'galleryData.js');
const OUT_DIR = path.join(__dirname, '..', 'data');
const OUT = path.join(OUT_DIR, 'gallery-config.json');

if (fs.existsSync(OUT)) {
  console.error('[ERR] data/gallery-config.json already exists. Refusing to overwrite.');
  console.error('      Delete it manually if you really want to re-seed from source.');
  process.exit(1);
}

if (!fs.existsSync(SRC)) {
  console.error('[ERR] Could not find', SRC);
  process.exit(1);
}

const src = fs.readFileSync(SRC, 'utf8');

// Strip ESM export and substitute PUBLIC_URL with empty string so paths
// become absolute server-relative ('/images/...').
const transformed = src
  .replace(/process\.env\.PUBLIC_URL/g, '""')
  .replace(/export\s+default\s+galleryData\s*;?/g, '');

let galleryData;
try {
  galleryData = new Function(transformed + '\nreturn galleryData;')();
} catch (err) {
  console.error('[ERR] Failed to evaluate galleryData.js:', err.message);
  process.exit(1);
}

if (!Array.isArray(galleryData)) {
  console.error('[ERR] galleryData did not produce an array.');
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(galleryData, null, 2));

const totalImages = galleryData.reduce((n, c) => n + (c.images?.length || 0), 0);
console.log('[OK] Wrote', OUT);
console.log('     Categories:', galleryData.length, '| Total images:', totalImages);
