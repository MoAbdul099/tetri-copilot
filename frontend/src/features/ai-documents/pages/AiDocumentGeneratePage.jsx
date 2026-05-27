import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Sparkles, Save, Loader2,
  CheckCircle, FileText, Settings, Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import { getCategories, generateDoc, saveDocument } from '../services/aiDocumentsService.js';
import { generateFromTpl } from '../../document-templates/services/documentTemplatesService.js';
import api from '../../../lib/api.js';

const STEPS = [
  { label: 'Document Info',          icon: Settings },
  { label: 'Context & Instructions', icon: FileText },
  { label: 'Generate & Save',        icon: Wand2 },
];

const LANGUAGES = ['English', 'Arabic', 'French', 'Spanish', 'German', 'Italian', 'Portuguese'];

const SOURCE_TYPES = [
  { value: 'company',   label: 'Company Info' },
  { value: 'customer',  label: 'Customer' },
  { value: 'supplier',  label: 'Supplier / Vendor' },
  { value: 'invoice',   label: 'Invoice' },
  { value: 'expense',   label: 'Expense' },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done    = i < current;
        const active  = i === current;
        return (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${done   ? 'bg-green-100 text-green-700' : ''}
              ${active ? 'bg-tetri-blue text-white' : ''}
              ${!done && !active ? 'bg-tetri-surface text-tetri-neutral' : ''}
            `}>
              {done ? <CheckCircle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              {s.label}
            </div>
            {i < STEPS.length - 1 && <div className={`w-6 h-px ${done ? 'bg-green-400' : 'bg-tetri-border'}`} />}
          </div>
        );
      })}
    </div>
  );
}

export default function AiDocumentGeneratePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('templateId');
  const { showToast, ToastContainer } = useToast();

  const [step, setStep]       = useState(0);
  const [categories, setCats] = useState([]);
  const [tones, setTones]     = useState([]);
  const [generating, setGen]  = useState(false);
  const [saving, setSaving]   = useState(false);
  const [generated, setGenerated] = useState(null);
  const [usingTemplate, setUsingTemplate] = useState(!!templateId);

  // Step 1 fields
  const [form, setForm] = useState({
    title:    '',
    category: '',
    tone:     '',
    language: 'English',
    purpose:  '',
  });

  // Step 2 fields
  const [contextSources, setContextSources] = useState([]);
  const [instructions, setInstructions]     = useState('');

  // Context pickers
  const [customers,  setCustomers]  = useState([]);
  const [suppliers,  setSuppliers]  = useState([]);
  const [invoices,   setInvoices]   = useState([]);
  const [expenses,   setExpenses]   = useState([]);

  useEffect(() => {
    getCategories().then((d) => { setCats(d.categories || []); setTones(d.tones || []); }).catch(() => {});
    api.get('/api/v1/customers', { params: { limit: 200 } }).then(r => setCustomers(r.data.data?.items || [])).catch(() => {});
    api.get('/api/v1/suppliers', { params: { limit: 200 } }).then(r => setSuppliers(r.data.data?.items || [])).catch(() => {});
    api.get('/api/v1/invoices',  { params: { limit: 200 } }).then(r => setInvoices(r.data.data?.items || [])).catch(() => {});
    api.get('/api/v1/expenses',  { params: { limit: 200 } }).then(r => setExpenses(r.data.data?.items || [])).catch(() => {});
  }, []);

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const addContextSource = (type) => {
    if (type === 'company') {
      if (contextSources.find(s => s.sourceType === 'company')) return;
      setContextSources(p => [...p, { sourceType: 'company', sourceName: 'Company Info' }]);
      return;
    }
    setContextSources(p => [...p, { sourceType: type, sourceRecordId: '', sourceName: '' }]);
  };

  const updateSource = (i, field, value) => {
    setContextSources(p => {
      const next = [...p];
      next[i] = { ...next[i], [field]: value };
      if (field === 'sourceRecordId') {
        const opts = { customer: customers, supplier: suppliers, invoice: invoices, expense: expenses }[next[i].sourceType] || [];
        const rec  = opts.find(o => o.id === value);
        next[i].sourceName = rec ? (rec.name || rec.invoiceNumber || rec.expenseNumber || '') : '';
      }
      return next;
    });
  };

  const removeSource = (i) => setContextSources(p => p.filter((_, idx) => idx !== i));

  const canProceedStep1 = form.title.trim() && form.category;

  const handleGenerate = async () => {
    setGen(true);
    try {
      const validSources = contextSources.filter(s => s.sourceType === 'company' || s.sourceRecordId);
      let result;
      if (templateId) {
        result = await generateFromTpl(templateId, { contextSources: validSources, instructions: instructions || undefined });
        // Map template result to expected shape
        if (result.template && !form.category) setForm(p => ({ ...p, category: result.template.category || p.category }));
      } else {
        result = await generateDoc({ ...form, instructions: instructions || undefined, contextSources: validSources });
      }
      setGenerated(result);
      setStep(2);
    } catch {
      showToast('error', 'Generation failed. Please try again.');
    } finally {
      setGen(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const validSources = contextSources.filter(s => s.sourceType === 'company' || s.sourceRecordId);
      const doc = await saveDocument({
        ...form,
        instructions:     instructions || undefined,
        generatedContent: generated.generatedContent,
        finalContent:     generated.generatedContent,
        provider:         generated.provider,
        model:            generated.model,
        promptText:       generated.promptText,
        inputTokens:      generated.inputTokens,
        outputTokens:     generated.outputTokens,
        durationMs:       generated.durationMs,
        contextSources:   validSources,
      });
      showToast('success', 'Document saved');
      navigate(`/ai-documents/${doc.id}`);
    } catch {
      showToast('error', 'Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const getRecordOptions = (type) => {
    if (type === 'customer') return customers.map(c => ({ id: c.id, label: c.name }));
    if (type === 'supplier') return suppliers.map(s => ({ id: s.id, label: s.name }));
    if (type === 'invoice')  return invoices.map(inv => ({ id: inv.id, label: `${inv.invoiceNumber} — ${inv.customer?.name || ''}` }));
    if (type === 'expense')  return expenses.map(exp => ({ id: exp.id, label: `${exp.expenseNumber || exp.id.slice(0, 8)} — ${exp.description || ''}` }));
    return [];
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {ToastContainer}

      <PageHeader title="Generate Document" subtitle="AI-powered business document creation">
        <Button variant="outline" onClick={() => navigate('/ai-documents')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </PageHeader>

      <div className="bg-white border border-tetri-border rounded-xl p-6">
        <StepIndicator current={step} />

        {/* Step 1 — Document Info */}
        {step === 0 && (
          <div className="space-y-4">
            {usingTemplate && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Generating from template — context and AI instructions from the template will be applied automatically.</span>
                <button className="ml-auto text-blue-500 hover:text-blue-700 underline" onClick={() => setUsingTemplate(false)}>Use scratch instead</button>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-tetri-text mb-1.5">Document Title <span className="text-tetri-error">*</span></label>
              <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Payment Reminder to Acme Corp" />
            </div>
            <div>
              <label className="block text-sm font-medium text-tetri-text mb-1.5">Category <span className="text-tetri-error">*</span></label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue"
              >
                <option value="">Select category…</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tetri-text mb-1.5">Tone</label>
                <select
                  value={form.tone}
                  onChange={e => set('tone', e.target.value)}
                  className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue"
                >
                  <option value="">Default (Professional)</option>
                  {tones.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-tetri-text mb-1.5">Language</label>
                <select
                  value={form.language}
                  onChange={e => set('language', e.target.value)}
                  className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue"
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-tetri-text mb-1.5">Purpose / Brief</label>
              <textarea
                value={form.purpose}
                onChange={e => set('purpose', e.target.value)}
                placeholder="What is this document for? Brief description of intent…"
                rows={3}
                className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue resize-none"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(1)} disabled={!canProceedStep1} className="gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — Context & Instructions */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-tetri-text">Context Sources</label>
                <div className="flex gap-1 flex-wrap justify-end">
                  {SOURCE_TYPES.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => addContextSource(s.value)}
                      className="text-xs px-2 py-1 bg-tetri-surface border border-tetri-border text-tetri-neutral rounded-lg hover:bg-tetri-blue hover:text-white hover:border-tetri-blue transition-colors"
                    >
                      + {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-tetri-neutral mb-3">Add data sources to give the AI relevant context for this document.</p>

              {contextSources.length === 0 && (
                <div className="text-center py-6 border border-dashed border-tetri-border rounded-lg">
                  <p className="text-xs text-tetri-neutral">No context added — document will be generated from title and purpose only.</p>
                </div>
              )}

              <div className="space-y-2">
                {contextSources.map((src, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-tetri-surface rounded-lg">
                    <span className="text-xs font-medium text-tetri-text w-24 flex-shrink-0 capitalize">
                      {SOURCE_TYPES.find(s => s.value === src.sourceType)?.label || src.sourceType}
                    </span>
                    {src.sourceType !== 'company' ? (
                      <select
                        value={src.sourceRecordId}
                        onChange={e => updateSource(i, 'sourceRecordId', e.target.value)}
                        className="flex-1 text-xs border border-tetri-border rounded-lg px-2 py-1.5 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue"
                      >
                        <option value="">Select…</option>
                        {getRecordOptions(src.sourceType).map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                      </select>
                    ) : (
                      <span className="flex-1 text-xs text-tetri-neutral italic">Workspace company information</span>
                    )}
                    <button type="button" onClick={() => removeSource(i)} className="text-xs text-tetri-neutral hover:text-tetri-error px-1">✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-tetri-text mb-1.5">Additional Instructions</label>
              <textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Any specific instructions, formatting requirements, or content to include or avoid…"
                rows={4}
                className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue resize-none"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={handleGenerate} disabled={generating} className="gap-2">
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 — Preview & Save */}
        {step === 2 && generated && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Document generated successfully</span>
              {generated.provider && (
                <span className="text-xs text-green-600 ml-auto">{generated.provider} · {generated.model}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-tetri-text mb-1.5">Generated Content</label>
              <textarea
                value={generated.generatedContent}
                onChange={e => setGenerated(p => ({ ...p, generatedContent: e.target.value }))}
                rows={18}
                className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue resize-y font-mono"
              />
              <p className="text-xs text-tetri-neutral mt-1">You can edit the content before saving.</p>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Document
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
