import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, User, Shield, Activity, Building2, FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { getUser, changeStatus, getActivity, getSecurity, addNote } from '../services/usersService';

const STATUS_STYLE = {
  active:    'bg-green-50 text-green-700 border-green-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  inactive:  'bg-gray-50 text-gray-600 border-gray-200',
  invited:   'bg-blue-50 text-blue-700 border-blue-200',
};

const SEVERITY_STYLE = {
  critical: 'text-red-700 bg-red-50',
  high:     'text-orange-700 bg-orange-50',
  medium:   'text-yellow-700 bg-yellow-50',
  low:      'text-blue-700 bg-blue-50',
  info:     'text-gray-600 bg-gray-50',
};

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtFull  = (d) => d ? new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmt      = (n) => Number(n || 0).toLocaleString();

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[status] || 'bg-tetri-bg text-tetri-neutral border-tetri-border'}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-tetri-bg rounded-xl p-4">
      <p className="text-xs text-tetri-neutral mb-1">{label}</p>
      <p className="text-lg font-bold text-tetri-text">{value}</p>
      {sub && <p className="text-xs text-tetri-muted mt-0.5">{sub}</p>}
    </div>
  );
}

function UserInitials({ name, email, size = 'md' }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : (email?.[0] || '?').toUpperCase();
  const cls = size === 'lg' ? 'w-12 h-12 text-base' : 'w-8 h-8 text-sm';
  return (
    <div className={`${cls} rounded-full bg-tetri-primary/10 flex items-center justify-center flex-shrink-0`}>
      <span className="font-semibold text-tetri-primary">{initials}</span>
    </div>
  );
}

