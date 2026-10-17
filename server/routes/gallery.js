const express = require('express');
const store = require('../lib/gallery-store');

const router = express.Router();

// Public read-only endpoint used by the gallery page.
router.get('/', async (_req, res) => {
  try {
    const data = await store.read();
    res.json(data);
  } catch (err) {
    console.error('[gallery] read failed:', err.message);
    res.status(500).json({ error: 'Failed to read gallery config' });
  }
});

module.exports = router;
