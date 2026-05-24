import { useState, useEffect, useCallback } from 'react';
import { Siren, CheckCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listEscalations, acknowledgeEscalation } from '../../notifications/services/notificationService';
import { Toast } from '../../../components/shared/Toast.jsx';

const STATUS_BADGE = {
  triggered:    'bg-red-50 text-red-700 border-red-200',
  sent:         'bg-orange-50 text-orange-700 border-orange-200',
  acknowledged: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:    'bg-slate-50 text-slate-500 border-slate-200',
};

export default function EscalationsPage() {
  const navigate                   = useNavigate();
  const [items, setItems]          = useState([]);
  const [total, setTotal]          = useState(0);
  const [page, setPage]            = useState(1);
  const [pages, setPages]          = useState(1);
  const [loading, setLoading]      = useState(true);
  const [statusFilter, setStatus]  = useState('');
  const [toast, setToast]          = useState(null);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const d = await listEscalations(params);
      setItems(d.items || []); setTotal(d.total || 0); setPages(d.pages || 1);
    } catch {}
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeEscalation(id);
      showToast('Escalation acknowledged');
      load();
    } catch { showToast('Failed', 'error'); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-tetri-text flex items-center gap-2">
            <Siren className="w-5 h-5 text-red-500" /> Active Escalations
          </h1>
          <p className="text-sm text-tetri-muted mt-0.5">{total} escalation{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'All', value: '' },
          { label: 'Triggered', value: 'triggered' },
          { label: 'Sent', value: 'sent' },
          { label: 'Acknowledged', value: 'acknowledged' },
          { label: 'Resolved', value: 'resolved' },
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => { setStatus(value); setPage(1); }}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${statusFilter === value ? 'bg-tetri-blue text-white border-tetri-blue' : 'text-tetri-muted border-tetri-border hover:border-tetri-blue/40'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-tetri-surface border border-tetri-border rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-sm text-tetri-neutral text-center py-12">Loading…</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Siren className="w-10 h-10 text-tetri-border mx-auto mb-3" />
            <p className="text-sm font-medium text-tetri-muted">No escalations</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tetri-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Obligation</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Level</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Status</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Triggered</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-tetri-border/50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-tetri-bg transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-tetri-text truncate max-w-xs">{item.occurrence?.name || '—'}</p>
                    <p className="text-xs text-tetri-neutral mt-0.5">Due: {fmt(item.occurrence?.dueDate)}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="w-7 h-7 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center">
                      {item.level}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_BADGE[item.status] || STATUS_BADGE.triggered}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-tetri-muted">{fmt(item.triggeredAt)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {(item.status === 'triggered' || item.status === 'sent') && (
                        <button
                          onClick={() => handleAcknowledge(item.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-tetri-blue border border-tetri-blue/30 rounded-lg hover:bg-blue-50"
                        >
                          <CheckCircle className="w-3 h-3" /> Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/compliance/occurrences/${item.occurrenceId}`)}
                        className="p-1.5 text-tetri-neutral hover:text-tetri-text rounded-lg hover:bg-tetri-bg"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
