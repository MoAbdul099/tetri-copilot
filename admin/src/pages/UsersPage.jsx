import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, ChevronRight, RefreshCw } from 'lucide-react';
import { listUsers } from '../services/usersService';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'invited', label: 'Invited' },
];

const ROLE_OPTS = [
  { value: '', label: 'All Roles' },
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
  { value: 'viewer', label: 'Viewer' },
];

const STATUS_STYLE = {
  active:    'bg-green-50 text-green-700 border-green-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  inactive:  'bg-gray-50 text-gray-600 border-gray-200',
  invited:   'bg-blue-50 text-blue-700 border-blue-200',
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

function UserInitials({ name, email }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : (email?.[0] || '?').toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-tetri-primary/10 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-semibold text-tetri-primary">{initials}</span>
    </div>
  );
}

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusTab, setStatusTab] = useState('');
  const [role, setRole]         = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUsers({ search: search || undefined, status: statusTab || undefined, role: role || undefined, page, limit: 20 });
      setUsers(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch { /* keep stale */ }
    finally { setLoading(false); }
  }, [search, statusTab, role, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, statusTab, role]);

  const primaryWorkspace = (u) => u.workspaceMemberships?.[0];

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-tetri-text">Users</h1>
          <p className="text-sm text-tetri-neutral mt-0.5">{fmt(total)} user{total !== 1 ? 's' : ''} on platform</p>
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
            placeholder="Search by name, email, workspace…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-tetri-border rounded-xl bg-white text-tetri-text placeholder:text-tetri-muted focus:outline-none focus:ring-2 focus:ring-tetri-primary/20 focus:border-tetri-primary"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="text-sm border border-tetri-border rounded-xl px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-primary/20"
        >
          {ROLE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-tetri-border rounded-xl overflow-x-auto">
        {loading && users.length === 0 ? (
          <div className="py-16 text-center text-tetri-neutral text-sm">Loading…</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Users className="w-10 h-10 text-tetri-border mx-auto" />
            <p className="text-sm font-medium text-tetri-neutral">No users found</p>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="border-b border-tetri-border bg-tetri-bg">
                {['User', 'Email', 'Workspace', 'Role', 'Status', 'Last Login', 'Joined', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const ws = primaryWorkspace(u);
                return (
                  <tr
                    key={u.id}
                    onClick={() => navigate(`/users/${u.id}`)}
                    className="border-b border-tetri-border last:border-0 hover:bg-tetri-bg/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <UserInitials name={u.fullName} email={u.email} />
                        <p className="font-medium text-tetri-text">{u.fullName || '—'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-tetri-neutral text-xs">{u.email}</td>
                    <td className="px-4 py-3 text-tetri-neutral text-xs truncate max-w-[140px]">
                      {ws?.workspace?.company?.companyName || ws?.workspace?.name || '—'}
                      {u._count?.workspaceMemberships > 1 && (
                        <span className="ml-1 text-tetri-muted">+{u._count.workspaceMemberships - 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-tetri-neutral capitalize">{ws?.role || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                    <td className="px-4 py-3 text-tetri-neutral text-xs">{fmtDate(u.lastLoginAt)}</td>
                    <td className="px-4 py-3 text-tetri-neutral text-xs">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-tetri-muted" /></td>
                  </tr>
                );
              })}
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
