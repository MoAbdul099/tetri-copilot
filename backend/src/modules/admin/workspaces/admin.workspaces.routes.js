const express = require('express');
const c = require('./admin.workspaces.controller');

const router = express.Router();

router.get('/',                    c.list);
router.get('/:id',                 c.getById);
router.patch('/:id/status',        c.changeStatus);
router.get('/:id/usage',           c.getUsage);
router.get('/:id/activity',        c.getActivity);
router.post('/:id/notes',          c.addNote);

module.exports = router;
