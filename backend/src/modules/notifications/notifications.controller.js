const svc = require('./notifications.service');
const { success } = require('../../utils/response');

const getPreference           = async (req, res, next) => { try { const d = await svc.getPreference(req.workspaceId, req.user.id); success(res, d); } catch (e) { next(e); } };
const updatePreference        = async (req, res, next) => { try { const d = await svc.updatePreference(req.workspaceId, req.user.id, req.body); success(res, d); } catch (e) { next(e); } };

const listNotifications       = async (req, res, next) => { try { const d = await svc.listNotifications(req.workspaceId, req.user.id, req.query); success(res, d); } catch (e) { next(e); } };
const getUnreadCount          = async (req, res, next) => { try { const count = await svc.getUnreadCount(req.workspaceId, req.user.id); success(res, { count }); } catch (e) { next(e); } };
const markRead                = async (req, res, next) => { try { const d = await svc.markRead(req.workspaceId, req.user.id, req.params.id); success(res, d); } catch (e) { next(e); } };
const markAllRead             = async (req, res, next) => { try { await svc.markAllRead(req.workspaceId, req.user.id); success(res, null, 'All marked as read'); } catch (e) { next(e); } };
const archiveItem             = async (req, res, next) => { try { const d = await svc.archiveNotification(req.workspaceId, req.user.id, req.params.id); success(res, d); } catch (e) { next(e); } };
const snoozeItem              = async (req, res, next) => { try { const d = await svc.snoozeNotification(req.workspaceId, req.user.id, req.params.id, req.body.until); success(res, d); } catch (e) { next(e); } };
const deleteItem              = async (req, res, next) => { try { await svc.deleteNotification(req.workspaceId, req.user.id, req.params.id); success(res, null, 'Deleted'); } catch (e) { next(e); } };

const getWorkspaceSettings    = async (req, res, next) => { try { const d = await svc.getWorkspaceSettings(req.workspaceId); success(res, d); } catch (e) { next(e); } };
const updateWorkspaceSettings = async (req, res, next) => { try { const d = await svc.updateWorkspaceSettings(req.workspaceId, req.body); success(res, d); } catch (e) { next(e); } };
const listCategories          = async (req, res, next) => { try { const d = await svc.listCategories(); success(res, d); } catch (e) { next(e); } };

const listProfiles    = async (req, res, next) => { try { const d = await svc.listProfiles(req.workspaceId); success(res, d); } catch (e) { next(e); } };
const createProfile   = async (req, res, next) => { try { const d = await svc.createProfile(req.workspaceId, req.body); success(res, d, 'Profile created', 201); } catch (e) { next(e); } };
const updateProfile   = async (req, res, next) => { try { const d = await svc.updateProfile(req.workspaceId, req.params.id, req.body); success(res, d); } catch (e) { next(e); } };
const deleteProfile   = async (req, res, next) => { try { await svc.deleteProfile(req.workspaceId, req.params.id); success(res, null, 'Profile deleted'); } catch (e) { next(e); } };
const addRule         = async (req, res, next) => { try { const d = await svc.addRule(req.workspaceId, req.params.id, req.body); success(res, d, 'Rule added', 201); } catch (e) { next(e); } };
const updateRule      = async (req, res, next) => { try { const d = await svc.updateRule(req.workspaceId, req.params.id, req.body); success(res, d); } catch (e) { next(e); } };
const deleteRule      = async (req, res, next) => { try { await svc.deleteRule(req.workspaceId, req.params.id); success(res, null, 'Rule deleted'); } catch (e) { next(e); } };

const listEscProfiles  = async (req, res, next) => { try { const d = await svc.listEscalationProfiles(req.workspaceId); success(res, d); } catch (e) { next(e); } };
const createEscProfile = async (req, res, next) => { try { const d = await svc.createEscalationProfile(req.workspaceId, req.body); success(res, d, 'Escalation profile created', 201); } catch (e) { next(e); } };
const updateEscProfile = async (req, res, next) => { try { const d = await svc.updateEscalationProfile(req.workspaceId, req.params.id, req.body); success(res, d); } catch (e) { next(e); } };
const addEscRule       = async (req, res, next) => { try { const d = await svc.addEscalationRule(req.workspaceId, req.params.id, req.body); success(res, d, 'Rule added', 201); } catch (e) { next(e); } };
const updateEscRule    = async (req, res, next) => { try { const d = await svc.updateEscalationRule(req.workspaceId, req.params.id, req.body); success(res, d); } catch (e) { next(e); } };
const deleteEscRule    = async (req, res, next) => { try { await svc.deleteEscalationRule(req.workspaceId, req.params.id); success(res, null, 'Rule deleted'); } catch (e) { next(e); } };

const listEscalations  = async (req, res, next) => { try { const d = await svc.listEscalations(req.workspaceId, req.query); success(res, d); } catch (e) { next(e); } };
const acknowledgeEsc   = async (req, res, next) => { try { const d = await svc.acknowledgeEscalation(req.workspaceId, req.params.id); success(res, d); } catch (e) { next(e); } };

module.exports = {
  getPreference, updatePreference,
  getWorkspaceSettings, updateWorkspaceSettings, listCategories,
  listNotifications, getUnreadCount, markRead, markAllRead, archiveItem, snoozeItem, deleteItem,
  listProfiles, createProfile, updateProfile, deleteProfile, addRule, updateRule, deleteRule,
  listEscProfiles, createEscProfile, updateEscProfile, addEscRule, updateEscRule, deleteEscRule,
  listEscalations, acknowledgeEsc,
};
