import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Copy, Archive, Trash2, Eye, Loader2, RefreshCw, Sparkles, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import { listTemplates, cloneTemplate, archiveTemplate, deleteTemplate } from '../services/documentTemplatesService.js';

const STATUS_COLORS = {
  draft:    'bg-gray-100 text-gray-700',
  active:   'bg-green-100 text-green-700',
  archived: 'bg-amber-100 text-amber-700',
};

function TemplateCard({ tpl, onClone, onArchive, onDelete }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white border border-tetri-border rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-tetri-surface rounded-lg flex-shrink-0">
            <FileText className="w-4 h-4 text-tetri-blue" />
          </div>
          <p className="text-sm font-semibold text-tetri-text truncate">{tpl.name}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[tpl.status] || STATUS_COLORS.draft}`}>
          {tpl.status}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-tetri-neutral">{tpl.category}</p>
        {tpl.tone && <p className="text-xs text-tetri-neutral">Tone: {tpl.tone}</p>}
        {tpl.languageName && tpl.languageName !== 'English' && <p className="text-xs text-tetri-neutral">Lang: {tpl.languageName}</p>}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs text-tetri-neutral">{tpl.usageCount} uses</span>
          {tpl._count?.placeholders > 0 && <span className="text-xs text-tetri-neutral">{tpl._count.placeholders} placeholders</span>}
          {tpl.isSystemDefault && <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">System</span>}
        </div>
      </div>
      <div className="flex gap-1 pt-1 border-t border-tetri-border">
        <button onClick={() => navigate(`/document-templates/${tpl.id}`)} className="flex-1 text-xs py-1 px-2 rounded hover:bg-tetri-surface text-tetri-neutral hover:text-tetri-text transition-colors flex items-center justify-center gap-1">
          <Eye className="w-3 h-3" /> View
        </button>
        <button onClick={() => onClone(tpl.id)} className="flex-1 text-xs py-1 px-2 rounded hover:bg-tetri-surface text-tetri-neutral hover:text-tetri-text transition-colors flex items-center justify-center gap-1">
          <Copy className="w-3 h-3" /> Clone
        </button>
        {tpl.status !== 'archived' && (
          <button onClick={() => onArchive(tpl.id)} className="flex-1 text-xs py-1 px-2 rounded hover:bg-amber-50 text-tetri-neutral hover:text-amber-700 transition-colors flex items-center justify-center gap-1">
            <Archive className="w-3 h-3" /> Archive
          </button>
        )}
        {!tpl.isSystemDefault && (
          <button onClick={() => onDelete(tpl.id)} className="p-1 rounded hover:bg-red-50 text-tetri-neutral hover:text-tetri-error transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function DocumentTemplatesPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [items,    setItems]    = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [status,   setStatus]   = useState('');
  const [page,     setPage]     = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listTemplates({ page, limit: 18, search: search || undefined, category: category || undefined, status: status || undefined });
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch { showToast('error', 'Failed to load templates'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, search, category, status]);

  const handleClone = async (id) => {
    try { const t = await cloneTemplate(id); showToast('success', 'Template cloned'); load(); navigate(`/document-templates/${t.id}/edit`); }
    catch { showToast('error', 'Failed to clone template'); }
  };
  const handleArchive = async (id) => {
    if (!confirm('Archive this template?')) return;
    try { await archiveTemplate(id); showToast('success', 'Template archived'); load(); }
    catch { showToast('error', 'Failed to archive template'); }
  };
  const handleDelete = async (id) => {
    if (!confirm('Delete this template permanently?')) return;
    try { await deleteTemplate(id); showToast('success', 'Template deleted'); load(); }
    catch { showToast('error', 'Failed to delete template'); }
  };

  return (
    <div className="space-y-6">
      {ToastContainer}

      <PageHeader title="Document Templates" subtitle={`${total} template${total !== 1 ? 's' : ''}`} icon={<FileText className="w-5 h-5" />}>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/document-templates/branding')} className="gap-2">
            <Palette className="w-4 h-4" /> Branding
          </Button>
          <Button onClick={() => navigate('/document-templates/new')} className="gap-2">
            <Plus className="w-4 h-4" /> New Template
          </Button>
        </div>
      </PageHeader>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral" />
          <Input placeholder="Search templates…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue">
          <option value="">All categories</option>
          {['Business Letter','Customer Communication','Vendor Communication','Collection Letter','Payment Reminder','Proposal Introduction','Quotation Cover Letter','Meeting Summary','Internal Memo','HR Communication','Compliance Communication','Announcement','General Business Document'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <Button variant="outline" size="icon" onClick={load}><RefreshCw className="w-4 h-4" /></Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white border border-tetri-border rounded-xl">
          <FileText className="w-10 h-10 text-tetri-neutral mx-auto mb-3" />
          <p className="text-sm font-semibold text-tetri-text mb-1">No templates yet</p>
          <p className="text-xs text-tetri-neutral mb-4">Create reusable document templates for your team</p>
          <Button onClick={() => navigate('/document-templates/new')} className="gap-2"><Plus className="w-4 h-4" /> New Template</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(t => <TemplateCard key={t.id} tpl={t} onClone={handleClone} onArchive={handleArchive} onDelete={handleDelete} />)}
          </div>
          {total > 18 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-tetri-neutral self-center">Page {page}</span>
              <Button variant="outline" size="sm" disabled={items.length < 18} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
