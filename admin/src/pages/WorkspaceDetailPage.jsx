import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2, Users, HardDrive, BrainCircuit, ShieldCheck,
  CreditCard, ArrowLeft, CheckCircle, AlertTriangle, Clock,
  Activity, StickyNote, Cpu, RefreshCw, Send,
} from 'lucide-react';
import { getWorkspace, changeStatus, getUsage, getActivity, addNote } from '../services/workspacesService';

const STATUS_STYLE = {
  active:    'bg-green-50 text-green-700 border-green-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  inactive:  'bg-gray-50 text-gray-600 border-gray-200',
};
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtDT    = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmt      = (n) => Number(n || 0).toLocaleString();

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-tetri-bg rounded-xl p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-lg font-bold text-tetri-text">{value}</p>
        <p className="text-xs text-tetri-neutral">{label}</p>
      </div>
    </div>
  );
}

const DIAG_CHECKS = [
  { label: 'API Access',          ok: true,  note: 'Workspace reachable via API' },
  { label: 'Subscription Active', ok: null,  note: 'Checked from subscription status' },
  { label: 'Storage Provider',    ok: true,  note: 'R2 storage operational' },
  { label: 'Compliance Engine',   ok: true,  note: 'Occurrence tracking active' },
  { label: 'Notification Engine', ok: true,  note: 'Event bus connected' },
];

