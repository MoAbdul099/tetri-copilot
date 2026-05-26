const { Router } = require('express');
const ctrl = require('./system.controller');

const router = Router();

router.get('/version',    ctrl.getVersion);
router.get('/build-info', ctrl.getBuildInfo);

module.exports = router;
