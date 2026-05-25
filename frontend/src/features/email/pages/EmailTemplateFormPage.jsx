import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Send, Eye, FlaskConical, Loader2, Copy, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import {
  getTemplate, createTemplate, updateTemplate, publishTemplate,
  previewTemplate, sendTestEmail,
} from '../services/emailService.js';

const CATEGORIES = ['workspace', 'approval', 'expense', 'invoice', 'payment', 'billing', 'compliance', 'system'];
const LANGUAGES  = [{ value: 'en', label: 'English' }, { value: 'ar', label: 'Arabic' }, { value: 'ka', label: 'Georgian' }];

const VARIABLE_GROUPS = [
  {
    label: 'Global',
    vars: ['workspace_name', 'company_name', 'current_date', 'support_email', 'app_url'],
  },
  {
    label: 'User',
    vars: ['first_name', 'last_name', 'user_name', 'email', 'role'],
  },
  {
    label: 'Invoice',
    vars: ['invoice_number', 'invoice_date', 'invoice_due_date', 'invoice_amount', 'currency'],
  },
  {
    label: 'Expense',
    vars: ['expense_number', 'expense_amount', 'expense_status'],
  },
  {
    label: 'Compliance',
    vars: ['compliance_title', 'compliance_due_date', 'compliance_status'],
  },
  {
    label: 'Billing',
    vars: ['subscription_plan', 'subscription_amount', 'renewal_date'],
  },
  {
    label: 'Generic',
    vars: ['title', 'body', 'source_link'],
  },
];

