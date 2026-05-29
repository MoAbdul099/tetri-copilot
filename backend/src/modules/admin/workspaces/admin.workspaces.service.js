const repo = require('./admin.workspaces.repository');
const { logActivity } = require('../auth/admin.auth.repository');

const ALLOWED_STATUSES = ['active', 'suspended', 'inactive'];

async function list(query) {
  return repo.list(query);
}

async function getById(id) {
  const ws = await repo.findById(id);
  if (!ws) throw Object.assign(new Error('Workspace not found'), { status: 404 });
  return ws;
}

async function changeStatus(id, status, { adminId, ipAddress }) {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw Object.assign(new Error(`Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`), { status: 400 });
  }
  const ws = await repo.findById(id);
  if (!ws) throw Object.assign(new Error('Workspace not found'), { status: 404 });
  const updated = await repo.updateStatus(id, status);
  await logActivity({ adminId, action: `workspace_${status}`, entityType: 'workspace', entityId: id, meta: { previousStatus: ws.status, newStatus: status }, ipAddress }).catch(() => {});
  return updated;
}

async function getUsage(id) {
  const ws = await repo.findById(id);
  if (!ws) throw Object.assign(new Error('Workspace not found'), { status: 404 });
  return repo.getUsage(id);
}

async function getActivity(id) {
  const ws = await repo.findById(id);
  if (!ws) throw Object.assign(new Error('Workspace not found'), { status: 404 });
  return repo.getActivity(id);
}

async function addNote(id, text, { adminId, adminEmail, ipAddress }) {
  if (!text?.trim()) throw Object.assign(new Error('Note text is required'), { status: 400 });
  const ws = await repo.findById(id);
  if (!ws) throw Object.assign(new Error('Workspace not found'), { status: 404 });
  const meta = await repo.addNote(id, { text: text.trim(), adminId, adminEmail });
  await logActivity({ adminId, action: 'workspace_note_added', entityType: 'workspace', entityId: id, ipAddress }).catch(() => {});
  return meta;
}

module.exports = { list, getById, changeStatus, getUsage, getActivity, addNote };