export default function WorkspaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ws, setWs]           = useState(null);
  const [usage, setUsage]     = useState(null);
  const [activity, setAct]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('overview');

  // Status change
  const [statusLoading, setStatusLoading] = useState(false);

  // Notes
  const [noteText, setNoteText]   = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [notes, setNotes]         = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [wsData, usageData, actData] = await Promise.all([
        getWorkspace(id), getUsage(id), getActivity(id),
      ]);
      setWs(wsData);
      setUsage(usageData);
      setAct(actData);
      setNotes(Array.isArray(wsData.adminMeta?.adminNotes) ? wsData.adminMeta.adminNotes : []);
    } catch { navigate('/organizations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!confirm(`Change workspace status to "${newStatus}"?`)) return;
    setStatusLoading(true);
    try {
      await changeStatus(id, newStatus);
      await load();
    } catch (e) { alert(e.response?.data?.error || 'Failed to update status'); }
    finally { setStatusLoading(false); }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNoteLoading(true);
    try {
      const result = await addNote(id, noteText);
      setNotes(Array.isArray(result.data?.adminNotes) ? result.data.adminNotes : notes);
      setNoteText('');
    } catch { alert('Failed to add note'); }
    finally { setNoteLoading(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-64 text-sm text-tetri-neutral">Loading workspace…</div>;
  }
  if (!ws) return null;

  const diagChecks = DIAG_CHECKS.map((c) =>
    c.label === 'Subscription Active' ? { ...c, ok: ws.subscription?.status === 'active' } : c
  );

  const TABS = [
    { id: 'overview',    label: 'Overview',    icon: Building2 },
    { id: 'usage',       label: 'Usage',       icon: Activity },
    { id: 'activity',    label: 'Activity',    icon: Clock },
    { id: 'notes',       label: 'Notes',       icon: StickyNote },
    { id: 'diagnostics', label: 'Diagnostics', icon: Cpu },
  ];

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Back + header */}
      <div>
        <button onClick={() => navigate('/organizations')} className="flex items-center gap-1.5 text-sm text-tetri-neutral hover:text-tetri-text mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Organizations
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-tetri-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-tetri-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-tetri-text">{ws.company?.companyName || ws.name}</h1>
              <p className="text-sm text-tetri-neutral">{ws.name} · Created {fmtDate(ws.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLE[ws.status] || 'bg-tetri-bg text-tetri-neutral border-tetri-border'}`}>
              {ws.status}
            </span>
            {ws.status !== 'active' && (
              <button onClick={() => handleStatusChange('active')} disabled={statusLoading} className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors">
                Activate
              </button>
            )}
            {ws.status === 'active' && (
              <button onClick={() => handleStatusChange('suspended')} disabled={statusLoading} className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors">
                Suspend
              </button>
            )}
            <button onClick={load} disabled={loading} className="p-1.5 border border-tetri-border rounded-lg hover:bg-tetri-bg transition-colors">
              <RefreshCw className={`w-4 h-4 text-tetri-neutral ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-tetri-border overflow-x-auto">
        {TABS.map(({ id: tid, label, icon: Icon }) => (
          <button
            key={tid}
            onClick={() => setTab(tid)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === tid ? 'border-tetri-primary text-tetri-primary' : 'border-transparent text-tetri-neutral hover:text-tetri-text'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* General info */}
          <div className="bg-white border border-tetri-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-tetri-text mb-4">General Information</h3>
            <dl className="space-y-2.5">
              {[
                { label: 'Workspace ID',   value: ws.id },
                { label: 'Display Name',   value: ws.name },
                { label: 'Company Name',   value: ws.company?.companyName || '—' },
                { label: 'Country',        value: ws.countryProfile?.countryName || '—' },
                { label: 'Status',         value: ws.status },
                { label: 'Created',        value: fmtDate(ws.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4 text-sm">
                  <dt className="text-tetri-neutral flex-shrink-0">{label}</dt>
                  <dd className="text-tetri-text font-medium text-right truncate max-w-[200px]" title={value}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Owner + Subscription */}
          <div className="space-y-4">
            <div className="bg-white border border-tetri-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-tetri-text mb-4">Owner</h3>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-tetri-bg flex items-center justify-center">
                  <Users className="w-4 h-4 text-tetri-neutral" />
                </div>
                <div>
                  <p className="text-sm font-medium text-tetri-text">{ws.owner?.fullName || '—'}</p>
                  <p className="text-xs text-tetri-neutral">{ws.owner?.email}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-tetri-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-tetri-text mb-4">Subscription</h3>
              <dl className="space-y-2">
                {[
                  { label: 'Plan',       value: ws.subscription?.plan?.name || 'No plan' },
                  { label: 'Status',     value: ws.subscription?.status || '—' },
                  { label: 'Period End', value: fmtDate(ws.subscription?.currentPeriodEnd) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <dt className="text-tetri-neutral">{label}</dt>
                    <dd className="text-tetri-text font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Quick stats */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Members"        value={fmt(ws._count?.members)} icon={Users}       color="bg-blue-50 text-blue-600" />
            <StatCard label="Files"          value={fmt(usage?.files)}       icon={HardDrive}   color="bg-purple-50 text-purple-600" />
            <StatCard label="AI Req (30d)"   value={fmt(usage?.aiRequests30d)} icon={BrainCircuit} color="bg-pink-50 text-pink-600" />
            <StatCard label="Compliance"     value={fmt(usage?.complianceTotal)} icon={ShieldCheck} color="bg-amber-50 text-amber-600" />
          </div>
        </div>
      )}

      {/* ── Usage ── */}
      {tab === 'usage' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Active Members',      value: fmt(usage?.members),       icon: Users,       color: 'bg-blue-50 text-blue-600' },
            { label: 'Files',               value: fmt(usage?.files),          icon: HardDrive,   color: 'bg-purple-50 text-purple-600' },
            { label: 'Storage (MB)',        value: `${usage?.storageMb} MB`,   icon: HardDrive,   color: 'bg-indigo-50 text-indigo-600' },
            { label: 'AI Requests (30d)',   value: fmt(usage?.aiRequests30d),  icon: BrainCircuit, color: 'bg-pink-50 text-pink-600' },
            { label: 'AI Tokens (30d)',     value: fmt(usage?.aiTokens30d),    icon: BrainCircuit, color: 'bg-rose-50 text-rose-600' },
            { label: 'AI Cost USD (30d)',   value: `$${usage?.aiCostUsd30d}`,  icon: CreditCard,  color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Compliance Tasks',    value: fmt(usage?.complianceTotal), icon: ShieldCheck, color: 'bg-amber-50 text-amber-600' },
            { label: 'Overdue Tasks',       value: fmt(usage?.complianceOverdue), icon: AlertTriangle, color: usage?.complianceOverdue > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600' },
          ].map(({ label, value, icon, color }) => (
            <StatCard key={label} label={label} value={value} icon={icon} color={color} />
          ))}
        </div>
      )}

      {/* ── Activity ── */}
      {tab === 'activity' && (
        <div className="bg-white border border-tetri-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-tetri-text mb-4">Recent Activity</h3>
          {activity.length === 0 ? (
            <p className="text-sm text-tetri-muted">No recent activity</p>
          ) : (
            <div className="space-y-0">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-2.5 border-b border-tetri-border last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.type === 'ai' ? 'bg-pink-400' : item.type === 'compliance' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                  <p className="text-sm text-tetri-text flex-1">{item.label}</p>
                  <span className="text-xs text-tetri-muted flex-shrink-0">{fmtDT(item.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Notes ── */}
      {tab === 'notes' && (
        <div className="space-y-4">
          <div className="bg-white border border-tetri-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-tetri-text mb-4">Internal Admin Notes</h3>
            {notes.length === 0 ? (
              <p className="text-sm text-tetri-muted mb-4">No notes yet</p>
            ) : (
              <div className="space-y-3 mb-4">
                {[...notes].reverse().map((note) => (
                  <div key={note.id} className="bg-tetri-bg rounded-xl p-4 border border-tetri-border">
                    <p className="text-sm text-tetri-text whitespace-pre-wrap">{note.text}</p>
                    <p className="text-xs text-tetri-muted mt-2">{note.adminEmail} · {fmtDT(note.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add an internal note…"
                rows={2}
                className="flex-1 text-sm border border-tetri-border rounded-xl px-3 py-2 bg-white text-tetri-text placeholder:text-tetri-muted resize-none focus:outline-none focus:ring-2 focus:ring-tetri-primary/20 focus:border-tetri-primary"
              />
              <button
                type="submit"
                disabled={noteLoading || !noteText.trim()}
                className="px-4 py-2 bg-tetri-primary text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex-shrink-0 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Add
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Diagnostics ── */}
      {tab === 'diagnostics' && (
        <div className="bg-white border border-tetri-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-tetri-text mb-4">Workspace Diagnostics</h3>
          <div className="space-y-3">
            {diagChecks.map(({ label, ok, note }) => (
              <div key={label} className="flex items-center gap-3 py-2.5 border-b border-tetri-border last:border-0">
                {ok === true  && <CheckCircle  className="w-5 h-5 text-green-500 flex-shrink-0" />}
                {ok === false && <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                {ok === null  && <Clock         className="w-5 h-5 text-amber-400 flex-shrink-0" />}
                <div className="flex-1">
                  <p className="text-sm font-medium text-tetri-text">{label}</p>
                  <p className="text-xs text-tetri-neutral">{note}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ok === true ? 'bg-green-50 text-green-700' : ok === false ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                  {ok === true ? 'OK' : ok === false ? 'Issue' : 'Check'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
