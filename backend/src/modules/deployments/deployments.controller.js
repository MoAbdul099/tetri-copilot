const service = require('./deployments.service');
const { success, error } = require('../../utils/response');

// Guard: Clerk-authed owner/admin OR DEPLOY_SECRET token
function isAuthorized(req) {
  // CI/CD secret token
  const deploySecret = process.env.DEPLOY_SECRET;
  if (deploySecret) {
    const auth = req.headers.authorization || '';
    if (auth === `Bearer ${deploySecret}`) return true;
  }
  // Clerk-authed user with owner/admin role
  if (req.workspaceMember && ['owner', 'admin'].includes(req.role)) return true;
  return false;
}

function guard(req, res) {
  if (!isAuthorized(req)) {
    error(res, 'Access denied', 403);
    return false;
  }
  return true;
}

async function listDeployments(req, res) {
  if (!guard(req, res)) return;
  try {
    const result = await service.listDeployments(req.query);
    return success(res, result);
  } catch (err) { return error(res, err.message, err.status || 500); }
}

async function getDeployment(req, res) {
  if (!guard(req, res)) return;
  try {
    return success(res, await service.getDeployment(req.params.id));
  } catch (err) { return error(res, err.message, err.status || 500); }
}

async function startDeployment(req, res) {
  const deploySecret = process.env.DEPLOY_SECRET;
  const auth = req.headers.authorization || '';
  const isSecret = deploySecret && auth === `Bearer ${deploySecret}`;
  if (!isSecret && !isAuthorized(req)) {
    return error(res, 'Access denied', 403);
  }
  try {
    const log = await service.startDeployment(req.body);
    return success(res, log, 'Deployment started', 201);
  } catch (err) { return error(res, err.message, err.status || 500); }
}

async function completeDeployment(req, res) {
  const deploySecret = process.env.DEPLOY_SECRET;
  const auth = req.headers.authorization || '';
  const isSecret = deploySecret && auth === `Bearer ${deploySecret}`;
  if (!isSecret && !isAuthorized(req)) {
    return error(res, 'Access denied', 403);
  }
  try {
    const log = await service.completeDeployment(req.params.id, req.body);
    return success(res, log, 'Deployment updated');
  } catch (err) { return error(res, err.message, err.status || 500); }
}

async function addAuditEntry(req, res) {
  const deploySecret = process.env.DEPLOY_SECRET;
  const auth = req.headers.authorization || '';
  const isSecret = deploySecret && auth === `Bearer ${deploySecret}`;
  if (!isSecret && !isAuthorized(req)) {
    return error(res, 'Access denied', 403);
  }
  try {
    const entry = await service.addAuditEntry(req.params.id, req.body);
    return success(res, entry, 'Audit entry added', 201);
  } catch (err) { return error(res, err.message, err.status || 500); }
}

async function getLatestByEnvironment(req, res) {
  try {
    const latest = await service.getLatestByEnvironment(req.params.env);
    return success(res, latest);
  } catch (err) { return error(res, err.message, err.status || 500); }
}

module.exports = { listDeployments, getDeployment, startDeployment, completeDeployment, addAuditEntry, getLatestByEnvironment };
