const express = require('express');
const c = require('./admin.currencies.controller');

const router = express.Router();

router.get('/',               c.list);
router.post('/',              c.create);
router.get('/:id',            c.getById);
router.put('/:id',            c.update);
router.patch('/:id/status',   c.updateStatus);

module.exports = router;
