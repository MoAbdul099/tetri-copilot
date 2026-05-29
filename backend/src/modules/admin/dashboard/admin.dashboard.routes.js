const express = require('express');
const c = require('./admin.dashboard.controller');

const router = express.Router();

router.get('/',               c.overview);
router.get('/organizations',  c.organizations);
router.get('/users',          c.users);
router.get('/subscriptions',  c.subscriptions);
router.get('/ai',             c.ai);
router.get('/compliance',     c.compliance);
router.get('/storage',        c.storage);
router.get('/activity',       c.activity);
router.get('/export',         c.exportCsv);

module.exports = router;
