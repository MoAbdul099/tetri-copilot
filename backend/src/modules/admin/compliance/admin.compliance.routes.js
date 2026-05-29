const express = require('express');
const c = require('./admin.compliance.controller');

const router = express.Router();

router.get('/stats',           c.getStats);
router.get('/jurisdictions',   c.listJurisdictions);
router.get('/categories',      c.listCategories);

router.get('/',                c.list);
router.post('/',               c.create);
router.get('/:id',             c.getById);
router.put('/:id',             c.update);
router.post('/:id/publish',    c.publish);
router.post('/:id/archive',    c.archive);
router.post('/:id/clone',      c.clone);
router.get('/:id/workspaces',  c.getWorkspaceImpact);

router.post('/:id/obligations',            c.createObligation);
router.put('/:id/obligations/:oid',        c.updateObligation);
router.delete('/:id/obligations/:oid',     c.deleteObligation);

module.exports = router;
