const express = require('express');
const c = require('./admin.subscriptions.controller');

const router = express.Router();

// Static routes must come before /:id
router.get('/plans',     c.getPlans);
router.get('/renewals',  c.getRenewals);
router.get('/revenue',   c.getRevenue);

router.get('/',              c.list);
router.get('/:id',           c.getById);
router.patch('/:id/status',  c.changeStatus);

module.exports = router;
