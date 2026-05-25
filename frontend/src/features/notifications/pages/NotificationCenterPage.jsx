import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, Archive, Clock, ExternalLink, RefreshCw, Trash2,
  Search, X, ShieldAlert, Building2, CreditCard, Users, FileText,
  ShoppingCart, CheckSquare, FolderOpen, ShieldCheck, Brain,
} from 'lucide-react';
import {
  listNotifications, markRead, markAllRead, archiveNotification,
  snoozeNotification, deleteNotification,
} from '../services/notificationService';

// ── Deep link resolver ─────────────────────────────────────

const resolveLink = (item) => {
  const { moduleType, sourceId } = item;
  if (!sourceId) return null;
  const map = {
    invoice:    `/invoices/${sourceId}`,
    payment:    `/payments/${sourceId}`,
    expense:    `/expenses/${sourceId}`,
    compliance: `/compliance/occurrences/${sourceId}`,
    workspace:  '/settings',
    billing:    '/billing',
    security:   '/settings',
    file:       '/files',
  };
  return map[moduleType] || null;
};

// ── Category meta ──────────────────────────────────────────

const CATEGORY_META = {
  security:   { label: 'Security',    icon: ShieldAlert,   color: 'bg-red-50 text-red-600 border-red-200' },
  workspace:  { label: 'Workspace',   icon: Building2,     color: 'bg-slate-50 text-slate-600 border-slate-200' },
  billing:    { label: 'Billing',     icon: CreditCard,    color: 'bg-violet-50 text-violet-600 border-violet-200' },
  customer:   { label: 'Customer',    icon: Users,         color: 'bg-blue-50 text-blue-600 border-blue-200' },
  invoice:    { label: 'Invoice',     icon: FileText,      color: 'bg-blue-50 text-blue-600 border-blue-200' },
  payment:    { label: 'Payment',     icon: CreditCard,    color: 'bg-green-50 text-green-600 border-green-200' },
  expense:    { label: 'Expense',     icon: ShoppingCart,  color: 'bg-orange-50 text-orange-600 border-orange-200' },
  approval:   { label: 'Approval',    icon: CheckSquare,   color: 'bg-amber-50 text-amber-600 border-amber-200' },
  file:       { label: 'File',        icon: FolderOpen,    color: 'bg-teal-50 text-teal-600 border-teal-200' },
  compliance: { label: 'Compliance',  icon: ShieldCheck,   color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  system:     { label: 'System',      icon: Bell,          color: 'bg-slate-50 text-slate-600 border-slate-200' },
  ai:         { label: 'AI',          icon: Brain,         color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  // legacy types from Slice 9.2
  reminder:   { label: 'Reminder',    icon: Bell,          color: 'bg-blue-50 text-blue-600 border-blue-200' },
  escalation: { label: 'Escalation',  icon: ShieldAlert,   color: 'bg-red-50 text-red-600 border-red-200' },
  alert:      { label: 'Alert',       icon: ShieldAlert,   color: 'bg-red-50 text-red-600 border-red-200' },
  info:       { label: 'Info',        icon: Bell,          color: 'bg-blue-50 text-blue-600 border-blue-200' },
};

const PRIORITY_DOT = {
  critical: 'bg-red-500',
  high:     'bg-orange-400',
  medium:   'bg-blue-400',
  low:      'bg-slate-300',
};

const SNOOZE_OPTIONS = [
  { label: '1 day',  days: 1 },
  { label: '3 days', days: 3 },
  { label: '7 days', days: 7 },
];

const TABS = [
  { label: 'All',      status: '' },
  { label: 'Unread',   status: 'sent' },
  { label: 'Read',     status: 'read' },
  { label: 'Archived', status: 'archived' },
];

const MODULE_FILTERS = [
  { label: 'All modules', value: '' },
  { label: 'Invoice',     value: 'invoice' },
  { label: 'Expense',     value: 'expense' },
  { label: 'Compliance',  value: 'compliance' },
  { label: 'Workspace',   value: 'workspace' },
  { label: 'Billing',     value: 'billing' },
  { label: 'Security',    value: 'security' },
];

const timeSince = (date) => {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function NotificationCenterPage() {
  const navigate = useNavigate();

  const [items, setItems]               = useState([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [pages, setPages]               = useState(1);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [search, setSearch]             = useState('');
  const [searchInput, setSearchInput]   = useState('');
  const [snoozePicker, setSnoozePicker] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      if (activeTab)    params.status     = activeTab;
      if (moduleFilter) params.moduleType = moduleFilter;
      if (search)       params.search     = search;
      const d = await listNotifications(params);
      setItems(d.items || []);
      setTotal(d.total || 0);
      setPages(d.pages || 1);
    } catch {}
    setLoading(false);
  }, [page, activeTab, moduleFilter, search]);

  useEffect(() => { load(); }, [load]);

  const switchTab = (status) => { setActiveTab(status); setPage(1); };
  const switchModule = (m) => { setModuleFilter(m); setPage(1); };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const clearSearch = () => { setSearch(''); setSearchInput(''); setPage(1); };

  const handleMarkRead = async (id) => {
    await markRead(id);
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, status: 'read', readAt: new Date() } : n));
  };

  const handleMarkAll = async () => { await markAllRead(); load(); };

  const handleArchive = async (id) => {
    await archiveNotification(id);
    setItems((prev) => prev.filter((n) => n.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    setItems((prev) => prev.filter((n) => n.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  };

  const handleSnooze = async (id, days) => {
    const until = new Date();
    until.setDate(until.getDate() + days);
    await snoozeNotification(id, until.toISOString());
    setSnoozePicker(null);
    load();
  };

  const handleView = (item) => {
    if (!item.readAt) handleMarkRead(item.id).catch(() => {});
    const link = resolveLink(item);
    if (link) navigate(link);
  };

  const CategoryBadge = ({ type, moduleType }) => {
    const key = moduleType || type || 'system';
    const meta = CATEGORY_META[key] || CATEGORY_META.system;
    const Icon = meta.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded border ${meta.color}`}>
        <Icon className="w-2.5 h-2.5" />{meta.label}
      </span>
    );
  };

  const unreadCount = items.filter((n) => !n.readAt).length;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-tetri-text flex items-center gap-2">
            <Bell className="w-5 h-5 text-tetri-blue" /> Notifications
          </h1>
          <p className="text-sm text-tetri-muted mt-0.5">{total} notification{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/settings/notifications')}
            className="px-3 py-1.5 text-xs text-tetri-neutral border border-tetri-border rounded-lg hover:bg-tetri-bg transition-colors"
          >
            Preferences
          </button>
          <button onClick={load} className="p-2 rounded-lg text-tetri-neutral hover:bg-tetri-bg" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-tetri-blue border border-tetri-blue/30 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-tetri-border">
        {TABS.map(({ label, status }) => (
          <button
            key={status}
            onClick={() => switchTab(status)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === status
                ? 'border-tetri-blue text-tetri-blue'
                : 'border-transparent text-tetri-muted hover:text-tetri-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search + Module filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 bg-tetri-surface border border-tetri-border rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-tetri-neutral flex-shrink-0" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search notifications…"
            className="flex-1 text-sm bg-transparent outline-none text-tetri-text placeholder-tetri-neutral"
          />
          {searchInput && (
            <button type="button" onClick={clearSearch} className="text-tetri-neutral hover:text-tetri-text">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
        <div className="flex flex-wrap gap-1.5">
          {MODULE_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => switchModule(value)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                moduleFilter === value
                  ? 'bg-tetri-blue text-white border-tetri-blue'
                  : 'text-tetri-muted border-tetri-border hover:border-tetri-blue/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-tetri-surface border border-tetri-border rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-sm text-tetri-neutral text-center py-12">Loading…</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-10 h-10 text-tetri-border mx-auto mb-3" />
            <p className="text-sm font-medium text-tetri-muted">
              {activeTab === 'sent'     ? "No unread notifications. You're all caught up." :
               activeTab === 'archived' ? 'No archived notifications.' :
               'No notifications yet.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-tetri-border">
            {items.map((item) => {
              const link = resolveLink(item);
              return (
                <li
                  key={item.id}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-tetri-bg transition-colors ${!item.readAt ? 'bg-blue-50/20' : ''}`}
                >
                  <div className="flex-shrink-0 mt-1.5">
                    <span className={`w-2 h-2 rounded-full block ${PRIORITY_DOT[item.priority] || 'bg-slate-300'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryBadge type={item.type} moduleType={item.moduleType} />
                      <span className="text-[11px] text-tetri-neutral">{timeSince(item.createdAt)}</span>
                      {!item.readAt && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                    </div>
                    <p className={`text-sm font-medium ${!item.readAt ? 'text-tetri-text' : 'text-tetri-muted'}`}>{item.title}</p>
                    {item.body && (
                      <p className="text-xs text-tetri-neutral mt-0.5 line-clamp-2">{item.body}</p>
                    )}

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {link && (
                        <button
                          onClick={() => handleView(item)}
                          className="text-xs text-tetri-blue hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> View
                        </button>
                      )}
                      {!item.readAt && (
                        <button onClick={() => handleMarkRead(item.id)} className="text-xs text-tetri-neutral hover:text-tetri-text">
                          Mark read
                        </button>
                      )}
                      <div className="relative">
                        <button
                          onClick={() => setSnoozePicker(snoozePicker === item.id ? null : item.id)}
                          className="text-xs text-tetri-neutral hover:text-tetri-text flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3" /> Snooze
                        </button>
                        {snoozePicker === item.id && (
                          <div className="absolute left-0 top-full mt-1 bg-tetri-surface border border-tetri-border rounded-xl shadow-lg py-1 z-10 min-w-[100px]">
                            {SNOOZE_OPTIONS.map(({ label, days }) => (
                              <button
                                key={days}
                                onClick={() => handleSnooze(item.id, days)}
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-tetri-bg text-tetri-text"
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {item.status !== 'archived' && (
                        <button onClick={() => handleArchive(item.id)} className="text-xs text-tetri-neutral hover:text-tetri-muted flex items-center gap-1">
                          <Archive className="w-3 h-3" /> Archive
                        </button>
                      )}
                      <button onClick={() => handleDelete(item.id)} className="text-xs text-tetri-neutral hover:text-tetri-error flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-tetri-border rounded-lg disabled:opacity-40 hover:bg-tetri-bg">Prev</button>
          <span className="text-sm text-tetri-muted">{page} / {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1.5 text-sm border border-tetri-border rounded-lg disabled:opacity-40 hover:bg-tetri-bg">Next</button>
        </div>
      )}
    </div>
  );
}
