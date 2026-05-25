/**
 * Public API Module Boundary — Slice 10.5
 *
 * Future home of all /api/public/* endpoints.
 * No authentication required for routes in this namespace.
 *
 * Examples:
 *   GET /api/public/plans        — public pricing plans
 *   GET /api/public/features     — feature catalog
 *   POST /api/public/contact     — contact form submission
 *
 * Currently, the plans route (/api/v1/plans) serves this purpose.
 * Routes will migrate to /api/public/* in Slice 20.
 */

const express = require('express');

const router = express.Router();

// Placeholder — public routes will be registered here in Slice 20
router.get('/status', (req, res) => {
  res.json({ success: true, data: { status: 'ok' }, message: 'Public API ready' });
});

module.exports = router;