const TABS = ['Overview', 'Memberships', 'Activity', 'Security', 'Notes'];

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser]           = useState(null);
  const [activity, setActivity]   = useState(null);
  const [security, setSecurity]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('Overview');
  const [statusBusy, setStatusBusy] = useState(false);
  const [noteText, setNoteText]   = useState('');
  const [noteBusy, setNoteBusy]   = useState(false);
  const [error, setError]         = useState('');

  const loadUser = useCallback(async () => {
    setLoading(true);
    try { setUser(await getUser(id)); }
    catch { setError('Failed to load user'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadUser(); }, [loadUser]);

  useEffect(() => {
    if (tab === 'Activity' && !activity) getActivity(id).then(setActivity).catch(() => setActivity([]));
    if (tab === 'Security' && !security) getSecurity(id).then(setSecurity).catch(() => setSecurity({ securityEvents: [], recentActivity: [], aiUsage30d: {} }));
  }, [tab, id, activity, security]);

  const handleStatus = async (status) => {
    setStatusBusy(true);
    try {
      await changeStatus(id, status);
      setUser((u) => ({ ...u, status }));
    } catch { /* ignore */ }
    finally { setStatusBusy(false); }
  };

  const handleNote = async () => {
    if (!noteText.trim()) return;
    setNoteBusy(true);
    try {
      const res = await addNote(id, noteText.trim());
      setUser((u) => ({ ...u, adminMeta: res.data }));
      setNoteText('');
    } catch { /* ignore */ }
    finally { setNoteBusy(false); }
  };

  if (loading) return <div className="py-32 text-center text-tetri-neutral text-sm">Loading…</div>;
  if (!user || error) return (
    <div className="py-32 text-center space-y-3">
      <p className="text-sm text-tetri-neutral">{error || 'User not found'}</p>
      <button onClick={() => navigate('/users')} className="text-sm text-tetri-primary hover:underline">Back to Users</button>
    </div>
  );

  const notes = Array.isArray(user.adminMeta?.adminNotes) ? [...user.adminMeta.adminNotes].reverse() : [];
  const primaryWs = user.workspaceMemberships?.[0];

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Back + Header */}
      <div>
        <button onClick={() => navigate('/users')} className="flex items-center gap-1.5 text-sm text-tetri-neutral hover:text-tetri-text mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <UserInitials name={user.fullName} email={user.email} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-tetri-text">{user.fullName || user.email}</h1>
                <StatusBadge status={user.status} />
              </div>
              <p className="text-sm text-tetri-neutral mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {user.status !== 'active' && (
              <button onClick={() => handleStatus('active')} disabled={statusBusy}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors">
                Activate
              </button>
            )}
            {user.status === 'active' && (
              <button onClick={() => handleStatus('suspended')} disabled={statusBusy}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors">
                Suspend
              </button>
            )}
            <button onClick={loadUser} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-tetri-border bg-white rounded-lg hover:bg-tetri-bg disabled:opacity-60 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-tetri-border overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === t ? 'border-tetri-primary text-tetri-primary' : 'border-transparent text-tetri-neutral hover:text-tetri-text'
            }`}>{t}</button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Profile */}
          <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-tetri-text flex items-center gap-2"><User className="w-4 h-4 text-tetri-primary" /> Profile</h2>
            <dl className="space-y-2 text-sm">
              {[
                ['Full Name', user.fullName || '—'],
                ['Email', user.email],
                ['Phone', user.phone || '—'],
                ['Platform Admin', user.isPlatformAdmin ? 'Yes' : 'No'],
                ['Clerk ID', user.clerkUserId ? user.clerkUserId.slice(0, 20) + '…' : '—'],
                ['Joined', fmtDate(user.createdAt)],
                ['Last Login', fmtFull(user.lastLoginAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-tetri-neutral">{k}</dt>
                  <dd className="text-tetri-text font-medium text-right max-w-[55%] truncate">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Workspace summary */}
          <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-tetri-text flex items-center gap-2"><Building2 className="w-4 h-4 text-tetri-primary" /> Workspace Summary</h2>
            {primaryWs ? (
              <dl className="space-y-2 text-sm">
                {[
                  ['Primary Workspace', primaryWs.workspace?.company?.companyName || primaryWs.workspace?.name || '—'],
                  ['Role', primaryWs.role],
                  ['Membership Status', primaryWs.status],
                  ['Joined Workspace', fmtDate(primaryWs.joinedAt || primaryWs.createdAt)],
                  ['Total Workspaces', fmt(user._count?.workspaceMemberships)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <dt className="text-tetri-neutral">{k}</dt>
                    <dd className="text-tetri-text font-medium capitalize">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-tetri-neutral">No workspace memberships</p>
            )}
          </div>

          {/* Quick stats */}
          <div className="lg:col-span-2 grid grid-cols-3 gap-3">
            <StatCard label="Activity Logs" value={fmt(user._count?.activityLogs)} />
            <StatCard label="AI Requests" value={fmt(user._count?.aiUsageLogs)} />
            <StatCard label="Workspaces" value={fmt(user._count?.workspaceMemberships)} />
          </div>
        </div>
      )}

      {/* ── Memberships ── */}
      {tab === 'Memberships' && (
        <div className="bg-white border border-tetri-border rounded-xl overflow-x-auto">
          {user.workspaceMemberships?.length === 0 ? (
            <div className="py-16 text-center text-tetri-neutral text-sm">No workspace memberships</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tetri-border bg-tetri-bg">
                  {['Workspace', 'Role', 'Status', 'Joined'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {user.workspaceMemberships.map((m) => (
                  <tr key={m.id} className="border-b border-tetri-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-tetri-text">{m.workspace?.company?.companyName || m.workspace?.name || '—'}</p>
                      <p className="text-xs text-tetri-muted">{m.workspace?.name}</p>
                    </td>
                    <td className="px-4 py-3 text-tetri-neutral capitalize">{m.role}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                    <td className="px-4 py-3 text-tetri-neutral text-xs">{fmtDate(m.joinedAt || m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Activity ── */}
      {tab === 'Activity' && (
        <div className="bg-white border border-tetri-border rounded-xl divide-y divide-tetri-border">
          {!activity ? (
            <div className="py-16 text-center text-tetri-neutral text-sm">Loading…</div>
          ) : activity.length === 0 ? (
            <div className="py-16 text-center text-tetri-neutral text-sm">No activity recorded</div>
          ) : activity.map((item) => (
            <div key={item.id} className="flex items-start gap-3 px-5 py-3.5">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.type === 'audit' ? 'bg-purple-400' : 'bg-tetri-primary'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-tetri-text">{item.label}</p>
                {item.description && <p className="text-xs text-tetri-muted mt-0.5 truncate">{item.description}</p>}
                {item.ipAddress && <p className="text-xs text-tetri-muted">IP: {item.ipAddress}</p>}
              </div>
              <p className="text-xs text-tetri-muted flex-shrink-0">{fmtFull(item.createdAt)}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Security ── */}
      {tab === 'Security' && (
        <div className="space-y-5">
          {!security ? (
            <div className="py-16 text-center text-tetri-neutral text-sm">Loading…</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Security Events" value={fmt(security.securityEvents?.length)} />
                <StatCard label="AI Requests (30d)" value={fmt(security.aiUsage30d?.requests)} />
                <StatCard label="AI Tokens (30d)" value={fmt(security.aiUsage30d?.tokens)} sub={`$${security.aiUsage30d?.costUsd || '0.0000'} est.`} />
              </div>

              <div className="bg-white border border-tetri-border rounded-xl">
                <div className="px-5 py-3 border-b border-tetri-border">
                  <h3 className="text-sm font-semibold text-tetri-text flex items-center gap-2"><Shield className="w-4 h-4 text-tetri-primary" /> Security Events</h3>
                </div>
                {security.securityEvents?.length === 0 ? (
                  <div className="py-10 text-center text-tetri-neutral text-sm">No security events</div>
                ) : (
                  <div className="divide-y divide-tetri-border">
                    {security.securityEvents.map((e) => (
                      <div key={e.id} className="flex items-start gap-3 px-5 py-3.5">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize flex-shrink-0 ${SEVERITY_STYLE[e.severity] || SEVERITY_STYLE.info}`}>{e.severity}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-tetri-text">{e.eventType}</p>
                          {e.description && <p className="text-xs text-tetri-muted mt-0.5 truncate">{e.description}</p>}
                        </div>
                        <p className="text-xs text-tetri-muted flex-shrink-0">{fmtFull(e.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-tetri-border rounded-xl">
                <div className="px-5 py-3 border-b border-tetri-border">
                  <h3 className="text-sm font-semibold text-tetri-text flex items-center gap-2"><Activity className="w-4 h-4 text-tetri-primary" /> Recent Login Activity</h3>
                </div>
                {security.recentActivity?.length === 0 ? (
                  <div className="py-10 text-center text-tetri-neutral text-sm">No recent activity</div>
                ) : (
                  <div className="divide-y divide-tetri-border">
                    {security.recentActivity.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                        <Clock className="w-3.5 h-3.5 text-tetri-muted flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-tetri-text">{a.action}</p>
                          {a.ipAddress && <p className="text-xs text-tetri-muted">IP: {a.ipAddress}</p>}
                        </div>
                        <p className="text-xs text-tetri-muted flex-shrink-0">{fmtFull(a.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Notes ── */}
      {tab === 'Notes' && (
        <div className="space-y-4">
          <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-tetri-text flex items-center gap-2"><FileText className="w-4 h-4 text-tetri-primary" /> Add Note</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Internal admin note about this user…"
              rows={3}
              className="w-full text-sm border border-tetri-border rounded-xl px-3 py-2 text-tetri-text placeholder:text-tetri-muted focus:outline-none focus:ring-2 focus:ring-tetri-primary/20 focus:border-tetri-primary resize-none"
            />
            <div className="flex justify-end">
              <button onClick={handleNote} disabled={noteBusy || !noteText.trim()}
                className="px-4 py-2 text-sm bg-tetri-primary text-white rounded-lg hover:bg-tetri-primary/90 disabled:opacity-60 transition-colors">
                {noteBusy ? 'Saving…' : 'Add Note'}
              </button>
            </div>
          </div>

          {notes.length === 0 ? (
            <div className="bg-white border border-tetri-border rounded-xl py-12 text-center text-tetri-neutral text-sm">No admin notes yet</div>
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n.id} className="bg-white border border-tetri-border rounded-xl p-4">
                  <p className="text-sm text-tetri-text">{n.text}</p>
                  <p className="text-xs text-tetri-muted mt-2">{n.adminEmail} · {fmtFull(n.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
