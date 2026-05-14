const { Router } = require('express');
const { protect } = require('../../middleware/requireAuth');
const authController = require('./auth.controller');

const router = Router();

router.get('/me', protect, authController.getMe);

module.exports = router;
