const repo = require('./notifications.repository');

// ── Preferences ────────────────────────────────────────────

const getPreference = async (workspaceId, userId) => {
  const pref = await repo.getPreference(userId, workspaceId);
  return pref || { userId, workspaceId, enableInApp: true, enableEmail: true, frequency: 'immediate' };
};

const updatePreference = (workspaceId, userId, data) => {
  const allowed = {};
  if (data.enableInApp !== undefined) allowed.enableInApp = !!data.enableInApp;
  if (data.enableEmail !== undefined) allowed.enableEmail = !!data.enableEmail;
  if (['immediate', 'daily', 'weekly'].includes(data.frequency)) allowed.frequency = data.frequency;
  return repo.upsertPreference(userId, workspaceId, allowed);
};

// ── Notification center ────────────────────────────────────

const listNotifications = (workspaceId, userId, query) =>
  repo.listItems(workspaceId, userId, query);

const getUnreadCount = (workspaceId, userId) =>
  repo.countUnread(workspaceId, userId);

const markRead = async (workspaceId, userId, id) => {
  const item = await repo.findItem(id, workspaceId, userId);
  if (!item) throw Object.assign(new Error('Notification not found'), { statusCode: 404 });
  if (item.readAt) return item;
  return repo.updateItem(id, { status: 'read', readAt: new Date() });
};

const markAllRead = (workspaceId, userId) =>
  repo.markAllRead(workspaceId, userId);

const archiveNotification = async (workspaceId, userId, id) => {
  const item = await repo.findItem(id, workspaceId, userId);
  if (!item) throw Object.assign(new Error('Notification not found'), { statusCode: 404 });
  return repo.updateItem(id, { status: 'archived', archivedAt: new Date() });
};

const deleteNotification = async (workspaceId, userId, id) => {
  const item = await repo.findItem(id, workspaceId, userId);
  if (!item) throw Object.assign(new Error('Notification not found'), { statusCode: 404 });
  await repo.deleteItem(id, workspaceId, userId);
};

const snoozeNotification = async (workspaceId, userId, id, until) => {
  const item = await repo.findItem(id, workspaceId, userId);
  if (!item) throw Object.assign(new Error('Notification not found'), { statusCode: 404 });
  const snoozeDate = until ? new Date(until) : (() => {
    const d = new Date(); d.setDate(d.getDate() + 1); return d;
  })();
  return repo.updateItem(id, { snoozedUntil: snoozeDate, status: 'sent' });
};

// ── Profiles ───────────────────────────────────────────────

const listProfiles = (workspaceId) => repo.listProfiles(workspaceId);

const getProfile = async (workspaceId, id) => {
  const p = await repo.getProfileById(id);
  if (!p) throw Object.assign(new Error('Profile not found'), { statusCode: 404 });
  return p;
};

const createProfile = async (workspaceId, data) => {
  if (!data.name?.trim()) throw Object.assign(new Error('Profile name is required'), { statusCode: 400 });
  return repo.createProfile(workspaceId, { name: data.name.trim(), description: data.description });
};

const updateProfile = async (workspaceId, id, data) => {
  await getProfile(workspaceId, id);
  return repo.updateProfile(id, { name: data.name, description: data.description, isActive: data.isActive });
};

const deleteProfile = async (workspaceId, id) => {
  await getProfile(workspaceId, id);
  return repo.deleteProfile(id);
};

const addRule = async (workspaceId, profileId, data) => {
  await getProfile(workspaceId, profileId);
  if (data.offsetDays === undefined) throw Object.assign(new Error('offsetDays is required'), { statusCode: 400 });
  return repo.addRule(profileId, {
    name:       data.name,
    offsetDays: parseInt(data.offsetDays, 10),
    direction:  ['before', 'after'].includes(data.direction) ? data.direction : 'before',
    channel:    ['inapp', 'email', 'both'].includes(data.channel) ? data.channel : 'both',
    sortOrder:  parseInt(data.sortOrder, 10) || 0,
  });
};

const updateRule = (workspaceId, ruleId, data) => {
  const update = {};
  if (data.name !== undefined)      update.name      = data.name;
  if (data.offsetDays !== undefined) update.offsetDays = parseInt(data.offsetDays, 10);
  if (['before', 'after'].includes(data.direction)) update.direction = data.direction;
  if (['inapp', 'email', 'both'].includes(data.channel)) update.channel = data.channel;
  if (data.isActive !== undefined)  update.isActive  = !!data.isActive;
  if (data.sortOrder !== undefined) update.sortOrder = parseInt(data.sortOrder, 10);
  return repo.updateRule(ruleId, update);
};

