const svc = require('./email.service');
const { success } = require('../../utils/response');

const listTemplates   = async (req, res, next) => { try { const d = await svc.listTemplates(req.query); res.json(success(d)); } catch (e) { next(e); } };
const getTemplate     = async (req, res, next) => { try { const d = await svc.getTemplate(req.params.id); res.json(success(d)); } catch (e) { next(e); } };
const createTemplate  = async (req, res, next) => { try { const d = await svc.createTemplate(req.user.id, req.body); res.json(success(d, 'Template created', 201)); } catch (e) { next(e); } };
const updateTemplate  = async (req, res, next) => { try { const d = await svc.updateTemplate(req.params.id, req.user.id, req.body); res.json(success(d)); } catch (e) { next(e); } };
const publishTemplate = async (req, res, next) => { try { const d = await svc.publishTemplate(req.params.id, req.user.id); res.json(success(d, 'Template published')); } catch (e) { next(e); } };
const archiveTemplate = async (req, res, next) => { try { const d = await svc.archiveTemplate(req.params.id, req.user.id); res.json(success(d, 'Template archived')); } catch (e) { next(e); } };
const deleteTemplate  = async (req, res, next) => { try { await svc.deleteTemplate(req.params.id); res.json(success(null, 'Template deleted')); } catch (e) { next(e); } };
const getVersions     = async (req, res, next) => { try { const d = await svc.getVersions(req.params.id); res.json(success(d)); } catch (e) { next(e); } };
const previewTemplate = async (req, res, next) => { try { const d = await svc.previewTemplate(req.params.id, req.body.vars); res.json(success(d)); } catch (e) { next(e); } };
const sendTest        = async (req, res, next) => { try { const d = await svc.sendTestEmail(req.params.id, req.body.email, req.body.vars); res.json(success(d)); } catch (e) { next(e); } };
const getAnalytics    = async (req, res, next) => { try { const d = await svc.getAnalytics(req.workspaceId, req.query.days); res.json(success(d)); } catch (e) { next(e); } };
const listDeliveries  = async (req, res, next) => { try { const d = await svc.listDeliveries(req.workspaceId, req.query); res.json(success(d)); } catch (e) { next(e); } };

module.exports = {
  listTemplates, getTemplate, createTemplate, updateTemplate,
  publishTemplate, archiveTemplate, deleteTemplate, getVersions,
  previewTemplate, sendTest, getAnalytics, listDeliveries,
};
