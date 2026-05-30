const repo = require('./admin.logs.repository');

const getDashboard    = async (req, res, next) => { try { res.json({ success: true, data: await repo.getDashboard() }); } catch (e) { next(e); } };
const listActivity    = async (req, res, next) => { try { res.json({ success: true, data: await repo.listActivity(req.query) }); } catch (e) { next(e); } };
const listAudit       = async (req, res, next) => { try { res.json({ success: true, data: await repo.listAudit(req.query) }); } catch (e) { next(e); } };
const listSecurity    = async (req, res, next) => { try { res.json({ success: true, data: await repo.listSecurity(req.query) }); } catch (e) { next(e); } };
const listAi          = async (req, res, next) => { try { res.json({ success: true, data: await repo.listAi(req.query) }); } catch (e) { next(e); } };
const listCompliance  = async (req, res, next) => { try { res.json({ success: true, data: await repo.listCompliance(req.query) }); } catch (e) { next(e); } };
const listAdminActions = async (req, res, next) => { try { res.json({ success: true, data: await repo.listAdminActions(req.query) }); } catch (e) { next(e); } };

const exportCsv = async (req, res, next) => {
  try {
    const { type = 'activity', ...params } = req.query;
    params.limit = 5000;
    params.page  = 1;

    let result;
    if (type === 'audit')    result = await repo.listAudit(params);
    else if (type === 'security')  result = await repo.listSecurity(params);
    else if (type === 'ai')        result = await repo.listAi(params);
    else if (type === 'compliance') result = await repo.listCompliance(params);
    else if (type === 'admin')     result = await repo.listAdminActions(params);
    else                           result = await repo.listActivity(params);

    const items = result.items;
    if (!items.length) return res.json({ success: true, data: [] });

    const cols = Object.keys(items[0]).filter((k) => typeof items[0][k] !== 'object' || items[0][k] === null);
    const header = cols.join(',');
    const rows = items.map((r) =>
      cols.map((c) => {
        const v = r[c];
        if (v === null || v === undefined) return '';
        const s = String(v).replace(/"/g, '""');
        return s.includes(',') || s.includes('\n') ? `"${s}"` : s;
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-logs.csv"`);
    res.send(csv);
  } catch (e) { next(e); }
};

module.exports = { getDashboard, listActivity, listAudit, listSecurity, listAi, listCompliance, listAdminActions, exportCsv };
