import { useState, useEffect, useCallback } from 'react';
import { Siren, Plus, ChevronDown, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react';
import monitoringService from '../services/monitoringService';
import { Toast } from '../../../components/shared/Toast.jsx';

const SEV_COLORS = {
  'SEV-1': 'bg-red-100 text-red-700 border-red-200',
  'SEV-2': 'bg-orange-100 text-orange-700 border-orange-200',
  'SEV-3': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'SEV-4': 'bg-blue-100 text-blue-700 border-blue-200',
};

const STATUS_COLORS = {
  open:          'bg-red-50 text-red-700',
  investigating: 'bg-orange-50 text-orange-700',
  mitigating:    'bg-yellow-50 text-yellow-700',
  resolved:      'bg-emerald-50 text-emerald-700',
};

function Badge({ label, className }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>{label}</span>;
}

function IncidentRow({ incident, onUpdate }) {
  const [open, setOpen]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const [note, setNote]   = useState('');
  const [status, setStatus] = useState(incident.status);

  const timeline = Array.isArray(incident.timeline) ? incident.timeline : [];

  const save = async () => {
    setBusy(true);
    try {
      const updates = { status };
      if (note.trim()) updates.timelineEntry = { event: note.trim(), actor: 'admin' };
      await onUpdate(incident.id, updates);
      setNote('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-tetri-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-tetri-bg transition-colors text-left"
      >
        <span className="mt-0.5">{open ? <ChevronDown className="w-4 h-4 text-tetri-muted" /> : <ChevronRight className="w-4 h-4 text-tetri-muted" />}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-tetri-text">{incident.title}</p>
            <Badge label={incident.severity} className={SEV_COLORS[incident.severity] || 'bg-tetri-bg text-tetri-muted'} />
            <Badge label={incident.status}   className={STATUS_COLORS[incident.status] || 'bg-tetri-bg text-tetri-muted'} />
          </div>
          <p className="text-xs text-tetri-muted">
            {incident.affectedServices ? `Affected: ${incident.affectedServices} · ` : ''}
            Started {new Date(incident.startedAt).toLocaleString()}
            {incident.resolvedAt ? ` · Resolved ${new Date(incident.resolvedAt).toLocaleString()}` : ''}
          </p>
        </div>
      </button>

      {open && (
        <div className="border-t border-tetri-border px-4 py-4 space-y-4 bg-tetri-bg/40">
          {incident.description && (
            <p className="text-sm text-tetri-muted">{incident.description}</p>
          )}

          {timeline.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-tetri-muted">Timeline</p>
              {timeline.map((t, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-xs text-tetri-muted flex-shrink-0 w-36">{new Date(t.at).toLocaleString()}</span>
                  <span className="text-tetri-text">{t.event}</span>
                </div>
              ))}
            </div>
          )}

          {incident.status !== 'resolved' && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-tetri-muted">Update Incident</p>
              <div className="flex flex-wrap gap-2">
                {['open','investigating','mitigating','resolved'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      status === s ? 'bg-tetri-blue text-white border-tetri-blue' : 'border-tetri-border text-tetri-muted hover:bg-tetri-bg'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add timeline note (optional)"
                className="w-full px-3 py-2 rounded-lg border border-tetri-border text-sm bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/30"
              />
              <button
                onClick={save}
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-tetri-blue text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {busy ? 'Saving…' : 'Save Update'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NewIncidentModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', description: '', severity: 'SEV-3', affectedServices: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await onCreate(form); onClose(); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-tetri-surface border border-tetri-border rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-tetri-text mb-4">Open New Incident</h2>
        <form onSubmit={submit} className="space-y-3">
          <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Incident title *" className="w-full px-3 py-2 rounded-lg border border-tetri-border text-sm focus:outline-none focus:ring-2 focus:ring-tetri-blue/30" />
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description (optional)" rows={3}
            className="w-full px-3 py-2 rounded-lg border border-tetri-border text-sm focus:outline-none focus:ring-2 focus:ring-tetri-blue/30 resize-none" />
          <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-tetri-border text-sm focus:outline-none focus:ring-2 focus:ring-tetri-blue/30">
            {['SEV-1','SEV-2','SEV-3','SEV-4'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input value={form.affectedServices} onChange={e => setForm(f => ({ ...f, affectedServices: e.target.value }))}
            placeholder="Affected services (optional)" className="w-full px-3 py-2 rounded-lg border border-tetri-border text-sm focus:outline-none focus:ring-2 focus:ring-tetri-blue/30" />
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-tetri-border text-sm text-tetri-muted hover:bg-tetri-bg transition-colors">Cancel</button>
            <button type="submit" disabled={busy} className="flex-1 px-4 py-2 rounded-lg bg-tetri-blue text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {busy ? 'Creating…' : 'Create Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function IncidentManagementPage() {
  const [incidents, setIncidents] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [showNew,   setShowNew]   = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [toast,     setToast]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await monitoringService.listIncidents({ status: statusFilter || undefined, limit: 50 });
      setIncidents(data.rows || []);
      setTotal(data.total || 0);
    } catch {
      setToast({ type: 'error', message: 'Failed to load incidents' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data) => {
    try {
      await monitoringService.createIncident(data);
      setToast({ type: 'success', message: 'Incident opened' });
      load();
    } catch {
      setToast({ type: 'error', message: 'Failed to create incident' });
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await monitoringService.updateIncident(id, data);
      setToast({ type: 'success', message: 'Incident updated' });
      load();
    } catch {
      setToast({ type: 'error', message: 'Failed to update incident' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      {showNew && <NewIncidentModal onClose={() => setShowNew(false)} onCreate={handleCreate} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-tetri-text flex items-center gap-2">
            <Siren className="w-5 h-5 text-tetri-muted" /> Incident Management
          </h1>
          <p className="text-sm text-tetri-muted mt-0.5">{total} incident{total !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-tetri-border text-sm text-tetri-muted focus:outline-none focus:ring-2 focus:ring-tetri-blue/30">
            <option value="">All statuses</option>
            {['open','investigating','mitigating','resolved'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={load} className="p-1.5 rounded-lg border border-tetri-border text-tetri-muted hover:bg-tetri-bg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-tetri-blue text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Open Incident
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <RefreshCw className="w-5 h-5 text-tetri-muted animate-spin" />
        </div>
      ) : incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-tetri-muted space-y-2">
          <AlertTriangle className="w-8 h-8" />
          <p className="text-sm">No incidents found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {incidents.map(inc => (
            <IncidentRow key={inc.id} incident={inc} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