export default function EmailTemplateFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const isEdit = !!id;

  const [form, setForm] = useState({
    code: '', name: '', category: 'workspace', language: 'en',
    subject: '', bodyHtml: '', bodyText: '',
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('draft');
  const [openGroup, setOpenGroup] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getTemplate(id)
      .then((t) => {
        setForm({
          code:     t.code,
          name:     t.name,
          category: t.category,
          language: t.language,
          subject:  t.subject,
          bodyHtml: t.bodyHtml,
          bodyText: t.bodyText || '',
        });
        setCurrentStatus(t.status);
      })
      .catch(() => showToast('error', 'Failed to load template'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.subject.trim() || !form.bodyHtml.trim()) {
      showToast('error', 'Subject and HTML body are required');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateTemplate(id, form);
        showToast('success', 'Template saved');
      } else {
        if (!form.code.trim() || !form.name.trim()) {
          showToast('error', 'Code and name are required');
          setSaving(false);
          return;
        }
        const created = await createTemplate(form);
        showToast('success', 'Template created');
        navigate(`/settings/email-templates/${created.id}/edit`, { replace: true });
      }
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!isEdit) { showToast('error', 'Save first before publishing'); return; }
    setPublishing(true);
    try {
      await publishTemplate(id);
      setCurrentStatus('published');
      showToast('success', 'Template published');
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  const handlePreview = async () => {
    if (!isEdit) { showToast('error', 'Save the template first to preview'); return; }
    setPreviewLoading(true);
    try {
      const result = await previewTemplate(id, {});
      setPreviewHtml(result.bodyHtml || result.html || '');
      setShowPreview(true);
    } catch (err) {
      showToast('error', 'Preview failed');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) { showToast('error', 'Enter a recipient email'); return; }
    if (!isEdit) { showToast('error', 'Save first before sending test'); return; }
    setTestLoading(true);
    try {
      await sendTestEmail(id, { toEmail: testEmail });
      showToast('success', `Test email sent to ${testEmail}`);
      setShowTestModal(false);
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to send test');
    } finally {
      setTestLoading(false);
    }
  };

  const insertVar = (v) => {
    setForm((f) => ({ ...f, bodyHtml: f.bodyHtml + `{{${v}}}` }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {ToastContainer}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-tetri-text">Email Preview</h2>
              <button onClick={() => setShowPreview(false)} className="text-tetri-neutral hover:text-tetri-text text-2xl leading-none">&times;</button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[75vh]">
              <iframe
                srcDoc={previewHtml}
                title="Email Preview"
                className="w-full border-0 rounded-xl"
                style={{ height: '600px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="font-semibold text-tetri-text">Send Test Email</h2>
            <div>
              <label className="block text-sm font-medium text-tetri-text mb-1.5">Recipient Email</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTestModal(false)} className="px-4 py-2 text-sm rounded-xl border border-tetri-border text-tetri-muted hover:bg-tetri-bg transition-colors">
                Cancel
              </button>
              <Button onClick={handleSendTest} disabled={testLoading}>
                {testLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      <PageHeader
        title={isEdit ? 'Edit Template' : 'New Template'}
        subtitle={isEdit ? `Status: ${currentStatus}` : 'Create an email template'}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/settings/email-templates')}
            className="flex items-center gap-1.5 text-sm text-tetri-muted hover:text-tetri-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {isEdit && (
            <>
              <button
                onClick={handlePreview}
                disabled={previewLoading}
                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-tetri-border bg-tetri-surface text-tetri-muted hover:text-tetri-text hover:bg-tetri-bg transition-colors"
              >
                {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Preview
              </button>
              <button
                onClick={() => setShowTestModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-tetri-border bg-tetri-surface text-tetri-muted hover:text-tetri-text hover:bg-tetri-bg transition-colors"
              >
                <FlaskConical className="w-4 h-4" /> Test
              </button>
            </>
          )}
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            Save Draft
          </Button>
          {currentStatus !== 'published' && (
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
              Publish
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main form */}
        <div className="lg:col-span-3 space-y-5">
          {/* Meta */}
          <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-tetri-text">Template Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Template Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={set('code')}
                  disabled={isEdit}
                  placeholder="e.g. invoice_created"
                  className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20 font-mono disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Template Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Invoice Created"
                  className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Category</label>
                <select value={form.category} onChange={set('category')} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20 capitalize">
                  {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Language</label>
                <select value={form.language} onChange={set('language')} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20">
                  {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-tetri-text">Subject Line</h3>
            <input
              type="text"
              value={form.subject}
              onChange={set('subject')}
              placeholder="e.g. New invoice created — {{workspace_name}}"
              className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
            />
          </div>

          {/* HTML Body */}
          <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-tetri-text">HTML Body</h3>
              <span className="text-xs text-tetri-neutral">Use {`{{variable}}`} syntax for dynamic content</span>
            </div>
            <textarea
              value={form.bodyHtml}
              onChange={set('bodyHtml')}
              rows={18}
              placeholder="Paste your HTML email content here…"
              className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20 font-mono resize-y"
            />
          </div>

          {/* Plain Text Body */}
          <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-tetri-text">Plain Text Body <span className="text-tetri-neutral font-normal">(optional)</span></h3>
            <textarea
              value={form.bodyText}
              onChange={set('bodyText')}
              rows={6}
              placeholder="Plain text fallback for email clients that don't render HTML…"
              className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20 resize-y"
            />
          </div>
        </div>

        {/* Variable picker sidebar */}
        <div className="space-y-4">
          <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-4 sticky top-4">
            <h3 className="text-sm font-semibold text-tetri-text mb-3">Variable Reference</h3>
            <p className="text-xs text-tetri-neutral mb-4">Click a variable to append it to the HTML body.</p>
            <div className="space-y-2">
              {VARIABLE_GROUPS.map((group) => (
                <div key={group.label} className="border border-tetri-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenGroup((prev) => prev === group.label ? null : group.label)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-tetri-text bg-tetri-bg hover:bg-tetri-border/30 transition-colors"
                  >
                    {group.label}
                    <ChevronDown className={`w-3 h-3 transition-transform ${openGroup === group.label ? 'rotate-180' : ''}`} />
                  </button>
                  {openGroup === group.label && (
                    <div className="p-2 space-y-1">
                      {group.vars.map((v) => (
                        <button
                          key={v}
                          onClick={() => insertVar(v)}
                          className="w-full text-left flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-mono text-tetri-muted hover:bg-tetri-bg hover:text-tetri-blue transition-colors group"
                        >
                          <span>{`{{${v}}}`}</span>
                          <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
