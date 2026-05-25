import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Megaphone, Send, Archive, Trash2, RefreshCw, Loader2, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import {
  listAnnouncements, publishAnnouncement, archiveAnnouncement,
  deleteAnnouncement, getAnnouncementStats,
} from '../services/announcementsService.js';

const STATUS_BADGE = {
  draft:     'bg-slate-100 text-slate-600',
  published: 'bg-green-100 text-green-700',
  archived:  'bg-amber-100 text-amber-700',
};

const PRIORITY_BADGE = {
  info:        'bg-blue-50 text-blue-700',
  important:   'bg-amber-50 text-amber-700',
  high:        'bg-orange-50 text-orange-700',
  critical:    'bg-red-100 text-red-700',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

function StatCard({ label, value, color = 'text-tetri-text' }) {
  return (
    <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-4">
      <p className={`text-2xl font-bold ${color}`}>{value ?? 0}</p>
      <p className="text-xs text-tetri-neutral mt-1">{label}</p>
    </div>
  );
}

export default function AnnouncementsPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [items, setItems]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]     = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const limit = 20;

  const load = () => {
    setLoading(true);
    Promise.all([
      listAnnouncements({ status: statusFilter || undefined, page, limit }),
      getAnnouncementStats(),
    ])
      .then(([data, s]) => {
        setItems(Array.isArray(data) ? data : (data?.items || []));
        setTotal(data?.total || 0);
        setStats(s);
      })
      .catch(() => showToast('error', 'Failed to load announcements'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter, page]);

  const handlePublish = async (id) => {
    setActionLoading(id + '_pub');
    try { await publishAnnouncement(id); showToast('success', 'Published'); load(); }
    catch (e) { showToast('error', e?.response?.data?.error || 'Failed'); }
    finally { setActionLoading(null); }
  };

  const handleArchive = async (id) => {
    setActionLoading(id + '_arc');
    try { await archiveAnnouncement(id); showToast('success', 'Archived'); load(); }
    catch (e) { showToast('error', e?.response?.data?.error || 'Failed'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteAnnouncement(deleteTarget.id); showToast('success', 'Deleted'); setDeleteTarget(null); load(); }
    catch (e) { showToast('error', e?.response?.data?.error || 'Failed to delete'); }
    finally { setDeleting(false); }
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {ToastContainer}
      <ConfirmDialog
        open={!!deleteTarget} title="Delete Announcement"
        description={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete" variant="destructive" loading={deleting}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
      />

      <PageHeader title="Announcements" subtitle="Broadcast messages to your workspace">
        <Button onClick={() => navigate('/announcements/new')}>
          <Plus className="w-4 h-4 mr-1" /> New Announcement
        </Button>
      </PageHeader>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total"     value={stats.total}     />
          <StatCard label="Published" value={stats.published} color="text-green-600" />
          <StatCard label="Scheduled" value={stats.scheduled} color="text-blue-600" />
          <StatCard label="Archived"  value={stats.expired}   color="text-amber-600" />
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        {['', 'draft', 'published', 'archived'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors capitalize ${
              statusFilter === s
                ? 'bg-tetri-blue text-white'
                : 'bg-tetri-surface border border-tetri-border text-tetri-muted hover:text-tetri-text hover:bg-tetri-bg'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
        <button onClick={load} className="ml-auto p-2 rounded-xl border border-tetri-border bg-tetri-surface text-tetri-neutral hover:text-tetri-text hover:bg-tetri-bg transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-tetri-surface border border-tetri-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-tetri-neutral">
            <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No announcements yet</p>
            <p className="text-sm mt-1">Create an announcement to broadcast a message to your workspace.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tetri-border bg-tetri-bg">
                <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Priority</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Audience</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Publish At</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Reads</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-tetri-border">
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-tetri-bg/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-tetri-text">{a.title}</p>
                    <p className="text-xs text-tetri-neutral mt-0.5 truncate max-w-xs">{a.summary}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${PRIORITY_BADGE[a.priority] || 'bg-slate-100 text-slate-600'}`}>
                      {a.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1 text-tetri-muted text-xs capitalize">
                      <Users className="w-3.5 h-3.5" />{a.audienceType}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${STATUS_BADGE[a.status] || 'bg-slate-100 text-slate-600'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-tetri-neutral text-xs">
                    {a.publishAt ? (
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{fmtDate(a.publishAt)}</span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-tetri-neutral text-xs">{a._count?.reads ?? 0}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => navigate(`/announcements/${a.id}/edit`)} className="p-1.5 rounded-lg text-tetri-neutral hover:text-tetri-blue hover:bg-blue-50 transition-colors" title="Edit">
                        <Megaphone className="w-4 h-4" />
                      </button>
                      {a.status === 'draft' && (
                        <button onClick={() => handlePublish(a.id)} disabled={actionLoading === a.id + '_pub'} className="p-1.5 rounded-lg text-tetri-neutral hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50" title="Publish">
                          {actionLoading === a.id + '_pub' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                      )}
                      {a.status === 'published' && (
                        <button onClick={() => handleArchive(a.id)} disabled={actionLoading === a.id + '_arc'} className="p-1.5 rounded-lg text-tetri-neutral hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50" title="Archive">
                          {actionLoading === a.id + '_arc' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                        </button>
                      )}
                      {a.status !== 'published' && (
                        <button onClick={() => setDeleteTarget(a)} className="p-1.5 rounded-lg text-tetri-neutral hover:text-tetri-error hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-tetri-neutral">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-tetri-border bg-tetri-surface hover:bg-tetri-bg disabled:opacity-40 transition-colors">Previous</button>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1.5 rounded-lg border border-tetri-border bg-tetri-surface hover:bg-tetri-bg disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
