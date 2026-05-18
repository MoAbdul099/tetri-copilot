const { Router } = require('express');
const controller = require('./plans.controller');

const router = Router();

// Plans are public — no auth required for listing
router.get('/', controller.list);
router.get('/:slug', controller.getBySlug);

module.exports = router;
