import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, Save, Loader2, RefreshCw, FileText,
  Clock, Tag, Globe, MessageSquare, Trash2, Download,
  History, Wand2, BarChart2, Copy, Printer, FilePlus2,
  ChevronDown, ChevronUp, RotateCcw, GitCompare, CheckCircle2,
  AlertCircle, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import {
  getDocument, updateDocument, deleteDocument, regenerateDoc,
  duplicateDoc, listVersions, restoreVersion, compareVersions,
  enhanceDoc, transformTone, generateSummary, qualityReview,
  exportDocPdf, exportDocDocx, exportDocHtml,
} from '../services/aiDocumentsService.js';

// ---- Constants ----

const STATUS_OPTIONS = ['draft', 'review', 'final', 'archived', 'obsolete'];

const STATUS_COLORS = {
  draft:    'bg-gray-100 text-gray-700',
  review:   'bg-yellow-100 text-yellow-700',
  saved:    'bg-blue-100 text-blue-700',
  final:    'bg-green-100 text-green-700',
  archived: 'bg-gray-200 text-gray-500',
  obsolete: 'bg-red-100 text-red-600',
};

const ENHANCEMENT_TYPES = [
  { id: 'improve_writing',     label: 'Improve Writing' },
  { id: 'improve_grammar',     label: 'Improve Grammar' },
  { id: 'improve_readability', label: 'Improve Readability' },
  { id: 'improve_tone',        label: 'Professional Tone' },
  { id: 'improve_formality',   label: 'Improve Formality' },
  { id: 'simplify_language',   label: 'Simplify Language' },
  { id: 'expand_content',      label: 'Expand Content' },
  { id: 'shorten_content',     label: 'Shorten Content' },
  { id: 'rewrite_content',     label: 'Rewrite Content' },
  { id: 'correct_formatting',  label: 'Correct Formatting' },
];

const TRANSFORM_TONES = [
  'Professional', 'Formal', 'Friendly', 'Executive',
  'Compliance', 'Legal', 'Customer Service', 'Internal Communication',
];

const SUMMARY_FORMATS = [
  { id: 'executive_summary', label: 'Executive Summary' },
  { id: 'key_points',        label: 'Key Points' },
  { id: 'bullet_summary',    label: 'Bullet Summary' },
  { id: 'one_paragraph',     label: 'One Paragraph' },
];

// ---- Helpers ----

function MetaChip({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-1.5 text-xs text-tetri-neutral">
      <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span><span className="font-medium text-tetri-text">{label}:</span> {value}</span>
    </div>
  );
}

