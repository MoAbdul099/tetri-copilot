import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Filter, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { getRegisterReport, exportReport, listJurisdictions, listCategories, listAuthorities } from '../services/complianceService.js';
import { Toast } from '../../../components/shared/Toast.jsx';

const STATUS_BADGE = {
  scheduled:  'bg-blue-50 text-blue-700',
  in_progress:'bg-orange-50 text-orange-700',
  overdue:    'bg-red-50 text-red-700',
  completed:  'bg-green-50 text-green-700',
  submitted:  'bg-purple-50 text-purple-700',
  approved:   'bg-emerald-50 text-emerald-700',
  cancelled:  'bg-slate-100 text-slate-500',
};

const PRIORITY_BADGE = {
  critical: 'text-red-700 font-semibold',
  high:     'text-orange-700 font-semibold',
  medium:   'text-tetri-muted',
  low:      'text-slate-400',
};

export default function RegisterReportPage() {
  const navigate = useNavigate();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage]   = useState(1);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [categories, setCategories]       = useState([]);

  const [filters, setFilters] = useState({ jurisdictionId: '', categoryId: '', status: '', priority: '', search: '' });

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const result = await getRegisterReport({ ...filters, page: p, limit: 50 });
      setData(result);
      setPage(p);
    } catch { setToast({ type: 'error', message: 'Failed to load report' }); }
    setLoading(false);
  };

  useEffect(() => { load(1); }, []);
  useEffect(() => {
    listJurisdictions().then(setJurisdictions).catch(() => {});
    listCategories().then(setCategories).catch(() => {});
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const resp = await exportReport('register', filters, 'csv');
      const url  = URL.createObjectURL(new Blob([resp.data]));
      const a    = document.createElement('a');
      a.href = url; a.download = `compliance-register-${new Date().toISOString().split('T')[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch { setToast({ type: 'error', message: 'Export failed' }); }
    setExporting(false);
  };

  const items = data?.items || [];

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/compliance/reports')} className="text-tetri-muted hover:text-tetri-text">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-tetri-text">Compliance Register</h1>
          <p className="text-sm text-tetri-muted mt-0.5">All compliance obligations across your workspace.</p>
        </div>
        <button onClick={() => setShowFilter(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-tetri-border rounded-lg text-tetri-muted hover:bg-tetri-bg transition-colors">
          <Filter className="w-3.5 h-3.5" /> Filters
        </button>
        <button onClick={handleExport} disabled={exporting} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-tetri-blue rounded-lg hover:bg-tetri-blue-hover transition-colors disabled:opacity-60">
          <Download className="w-3.5 h-3.5" /> {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {showFilter && (
        <div className="bg-white border border-tetri-border rounded-xl p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          <input
            placeholder="Search…"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="col-span-2 md:col-span-1 border border-tetri-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-tetri-blue"
          />
          <select value={filters.jurisdictionId} onChange={e => setFilters(f => ({ ...f, jurisdictionId: e.target.value }))} className="border border-tetri-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-tetri-blue bg-white">
            <option value="">All Jurisdictions</option>
            {jurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
          </select>
          <select value={filters.categoryId} onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value }))} className="border border-tetri-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-tetri-blue bg-white">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="border border-tetri-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-tetri-blue bg-white">
            <option value="">All Statuses</option>
            {['scheduled','in_progress','overdue','completed','submitted','approved','cancelled'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={() => load(1)} className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-tetri-blue rounded-lg hover:bg-tetri-blue-hover transition-colors">Apply</button>
            <button onClick={() => { setFilters({ jurisdictionId: '', categoryId: '', status: '', priority: '', search: '' }); setTimeout(() => load(1), 0); }} className="px-3 py-1.5 text-xs text-tetri-muted border border-tetri-border rounded-lg hover:bg-tetri-bg transition-colors">Clear</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-tetri-border bg-tetri-bg/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Obligation</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral hidden md:table-cell">Jurisdiction</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral hidden lg:table-cell">Authority</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral hidden md:table-cell">Owner</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Due Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral hidden lg:table-cell">Priority</th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-xs text-tetri-neutral">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-xs text-tetri-neutral">No records found.</td></tr>
            ) : items.map((occ) => (
              <tr key={occ.id} className="border-b border-tetri-border/50 hover:bg-tetri-bg/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-tetri-text truncate max-w-[200px]">{occ.name}</p>
                  {occ.referenceNumber && <p className="text-xs text-tetri-neutral mt-0.5">{occ.referenceNumber}</p>}
                </td>
                <td className="px-4 py-3 text-tetri-muted hidden md:table-cell">{occ.jurisdiction?.name || '—'}</td>
                <td className="px-4 py-3 text-tetri-muted hidden lg:table-cell">{occ.authority?.name || '—'}</td>
                <td className="px-4 py-3 text-tetri-muted hidden md:table-cell">{occ.owner?.fullName || '—'}</td>
                <td className="px-4 py-3 text-tetri-muted whitespace-nowrap">{new Date(occ.dueDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[occ.status] || 'bg-slate-100 text-slate-600'}`}>
                    {occ.status.replace('_', ' ')}
                  </span>
                </td>
                <td className={`px-4 py-3 text-xs capitalize hidden lg:table-cell ${PRIORITY_BADGE[occ.priority] || ''}`}>{occ.priority}</td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/compliance/occurrences/${occ.id}`)} className="text-tetri-neutral hover:text-tetri-blue transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-tetri-border">
            <p className="text-xs text-tetri-neutral">{data.total} records · Page {page} of {data.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => load(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg border border-tetri-border text-tetri-muted hover:bg-tetri-bg disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => load(page + 1)} disabled={page >= data.pages} className="p-1.5 rounded-lg border border-tetri-border text-tetri-muted hover:bg-tetri-bg disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
