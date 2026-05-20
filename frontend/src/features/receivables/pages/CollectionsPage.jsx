import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Activity, ClipboardList, AlertCircle } from 'lucide-react';
import {
  listActivities, createActivity, updateActivity, deleteActivity,
  listPromises, createPromise, updatePromise,
  getQueue,
} from '../services/receivablesService';
import api from '../../../lib/api';
import { useToast } from '../../../components/shared/Toast.jsx';

const ACTIVITY_TYPES = [
  { value: 'phone_call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'escalation', label: 'Escalation' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'other', label: 'Other' },
];

const COLLECTION_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'awaiting_response', label: 'Awaiting Response' },
  { value: 'promise_to_pay', label: 'Promise to Pay' },
  { value: 'partially_settled', label: 'Partially Settled' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'closed', label: 'Closed' },
];

const STATUS_COLOR = {
  pending: 'bg-gray-100 text-gray-700',
  contacted: 'bg-blue-50 text-blue-700',
  awaiting_response: 'bg-yellow-50 text-yellow-700',
  promise_to_pay: 'bg-purple-50 text-purple-700',
  partially_settled: 'bg-orange-50 text-orange-700',
  escalated: 'bg-red-50 text-red-700',
  closed: 'bg-green-50 text-green-700',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const TABS = [
  { key: 'activities', label: 'Activities', icon: Activity },
  { key: 'promises',   label: 'Promises',   icon: ClipboardList },
  { key: 'queue',      label: 'Queue',      icon: AlertCircle },
];

export default function CollectionsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preCustomerId = searchParams.get('customerId') || '';
  const { showToast, ToastContainer } = useToast();

  const [tab, setTab] = useState('activities');
  const [activities, setActivities] = useState({ items: [], total: 0 });
  const [promises, setPromises] = useState({ items: [], total: 0 });
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showForm, setShowForm] = useState(!!preCustomerId);
  const [formMode, setFormMode] = useState('activity');
  const [editTarget, setEditTarget] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customerId: preCustomerId, activityType: 'phone_call', status: 'pending',
    activityDate: new Date().toISOString().split('T')[0], notes: '', outcome: '', nextFollowUpDate: '',
  });
  const [promiseForm, setPromiseForm] = useState({
    customerId: preCustomerId, invoiceId: '', promisedAmount: '', promisedDate: '', notes: '', status: 'pending',
  });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (preCustomerId) params.customerId = preCustomerId;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const [a, p, q] = await Promise.all([
        listActivities(params),
        listPromises({ ...params, search: undefined }),
        getQueue(),
      ]);
      setActivities(a);
      setPromises(p);
      setQueue(q);
    } catch {
      showToast('error', 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, preCustomerId]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    api.get('/api/v1/customers', { params: { status: 'active', limit: 200 } })
      .then(r => setCustomers(r.data?.data?.items || []))
      .catch(() => {});
  }, []);

  const handleSubmitActivity = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.nextFollowUpDate) delete payload.nextFollowUpDate;
      if (editTarget) {
        await updateActivity(editTarget.id, payload);
        showToast('success', 'Activity updated');
      } else {
        await createActivity(payload);
        showToast('success', 'Activity logged');
      }
      setShowForm(false);
      setEditTarget(null);
      loadData();
    } catch {
      showToast('error', 'Failed to save activity');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitPromise = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...promiseForm, promisedAmount: Number(promiseForm.promisedAmount) };
      if (!payload.invoiceId) delete payload.invoiceId;
      await createPromise(payload);
      showToast('success', 'Promise recorded');
      setShowForm(false);
      loadData();
    } catch {
      showToast('error', 'Failed to save promise');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this activity?')) return;
    try {
      await deleteActivity(id);
      showToast('success', 'Activity deleted');
      loadData();
    } catch {
      showToast('error', 'Failed to delete');
    }
  };

  const openEditActivity = (a) => {
    setFormMode('activity');
    setEditTarget(a);
    setForm({
      customerId: a.customer?.id || '',
      activityType: a.activityType,
      status: a.status,
      activityDate: a.activityDate?.split('T')[0] || '',
      notes: a.notes || '',
      outcome: a.outcome || '',
      nextFollowUpDate: a.nextFollowUpDate?.split('T')[0] || '',
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {ToastContainer}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tetri-text">Collections</h1>
          <p className="text-sm text-tetri-muted mt-0.5">Track collection activities and payment commitments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setFormMode('promise'); setEditTarget(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-tetri-border rounded-lg hover:bg-tetri-bg transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            Add Promise
          </button>
          <button
            onClick={() => { setFormMode('activity'); setEditTarget(null); setForm(f => ({ ...f, customerId: preCustomerId })); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-tetri-blue rounded-lg hover:bg-tetri-blue-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Activity
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-tetri-border">
        <div className="flex gap-6">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === key ? 'border-tetri-blue text-tetri-blue' : 'border-transparent text-tetri-muted hover:text-tetri-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {key === 'queue' && queue?.brokenPromises?.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{queue.brokenPromises.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters (for activities tab) */}
      {tab === 'activities' && (
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search activities..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
          >
            <option value="">All statuses</option>
            {COLLECTION_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      )}

      {/* Activities list */}
      {tab === 'activities' && (
        <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-tetri-muted">Loading...</div>
          ) : activities.items.length === 0 ? (
            <div className="p-10 text-center">
              <Activity className="w-8 h-8 text-tetri-muted mx-auto mb-2" />
              <p className="text-sm text-tetri-muted">No collection activities yet</p>
              <button
                onClick={() => { setFormMode('activity'); setShowForm(true); }}
                className="mt-3 px-4 py-2 text-sm text-white bg-tetri-blue rounded-lg"
              >
                Log First Activity
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-tetri-bg border-b border-tetri-border">
                <tr>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Customer</th>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Type</th>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Date</th>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Notes</th>
                  <th className="text-center font-medium text-tetri-muted px-4 py-3">Status</th>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Follow-Up</th>
                  <th className="text-right font-medium text-tetri-muted px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.items.map((a) => (
                  <tr key={a.id} className="border-b border-tetri-border hover:bg-tetri-bg">
                    <td className="px-4 py-3">
                      <p className="font-medium text-tetri-text">{a.customer?.name}</p>
                      <p className="text-xs text-tetri-muted">{a.customer?.customerCode}</p>
                    </td>
                    <td className="px-4 py-3 text-tetri-muted capitalize">{a.activityType?.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-tetri-muted">{fmtDate(a.activityDate)}</td>
                    <td className="px-4 py-3 text-tetri-muted max-w-xs truncate">{a.notes || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[a.status] || 'bg-gray-100 text-gray-700'}`}>
                        {a.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-tetri-muted text-xs">{fmtDate(a.nextFollowUpDate)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEditActivity(a)} className="text-xs text-tetri-blue hover:underline mr-3">Edit</button>
                      <button onClick={() => handleDelete(a.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Promises list */}
      {tab === 'promises' && (
        <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-tetri-muted">Loading...</div>
          ) : promises.items.length === 0 ? (
            <div className="p-10 text-center">
              <ClipboardList className="w-8 h-8 text-tetri-muted mx-auto mb-2" />
              <p className="text-sm text-tetri-muted">No payment promises recorded</p>
              <button
                onClick={() => { setFormMode('promise'); setShowForm(true); }}
                className="mt-3 px-4 py-2 text-sm text-white bg-tetri-blue rounded-lg"
              >
                Record Promise
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-tetri-bg border-b border-tetri-border">
                <tr>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Customer</th>
                  <th className="text-right font-medium text-tetri-muted px-4 py-3">Amount</th>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Promised Date</th>
                  <th className="text-center font-medium text-tetri-muted px-4 py-3">Status</th>
                  <th className="text-left font-medium text-tetri-muted px-4 py-3">Notes</th>
                  <th className="text-right font-medium text-tetri-muted px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promises.items.map((p) => {
                  const isOverdue = p.status === 'pending' && new Date(p.promisedDate) < new Date();
                  return (
                    <tr key={p.id} className={`border-b border-tetri-border hover:bg-tetri-bg ${isOverdue ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-tetri-text">{p.customer?.name}</p>
                        {isOverdue && <span className="text-xs text-red-500 font-medium">Overdue promise</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-tetri-text">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.promisedAmount)}
                      </td>
                      <td className="px-4 py-3 text-tetri-muted">{fmtDate(p.promisedDate)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === 'fulfilled' ? 'bg-green-50 text-green-700' :
                          p.status === 'broken' ? 'bg-red-50 text-red-700' :
                          p.status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
                          'bg-yellow-50 text-yellow-700'
                        }`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3 text-tetri-muted text-xs max-w-xs truncate">{p.notes || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => updatePromise(p.id, { status: 'fulfilled' }).then(loadData)}
                          className="text-xs text-emerald-600 hover:underline mr-2"
                        >
                          Mark Fulfilled
                        </button>
                        <button
                          onClick={() => updatePromise(p.id, { status: 'broken' }).then(loadData)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Broken
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Queue tab */}
      {tab === 'queue' && queue && (
        <div className="space-y-6">
          {queue.brokenPromises.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-card p-5">
              <h3 className="font-semibold text-red-700 mb-3">Broken Promises ({queue.brokenPromises.length})</h3>
              <div className="space-y-2">
                {queue.brokenPromises.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-tetri-text">{p.customer?.name}</p>
                      <p className="text-xs text-tetri-muted">Promised {fmtDate(p.promisedDate)}</p>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.promisedAmount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {queue.upcomingFollowUps.length > 0 && (
            <div className="bg-tetri-surface border border-tetri-border rounded-card p-5">
              <h3 className="font-semibold text-tetri-text mb-3">Upcoming Follow-Ups</h3>
              <div className="space-y-2">
                {queue.upcomingFollowUps.map((a) => (
                  <div key={a.id} className="flex items-center justify-between border-b border-tetri-border pb-2">
                    <div>
                      <p className="text-sm font-medium text-tetri-text">{a.customer?.name}</p>
                      <p className="text-xs text-tetri-muted">{a.activityType?.replace('_', ' ')} · Follow-up {fmtDate(a.nextFollowUpDate)}</p>
                    </div>
                    <button onClick={() => openEditActivity(a)} className="text-xs text-tetri-blue hover:underline">Update</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {queue.brokenPromises.length === 0 && queue.upcomingFollowUps.length === 0 && (
            <div className="text-center py-16">
              <Activity className="w-10 h-10 text-tetri-muted mx-auto mb-3" />
              <p className="text-tetri-muted">No urgent items in queue</p>
            </div>
          )}
        </div>
      )}

      {/* Activity form modal */}
      {showForm && formMode === 'activity' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-tetri-surface rounded-card border border-tetri-border w-full max-w-lg shadow-xl">
            <div className="px-6 py-4 border-b border-tetri-border">
              <h2 className="font-semibold text-tetri-text">{editTarget ? 'Edit Activity' : 'Log Collection Activity'}</h2>
            </div>
            <form onSubmit={handleSubmitActivity} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-tetri-muted mb-1 block">Customer *</label>
                <select
                  required
                  value={form.customerId}
                  onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
                >
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-tetri-muted mb-1 block">Activity Type *</label>
                  <select
                    value={form.activityType}
                    onChange={e => setForm(f => ({ ...f, activityType: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
                  >
                    {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-tetri-muted mb-1 block">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
                  >
                    {COLLECTION_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-tetri-muted mb-1 block">Activity Date *</label>
                  <input
                    type="date"
                    required
                    value={form.activityDate}
                    onChange={e => setForm(f => ({ ...f, activityDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-tetri-muted mb-1 block">Next Follow-Up</label>
                  <input
                    type="date"
                    value={form.nextFollowUpDate}
                    onChange={e => setForm(f => ({ ...f, nextFollowUpDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-tetri-muted mb-1 block">Notes *</label>
                <textarea
                  required
                  rows={3}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="What happened during this activity?"
                  className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-tetri-muted mb-1 block">Outcome</label>
                <textarea
                  rows={2}
                  value={form.outcome}
                  onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))}
                  placeholder="Result or next steps..."
                  className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20 resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditTarget(null); }} className="px-4 py-2 text-sm text-tetri-muted border border-tetri-border rounded-lg hover:bg-tetri-bg">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-tetri-blue rounded-lg hover:bg-tetri-blue-hover disabled:opacity-50">
                  {saving ? 'Saving...' : (editTarget ? 'Update' : 'Log Activity')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promise form modal */}
      {showForm && formMode === 'promise' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-tetri-surface rounded-card border border-tetri-border w-full max-w-md shadow-xl">
            <div className="px-6 py-4 border-b border-tetri-border">
              <h2 className="font-semibold text-tetri-text">Record Promise to Pay</h2>
            </div>
            <form onSubmit={handleSubmitPromise} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-tetri-muted mb-1 block">Customer *</label>
                <select
                  required
                  value={promiseForm.customerId}
                  onChange={e => setPromiseForm(f => ({ ...f, customerId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
                >
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-tetri-muted mb-1 block">Promised Amount *</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={promiseForm.promisedAmount}
                    onChange={e => setPromiseForm(f => ({ ...f, promisedAmount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-tetri-muted mb-1 block">Promised Date *</label>
                  <input
                    type="date"
                    required
                    value={promiseForm.promisedDate}
                    onChange={e => setPromiseForm(f => ({ ...f, promisedDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-tetri-muted mb-1 block">Notes</label>
                <textarea
                  rows={3}
                  value={promiseForm.notes}
                  onChange={e => setPromiseForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Context or conditions..."
                  className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20 resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-tetri-muted border border-tetri-border rounded-lg hover:bg-tetri-bg">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm text-white bg-tetri-blue rounded-lg hover:bg-tetri-blue-hover disabled:opacity-50">
                  {saving ? 'Saving...' : 'Record Promise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
