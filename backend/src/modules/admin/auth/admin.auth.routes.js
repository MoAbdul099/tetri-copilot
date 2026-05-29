const express = require('express');
const controller = require('./admin.auth.controller');
const requireAdmin = require('../../../middleware/requireAdmin');

const router = express.Router();

router.post('/login',  controller.login);
router.get('/me',      requireAdmin, controller.me);
router.post('/logout', requireAdmin, controller.logout);

module.exports = router;
