const express = require('express');
const multer = require('multer');
const { protect } = require('../../middleware/requireAuth');
const requireWorkspace = require('../../middleware/requireWorkspace');
const ctrl = require('./files.controller');

const router = express.Router();
router.use(protect, requireWorkspace);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post('/upload',                              upload.array('files', 10), ctrl.upload);
router.get('/',                                     ctrl.list);
router.get('/entity/:entityType/:entityId',         ctrl.entityFiles);
router.get('/:id',                                  ctrl.getOne);
router.get('/:id/download',                         ctrl.download);
router.get('/:id/serve',                            ctrl.serve);
router.put('/:id',                                  ctrl.rename);
router.delete('/:id',                               ctrl.remove);
router.post('/:id/restore',                         ctrl.restore);
router.post('/link',                                ctrl.link);
router.delete('/link/:linkId',                      ctrl.unlink);

module.exports = router;
