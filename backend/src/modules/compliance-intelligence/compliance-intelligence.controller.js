const svc  = require('./compliance-intelligence.service');
const repo = require('./compliance-intelligence.repository');
const { success, error } = require('../../utils/response');

async function getDashboard(req, res) {
  try {
    const data = await svc.getDashboard(req.workspaceId);
    return success(res, data);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function analyze(req, res) {
  try {
    const data = await svc.runAnalysis(req.workspaceId);
    return success(res, data, 'Analysis complete.');
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function listRisks(req, res) {
  try {
    const { severity, status, page, pageSize } = req.query;
    const data = await repo.listRisks(req.workspaceId, { severity, status, page, pageSize });
    return success(res, data);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function listRecommendations(req, res) {
  try {
    const data = await repo.listRecommendations(req.workspaceId);
    return success(res, data);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function getHistory(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const [scores, snapshots] = await Promise.all([
      repo.getHealthScoreHistory(req.workspaceId, limit),
      repo.listSnapshots(req.workspaceId, limit),
    ]);
    return success(res, { scores, snapshots });
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function generateAiInsights(req, res) {
  try {
    const data = await svc.generateAiInsights(req.workspaceId, req.auth.userId);
    return success(res, data);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

async function generateExecutiveSummary(req, res) {
  try {
    const data = await svc.generateExecutiveSummary(req.workspaceId, req.auth.userId);
    return success(res, data);
  } catch (err) {
    return error(res, err.message, 500);
  }
}

module.exports = { getDashboard, analyze, listRisks, listRecommendations, getHistory, generateAiInsights, generateExecutiveSummary };
