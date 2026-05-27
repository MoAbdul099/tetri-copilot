import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Plus, RefreshCw, Loader2, AlertCircle, CheckCircle, XCircle,
  Clock, Play, Ban, AlertTriangle, ChevronRight, Filter,
} from 'lucide-react';
import { getDashboard, listActions, createAction, submitAction, cancelAction, getRegistry } from '../services/aiActionService.js';

const STATUS_CONFIG = {
  draft:            { label: 'Draft',            color: 'text-slate-500',  bg: 'bg-slate-100',  icon: Clock },
  pending_approval: { label: 'Pending Approval', color: 'text-amber-600',  bg: 'bg-amber-100',  icon: Clock },
  approved:         { label: 'Approved',         color: 'text-blue-600',   bg: 'bg-blue-100',   icon: CheckCircle },
  rejected:         { label: 'Rejected',         color: 'text-red-600',    bg: 'bg-red-100',    icon: XCircle },
  executing:        { label: 'Executing',        color: 'text-violet-600', bg: 'bg-violet-100', icon: Loader2 },
  completed:        { label: 'Completed',        color: 'text-emerald-600',bg: 'bg-emerald-100',icon: CheckCircle },
  failed:           { label: 'Failed',           color: 'text-red-600',    bg: 'bg-red-100',    icon: XCircle },
  cancelled:        { label: 'Cancelled',        color: 'text-slate-400',  bg: 'bg-slate-100',  icon: Ban },
  expired:          { label: 'Expired',          color: 'text-slate-400',  bg: 'bg-slate-100',  icon: AlertTriangle },
};

