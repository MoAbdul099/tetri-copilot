import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit, Copy, Archive, Trash2, Sparkles, Eye,
  FileText, Tag, Brain, Clock, BarChart2, Loader2, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import { getTemplate, cloneTemplate, archiveTemplate, deleteTemplate, previewTemplate } from '../services/documentTemplatesService.js';

const STATUS_COLORS = {
  draft:    'bg-gray-100 text-gray-700',
  active:   'bg-green-100 text-green-700',
  archived: 'bg-amber-100 text-amber-700',
};

export default function DocumentTemplateDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [tpl,      setTpl]      = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [preview,  setPreview]  = useState(null);
  const [showPrev, setShowPrev] = useState(false);
  const [prevLoading, setPrevLoading] = useState(false);

  useEffect(() => {
    getTemplate(id).then(setTpl).catch(() => showToast('error', 'Failed to load template')).finally(() => setLoading(false));
  }, [id]);

  const handleClone = async () => {
    try { const t = await cloneTemplate(id); showToast('success', 'Template cloned'); navigate(`/document-templates/${t.id}/edit`); }
    catch { showToast('error', 'Failed to clone'); }
  };

  const handleArchive = async () => {
    if (!confirm('Archive this template? It will no longer be available for document generation.')) return;
    try { await archiveTemplate(id); showToast('success', 'Template archived'); navigate('/document-templates'); }
    catch { showToast('error', 'Failed to archive'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this template permanently?')) return;
    try { await deleteTemplate(id); navigate('/document-templates'); }
    catch { showToast('error', 'Failed to delete'); }
  };

  const handlePreview = async () => {
    setPrevLoading(true);
    try {
      const result = await previewTemplate(id, {});
      setPreview(result.resolvedContent || '');
      setShowPrev(true);
    } catch { showToast('error', 'Preview failed'); }
    finally { setPrevLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" /></div>;
  if (!tpl) return null;

  const sections = tpl.contentSections || {};

  return (
    <div className="space-y-6">
      {ToastContainer}

      <PageHeader title={tpl.name} subtitle={tpl.category}>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => navigate('/document-templates')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button variant="outline" onClick={handlePreview} disabled={prevLoading} className="gap-2">
            {prevLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />} Preview
          </Button>
          <Button variant="outline" onClick={handleClone} className="gap-2">
            <Copy className="w-4 h-4" /> Clone
          </Button>
          {tpl.status !== 'archived' && (
            <Button variant="outline" onClick={() => navigate(`/document-templates/${id}/edit`)} className="gap-2">
              <Edit className="w-4 h-4" /> Edit
            </Button>
          )}
          {tpl.status === 'active' && (
            <Button onClick={() => navigate(`/ai-documents/generate?templateId=${id}`)} className="gap-2">
              <Sparkles className="w-4 h-4" /> Use Template
            </Button>
          )}
        </div>
      </PageHeader>

      {showPrev && preview && (
        <div className="bg-white border border-tetri-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-tetri-text">Preview (with resolved placeholders)</h3>
            <button onClick={() => setShowPrev(false)} className="text-xs text-tetri-neutral hover:text-tetri-text">Close</button>
          </div>
          <pre className="text-sm text-tetri-text whitespace-pre-wrap font-sans leading-relaxed bg-tetri-surface rounded-lg p-4">{preview}</pre>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content */}
        <div className="lg:col-span-2 space-y-4">
          {[
            { key: 'header',       label: 'Header' },
            { key: 'introduction', label: 'Introduction' },
            { key: 'body',         label: 'Body' },
            { key: 'closing',      label: 'Closing' },
            { key: 'footer',       label: 'Footer' },
          ].filter(s => sections[s.key]).map(s => (
            <div key={s.key} className="bg-white border border-tetri-border rounded-xl p-5">
              <h4 className="text-xs font-semibold text-tetri-neutral uppercase tracking-wide mb-2">{s.label}</h4>
              <pre className="text-sm text-tetri-text whitespace-pre-wrap font-sans leading-relaxed">{sections[s.key]}</pre>
            </div>
          ))}
          {!Object.values(sections).some(Boolean) && (
            <div className="bg-white border border-tetri-border rounded-xl p-8 text-center">
              <FileText className="w-8 h-8 text-tetri-neutral mx-auto mb-2" />
              <p className="text-sm text-tetri-neutral">No content sections defined</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-tetri-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-tetri-text">Details</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[tpl.status] || STATUS_COLORS.draft}`}>{tpl.status}</span>
            </div>
            {tpl.description && <p className="text-xs text-tetri-neutral">{tpl.description}</p>}
            {tpl.tone && <div className="flex items-center gap-2 text-xs text-tetri-neutral"><FileText className="w-3 h-3" /> Tone: {tpl.tone}</div>}
            {tpl.languageName && <div className="flex items-center gap-2 text-xs text-tetri-neutral"><FileText className="w-3 h-3" /> Language: {tpl.languageName}</div>}
            <div className="flex items-center gap-2 text-xs text-tetri-neutral"><BarChart2 className="w-3 h-3" /> {tpl.usageCount} uses</div>
            {tpl.lastUsedAt && <div className="flex items-center gap-2 text-xs text-tetri-neutral"><Clock className="w-3 h-3" /> Last used: {new Date(tpl.lastUsedAt).toLocaleDateString()}</div>}
            <div className="flex items-center gap-2 text-xs text-tetri-neutral"><Clock className="w-3 h-3" /> Created: {new Date(tpl.createdAt).toLocaleDateString()}</div>
            {tpl.createdByUser && <div className="flex items-center gap-2 text-xs text-tetri-neutral"><FileText className="w-3 h-3" /> By: {tpl.createdByUser.fullName || tpl.createdByUser.email}</div>}
            {tpl.brandingEnabled && <div className="flex items-center gap-2 text-xs text-green-700"><CheckCircle className="w-3 h-3" /> Branding enabled</div>}
          </div>

          {tpl.placeholders?.length > 0 && (
            <div className="bg-white border border-tetri-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-tetri-text mb-2 flex items-center gap-1.5"><Tag className="w-4 h-4" /> Placeholders</h3>
              <div className="flex flex-wrap gap-1.5">
                {tpl.placeholders.map(p => (
                  <span key={p.id} className="text-xs font-mono bg-tetri-surface px-2 py-0.5 rounded text-tetri-neutral">{p.placeholderName}</span>
                ))}
              </div>
            </div>
          )}

          {tpl.contextRequirements?.length > 0 && (
            <div className="bg-white border border-tetri-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-tetri-text mb-2">Context Requirements</h3>
              <div className="space-y-1">
                {tpl.contextRequirements.map(r => (
                  <div key={r.id} className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-tetri-surface rounded-full text-tetri-neutral capitalize">{r.sourceType}</span>
                    {r.required && <span className="text-xs text-tetri-error">Required</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tpl.aiInstructions && (
            <div className="bg-white border border-tetri-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-tetri-text mb-2 flex items-center gap-1.5"><Brain className="w-4 h-4" /> AI Instructions</h3>
              <p className="text-xs text-tetri-neutral leading-relaxed">{tpl.aiInstructions}</p>
            </div>
          )}

          {tpl.status !== 'archived' && !tpl.isSystemDefault && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleArchive} className="flex-1 gap-2 text-amber-700 border-amber-200 hover:bg-amber-50">
                <Archive className="w-4 h-4" /> Archive
              </Button>
              <Button variant="outline" onClick={handleDelete} className="flex-1 gap-2 text-tetri-error border-red-200 hover:bg-red-50">
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
