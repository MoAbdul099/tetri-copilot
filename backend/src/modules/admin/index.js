/**
 * Platform Administration Module Boundary — Slice 10.5
 *
 * Future home of all /api/admin/* endpoints (Slice 19).
 * Only platform administrators may access routes under this namespace.
 *
 * Security: admin guard middleware must be applied to all routes here.
 * Non-platform users must never access /api/admin/*.
 */

const express = require('express');

const router = express.Router();

// Placeholder — admin guard will be enforced here once Slice 19 is implemented
router.use((req, res, next) => {
  res.status(501).json({
    success: false,
    error: 'Platform administration panel not yet implemented.',
    details: [],
  });
});

module.exports = router;
