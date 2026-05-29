import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, ChevronRight, RefreshCw } from 'lucide-react';
import { listWorkspaces } from '../services/workspacesService';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
];

const PLAN_OPTS = [
  { value: '', label: 'All Plans' },
  { value: 'free', label: 'Free' },
  { value: 'starter', label: 'Starter' },
  { value: 'professional', label: 'Professional' },
  { value: 'business', label: 'Business' },
];

const STATUS_STYLE = {
  active:    'bg-green-50 text-green-700 border-green-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  inactive:  'bg-gray-50 text-gray-600 border-gray-200',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmt = (n) => Number(n || 0).toLocaleString();

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[status] || 'bg-tetri-bg text-tetri-neutral border-tetri-border'}`}>
      {status}
    </span>
  );
}

export default function WorkspacesPage() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [total, setTotal]           = useState(0);
  const [pages, setPages]           = useState(1);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusTab, setStatusTab]   = useState('');
  const [plan, setPlan]             = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listWorkspaces({ search: search || undefined, status: statusTab || undefined, plan: plan || undefined, page, limit: 20 });
      setWorkspaces(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch { /* keep stale */ }
    finally { setLoading(false); }
  }, [search, statusTab, plan, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, statusTab, plan]);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-tetri-text">Organizations</h1>
          <p className="text-sm text-tetri-neutral mt-0.5">{fmt(total)} workspace{total !== 1 ? 's' : ''} on platform</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 px-3 py-2 text-sm border border-tetri-border bg-white rounded-xl hover:bg-tetri-bg transition-colors disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 text-tetri-neutral ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-tetri-border overflow-x-auto">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatusTab(t.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              statusTab === t.value ? 'border-tetri-primary text-tetri-primary' : 'border-transparent text-tetri-neutral hover:text-tetri-text'
            }`}
          >{t.label}</button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, owner, email…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-tetri-border rounded-xl bg-white text-tetri-text placeholder:text-tetri-muted focus:outline-none focus:ring-2 focus:ring-tetri-primary/20 focus:border-tetri-primary"
          />
        </div>
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="text-sm border border-tetri-border rounded-xl px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-primary/20"
        >
          {PLAN_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-tetri-border rounded-xl overflow-x-auto">
        {loading && workspaces.length === 0 ? (
          <div className="py-16 text-center text-tetri-neutral text-sm">Loading…</div>
        ) : workspaces.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Building2 className="w-10 h-10 text-tetri-border mx-auto" />
            <p className="text-sm font-medium text-tetri-neutral">No workspaces found</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-tetri-border bg-tetri-bg">
                {['Workspace', 'Owner', 'Country', 'Plan', 'Members', 'Status', 'Created', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workspaces.map((ws) => (
                <tr
                  key={ws.id}
                  onClick={() => navigate(`/organizations/${ws.id}`)}
                  className="border-b border-tetri-border last:border-0 hover:bg-tetri-bg/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-tetri-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-tetri-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-tetri-text">{ws.company?.companyName || ws.name}</p>
                        <p className="text-xs text-tetri-muted truncate max-w-[140px]">{ws.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-tetri-text">{ws.owner?.fullName || '—'}</p>
                    <p className="text-xs text-tetri-muted">{ws.owner?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-tetri-neutral">{ws.countryProfile?.countryName || '—'}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{ws.subscription?.plan?.name || 'No plan'}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{fmt(ws._count?.members)}</td>
                  <td className="px-4 py-3"><StatusBadge status={ws.status} /></td>
                  <td className="px-4 py-3 text-tetri-neutral text-xs">{fmtDate(ws.createdAt)}</td>
                  <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-tetri-muted" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-tetri-neutral">
          <span>Page {page} of {pages} · {fmt(total)} total</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 border border-tetri-border rounded-lg text-sm hover:bg-tetri-bg disabled:opacity-50 transition-colors">Previous</button>
            <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border border-tetri-border rounded-lg text-sm hover:bg-tetri-bg disabled:opacity-50 transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
