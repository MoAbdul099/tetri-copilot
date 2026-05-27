import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, Save, Loader2, RefreshCw,
  FileText, Clock, Tag, Globe, MessageSquare, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import { getDocument, updateDocument, deleteDocument, regenerateDoc } from '../services/aiDocumentsService.js';

const STATUS_COLORS = {
  draft:  'bg-gray-100 text-gray-700',
  saved:  'bg-blue-100 text-blue-700',
  final:  'bg-green-100 text-green-700',
};

function MetaChip({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs text-tetri-neutral">
      <Icon className="w-3.5 h-3.5" />
      <span className="font-medium text-tetri-text">{label}:</span> {value}
    </div>
  );
}

export default function AiDocumentDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [doc,        setDoc]        = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [regen,      setRegen]      = useState(false);
  const [editMode,   setEditMode]   = useState(false);
  const [content,    setContent]    = useState('');
  const [showLogs,   setShowLogs]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await getDocument(id);
      setDoc(d);
      setContent(d.finalContent || d.generatedContent || '');
    } catch {
      showToast('error', 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateDocument(id, { finalContent: content, status: 'final' });
      setDoc(updated);
      setEditMode(false);
      showToast('success', 'Document saved');
    } catch {
      showToast('error', 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm('Regenerate this document? The current content will be replaced.')) return;
    setRegen(true);
    try {
      const updated = await regenerateDoc(id);
      setDoc(updated);
      setContent(updated.finalContent || updated.generatedContent || '');
      showToast('success', 'Document regenerated');
    } catch {
      showToast('error', 'Regeneration failed');
    } finally {
      setRegen(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this document permanently?')) return;
    try {
      await deleteDocument(id);
      navigate('/ai-documents');
    } catch {
      showToast('error', 'Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" />
      </div>
    );
  }

  if (!doc) return null;

  const displayContent = editMode ? content : (doc.finalContent || doc.generatedContent || '');

  return (
    <div className="space-y-6">
      {ToastContainer}

      <PageHeader title={doc.title} subtitle={doc.category}>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/ai-documents')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button variant="outline" onClick={handleRegenerate} disabled={regen} className="gap-2">
            {regen ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Regenerate
          </Button>
          {editMode ? (
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </Button>
          ) : (
            <Button onClick={() => setEditMode(true)} variant="outline" className="gap-2">
              Edit
            </Button>
          )}
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg border border-tetri-border hover:bg-red-50 hover:border-red-200 text-tetri-neutral hover:text-tetri-error transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-tetri-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-tetri-text">Document Content</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[doc.status] || STATUS_COLORS.draft}`}>
                {doc.status}
              </span>
            </div>
            {editMode ? (
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={24}
                className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue resize-y font-mono"
              />
            ) : (
              <pre className="text-sm text-tetri-text whitespace-pre-wrap font-sans leading-relaxed">{displayContent}</pre>
            )}
          </div>
        </div>

        {/* Sidebar — metadata */}
        <div className="space-y-4">
          <div className="bg-white border border-tetri-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-tetri-text">Document Details</h3>
            <MetaChip icon={Tag}           label="Category" value={doc.category} />
            <MetaChip icon={MessageSquare} label="Tone"     value={doc.tone} />
            <MetaChip icon={Globe}         label="Language" value={doc.language} />
            <MetaChip icon={Sparkles}      label="Provider" value={doc.provider} />
            <MetaChip icon={FileText}      label="Model"    value={doc.model} />
            <MetaChip icon={Clock}         label="Created"  value={new Date(doc.createdAt).toLocaleString()} />
            {doc.createdByUser && (
              <MetaChip
                icon={FileText}
                label="Author"
                value={`${doc.createdByUser.firstName || ''} ${doc.createdByUser.lastName || ''}`.trim()}
              />
            )}
          </div>

          {doc.purpose && (
            <div className="bg-white border border-tetri-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-tetri-text mb-2">Purpose</h3>
              <p className="text-xs text-tetri-neutral leading-relaxed">{doc.purpose}</p>
            </div>
          )}

          {doc.contextSources?.length > 0 && (
            <div className="bg-white border border-tetri-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-tetri-text mb-2">Context Sources</h3>
              <div className="space-y-1.5">
                {doc.contextSources.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-tetri-surface rounded-full text-tetri-neutral capitalize">{s.sourceType}</span>
                    {s.sourceName && <span className="text-xs text-tetri-text truncate">{s.sourceName}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {doc.generationLogs?.length > 0 && (
            <div className="bg-white border border-tetri-border rounded-xl p-4">
              <button
                className="flex items-center justify-between w-full"
                onClick={() => setShowLogs(p => !p)}
              >
                <h3 className="text-sm font-semibold text-tetri-text">Generation Log</h3>
                <span className="text-xs text-tetri-neutral">{showLogs ? '▲' : '▼'} {doc.generationLogs.length}</span>
              </button>
              {showLogs && (
                <div className="mt-3 space-y-2">
                  {doc.generationLogs.map((log) => (
                    <div key={log.id} className="text-xs text-tetri-neutral border-l-2 border-tetri-border pl-2">
                      <p>{new Date(log.createdAt).toLocaleString()}</p>
                      {log.provider && <p>{log.provider} · {log.model}</p>}
                      {log.durationMs && <p>{(log.durationMs / 1000).toFixed(1)}s · {(log.inputTokens || 0) + (log.outputTokens || 0)} tokens</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