const deleteRule = (workspaceId, ruleId) => repo.deleteRule(ruleId);

// ── Escalation profiles ───────────────────────────────────

const listEscalationProfiles = (workspaceId) => repo.listEscalationProfiles(workspaceId);

const getEscalationProfile = async (workspaceId, id) => {
  const p = await repo.getEscalationProfileById(id);
  if (!p) throw Object.assign(new Error('Escalation profile not found'), { statusCode: 404 });
  return p;
};

const createEscalationProfile = async (workspaceId, data) => {
  if (!data.name?.trim()) throw Object.assign(new Error('Profile name is required'), { statusCode: 400 });
  return repo.createEscalationProfile(workspaceId, { name: data.name.trim(), description: data.description });
};

const updateEscalationProfile = async (workspaceId, id, data) => {
  await getEscalationProfile(workspaceId, id);
  return repo.updateEscalationProfile(id, { name: data.name, description: data.description, isActive: data.isActive });
};

const addEscalationRule = async (workspaceId, profileId, data) => {
  await getEscalationProfile(workspaceId, profileId);
  return repo.addEscalationRule(profileId, {
    level:            parseInt(data.level, 10) || 1,
    triggerAfterDays: parseInt(data.triggerAfterDays, 10) || 3,
    recipientTypes:   data.recipientTypes || 'owner',
  });
};

const updateEscalationRule = (workspaceId, ruleId, data) => {
  const update = {};
  if (data.level !== undefined)            update.level            = parseInt(data.level, 10);
  if (data.triggerAfterDays !== undefined) update.triggerAfterDays = parseInt(data.triggerAfterDays, 10);
  if (data.recipientTypes !== undefined)  update.recipientTypes   = data.recipientTypes;
  if (data.isActive !== undefined)        update.isActive         = !!data.isActive;
  return repo.updateEscalationRule(ruleId, update);
};

const deleteEscalationRule = (workspaceId, ruleId) => repo.deleteEscalationRule(ruleId);

// ── Escalation instances ──────────────────────────────────

const listEscalations = (workspaceId, query) => repo.listEscalations(workspaceId, query);

const acknowledgeEscalation = async (workspaceId, id) => {
  const inst = await repo.listEscalations(workspaceId, {});
  const found = inst.items.find((i) => i.id === id);
  if (!found) throw Object.assign(new Error('Escalation not found'), { statusCode: 404 });
  return repo.updateEscalationInstance(id, { status: 'acknowledged', acknowledgedAt: new Date() });
};

// ── Workspace settings ─────────────────────────────────────

const getWorkspaceSettings = async (workspaceId) => {
  const s = await repo.getWorkspaceSettings(workspaceId);
  return s || { workspaceId, notificationsEnabled: true, inAppEnabled: true, toastEnabled: true, retentionMonths: 24, minimumToastPriority: 'medium' };
};

const updateWorkspaceSettings = (workspaceId, data) => {
  const allowed = {};
  if (data.notificationsEnabled !== undefined) allowed.notificationsEnabled = !!data.notificationsEnabled;
  if (data.inAppEnabled         !== undefined) allowed.inAppEnabled         = !!data.inAppEnabled;
  if (data.toastEnabled         !== undefined) allowed.toastEnabled         = !!data.toastEnabled;
  if (data.retentionMonths      !== undefined) allowed.retentionMonths      = parseInt(data.retentionMonths, 10) || 24;
  if (['low', 'medium', 'high', 'critical'].includes(data.minimumToastPriority)) allowed.minimumToastPriority = data.minimumToastPriority;
  return repo.upsertWorkspaceSettings(workspaceId, allowed);
};

// ── Categories ─────────────────────────────────────────────

const listCategories = () => repo.listCategories();

module.exports = {
  getPreference,
  updatePreference,
  getWorkspaceSettings,
  updateWorkspaceSettings,
  listCategories,
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  archiveNotification,
  snoozeNotification,
  deleteNotification,
  listProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  addRule,
  updateRule,
  deleteRule,
  listEscalationProfiles,
  getEscalationProfile,
  createEscalationProfile,
  updateEscalationProfile,
  addEscalationRule,
  updateEscalationRule,
  deleteEscalationRule,
  listEscalations,
  acknowledgeEscalation,
};
