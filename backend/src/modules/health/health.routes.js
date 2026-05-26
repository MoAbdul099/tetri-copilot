const { Router } = require('express');
const ctrl = require('./health.controller');

const router = Router();

router.get('/',        ctrl.getHealth);
router.get('/db',      ctrl.getDbHealth);
router.get('/storage', ctrl.getStorageHealth);
router.get('/version', ctrl.getVersion);

module.exports = router;
