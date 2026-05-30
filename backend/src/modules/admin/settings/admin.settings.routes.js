const express = require('express');
const c = require('./admin.settings.controller');

const router = express.Router();

router.get('/',              c.getAll);
router.put('/',              c.updateSettings);
router.get('/security',      c.getSecurity);
router.get('/feature-flags', c.listFlags);
router.put('/feature-flags', c.updateFlag);
router.post('/maintenance',  c.setMaintenance);
router.get('/history',       c.getHistory);

module.exports = router;
