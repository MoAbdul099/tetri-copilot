const express = require('express');
const c = require('./admin.countries.controller');

const router = express.Router();

router.get('/',                          c.list);
router.post('/',                         c.create);
router.get('/:id',                       c.getById);
router.put('/:id',                       c.update);
router.patch('/:id/status',              c.updateStatus);
router.post('/:id/clone',                c.cloneCountry);
router.get('/:id/workspaces',            c.getWorkspaces);
router.post('/:id/holidays',             c.addHoliday);
router.patch('/:id/holidays/:holidayId', c.updateHoliday);
router.delete('/:id/holidays/:holidayId', c.deleteHoliday);

module.exports = router;
