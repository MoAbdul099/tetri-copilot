const express = require('express');
const settingsCache = require('../../lib/settingsCache');

const router = express.Router();

// Public — no auth required. Both workspace app and public website use this.
router.get('/', async (req, res, next) => {
  try {
    const flags = await settingsCache.getAllFlags();
    // Return only the fields the frontend needs
    const data = flags.map((f) => ({
      name:             f.name,
      enabled:          f.enabled,
      rolloutPercentage:f.rolloutPercentage,
      isBeta:           f.isBeta,
    }));
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
