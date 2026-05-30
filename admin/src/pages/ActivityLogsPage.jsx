import { useState, useEffect, useCallback } from 'react';
import {
  Activity, ShieldAlert, Brain, ClipboardCheck, Settings2,
  FileText, Search, X, ChevronLeft, ChevronRight,
  Loader2, Download, Eye, CheckCircle2, XCircle,
  AlertTriangle, Info, Building2, User, Calendar,
} from 'lucide-react';
import * as svc from '../services/adminLogsService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate  = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtShort = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const cap = (s) => s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

const SEVERITY_CFG = {
  critical: 'bg-red-100 text-red-800',
  high:     'bg-orange-100 text-orange-800',
  medium:   'bg-amber-100 text-amber-700',
  low:      'bg-blue-100 text-blue-700',
  info:     'bg-gray-100 text-gray-600',
};

// ─── Shared components ────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color = 'text-gray-700', bg = 'bg-gray-50' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
      <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Pagination({ page, total, limit, onPage }) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
      <p className="text-xs text-gray-500">{total.toLocaleString()} total · page {page} of {pages}</p>
      <div className="flex gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <button onClick={() => onPage(page + 1)} disabled={page >= pages}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative flex-1 min-w-52">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function TableShell({ cols, loading, empty, children }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-max">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {cols.map((c) => (
                <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={cols.length} className="px-4 py-10 text-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" /></td></tr>}
            {!loading && empty && <tr><td colSpan={cols.length} className="px-4 py-10 text-center text-sm text-gray-400">No records found.</td></tr>}
            {!loading && !empty && children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DetailModal({ title, data, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          {Object.entries(data).filter(([, v]) => v !== null && v !== undefined).map(([k, v]) => (
            <div key={k}>
              <p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wide">{cap(k)}</p>
              {typeof v === 'object' ? (
                <pre className="bg-gray-900 text-green-300 text-xs rounded-lg p-3 overflow-auto max-h-48 font-mono">
                  {JSON.stringify(v, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-gray-800 font-medium break-all">{String(v)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab() {
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    svc.getDashboard().then(setDash).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  if (!dash)   return <p className="text-sm text-gray-400 py-8 text-center">Failed to load.</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Activity}      label="Activity Logs"     value={dash.totalActivity.toLocaleString()}   sub={`${dash.activity24h} last 24h`}     color="text-indigo-600" bg="bg-indigo-50" />
        <KpiCard icon={FileText}      label="Audit Records"     value={dash.totalAudit.toLocaleString()}                                               color="text-blue-600"   bg="bg-blue-50" />
        <KpiCard icon={ShieldAlert}   label="Security Events"   value={dash.totalSecurity.toLocaleString()}   sub={`${dash.securityHigh} high/critical`} color={dash.securityHigh > 0 ? 'text-red-600' : 'text-emerald-600'} bg={dash.securityHigh > 0 ? 'bg-red-50' : 'bg-emerald-50'} />
        <KpiCard icon={Brain}         label="AI Requests"       value={dash.totalAi.toLocaleString()}          sub={`${dash.aiErrors} errors (7d)`}      color="text-violet-600" bg="bg-violet-50" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard icon={ClipboardCheck} label="Compliance Events" value={dash.totalCompliance.toLocaleString()}                                         color="text-emerald-600" bg="bg-emerald-50" />
        <KpiCard icon={Settings2}      label="Admin Actions"     value={dash.totalAdminActions.toLocaleString()} sub={`${dash.adminActions24h} last 24h`} color="text-slate-600"   bg="bg-slate-100" />
        <KpiCard icon={AlertTriangle}  label="High Risk Security" value={dash.securityHigh}                                                            color={dash.securityHigh > 0 ? 'text-red-600' : 'text-gray-500'} bg={dash.securityHigh > 0 ? 'bg-red-50' : 'bg-gray-50'} />
      </div>
    </div>
  );
}

// ─── Activity Tab ─────────────────────────────────────────────────────────────

function ActivityTab() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modFilter, setModFilter] = useState('');
  const [page, setPage]     = useState(1);
  const [detail, setDetail] = useState(null);
  const limit = 25;

  const load = useCallback(() => {
    setLoading(true);
    svc.listActivity({ search: search || undefined, module: modFilter || undefined, page, limit })
      .then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [search, modFilter, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, modFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search workspace, user, action…" />
        <input className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white w-36"
          placeholder="Module filter" value={modFilter} onChange={(e) => setModFilter(e.target.value)} />
        <button onClick={() => svc.exportCsv('activity', { search: search || undefined, module: modFilter || undefined })}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      <TableShell cols={['Action', 'Workspace', 'User', 'Module', 'Entity', 'Date', '']}
        loading={loading} empty={!data?.items?.length}>
        {data?.items?.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 font-medium text-gray-800 max-w-48 truncate">{r.action}</td>
            <td className="px-4 py-3 text-gray-600 text-xs max-w-32 truncate">{r.workspace?.name || '—'}</td>
            <td className="px-4 py-3 text-gray-600 text-xs max-w-32 truncate">{r.userName || r.user?.fullName || '—'}</td>
            <td className="px-4 py-3 text-xs"><span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{r.module || '—'}</span></td>
            <td className="px-4 py-3 text-xs text-gray-500">{r.entityType || '—'}</td>
            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
            <td className="px-4 py-3">
              <button onClick={() => setDetail(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                <Eye className="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        ))}
      </TableShell>
      {data && <Pagination page={page} total={data.total} limit={limit} onPage={setPage} />}
      {detail && <DetailModal title="Activity Log Detail" data={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

// ─── Audit Tab ────────────────────────────────────────────────────────────────

function AuditTab() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [etFilter, setEtFilter] = useState('');
  const [page, setPage]     = useState(1);
  const [detail, setDetail] = useState(null);
  const limit = 25;

  const load = useCallback(() => {
    setLoading(true);
    svc.listAudit({ search: search || undefined, entityType: etFilter || undefined, page, limit })
      .then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [search, etFilter, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, etFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search workspace, user, action…" />
        <input className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white w-40"
          placeholder="Entity type" value={etFilter} onChange={(e) => setEtFilter(e.target.value)} />
        <button onClick={() => svc.exportCsv('audit', { search: search || undefined, entityType: etFilter || undefined })}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      <TableShell cols={['Action', 'Entity Type', 'Workspace', 'User', 'Legal Hold', 'Date', '']}
        loading={loading} empty={!data?.items?.length}>
        {data?.items?.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 font-medium text-gray-800 max-w-48 truncate">{r.action}</td>
            <td className="px-4 py-3 text-xs"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{r.entityType || '—'}</span></td>
            <td className="px-4 py-3 text-gray-600 text-xs max-w-32 truncate">{r.workspace?.name || '—'}</td>
            <td className="px-4 py-3 text-gray-600 text-xs max-w-32 truncate">{r.userName || r.user?.fullName || '—'}</td>
            <td className="px-4 py-3">
              {r.isLegalHold
                ? <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Held</span>
                : <span className="text-xs text-gray-400">—</span>}
            </td>
            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
            <td className="px-4 py-3">
              <button onClick={() => setDetail(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                <Eye className="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        ))}
      </TableShell>
      {data && <Pagination page={page} total={data.total} limit={limit} onPage={setPage} />}
      {detail && <DetailModal title="Audit Log Detail" data={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [page, setPage]     = useState(1);
  const [detail, setDetail] = useState(null);
  const limit = 25;

  const load = useCallback(() => {
    setLoading(true);
    svc.listSecurity({ search: search || undefined, severity: severity || undefined, page, limit })
      .then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [search, severity, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, severity]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search workspace, event type, user…" />
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
          value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="">All Severities</option>
          {['critical', 'high', 'medium', 'low', 'info'].map((s) => (
            <option key={s} value={s}>{cap(s)}</option>
          ))}
        </select>
        <button onClick={() => svc.exportCsv('security', { search: search || undefined, severity: severity || undefined })}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      <TableShell cols={['Severity', 'Event Type', 'Workspace', 'User', 'Risk Score', 'Date', '']}
        loading={loading} empty={!data?.items?.length}>
        {data?.items?.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SEVERITY_CFG[r.severity] || SEVERITY_CFG.info}`}>
                {cap(r.severity)}
              </span>
            </td>
            <td className="px-4 py-3 font-medium text-gray-800 max-w-48 truncate">{r.eventType}</td>
            <td className="px-4 py-3 text-gray-600 text-xs max-w-32 truncate">{r.workspace?.name || '—'}</td>
            <td className="px-4 py-3 text-gray-600 text-xs max-w-32 truncate">{r.userName || '—'}</td>
            <td className="px-4 py-3">
              <span className={`text-xs font-bold ${r.riskScore >= 70 ? 'text-red-600' : r.riskScore >= 40 ? 'text-amber-600' : 'text-gray-600'}`}>
                {r.riskScore}
              </span>
            </td>
            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
            <td className="px-4 py-3">
              <button onClick={() => setDetail(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                <Eye className="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        ))}
      </TableShell>
      {data && <Pagination page={page} total={data.total} limit={limit} onPage={setPage} />}
      {detail && <DetailModal title="Security Event Detail" data={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

// ─── AI Activity Tab ──────────────────────────────────────────────────────────

function AiTab() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [successFilter, setSuccessFilter] = useState('');
  const [page, setPage]     = useState(1);
  const limit = 25;

  const load = useCallback(() => {
    setLoading(true);
    svc.listAi({ search: search || undefined, success: successFilter, page, limit })
      .then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [search, successFilter, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, successFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search workspace, feature…" />
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
          value={successFilter} onChange={(e) => setSuccessFilter(e.target.value)}>
          <option value="">All Results</option>
          <option value="true">Success</option>
          <option value="false">Failed</option>
        </select>
        <button onClick={() => svc.exportCsv('ai', { search: search || undefined, success: successFilter || undefined })}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      <TableShell cols={['Status', 'Feature', 'Workspace ID', 'Provider / Model', 'Tokens', 'Cost', 'Date']}
        loading={loading} empty={!data?.items?.length}>
        {data?.items?.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3">
              {r.success
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                : <XCircle     className="w-4 h-4 text-red-500" />}
            </td>
            <td className="px-4 py-3 font-medium text-gray-800 text-xs">{r.feature}</td>
            <td className="px-4 py-3 text-gray-500 text-xs font-mono truncate max-w-32">{r.workspaceId || '—'}</td>
            <td className="px-4 py-3 text-xs text-gray-500">{r.provider?.name || '—'} · {r.model?.modelName || '—'}</td>
            <td className="px-4 py-3 text-xs text-gray-600">{(r.tokensInput + r.tokensOutput).toLocaleString()}</td>
            <td className="px-4 py-3 text-xs text-gray-600">${r.estimatedCost?.toFixed(4) || '0.0000'}</td>
            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
          </tr>
        ))}
      </TableShell>
      {data && <Pagination page={page} total={data.total} limit={limit} onPage={setPage} />}
    </div>
  );
}

// ─── Compliance Tab ───────────────────────────────────────────────────────────

function ComplianceTab() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const [detail, setDetail] = useState(null);
  const limit = 25;

  const load = useCallback(() => {
    setLoading(true);
    svc.listCompliance({ search: search || undefined, page, limit })
      .then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search workspace, action, user…" />
        <button onClick={() => svc.exportCsv('compliance', { search: search || undefined })}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      <TableShell cols={['Action', 'Workspace', 'Actor', 'Occurrence', 'Date', '']}
        loading={loading} empty={!data?.items?.length}>
        {data?.items?.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 font-medium text-gray-800 max-w-48 truncate">{r.action}</td>
            <td className="px-4 py-3 text-gray-600 text-xs max-w-32 truncate">{r.workspace?.name || '—'}</td>
            <td className="px-4 py-3 text-gray-600 text-xs">{r.actor?.fullName || '—'}</td>
            <td className="px-4 py-3 text-xs text-gray-500 max-w-40 truncate">{r.occurrence?.name || '—'}</td>
            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
            <td className="px-4 py-3">
              {r.metadata && (
                <button onClick={() => setDetail(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}
            </td>
          </tr>
        ))}
      </TableShell>
      {data && <Pagination page={page} total={data.total} limit={limit} onPage={setPage} />}
      {detail && <DetailModal title="Compliance Event Detail" data={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

// ─── Admin Actions Tab ────────────────────────────────────────────────────────

function AdminActionsTab() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [etFilter, setEtFilter] = useState('');
  const [page, setPage]     = useState(1);
  const [detail, setDetail] = useState(null);
  const limit = 25;

  const load = useCallback(() => {
    setLoading(true);
    svc.listAdminActions({ search: search || undefined, entityType: etFilter || undefined, page, limit })
      .then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [search, etFilter, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, etFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search admin, action, entity…" />
        <input className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white w-40"
          placeholder="Entity type" value={etFilter} onChange={(e) => setEtFilter(e.target.value)} />
        <button onClick={() => svc.exportCsv('admin', { search: search || undefined, entityType: etFilter || undefined })}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      <TableShell cols={['Action', 'Admin', 'Entity Type', 'Entity ID', 'IP', 'Date', '']}
        loading={loading} empty={!data?.items?.length}>
        {data?.items?.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 font-medium text-gray-800 max-w-48 truncate">{cap(r.action)}</td>
            <td className="px-4 py-3 text-gray-600 text-xs">{r.admin?.email || '—'}</td>
            <td className="px-4 py-3 text-xs"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{r.entityType || '—'}</span></td>
            <td className="px-4 py-3 text-xs text-gray-500 max-w-32 truncate font-mono">{r.entityId || '—'}</td>
            <td className="px-4 py-3 text-xs text-gray-400 font-mono">{r.ipAddress || '—'}</td>
            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
            <td className="px-4 py-3">
              {r.meta && (
                <button onClick={() => setDetail(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}
            </td>
          </tr>
        ))}
      </TableShell>
      {data && <Pagination page={page} total={data.total} limit={limit} onPage={setPage} />}
      {detail && <DetailModal title="Admin Action Detail" data={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'dashboard',    label: 'Dashboard',      icon: Activity },
  { key: 'activity',     label: 'Activity',        icon: Activity },
  { key: 'audit',        label: 'Audit',           icon: FileText },
  { key: 'security',     label: 'Security',        icon: ShieldAlert },
  { key: 'ai',           label: 'AI Activity',     icon: Brain },
  { key: 'compliance',   label: 'Compliance',      icon: ClipboardCheck },
  { key: 'admin',        label: 'Admin Actions',   icon: Settings2 },
];

export default function ActivityLogsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          Activity & Audit Logs
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform-wide activity, audit trails, security events, and administrative actions</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === t.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'dashboard'  && <DashboardTab />}
      {activeTab === 'activity'   && <ActivityTab />}
      {activeTab === 'audit'      && <AuditTab />}
      {activeTab === 'security'   && <SecurityTab />}
      {activeTab === 'ai'         && <AiTab />}
      {activeTab === 'compliance' && <ComplianceTab />}
      {activeTab === 'admin'      && <AdminActionsTab />}
    </div>
  );
}