function ScoreBar({ label, value }) {
  const color = value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-tetri-neutral">{label}</span>
        <span className="font-medium text-tetri-text">{value}/100</span>
      </div>
      <div className="h-1.5 bg-tetri-surface rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function SectionHeader({ children, open, onToggle }) {
  return (
    <button className="flex items-center justify-between w-full text-left" onClick={onToggle}>
      <span className="text-sm font-semibold text-tetri-text">{children}</span>
      {open ? <ChevronUp className="w-4 h-4 text-tetri-neutral" /> : <ChevronDown className="w-4 h-4 text-tetri-neutral" />}
    </button>
  );
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ---- Main Page ----

export default function AiDocumentDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [doc,         setDoc]         = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [regen,       setRegen]       = useState(false);
  const [editMode,    setEditMode]    = useState(false);
  const [content,     setContent]     = useState('');

  // Active panel tab: 'content' | 'enhance' | 'versions' | 'quality'
  const [activeTab,   setActiveTab]   = useState('content');

  // Versioning
  const [versions,    setVersions]    = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [compareIds,  setCompareIds]  = useState({ source: '', target: '' });
  const [compareResult, setCompareResult] = useState(null);
  const [comparing,   setComparing]   = useState(false);
  const [restoring,   setRestoring]   = useState(null);

  // Enhancement
  const [enhType,     setEnhType]     = useState('improve_writing');
  const [enhInstr,    setEnhInstr]    = useState('');
  const [enhLoading,  setEnhLoading]  = useState(false);

  // Tone
  const [toneTarget,  setToneTarget]  = useState('Professional');
  const [toneLoading, setToneLoading] = useState(false);

  // Summary
  const [summaryFmt,  setSummaryFmt]  = useState('key_points');
  const [summary,     setSummary]     = useState('');
  const [sumLoading,  setSumLoading]  = useState(false);

  // Quality
  const [review,      setReview]      = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Export
  const [exporting,   setExporting]   = useState(null); // 'pdf'|'docx'|'html'

  // Sidebar sections
  const [showMeta,    setShowMeta]    = useState(true);
  const [showContext, setShowContext] = useState(false);
  const [showLogs,    setShowLogs]    = useState(false);

  const load = useCallback(async () => {
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
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const loadVersions = async () => {
    setVersionsLoading(true);
    try {
      const data = await listVersions(id);
      setVersions(data.versions || []);
    } catch {
      showToast('error', 'Failed to load versions');
    } finally {
      setVersionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'versions') loadVersions();
  }, [activeTab]);

  // ---- Handlers ----

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateDocument(id, { finalContent: content, status: 'final' });
      setDoc(updated);
      setEditMode(false);
      showToast('success', 'Document saved as final');
    } catch {
      showToast('error', 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await updateDocument(id, { status: newStatus });
      setDoc(updated);
      showToast('success', `Status changed to ${newStatus}`);
    } catch {
      showToast('error', 'Failed to change status');
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
      if (activeTab === 'versions') loadVersions();
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

  const handleDuplicate = async () => {
    try {
      const copy = await duplicateDoc(id);
      showToast('success', 'Document duplicated');
      navigate(`/ai-documents/${copy.id}`);
    } catch {
      showToast('error', 'Failed to duplicate document');
    }
  };

  // ---- Versioning ----

  const handleRestore = async (versionId, versionNumber) => {
    if (!confirm(`Restore v${versionNumber}? The current content will be saved as a new version.`)) return;
    setRestoring(versionId);
    try {
      const updated = await restoreVersion(id, versionId);
      setDoc(updated);
      setContent(updated.finalContent || updated.generatedContent || '');
      showToast('success', `Restored to v${versionNumber}`);
      loadVersions();
    } catch {
      showToast('error', 'Restore failed');
    } finally {
      setRestoring(null);
    }
  };

  const handleCompare = async () => {
    if (!compareIds.source || !compareIds.target) { showToast('error', 'Select two versions to compare'); return; }
    if (compareIds.source === compareIds.target) { showToast('error', 'Select different versions'); return; }
    setComparing(true);
    try {
      const result = await compareVersions(id, { sourceVersionId: compareIds.source, targetVersionId: compareIds.target });
      setCompareResult(result);
    } catch {
      showToast('error', 'Comparison failed');
    } finally {
      setComparing(false);
    }
  };

  // ---- AI Enhancement ----

  const handleEnhance = async () => {
    setEnhLoading(true);
    try {
      const result = await enhanceDoc(id, { enhancementType: enhType, instructions: enhInstr });
      setDoc((prev) => ({ ...prev, finalContent: result.content }));
      setContent(result.content);
      showToast('success', 'Document enhanced');
      if (activeTab === 'versions') loadVersions();
    } catch {
      showToast('error', 'Enhancement failed');
    } finally {
      setEnhLoading(false);
    }
  };

  const handleTransformTone = async () => {
    setToneLoading(true);
    try {
      const result = await transformTone(id, { targetTone: toneTarget });
      setDoc((prev) => ({ ...prev, finalContent: result.content }));
      setContent(result.content);
      showToast('success', `Tone transformed to ${toneTarget}`);
      if (activeTab === 'versions') loadVersions();
    } catch {
      showToast('error', 'Tone transformation failed');
    } finally {
      setToneLoading(false);
    }
  };

  const handleSummary = async () => {
    setSumLoading(true);
    try {
      const result = await generateSummary(id, { format: summaryFmt });
      setSummary(result.summary);
    } catch {
      showToast('error', 'Summary generation failed');
    } finally {
      setSumLoading(false);
    }
  };

  const handleQualityReview = async () => {
    setReviewLoading(true);
    try {
      const result = await qualityReview(id);
      setReview(result);
    } catch {
      showToast('error', 'Quality review failed');
    } finally {
      setReviewLoading(false);
    }
  };

  // ---- Export ----

  const handleExportPdf = async () => {
    setExporting('pdf');
    try {
      const blob = await exportDocPdf(id);
      const filename = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      triggerBlobDownload(blob, filename);
      showToast('success', 'PDF downloaded');
    } catch {
      showToast('error', 'PDF export failed');
    } finally {
      setExporting(null);
    }
  };

  const handleExportDocx = async () => {
    setExporting('docx');
    try {
      const blob = await exportDocDocx(id);
      const filename = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.docx`;
      triggerBlobDownload(blob, filename);
      showToast('success', 'DOCX downloaded');
    } catch {
      showToast('error', 'DOCX export failed');
    } finally {
      setExporting(null);
    }
  };

  const handleExportHtml = async () => {
    setExporting('html');
    try {
      const result = await exportDocHtml(id);
      const blob = new Blob([result.html], { type: 'text/html' });
      const filename = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.html`;
      triggerBlobDownload(blob, filename);
      showToast('success', 'HTML downloaded');
    } catch {
      showToast('error', 'HTML export failed');
    } finally {
      setExporting(null);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(doc.finalContent || doc.generatedContent || '');
      showToast('success', 'Copied to clipboard');
    } catch {
      showToast('error', 'Copy failed');
    }
  };

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`<html><head><title>${doc.title}</title>
      <style>body{font-family:sans-serif;margin:40px;line-height:1.6}h1{font-size:20px}pre{white-space:pre-wrap;font-family:inherit}</style>
      </head><body><h1>${doc.title}</h1><pre>${doc.finalContent || doc.generatedContent || ''}</pre></body></html>`);
    printWin.document.close();
    printWin.print();
  };

  // ---- Loading / Not Found ----

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" />
      </div>
    );
  }

  if (!doc) return null;

  const displayContent = editMode ? content : (doc.finalContent || doc.generatedContent || '');

  const tabs = [
    { id: 'content',  label: 'Content',     icon: FileText },
    { id: 'enhance',  label: 'AI Enhance',  icon: Wand2 },
    { id: 'versions', label: 'History',     icon: History },
    { id: 'quality',  label: 'Quality',     icon: BarChart2 },
  ];

  return (
    <div className="space-y-5">
      {ToastContainer}

      {/* ---- Header ---- */}
      <PageHeader title={doc.title} subtitle={doc.category}>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/ai-documents')} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          {/* Export group */}
          <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={!!exporting} className="gap-1.5">
            {exporting === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportDocx} disabled={!!exporting} className="gap-1.5">
            {exporting === 'docx' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            DOCX
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportHtml} disabled={!!exporting} className="gap-1.5">
            {exporting === 'html' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            HTML
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
            <Copy className="w-3.5 h-3.5" /> Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="w-3.5 h-3.5" /> Print
          </Button>

          {/* Actions */}
          <Button variant="outline" size="sm" onClick={handleDuplicate} className="gap-1.5">
            <FilePlus2 className="w-3.5 h-3.5" /> Duplicate
          </Button>
          <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={regen} className="gap-1.5">
            {regen ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Regenerate
          </Button>
          {editMode ? (
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditMode(true)} className="gap-1.5">
              Edit
            </Button>
          )}
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg border border-tetri-border hover:bg-red-50 hover:border-red-200 text-tetri-neutral hover:text-tetri-error transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </PageHeader>

      {/* ---- Tab strip ---- */}
      <div className="flex gap-1 bg-tetri-surface border border-tetri-border rounded-xl p-1 w-fit">
        {tabs.map(({ id: tid, label, icon: Icon }) => (
          <button
            key={tid}
            onClick={() => setActiveTab(tid)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tid
                ? 'bg-white text-tetri-text shadow-sm border border-tetri-border'
                : 'text-tetri-neutral hover:text-tetri-text'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ---- Body ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ---- Left: active tab panel ---- */}
        <div className="lg:col-span-2 space-y-4">

          {/* Content tab */}
          {activeTab === 'content' && (
            <div className="bg-white border border-tetri-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-tetri-text">Document Content</h3>
                <div className="flex items-center gap-2">
                  {/* Status picker */}
                  <select
                    value={doc.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="text-xs border border-tetri-border rounded-lg px-2 py-1 bg-white text-tetri-text focus:outline-none focus:ring-1 focus:ring-tetri-blue"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[doc.status] || STATUS_COLORS.draft}`}>
                    {doc.status}
                  </span>
                </div>
              </div>
              {editMode ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={28}
                  className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue resize-y font-mono"
                />
              ) : (
                <pre className="text-sm text-tetri-text whitespace-pre-wrap font-sans leading-relaxed">{displayContent}</pre>
              )}
            </div>
          )}

          {/* AI Enhancement tab */}
          {activeTab === 'enhance' && (
            <div className="space-y-4">
              {/* Enhance writing */}
              <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-tetri-blue" />
                  <h3 className="text-sm font-semibold text-tetri-text">Enhance Writing</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ENHANCEMENT_TYPES.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setEnhType(e.id)}
                      className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                        enhType === e.id
                          ? 'border-tetri-blue bg-blue-50 text-tetri-blue font-medium'
                          : 'border-tetri-border text-tetri-neutral hover:border-tetri-blue hover:text-tetri-blue'
                      }`}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={enhInstr}
                  onChange={(e) => setEnhInstr(e.target.value)}
                  placeholder="Additional instructions (optional)…"
                  rows={2}
                  className="w-full text-xs border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-1 focus:ring-tetri-blue resize-none"
                />
                <Button
                  onClick={handleEnhance}
                  disabled={enhLoading}
                  className="gap-2 w-full"
                >
                  {enhLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Enhancing…</>
                    : <><Sparkles className="w-4 h-4" /> Enhance Document</>}
                </Button>
              </div>

              {/* Tone transformation */}
              <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-tetri-blue" />
                  <h3 className="text-sm font-semibold text-tetri-text">Transform Tone</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {TRANSFORM_TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setToneTarget(t)}
                      className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                        toneTarget === t
                          ? 'border-tetri-blue bg-blue-50 text-tetri-blue font-medium'
                          : 'border-tetri-border text-tetri-neutral hover:border-tetri-blue hover:text-tetri-blue'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <Button onClick={handleTransformTone} disabled={toneLoading} variant="outline" className="gap-2 w-full">
                  {toneLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Transforming…</>
                    : <><Sparkles className="w-4 h-4" /> Apply Tone</>}
                </Button>
              </div>

              {/* Document summary */}
              <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-tetri-blue" />
                  <h3 className="text-sm font-semibold text-tetri-text">Generate Summary</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SUMMARY_FORMATS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSummaryFmt(f.id)}
                      className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                        summaryFmt === f.id
                          ? 'border-tetri-blue bg-blue-50 text-tetri-blue font-medium'
                          : 'border-tetri-border text-tetri-neutral hover:border-tetri-blue hover:text-tetri-blue'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <Button onClick={handleSummary} disabled={sumLoading} variant="outline" className="gap-2 w-full">
                  {sumLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate Summary
                </Button>
                {summary && (
                  <div className="bg-tetri-surface border border-tetri-border rounded-lg p-3">
                    <p className="text-xs font-medium text-tetri-text mb-2">Summary</p>
                    <pre className="text-xs text-tetri-neutral whitespace-pre-wrap font-sans leading-relaxed">{summary}</pre>
                    <button
                      onClick={() => navigator.clipboard.writeText(summary)}
                      className="mt-2 text-xs text-tetri-blue hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy summary
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Versions tab */}
          {activeTab === 'versions' && (
            <div className="space-y-4">
              {/* Compare */}
              <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <GitCompare className="w-4 h-4 text-tetri-blue" />
                  <h3 className="text-sm font-semibold text-tetri-text">Compare Versions</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-tetri-neutral mb-1 block">Source version</label>
                    <select
                      value={compareIds.source}
                      onChange={(e) => setCompareIds((p) => ({ ...p, source: e.target.value }))}
                      className="w-full text-xs border border-tetri-border rounded-lg px-2 py-1.5 bg-white text-tetri-text focus:outline-none focus:ring-1 focus:ring-tetri-blue"
                    >
                      <option value="">Select…</option>
                      {versions.map((v) => (
                        <option key={v.id} value={v.id}>v{v.versionNumber} — {new Date(v.createdAt).toLocaleDateString()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-tetri-neutral mb-1 block">Target version</label>
                    <select
                      value={compareIds.target}
                      onChange={(e) => setCompareIds((p) => ({ ...p, target: e.target.value }))}
                      className="w-full text-xs border border-tetri-border rounded-lg px-2 py-1.5 bg-white text-tetri-text focus:outline-none focus:ring-1 focus:ring-tetri-blue"
                    >
                      <option value="">Select…</option>
                      {versions.map((v) => (
                        <option key={v.id} value={v.id}>v{v.versionNumber} — {new Date(v.createdAt).toLocaleDateString()}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button onClick={handleCompare} disabled={comparing} variant="outline" size="sm" className="gap-2">
                  {comparing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitCompare className="w-3.5 h-3.5" />}
                  Compare
                </Button>

                {compareResult && (
                  <div className="mt-3 border border-tetri-border rounded-lg overflow-hidden">
                    <div className="flex text-xs font-medium bg-tetri-surface border-b border-tetri-border">
                      <div className="flex-1 px-3 py-2 text-tetri-neutral">v{compareResult.sourceVersion.versionNumber} (Source)</div>
                      <div className="flex-1 px-3 py-2 text-tetri-neutral border-l border-tetri-border">v{compareResult.targetVersion.versionNumber} (Target)</div>
                    </div>
                    <div className="max-h-72 overflow-y-auto p-3 font-mono text-xs space-y-0.5">
                      {compareResult.diff.map((line, i) => (
                        <div
                          key={i}
                          className={
                            line.type === 'added'   ? 'bg-green-50 text-green-800 px-2 py-0.5 rounded' :
                            line.type === 'removed' ? 'bg-red-50 text-red-700 px-2 py-0.5 rounded line-through opacity-60' :
                            'text-tetri-neutral px-2 py-0.5'
                          }
                        >
                          <span className="mr-2 opacity-50">
                            {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                          </span>
                          {line.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Version list */}
              <div className="bg-white border border-tetri-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-tetri-blue" />
                  <h3 className="text-sm font-semibold text-tetri-text">Version History</h3>
                  <span className="ml-auto text-xs text-tetri-neutral">{versions.length} versions</span>
                </div>
                {versionsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-tetri-neutral" /></div>
                ) : versions.length === 0 ? (
                  <p className="text-xs text-tetri-neutral text-center py-6">No versions recorded yet</p>
                ) : (
                  <ol className="relative border-l border-tetri-border space-y-6 ml-3">
                    {versions.map((v) => (
                      <li key={v.id} className="ml-4">
                        <span className="absolute -left-1.5 w-3 h-3 bg-white border-2 border-tetri-blue rounded-full" />
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold text-tetri-text">v{v.versionNumber}</p>
                            {v.changeSummary && <p className="text-xs text-tetri-neutral">{v.changeSummary}</p>}
                            <p className="text-xs text-tetri-muted mt-0.5">{new Date(v.createdAt).toLocaleString()}</p>
                            {v.createdBy && (
                              <p className="text-xs text-tetri-muted">{v.createdBy.fullName || v.createdBy.email}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRestore(v.id, v.versionNumber)}
                            disabled={restoring === v.id}
                            className="shrink-0 flex items-center gap-1 text-xs text-tetri-blue hover:underline disabled:opacity-50"
                          >
                            {restoring === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                            Restore
                          </button>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}

          {/* Quality tab */}
          {activeTab === 'quality' && (
            <div className="space-y-4">
              <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-tetri-blue" />
                  <h3 className="text-sm font-semibold text-tetri-text">Quality Review</h3>
                  <span className="text-xs text-tetri-neutral ml-auto">AI-powered analysis</span>
                </div>
                <p className="text-xs text-tetri-neutral">Run an AI quality check to get grammar, readability, clarity, and professionalism scores along with improvement suggestions.</p>
                <Button onClick={handleQualityReview} disabled={reviewLoading} className="gap-2">
                  {reviewLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Reviewing…</>
                    : <><Sparkles className="w-4 h-4" /> Run Quality Review</>}
                </Button>

                {review && (
                  <div className="space-y-4 pt-2">
                    {/* Overall score */}
                    <div className="flex items-center gap-3 p-3 bg-tetri-surface rounded-lg">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                        review.overallScore >= 80 ? 'bg-green-100 text-green-700' :
                        review.overallScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {review.overallScore}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-tetri-text">Overall Score</p>
                        <p className="text-xs text-tetri-neutral">{review.overallScore >= 80 ? 'Excellent' : review.overallScore >= 60 ? 'Good' : 'Needs improvement'}</p>
                      </div>
                    </div>

                    {/* Score bars */}
                    {review.scores && (
                      <div className="space-y-2.5">
                        <p className="text-xs font-medium text-tetri-text">Detailed Scores</p>
                        {Object.entries(review.scores).map(([key, val]) => (
                          <ScoreBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={val} />
                        ))}
                      </div>
                    )}

                    {/* Strengths */}
                    {review.strengths?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-tetri-text mb-2 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Strengths</p>
                        <ul className="space-y-1">
                          {review.strengths.map((s, i) => (
                            <li key={i} className="text-xs text-tetri-neutral flex items-start gap-1.5">
                              <span className="mt-0.5 text-green-500">•</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Issues */}
                    {review.issues?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-tetri-text mb-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-yellow-500" /> Issues Found</p>
                        <ul className="space-y-1">
                          {review.issues.map((issue, i) => (
                            <li key={i} className="text-xs text-tetri-neutral flex items-start gap-1.5">
                              <span className="mt-0.5 text-yellow-500">•</span>{issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {review.recommendations?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-tetri-text mb-2 flex items-center gap-1"><Info className="w-3.5 h-3.5 text-tetri-blue" /> Recommendations</p>
                        <ul className="space-y-1">
                          {review.recommendations.map((r, i) => (
                            <li key={i} className="text-xs text-tetri-neutral flex items-start gap-1.5">
                              <span className="mt-0.5 text-tetri-blue">→</span>{r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ---- Right: metadata sidebar ---- */}
        <div className="space-y-4">
          {/* Document Details */}
          <div className="bg-white border border-tetri-border rounded-xl p-4 space-y-1">
            <SectionHeader open={showMeta} onToggle={() => setShowMeta((p) => !p)}>
              Document Details
            </SectionHeader>
            {showMeta && (
              <div className="space-y-2 pt-2">
                <MetaChip icon={Tag}           label="Category" value={doc.category} />
                <MetaChip icon={MessageSquare} label="Tone"     value={doc.tone} />
                <MetaChip icon={Globe}         label="Language" value={doc.language} />
                <MetaChip icon={Sparkles}      label="Provider" value={doc.provider} />
                <MetaChip icon={FileText}      label="Model"    value={doc.model} />
                <MetaChip icon={Clock}         label="Created"  value={new Date(doc.createdAt).toLocaleString()} />
                <MetaChip icon={Clock}         label="Updated"  value={new Date(doc.updatedAt).toLocaleString()} />
                {doc.createdByUser && (
                  <MetaChip icon={FileText} label="Author" value={doc.createdByUser.fullName || doc.createdByUser.email || ''} />
                )}
                {doc._count && (
                  <div className="flex gap-3 pt-1">
                    <span className="text-xs text-tetri-neutral">{doc._count.versions || 0} versions</span>
                    <span className="text-xs text-tetri-neutral">{doc._count.exports || 0} exports</span>
                    <span className="text-xs text-tetri-neutral">{doc._count.enhancements || 0} enhancements</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {doc.purpose && (
            <div className="bg-white border border-tetri-border rounded-xl p-4">
              <p className="text-xs font-semibold text-tetri-text mb-1">Purpose</p>
              <p className="text-xs text-tetri-neutral leading-relaxed">{doc.purpose}</p>
            </div>
          )}

          {/* Context Sources */}
          {doc.contextSources?.length > 0 && (
            <div className="bg-white border border-tetri-border rounded-xl p-4 space-y-1">
              <SectionHeader open={showContext} onToggle={() => setShowContext((p) => !p)}>
                Context Sources ({doc.contextSources.length})
              </SectionHeader>
              {showContext && (
                <div className="space-y-1.5 pt-2">
                  {doc.contextSources.map((s) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-tetri-surface rounded-full text-tetri-neutral capitalize">{s.sourceType}</span>
                      {s.sourceName && <span className="text-xs text-tetri-text truncate">{s.sourceName}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generation Logs */}
          {doc.generationLogs?.length > 0 && (
            <div className="bg-white border border-tetri-border rounded-xl p-4 space-y-1">
              <SectionHeader open={showLogs} onToggle={() => setShowLogs((p) => !p)}>
                Generation Log ({doc.generationLogs.length})
              </SectionHeader>
              {showLogs && (
                <div className="space-y-2 pt-2">
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
