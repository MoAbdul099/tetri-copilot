const express = require('express');
const c = require('./admin.logs.controller');

const router = express.Router();

router.get('/dashboard',  c.getDashboard);
router.get('/activity',   c.listActivity);
router.get('/audit',      c.listAudit);
router.get('/security',   c.listSecurity);
router.get('/ai',         c.listAi);
router.get('/compliance', c.listCompliance);
router.get('/admin',      c.listAdminActions);
router.get('/export',     c.exportCsv);

module.exports = router;