const RISK_CONFIG = {
  low:      { label: 'Low',      color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  medium:   { label: 'Medium',   color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200'   },
  high:     { label: 'High',     color: 'text-orange-600',  bg: 'bg-orange-50 border-orange-200' },
  critical: { label: 'Critical', color: 'text-red-600',     bg: 'bg-red-50 border-red-200'       },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function RiskBadge({ level }) {
  const cfg = RISK_CONFIG[level] || RISK_CONFIG.medium;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded border capitalize ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function ConfidencePill({ score }) {
  const label = score >= 75 ? 'High' : score >= 50 ? 'Medium' : 'Low';
  const color = score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-slate-500';
  return <span className={`text-xs font-medium ${color}`}>{label} ({score}%)</span>;
}

// ── Create Action Modal ───────────────────────────────────────────────────────
function CreateActionModal({ actionTypes, onClose, onCreate }) {
  const [form, setForm] = useState({
    actionType: '', module: '', title: '', description: '',
    confidenceScore: 75, riskLevel: '', explanation: '',
    expectedOutcome: '', payload: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleTypeChange(key) {
    const meta = actionTypes.find(t => t.key === key);
    set('actionType', key);
    if (meta) { set('module', meta.module); set('riskLevel', meta.defaultRisk); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.actionType || !form.title || !form.description) {
      setErr('Action type, title, and description are required.'); return;
    }
    setSaving(true); setErr('');
    try {
      let payload = null;
      if (form.payload.trim()) {
        try { payload = JSON.parse(form.payload); } catch { setErr('Payload must be valid JSON.'); setSaving(false); return; }
      }
      const action = await createAction({ ...form, payload });
      onCreate(action);
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Create AI Action Proposal</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Action Type *</label>
            <select
              value={form.actionType}
              onChange={e => handleTypeChange(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select action type…</option>
              {actionTypes.map(t => (
                <option key={t.key} value={t.key}>{t.label} — {t.module}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <input
              type="text" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Short descriptive title…"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
            <textarea
              value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Describe what this action will do…"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Confidence Score</label>
              <input
                type="number" min="0" max="100" value={form.confidenceScore}
                onChange={e => set('confidenceScore', parseInt(e.target.value) || 0)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Risk Level</label>
              <select
                value={form.riskLevel} onChange={e => set('riskLevel', e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Auto-detect</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Explanation (why generated)</label>
            <textarea
              value={form.explanation} onChange={e => set('explanation', e.target.value)}
              rows={2} placeholder="Why was this action generated?"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Expected Outcome</label>
            <input
              type="text" value={form.expectedOutcome} onChange={e => set('expectedOutcome', e.target.value)}
              placeholder="What outcome is expected?"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Create Action
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Action row ────────────────────────────────────────────────────────────────
function ActionRow({ action, onNavigate, onSubmit, onCancel }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <StatusBadge status={action.status} />
          <RiskBadge level={action.riskLevel} />
          <span className="text-xs text-slate-400">{action.module} / {action.actionType.replace(/_/g, ' ')}</span>
        </div>
        <p className="text-sm font-medium text-slate-800 truncate">{action.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {new Date(action.createdAt).toLocaleDateString()} · <ConfidencePill score={action.confidenceScore} />
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {action.status === 'draft' && (
          <button
            onClick={() => onSubmit(action.id)}
            className="text-xs px-2.5 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
          >Submit</button>
        )}
        {['draft', 'pending_approval'].includes(action.status) && (
          <button
            onClick={() => onCancel(action.id)}
            className="text-xs px-2.5 py-1 rounded border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >Cancel</button>
        )}
        <button
          onClick={() => onNavigate(action.id)}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'all',             label: 'All' },
  { id: 'draft',           label: 'Draft' },
  { id: 'pending_approval',label: 'Pending Approval' },
  { id: 'approved',        label: 'Approved' },
  { id: 'completed',       label: 'Completed' },
  { id: 'failed',          label: 'Failed' },
  { id: 'rejected',        label: 'Rejected' },
];

export default function AiActionCenterPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard]   = useState(null);
  const [actions, setActions]       = useState([]);
  const [total, setTotal]           = useState(0);
  const [actionTypes, setActionTypes] = useState([]);
  const [activeTab, setActiveTab]   = useState('all');
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [err, setErr]               = useState('');

  const load = useCallback(async (tab = activeTab) => {
    setLoading(true); setErr('');
    try {
      const status = tab === 'all' ? undefined : tab;
      const [dash, result, types] = await Promise.all([
        getDashboard(),
        listActions({ status, pageSize: 50 }),
        getRegistry(),
      ]);
      setDashboard(dash);
      setActions(result.items);
      setTotal(result.total);
      setActionTypes(types);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { load(activeTab); }, [activeTab]);

  function switchTab(id) { setActiveTab(id); }

  async function handleSubmit(id) {
    try {
      await submitAction(id);
      load(activeTab);
    } catch (e) { setErr(e.response?.data?.error || e.message); }
  }

  async function handleCancel(id) {
    if (!confirm('Cancel this action?')) return;
    try {
      await cancelAction(id);
      load(activeTab);
    } catch (e) { setErr(e.response?.data?.error || e.message); }
  }

  const counts = dashboard?.statusCounts || {};

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-100">
            <Zap className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">AI Action Center</h1>
            <p className="text-sm text-slate-500">Manage AI-proposed actions across the platform</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Action
        </button>
      </div>

      {err && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {err}
        </div>
      )}

      {/* Stats */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { key: 'pending_approval', label: 'Pending',   color: 'text-amber-600' },
            { key: 'approved',         label: 'Approved',  color: 'text-blue-600' },
            { key: 'executing',        label: 'Executing', color: 'text-violet-600' },
            { key: 'completed',        label: 'Completed', color: 'text-emerald-600' },
            { key: 'failed',           label: 'Failed',    color: 'text-red-600' },
          ].map(({ key, label, color }) => (
            <div key={key} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{counts[key] || 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Governance mode chip */}
      {dashboard?.governanceMode && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-slate-500">Governance mode:</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 capitalize">{dashboard.governanceMode}</span>
          <button onClick={() => navigate('/ai/governance')} className="text-xs text-blue-600 hover:underline">Configure →</button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-4">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.id !== 'all' && counts[tab.id] > 0 && (
                <span className="ml-1.5 text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{counts[tab.id]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Actions list */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
        ) : actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Zap className="w-8 h-8 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600 mb-1">No actions found</p>
            <p className="text-xs text-slate-400">Create an AI action proposal to get started.</p>
          </div>
        ) : (
          <>
            {actions.map(a => (
              <ActionRow
                key={a.id} action={a}
                onNavigate={(id) => navigate(`/ai/actions/${id}`)}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            ))}
            {total > actions.length && (
              <p className="text-xs text-slate-400 text-center py-3">Showing {actions.length} of {total} actions</p>
            )}
          </>
        )}
      </div>

      {showCreate && (
        <CreateActionModal
          actionTypes={actionTypes}
          onClose={() => setShowCreate(false)}
          onCreate={() => load(activeTab)}
        />
      )}
    </div>
  );
}
