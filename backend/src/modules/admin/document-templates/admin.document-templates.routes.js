const express = require('express');
const c = require('./admin.document-templates.controller');

const router = express.Router();

router.get('/stats',           c.getStats);
router.get('/countries',       c.listCountryProfiles);
router.get('/',                c.list);
router.post('/',               c.create);
router.get('/:id',             c.getOne);
router.put('/:id',             c.update);
router.post('/:id/publish',    c.publish);
router.post('/:id/archive',    c.archive);
router.post('/:id/clone',      c.clone);
router.delete('/:id',          c.remove);

module.exports = router;
