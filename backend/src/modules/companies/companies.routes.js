const { Router } = require('express');
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const requireOwner = require('../../middleware/requireOwner');
const companiesController = require('./companies.controller');

const router = Router();

router.use(protect, requireWorkspace);

router.get('/', companiesController.getCompany);
router.patch('/', requireOwner, companiesController.updateCompany);

module.exports = router;
