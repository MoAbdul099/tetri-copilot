const svc = require('./expense-insights.service');
const { success } = require('../../utils/response');

const getDashboard       = async (req, res, next) => { try { success(res, await svc.getDashboard(req.workspaceId)); } catch (e) { next(e); } };
const getAnalytics       = async (req, res, next) => { try { success(res, await svc.getAnalytics(req.workspaceId, req.query)); } catch (e) { next(e); } };
const checkDuplicates    = async (req, res, next) => { try { success(res, await svc.checkDuplicates(req.workspaceId, req.body)); } catch (e) { next(e); } };
const suggestCategory    = async (req, res, next) => { try { success(res, await svc.suggestCategory(req.workspaceId, req.body)); } catch (e) { next(e); } };
const getInsights        = async (req, res, next) => { try { success(res, await svc.getInsights(req.workspaceId)); } catch (e) { next(e); } };
const generateInsights   = async (req, res, next) => { try { success(res, await svc.generateInsights(req.workspaceId)); } catch (e) { next(e); } };
const getForecast        = async (req, res, next) => { try { success(res, await svc.getForecast(req.workspaceId)); } catch (e) { next(e); } };
const detectAnomalies    = async (req, res, next) => { try { success(res, await svc.detectAnomalies(req.workspaceId)); } catch (e) { next(e); } };
const getAnomalies       = async (req, res, next) => { try { success(res, await svc.getAnomalies(req.workspaceId)); } catch (e) { next(e); } };
const reviewAnomaly      = async (req, res, next) => { try { success(res, await svc.reviewAnomaly(req.workspaceId, req.params.id)); } catch (e) { next(e); } };
const nlSearch           = async (req, res, next) => { try { success(res, await svc.naturalLanguageSearch(req.workspaceId, req.body)); } catch (e) { next(e); } };
const getRecommendations = async (req, res, next) => { try { success(res, await svc.getRecommendations(req.workspaceId)); } catch (e) { next(e); } };

module.exports = {
  getDashboard, getAnalytics, checkDuplicates, suggestCategory,
  getInsights, generateInsights, getForecast,
  detectAnomalies, getAnomalies, reviewAnomaly,
  nlSearch, getRecommendations,
};
