import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RefreshCw, Trash2, Send, Archive, Eye, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import { listTemplates, deleteTemplate, publishTemplate, archiveTemplate } from '../services/emailService.js';

const STATUS_BADGE = {
  draft:     'bg-slate-100 text-slate-600',
  published: 'bg-green-100 text-green-700',
  archived:  'bg-amber-100 text-amber-700',
};

const CATEGORY_BADGE = {
  workspace:  'bg-blue-50 text-blue-700',
  approval:   'bg-amber-50 text-amber-700',
  expense:    'bg-orange-50 text-orange-700',
  invoice:    'bg-indigo-50 text-indigo-700',
  payment:    'bg-green-50 text-green-700',
  billing:    'bg-violet-50 text-violet-700',
  compliance: 'bg-emerald-50 text-emerald-700',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function EmailTemplatesPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [templates, setTemplates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const limit = 20;

  const load = () => {
    setLoading(true);
    listTemplates({ search: search || undefined, status: statusFilter || undefined, page, limit })
      .then((data) => {
        if (Array.isArray(data)) {
          setTemplates(data);
          setTotal(data.length);
        } else {
          setTemplates(data?.templates || []);
          setTotal(data?.total || 0);
        }
      })
      .catch(() => showToast('error', 'Failed to load templates'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, statusFilter, page]);

  const handlePublish = async (id) => {
    setActionLoading(id + '_publish');
    try {
      await publishTemplate(id);
      showToast('success', 'Template published');
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to publish');
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (id) => {
    setActionLoading(id + '_archive');
    try {
      await archiveTemplate(id);
      showToast('success', 'Template archived');
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to archive');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTemplate(deleteTarget.id);
      showToast('success', 'Template deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {ToastContainer}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Template"
        description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <PageHeader
        title="Email Templates"
        subtitle={`${total} template${total !== 1 ? 's' : ''}`}
      >
        <Button onClick={() => navigate('/settings/email-templates/new')}>
          <Plus className="w-4 h-4 mr-1" /> New Template
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral" />
          <input
            type="text"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="text-sm border border-tetri-border rounded-xl px-3 py-2 bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <button onClick={load} className="p-2 rounded-xl border border-tetri-border bg-tetri-surface text-tetri-neutral hover:text-tetri-text hover:bg-tetri-bg transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-tetri-surface border border-tetri-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16 text-tetri-neutral">
            <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No templates found</p>
            <p className="text-sm mt-1">Create your first email template to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tetri-border bg-tetri-bg">
                <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Template</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Version</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Updated</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-tetri-border">
              {templates.map((t) => (
                <tr key={t.id} className="hover:bg-tetri-bg/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-tetri-text">{t.name}</p>
                    <p className="text-xs text-tetri-neutral mt-0.5 font-mono">{t.code}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${CATEGORY_BADGE[t.category] || 'bg-slate-100 text-slate-600'}`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${STATUS_BADGE[t.status] || 'bg-slate-100 text-slate-600'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-tetri-neutral">v{t.version}</td>
                  <td className="px-5 py-3.5 text-tetri-neutral">{fmtDate(t.updatedAt)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => navigate(`/settings/email-templates/${t.id}/edit`)}
                        className="p-1.5 rounded-lg text-tetri-neutral hover:text-tetri-blue hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {t.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(t.id)}
                          disabled={actionLoading === t.id + '_publish'}
                          className="p-1.5 rounded-lg text-tetri-neutral hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                          title="Publish"
                        >
                          {actionLoading === t.id + '_publish'
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Send className="w-4 h-4" />}
                        </button>
                      )}
                      {t.status === 'published' && (
                        <button
                          onClick={() => handleArchive(t.id)}
                          disabled={actionLoading === t.id + '_archive'}
                          className="p-1.5 rounded-lg text-tetri-neutral hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                          title="Archive"
                        >
                          {actionLoading === t.id + '_archive'
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Archive className="w-4 h-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(t)}
                        className="p-1.5 rounded-lg text-tetri-neutral hover:text-tetri-error hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-tetri-neutral">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-tetri-border bg-tetri-surface hover:bg-tetri-bg disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-3 py-1.5 rounded-lg border border-tetri-border bg-tetri-surface hover:bg-tetri-bg disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
