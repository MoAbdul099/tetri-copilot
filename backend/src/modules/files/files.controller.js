const svc = require('./files.service');
const { success, error } = require('../../utils/response');
const fs = require('fs');
const path = require('path');

async function upload(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(error('No files provided'));
    }
    const { workspaceId, userId } = req;
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

    return res.status(201).json(success(
      { uploaded: results, errors },
      `${results.length} file(s) uploaded successfully`
    ));
  } catch (err) {
    return res.status(err.statusCode || 500).json(error(err.message));
  }
}

async function list(req, res) {
  try {
    const { workspaceId } = req;
    const result = await svc.listFiles(workspaceId, req.query);
    return res.json(success(result));
  } catch (err) {
    return res.status(err.statusCode || 500).json(error(err.message));
  }
}

async function getOne(req, res) {
  try {
    const file = await svc.getFile(req.params.id, req.workspaceId);
    return res.json(success(file));
  } catch (err) {
    return res.status(err.statusCode || 500).json(error(err.message));
  }
}

async function download(req, res) {
  try {
    const { url, file } = await svc.getDownloadUrl(req.params.id, req.workspaceId, req.userId);

    if (url) {
      return res.redirect(url);
    }

    // Local storage — stream the file
    const localPath = svc.getLocalPath(file);
    if (!localPath || !fs.existsSync(localPath)) {
      return res.status(404).json(error('File not found on disk'));
    }

    const filename = encodeURIComponent(file.fileName || file.originalFilename || 'download');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    if (file.mimeType) res.setHeader('Content-Type', file.mimeType);
    return fs.createReadStream(localPath).pipe(res);
  } catch (err) {
    return res.status(err.statusCode || 500).json(error(err.message));
  }
}

async function serve(req, res) {
  try {
    const file = await svc.getFile(req.params.id, req.workspaceId);
    if (file.isDeleted) return res.status(410).json(error('File has been deleted'));

    const localPath = svc.getLocalPath(file);
    if (!localPath || !fs.existsSync(localPath)) {
      return res.status(404).json(error('File not found on disk'));
    }

    if (file.mimeType) res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.fileName || 'file')}"`);
    return fs.createReadStream(localPath).pipe(res);
  } catch (err) {
    return res.status(err.statusCode || 500).json(error(err.message));
  }
}

async function rename(req, res) {
  try {
    const updated = await svc.renameFile(req.params.id, req.workspaceId, req.userId, req.body.fileName);
    return res.json(success(updated, 'File renamed'));
  } catch (err) {
    return res.status(err.statusCode || 500).json(error(err.message));
  }
}

async function remove(req, res) {
  try {
    const deleted = await svc.deleteFile(req.params.id, req.workspaceId, req.userId);
    return res.json(success(deleted, 'File deleted'));
  } catch (err) {
    return res.status(err.statusCode || 500).json(error(err.message));
  }
}

async function restore(req, res) {
  try {
    const restored = await svc.restoreFile(req.params.id, req.workspaceId, req.userId);
    return res.json(success(restored, 'File restored'));
  } catch (err) {
    return res.status(err.statusCode || 500).json(error(err.message));
  }
}

async function link(req, res) {
  try {
    const { fileId, entityType, entityId } = req.body;
    if (!fileId || !entityType || !entityId) {
      return res.status(400).json(error('fileId, entityType, and entityId are required'));
    }
    const result = await svc.linkFile(req.workspaceId, req.userId, fileId, entityType, entityId);
    return res.status(201).json(success(result, 'File linked'));
  } catch (err) {
    return res.status(err.statusCode || 500).json(error(err.message));
  }
}

async function unlink(req, res) {
  try {
    const result = await svc.unlinkFile(req.params.linkId, req.workspaceId, req.userId);
    return res.json(success(result, 'File unlinked'));
  } catch (err) {
    return res.status(err.statusCode || 500).json(error(err.message));
  }
}

async function entityFiles(req, res) {
  try {
    const { entityType, entityId } = req.params;
    const links = await svc.getEntityFiles(req.workspaceId, entityType, entityId, req.userId);
    return res.json(success(links));
  } catch (err) {
    return res.status(err.statusCode || 500).json(error(err.message));
  }
}

module.exports = { upload, list, getOne, download, serve, rename, remove, restore, link, unlink, entityFiles };
