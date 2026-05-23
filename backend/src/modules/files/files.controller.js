const fs = require('fs');
const svc = require('./files.service');
const { success, error } = require('../../utils/response');

async function upload(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      return error(res, 'No files provided', 400);
    }
    const { workspaceId } = req;
    const userId = req.user.id;
    const { description } = req.body;

    const results = [];
    const errors = [];

    for (const file of req.files) {
      try {
        const record = await svc.uploadFile(workspaceId, userId, file, description);
        results.push(record);
      } catch (err) {
        errors.push({ file: file.originalname, message: err.message });
      }
    }

    return success(res, { uploaded: results, errors }, `${results.length} file(s) uploaded successfully`, 201);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const result = await svc.listFiles(req.workspaceId, req.query);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const file = await svc.getFile(req.params.id, req.workspaceId);
    return success(res, file);
  } catch (err) {
    next(err);
  }
}

async function download(req, res, next) {
  try {
    const { url, file } = await svc.getDownloadUrl(req.params.id, req.workspaceId, req.user.id);
    if (url) return res.redirect(url);

    const localPath = svc.getLocalPath(file);
    if (!localPath || !fs.existsSync(localPath)) {
      return error(res, 'File not found on disk', 404);
    }
    const filename = encodeURIComponent(file.fileName || file.originalFilename || 'download');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    if (file.mimeType) res.setHeader('Content-Type', file.mimeType);
    return fs.createReadStream(localPath).pipe(res);
  } catch (err) {
    next(err);
  }
}

async function serve(req, res, next) {
  try {
    const file = await svc.getFile(req.params.id, req.workspaceId);
    if (file.isDeleted) return error(res, 'File has been deleted', 410);

    const signedUrl = await svc.getServeUrl(file);
    if (signedUrl) return res.redirect(signedUrl);

    const localPath = svc.getLocalPath(file);
    if (!localPath || !fs.existsSync(localPath)) {
      return error(res, 'File not found on disk', 404);
    }
    if (file.mimeType) res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.fileName || 'file')}"`);
    return fs.createReadStream(localPath).pipe(res);
  } catch (err) {
    next(err);
  }
}

async function rename(req, res, next) {
  try {
    const updated = await svc.renameFile(req.params.id, req.workspaceId, req.user.id, req.body.fileName);
    return success(res, updated, 'File renamed');
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await svc.deleteFile(req.params.id, req.workspaceId, req.user.id);
    return success(res, deleted, 'File deleted');
  } catch (err) {
    next(err);
  }
}

async function restore(req, res, next) {
  try {
    const restored = await svc.restoreFile(req.params.id, req.workspaceId, req.user.id);
    return success(res, restored, 'File restored');
  } catch (err) {
    next(err);
  }
}

async function link(req, res, next) {
  try {
    const { fileId, entityType, entityId } = req.body;
    if (!fileId || !entityType || !entityId) {
      return error(res, 'fileId, entityType, and entityId are required', 400);
    }
    const result = await svc.linkFile(req.workspaceId, req.user.id, fileId, entityType, entityId);
    return success(res, result, 'File linked', 201);
  } catch (err) {
    next(err);
  }
}

async function unlink(req, res, next) {
  try {
    const result = await svc.unlinkFile(req.params.linkId, req.workspaceId, req.user.id);
    return success(res, result, 'File unlinked');
  } catch (err) {
    next(err);
  }
}

async function entityFiles(req, res, next) {
  try {
    const { entityType, entityId } = req.params;
    const links = await svc.getEntityFiles(req.workspaceId, entityType, entityId, req.user.id);
    return success(res, links);
  } catch (err) {
    next(err);
  }
}

module.exports = { upload, list, getOne, download, serve, rename, remove, restore, link, unlink, entityFiles };
