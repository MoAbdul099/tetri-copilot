import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Archive, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listNotifications, markRead, markAllRead, archiveNotification, snoozeNotification } from '../services/notificationService';

const TYPE_BADGE = {
  reminder:   'bg-blue-50 text-blue-700 border-blue-200',
  escalation: 'bg-red-50 text-red-700 border-red-200',
  system:     'bg-slate-50 text-slate-600 border-slate-200',
};

const PRIORITY_DOT = {
  critical: 'bg-red-500',
  high:     'bg-orange-400',
  medium:   'bg-blue-400',
  low:      'bg-slate-300',
};

const SNOOZE_OPTIONS = [
  { label: '1 day',    days: 1 },
  { label: '3 days',   days: 3 },
  { label: '7 days',   days: 7 },
];

export default function NotificationCenterPage() {
  const navigate                      = useNavigate();
  const [items, setItems]             = useState([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [pages, setPages]             = useState(1);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter]   = useState('');
  const [snoozePicker, setSnoozePicker] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter)   params.type   = typeFilter;
      const d = await listNotifications(params);
      setItems(d.items || []);
      setTotal(d.total || 0);
      setPages(d.pages || 1);
    } catch {}
    setLoading(false);
  }, [page, statusFilter, typeFilter]);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id) => {
    await markRead(id);
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, status: 'read', readAt: new Date() } : n));
  };

  const handleMarkAll = async () => {
    await markAllRead();
    load();
  };

  const handleArchive = async (id) => {
    await archiveNotification(id);
    setItems((prev) => prev.filter((n) => n.id !== id));
    setTotal((t) => t - 1);
  };

  const handleSnooze = async (id, days) => {
    const until = new Date();
    until.setDate(until.getDate() + days);
    await snoozeNotification(id, until.toISOString());
    setSnoozePicker(null);
    load();
  };

  const timeSince = (date) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-tetri-text flex items-center gap-2">
            <Bell className="w-5 h-5 text-tetri-blue" /> Notifications
          </h1>
          <p className="text-sm text-tetri-muted mt-0.5">{total} notification{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg text-tetri-neutral hover:bg-tetri-bg">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-tetri-blue border border-tetri-blue/30 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'All', value: '' },
          { label: 'Unread', value: 'sent' },
          { label: 'Read', value: 'read' },
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(1); }}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${statusFilter === value ? 'bg-tetri-blue text-white border-tetri-blue' : 'text-tetri-muted border-tetri-border hover:border-tetri-blue/40'}`}
          >
            {label}
          </button>
        ))}
        <div className="w-px bg-tetri-border" />
        {[
          { label: 'All types', value: '' },
          { label: 'Reminders', value: 'reminder' },
          { label: 'Escalations', value: 'escalation' },
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => { setTypeFilter(value); setPage(1); }}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${typeFilter === value ? 'bg-tetri-blue text-white border-tetri-blue' : 'text-tetri-muted border-tetri-border hover:border-tetri-blue/40'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-tetri-surface border border-tetri-border rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-sm text-tetri-neutral text-center py-12">Loading…</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-10 h-10 text-tetri-border mx-auto mb-3" />
            <p className="text-sm font-medium text-tetri-muted">No notifications</p>
          </div>
        ) : (
          <ul className="divide-y divide-tetri-border">
            {items.map((item) => (
              <li key={item.id} className={`flex items-start gap-4 px-5 py-4 hover:bg-tetri-bg transition-colors ${!item.readAt ? 'bg-blue-50/20' : ''}`}>
                <div className="flex-shrink-0 mt-0.5">
                  <span className={`w-2 h-2 rounded-full block mt-1.5 ${PRIORITY_DOT[item.priority] || 'bg-slate-300'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded border ${TYPE_BADGE[item.type] || TYPE_BADGE.system}`}>
                      {item.type}
                    </span>
                    <span className="text-[11px] text-tetri-neutral">{timeSince(item.createdAt)}</span>
                  </div>
                  <p className={`text-sm font-medium ${!item.readAt ? 'text-tetri-text' : 'text-tetri-muted'}`}>{item.title}</p>
                  <p className="text-xs text-tetri-neutral mt-0.5 line-clamp-2 whitespace-pre-wrap">{item.body}</p>

                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => navigate(`/compliance/occurrences/${item.sourceId}`)}
                      className="text-xs text-tetri-blue hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> View
                    </button>
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
                    <button onClick={() => handleArchive(item.id)} className="text-xs text-tetri-neutral hover:text-tetri-error flex items-center gap-1">
                      <Archive className="w-3 h-3" /> Archive
                    </button>
                  </div>
                </div>
              </li>
            ))}
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
