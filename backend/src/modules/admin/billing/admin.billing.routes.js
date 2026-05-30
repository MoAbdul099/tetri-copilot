const express = require('express');
const c = require('./admin.billing.controller');

const router = express.Router();

router.get('/dashboard',      c.getDashboard);
router.get('/events',         c.listEvents);
router.get('/events/:id',     c.getEvent);
router.get('/subscriptions',  c.listSubscriptions);

module.exports = router;
