import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import { getBranding, upsertBranding } from '../services/documentTemplatesService.js';

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-tetri-text mb-1">{label}</label>
      {hint && <p className="text-xs text-tetri-neutral mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

export default function BrandingProfilePage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [form, setForm] = useState({
    profileName:    'Default',
    logoUrl:        '',
    primaryColor:   '#1E40AF',
    secondaryColor: '#64748B',
    fontName:       '',
    companyFooter:  '',
  });

  useEffect(() => {
    getBranding()
      .then(d => { if (d?.profileName) setForm({ profileName: d.profileName || 'Default', logoUrl: d.logoUrl || '', primaryColor: d.primaryColor || '#1E40AF', secondaryColor: d.secondaryColor || '#64748B', fontName: d.fontName || '', companyFooter: d.companyFooter || '' }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertBranding(form);
      showToast('success', 'Branding profile saved');
    } catch { showToast('error', 'Failed to save branding'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" /></div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {ToastContainer}

      <PageHeader title="Branding Profile" subtitle="Document branding settings for AI-generated documents" icon={<Palette className="w-5 h-5" />}>
        <Button variant="outline" onClick={() => navigate('/document-templates')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </PageHeader>

      <div className="bg-white border border-tetri-border rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-tetri-text">Identity</h3>
        <Field label="Profile Name">
          <Input value={form.profileName} onChange={e => set('profileName', e.target.value)} placeholder="Default" />
        </Field>
        <Field label="Logo URL" hint="URL to your company logo (used in AI document prompts as context)">
          <Input value={form.logoUrl} onChange={e => set('logoUrl', e.target.value)} placeholder="https://your-domain.com/logo.png" />
        </Field>
      </div>

      <div className="bg-white border border-tetri-border rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-tetri-text">Visual Branding</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary Color">
            <div className="flex gap-2">
              <input type="color" value={form.primaryColor} onChange={e => set('primaryColor', e.target.value)} className="w-10 h-10 rounded border border-tetri-border cursor-pointer p-0.5" />
              <Input value={form.primaryColor} onChange={e => set('primaryColor', e.target.value)} placeholder="#1E40AF" className="font-mono" />
            </div>
          </Field>
          <Field label="Secondary Color">
            <div className="flex gap-2">
              <input type="color" value={form.secondaryColor} onChange={e => set('secondaryColor', e.target.value)} className="w-10 h-10 rounded border border-tetri-border cursor-pointer p-0.5" />
              <Input value={form.secondaryColor} onChange={e => set('secondaryColor', e.target.value)} placeholder="#64748B" className="font-mono" />
            </div>
          </Field>
        </div>
        <Field label="Brand Font" hint="Font name to mention in AI generation prompts">
          <Input value={form.fontName} onChange={e => set('fontName', e.target.value)} placeholder="e.g. Inter, Helvetica" />
        </Field>
      </div>

      <div className="bg-white border border-tetri-border rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-tetri-text">Document Footer</h3>
        <Field label="Standard Footer Text" hint="This text is automatically added to the AI generation prompt when branding is enabled on a template">
          <textarea
            value={form.companyFooter}
            onChange={e => set('companyFooter', e.target.value)}
            placeholder="e.g. Mo Enterprise LLC | Registered in UAE | VAT: 12345 | info@company.com"
            rows={4}
            className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue resize-none"
          />
        </Field>
      </div>

      {(form.primaryColor || form.secondaryColor || form.fontName) && (
        <div className="bg-white border border-tetri-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-tetri-text mb-3">Preview</h3>
          <div className="rounded-lg border p-4 space-y-2" style={{ borderColor: form.primaryColor }}>
            <div className="h-1 rounded" style={{ backgroundColor: form.primaryColor }} />
            <p className="text-sm font-semibold" style={{ color: form.primaryColor, fontFamily: form.fontName || 'inherit' }}>Sample Document Title</p>
            <p className="text-xs" style={{ color: form.secondaryColor, fontFamily: form.fontName || 'inherit' }}>Document content appears here with your brand typography.</p>
            {form.companyFooter && <p className="text-xs border-t pt-2" style={{ color: form.secondaryColor, borderColor: form.secondaryColor + '40' }}>{form.companyFooter}</p>}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Branding Profile
        </Button>
      </div>
    </div>
  );
}
