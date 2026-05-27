import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Save, Loader2, Sparkles, Settings, FileText, Tag, Palette, Brain, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import { getMeta, getTemplate, createTemplate, updateTemplate, aiAssistTemplate } from '../services/documentTemplatesService.js';

const STEPS = [
  { label: 'General Info',      icon: Settings },
  { label: 'Content',           icon: FileText },
  { label: 'Placeholders',      icon: Tag },
  { label: 'Context',           icon: Settings },
  { label: 'Branding & AI',     icon: Brain },
  { label: 'Review & Publish',  icon: Eye },
];

const LANGUAGES = ['English', 'Arabic', 'French', 'Spanish', 'German', 'Italian', 'Portuguese'];
const CONTEXT_TYPES = ['customer', 'supplier', 'invoice', 'expense', 'compliance'];

const EMPTY_SECTIONS = { header: '', introduction: '', body: '', closing: '', footer: '' };

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-1 mb-6 flex-wrap">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors
              ${done ? 'bg-green-100 text-green-700' : active ? 'bg-tetri-blue text-white' : 'bg-tetri-surface text-tetri-neutral'}`}>
              {done ? <CheckCircle className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`w-3 h-px ${done ? 'bg-green-400' : 'bg-tetri-border'}`} />}
          </div>
        );
      })}
    </div>
  );
}

function SectionField({ label, value, onChange, rows = 4, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-tetri-text mb-1">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue resize-none"
      />
    </div>
  );
}

export default function DocumentTemplateFormPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const isEdit = Boolean(id);

  const [step,    setStep]    = useState(0);
  const [meta,    setMeta]    = useState({ categories: [], tones: [], placeholderGroups: {} });
  const [loading, setLoading] = useState(isEdit);
  const [saving,  setSaving]  = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Step 1
  const [form, setForm] = useState({
    name: '', description: '', category: '', tone: '', languageName: 'English',
  });
  // Step 2
  const [sections, setSections] = useState({ ...EMPTY_SECTIONS });
  // Step 3 — selected placeholder names
  const [selectedPlaceholders, setSelectedPlaceholders] = useState([]);
  // Step 4 — context requirements
  const [contextReqs, setContextReqs] = useState([]);
  // Step 5
  const [brandingEnabled, setBrandingEnabled] = useState(false);
  const [aiInstructions,  setAiInstructions]  = useState('');
  // Publish status
  const [publishStatus, setPublishStatus] = useState('draft');

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    getMeta().then(setMeta).catch(() => {});
    if (isEdit) {
      getTemplate(id).then(t => {
        setForm({ name: t.name || '', description: t.description || '', category: t.category || '', tone: t.tone || '', languageName: t.languageName || 'English' });
        setSections({ ...EMPTY_SECTIONS, ...(t.contentSections || {}) });
        setSelectedPlaceholders((t.placeholders || []).map(p => p.placeholderName));
        setContextReqs((t.contextRequirements || []).map(r => ({ sourceType: r.sourceType, required: r.required })));
        setBrandingEnabled(t.brandingEnabled || false);
        setAiInstructions(t.aiInstructions || '');
        setPublishStatus(t.status || 'draft');
      }).catch(() => showToast('error', 'Failed to load template'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const togglePlaceholder = (ph) => setSelectedPlaceholders(p => p.includes(ph) ? p.filter(x => x !== ph) : [...p, ph]);
  const toggleContext = (type) => setContextReqs(p => p.find(r => r.sourceType === type) ? p.filter(r => r.sourceType !== type) : [...p, { sourceType: type, required: true }]);

  const handleAiAssist = async () => {
    if (!form.category) return showToast('error', 'Select a category first');
    setAiLoading(true);
    try {
      const result = await aiAssistTemplate({ category: form.category, description: form.description });
      if (result.name) setF('name', result.name);
      if (result.description && !form.description) setF('description', result.description);
      if (result.tone && !form.tone) setF('tone', result.tone);
      if (result.contentSections) setSections(s => ({ ...s, ...result.contentSections }));
      if (result.aiInstructions) setAiInstructions(result.aiInstructions);
      showToast('success', 'AI filled in template content');
      setStep(1);
    } catch { showToast('error', 'AI assistance failed'); }
    finally { setAiLoading(false); }
  };

  const buildPayload = (status) => ({
    ...form,
    contentSections:     sections,
    aiInstructions:      aiInstructions || undefined,
    brandingEnabled,
    status,
    placeholders: selectedPlaceholders.map(ph => {
      const sourceType = Object.entries(meta.placeholderGroups || {}).find(([, arr]) => arr.includes(ph))?.[0] || 'general';
      return { placeholderName: ph, sourceType, required: false };
    }),
    contextRequirements: contextReqs,
  });

  const handleSave = async (status) => {
    if (!form.name.trim() || !form.category) return showToast('error', 'Name and category are required');
    setSaving(true);
    try {
      const payload = buildPayload(status);
      const result  = isEdit ? await updateTemplate(id, payload) : await createTemplate(payload);
      showToast('success', status === 'active' ? 'Template published' : 'Template saved');
      navigate(`/document-templates/${result.id}`);
    } catch { showToast('error', 'Failed to save template'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" /></div>;

  const canNext1 = form.name.trim() && form.category;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {ToastContainer}

      <PageHeader title={isEdit ? 'Edit Template' : 'New Template'} subtitle="Reusable document template">
        <Button variant="outline" onClick={() => navigate('/document-templates')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </PageHeader>

      <div className="bg-white border border-tetri-border rounded-xl p-6">
        <StepIndicator current={step} />

        {/* Step 1 — General Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-tetri-text mb-1.5">Template Name <span className="text-tetri-error">*</span></label>
              <Input value={form.name} onChange={e => setF('name', e.target.value)} placeholder="e.g. Payment Reminder — Standard" />
            </div>
            <div>
              <label className="block text-sm font-medium text-tetri-text mb-1.5">Category <span className="text-tetri-error">*</span></label>
              <select value={form.category} onChange={e => setF('category', e.target.value)} className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue">
                <option value="">Select category…</option>
                {(meta.categories || []).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-tetri-text mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setF('description', e.target.value)} placeholder="What is this template for?" rows={2} className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tetri-text mb-1.5">Tone</label>
                <select value={form.tone} onChange={e => setF('tone', e.target.value)} className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue">
                  <option value="">Default</option>
                  {(meta.tones || []).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-tetri-text mb-1.5">Language</label>
                <select value={form.languageName} onChange={e => setF('languageName', e.target.value)} className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue">
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" onClick={handleAiAssist} disabled={!form.category || aiLoading} className="gap-2">
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                AI Generate Draft
              </Button>
              <Button onClick={() => setStep(1)} disabled={!canNext1} className="gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — Template Content */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-tetri-neutral mb-2">Use <code className="bg-tetri-surface px-1 rounded">{'{{placeholder}}'}</code> tokens for dynamic content. Structure your template with content sections.</p>
            <SectionField label="Header" value={sections.header} onChange={v => setSections(s => ({ ...s, header: v }))} rows={2} placeholder="Company letterhead or document title…" />
            <SectionField label="Introduction" value={sections.introduction} onChange={v => setSections(s => ({ ...s, introduction: v }))} rows={3} placeholder="Opening salutation and context…" />
            <SectionField label="Body" value={sections.body} onChange={v => setSections(s => ({ ...s, body: v }))} rows={6} placeholder="Main document content…" />
            <SectionField label="Closing" value={sections.closing} onChange={v => setSections(s => ({ ...s, closing: v }))} rows={3} placeholder="Closing remarks and signature block…" />
            <SectionField label="Footer" value={sections.footer} onChange={v => setSections(s => ({ ...s, footer: v }))} rows={2} placeholder="Legal notices, contact details…" />
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button onClick={() => setStep(2)} className="gap-2">Next <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 3 — Placeholders */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-tetri-neutral">Select all placeholder tokens used in this template. This helps the generation wizard know what data to request.</p>
            {Object.entries(meta.placeholderGroups || {}).map(([group, phs]) => (
              <div key={group}>
                <p className="text-xs font-semibold text-tetri-text mb-2 capitalize">{group}</p>
                <div className="flex flex-wrap gap-2">
                  {phs.map(ph => (
                    <button
                      key={ph}
                      type="button"
                      onClick={() => togglePlaceholder(ph)}
                      className={`text-xs px-2.5 py-1 rounded-full border font-mono transition-colors
                        ${selectedPlaceholders.includes(ph) ? 'bg-tetri-blue text-white border-tetri-blue' : 'bg-white text-tetri-neutral border-tetri-border hover:border-tetri-blue'}`}
                    >
                      {ph}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {selectedPlaceholders.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-semibold text-blue-800 mb-1">Selected ({selectedPlaceholders.length})</p>
                <div className="flex flex-wrap gap-1">{selectedPlaceholders.map(ph => <span key={ph} className="text-xs font-mono bg-white border border-blue-200 px-2 py-0.5 rounded text-blue-700">{ph}</span>)}</div>
              </div>
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button onClick={() => setStep(3)} className="gap-2">Next <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 4 — Context Requirements */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-tetri-neutral">Specify which records are required when generating a document from this template. The generation wizard will prompt users to select them.</p>
            <div className="grid grid-cols-2 gap-3">
              {CONTEXT_TYPES.map(type => {
                const selected = contextReqs.find(r => r.sourceType === type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleContext(type)}
                    className={`text-left p-3 rounded-xl border transition-colors
                      ${selected ? 'bg-tetri-blue text-white border-tetri-blue' : 'bg-white text-tetri-text border-tetri-border hover:border-tetri-blue'}`}
                  >
                    <p className="text-sm font-medium capitalize">{type}</p>
                    <p className={`text-xs mt-0.5 ${selected ? 'text-blue-100' : 'text-tetri-neutral'}`}>{selected ? 'Required' : 'Not required'}</p>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button onClick={() => setStep(4)} className="gap-2">Next <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 5 — Branding & AI Instructions */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-tetri-surface rounded-xl border border-tetri-border">
              <input type="checkbox" id="brandingEnabled" checked={brandingEnabled} onChange={e => setBrandingEnabled(e.target.checked)} className="w-4 h-4 text-tetri-blue border-tetri-border rounded focus:ring-tetri-blue" />
              <div>
                <label htmlFor="brandingEnabled" className="text-sm font-medium text-tetri-text cursor-pointer">Apply Workspace Branding</label>
                <p className="text-xs text-tetri-neutral mt-0.5">Injects your workspace branding profile (colors, footer) into the document generation prompt.</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-tetri-text mb-1.5">AI Instructions</label>
              <textarea
                value={aiInstructions}
                onChange={e => setAiInstructions(e.target.value)}
                placeholder="Guidance for the AI when using this template — tone rules, things to include/avoid, formatting preferences…"
                rows={5}
                className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue resize-none"
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button onClick={() => setStep(5)} className="gap-2">Next <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 6 — Review & Publish */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-tetri-surface rounded-xl p-4">
                <p className="text-xs font-semibold text-tetri-text mb-2">Template Details</p>
                <p className="text-sm font-semibold text-tetri-text">{form.name}</p>
                <p className="text-xs text-tetri-neutral mt-1">{form.category}</p>
                {form.tone && <p className="text-xs text-tetri-neutral">Tone: {form.tone}</p>}
                <p className="text-xs text-tetri-neutral">Language: {form.languageName}</p>
              </div>
              <div className="bg-tetri-surface rounded-xl p-4">
                <p className="text-xs font-semibold text-tetri-text mb-2">Configuration</p>
                <p className="text-xs text-tetri-neutral">{selectedPlaceholders.length} placeholder{selectedPlaceholders.length !== 1 ? 's' : ''}</p>
                <p className="text-xs text-tetri-neutral">{contextReqs.length} context requirement{contextReqs.length !== 1 ? 's' : ''}</p>
                <p className="text-xs text-tetri-neutral">Branding: {brandingEnabled ? 'Enabled' : 'Disabled'}</p>
                {aiInstructions && <p className="text-xs text-tetri-neutral">AI instructions: Yes</p>}
              </div>
            </div>
            {form.description && (
              <div className="bg-tetri-surface rounded-xl p-4">
                <p className="text-xs font-semibold text-tetri-text mb-1">Description</p>
                <p className="text-xs text-tetri-neutral">{form.description}</p>
              </div>
            )}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-800 mb-1">Publish Status</p>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" value="draft" checked={publishStatus === 'draft'} onChange={() => setPublishStatus('draft')} className="text-tetri-blue" />
                  <span className="text-sm text-tetri-text">Save as Draft</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" value="active" checked={publishStatus === 'active'} onChange={() => setPublishStatus('active')} className="text-tetri-blue" />
                  <span className="text-sm text-tetri-text">Publish Active</span>
                </label>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(4)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
              <Button onClick={() => handleSave(publishStatus)} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {publishStatus === 'active' ? 'Publish Template' : 'Save Draft'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
