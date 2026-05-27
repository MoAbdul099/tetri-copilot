import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, Search, FileText, Trash2, Eye, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import { listDocuments, deleteDocument } from '../services/aiDocumentsService.js';

const STATUS_COLORS = {
  draft:  'bg-gray-100 text-gray-700',
  saved:  'bg-blue-100 text-blue-700',
  final:  'bg-green-100 text-green-700',
};

function DocCard({ doc, onDelete }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white border border-tetri-border rounded-xl p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
      <div className="p-2 bg-tetri-surface rounded-lg flex-shrink-0">
        <FileText className="w-4 h-4 text-tetri-blue" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-tetri-text truncate">{doc.title}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[doc.status] || STATUS_COLORS.draft}`}>
            {doc.status}
          </span>
        </div>
        <p className="text-xs text-tetri-neutral mt-0.5">{doc.category}</p>
        {doc.tone && <p className="text-xs text-tetri-neutral">Tone: {doc.tone}</p>}
        <p className="text-xs text-tetri-neutral mt-1">{new Date(doc.createdAt).toLocaleDateString()}</p>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={() => navigate(`/ai-documents/${doc.id}`)}
          className="p-1.5 rounded-lg hover:bg-tetri-surface text-tetri-neutral hover:text-tetri-text transition-colors"
          title="View document"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(doc.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-tetri-neutral hover:text-tetri-error transition-colors"
          title="Delete document"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function AiDocumentsPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [docs, setDocs]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage]         = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listDocuments({ page, limit: 20, search: search || undefined, category: category || undefined });
      setDocs(res.items || []);
      setTotal(res.total || 0);
    } catch {
      showToast('error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, search, category]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return;
    try {
      await deleteDocument(id);
      showToast('success', 'Document deleted');
      load();
    } catch {
      showToast('error', 'Failed to delete document');
    }
  };

  return (
    <div className="space-y-6">
      {ToastContainer}

      <PageHeader
        title="AI Documents"
        subtitle={`${total} document${total !== 1 ? 's' : ''} generated`}
        icon={<Sparkles className="w-5 h-5" />}
      >
        <Button onClick={() => navigate('/ai-documents/generate')} className="gap-2">
          <Plus className="w-4 h-4" /> Generate Document
        </Button>
      </PageHeader>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral" />
          <Input
            placeholder="Search documents…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue"
        >
          <option value="">All categories</option>
          {[
            'Business Letter', 'Customer Communication', 'Vendor Communication',
            'Collection Letter', 'Payment Reminder', 'Proposal Introduction',
            'Quotation Cover Letter', 'Meeting Summary', 'Internal Memo',
            'HR Communication', 'Compliance Communication', 'Announcement',
            'General Business Document',
          ].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button variant="outline" size="icon" onClick={load} title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" />
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-tetri-border rounded-xl">
          <Sparkles className="w-10 h-10 text-tetri-neutral mx-auto mb-3" />
          <p className="text-sm font-semibold text-tetri-text mb-1">No documents yet</p>
          <p className="text-xs text-tetri-neutral mb-4">Generate your first AI-powered business document</p>
          <Button onClick={() => navigate('/ai-documents/generate')} className="gap-2">
            <Plus className="w-4 h-4" /> Generate Document
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((d) => <DocCard key={d.id} doc={d} onDelete={handleDelete} />)}
          </div>
          {total > 20 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-tetri-neutral self-center">Page {page}</span>
              <Button variant="outline" size="sm" disabled={docs.length < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
