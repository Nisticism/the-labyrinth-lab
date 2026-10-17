// The gallery data now lives server-side in data/gallery-config.json and is
// managed via the admin portal. This module exposes a fetch helper for the
// Gallery component. The original hardcoded data was migrated by
// scripts/migrate-gallery.js into data/gallery-config.json.

const API_BASE = (process.env.REACT_APP_API_BASE || '').replace(/\/$/, '');

export async function fetchGalleryData() {
  const res = await fetch(`${API_BASE}/api/gallery`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to load gallery (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// Legacy default export kept so any stale imports don't crash. Always empty;
// real data comes from fetchGalleryData().
const galleryData = [];
export default galleryData;
