import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, Save, Lock } from 'lucide-react';
import { getPreference, updatePreference } from '../services/notificationService';
import { Toast } from '../../../components/shared/Toast.jsx';

const MANDATORY_CATEGORIES = ['security', 'billing', 'compliance', 'system'];

const CATEGORY_ROWS = [
  { code: 'security',   label: 'Security',    description: 'Authentication and account security events' },
  { code: 'workspace',  label: 'Workspace',   description: 'Workspace and user management activity' },
  { code: 'billing',    label: 'Billing',     description: 'Subscription, plan, and payment events' },
  { code: 'compliance', label: 'Compliance',  description: 'Compliance calendar and task events' },
  { code: 'invoice',    label: 'Invoice',     description: 'Invoice and receivable events' },
  { code: 'payment',    label: 'Payment',     description: 'Payment and allocation events' },
  { code: 'expense',    label: 'Expense',     description: 'Expense lifecycle events' },
  { code: 'approval',   label: 'Approval',    description: 'Approval requests and decisions' },
  { code: 'customer',   label: 'Customer',    description: 'Customer lifecycle events' },
  { code: 'file',       label: 'File',        description: 'File upload and attachment events' },
  { code: 'system',     label: 'System',      description: 'General system notices' },
];

const DEFAULT_PREFS = {
  enableInApp: true,
  enableEmail: true,
  frequency: 'immediate',
};

export default function NotificationPreferencesPage() {
  const navigate = useNavigate();
  const [prefs, setPrefs]     = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  useEffect(() => {
    getPreference()
      .then((data) => { if (data) setPrefs((p) => ({ ...p, ...data })); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreference({
        enableInApp: prefs.enableInApp,
        enableEmail: prefs.enableEmail,
        frequency:   prefs.frequency,
      });
      setToast({ message: 'Preferences saved', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save preferences', type: 'error' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-sm text-tetri-neutral py-12 text-center">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-tetri-muted hover:text-tetri-text">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-tetri-text flex items-center gap-2">
            <Bell className="w-5 h-5 text-tetri-blue" /> Notification Preferences
          </h1>
          <p className="text-sm text-tetri-muted mt-0.5">Control how you receive notifications.</p>
        </div>
      </div>

      {/* Global toggles */}
      <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-tetri-text">Global Settings</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-tetri-text">In-app notifications</p>
              <p className="text-xs text-tetri-muted">Receive notifications in the notification center</p>
            </div>
            <button
              type="button"
              onClick={() => setPrefs((p) => p ? { ...p, enableInApp: !p.enableInApp } : p)}
              className={`relative w-10 h-5 rounded-full transition-colors ${prefs?.enableInApp ? 'bg-tetri-blue' : 'bg-tetri-border'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${prefs?.enableInApp ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-tetri-text">Email notifications</p>
              <p className="text-xs text-tetri-muted">Receive notifications via email</p>
            </div>
            <button
              type="button"
              onClick={() => setPrefs((p) => p ? { ...p, enableEmail: !p.enableEmail } : p)}
              className={`relative w-10 h-5 rounded-full transition-colors ${prefs?.enableEmail ? 'bg-tetri-blue' : 'bg-tetri-border'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${prefs?.enableEmail ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-tetri-text">Delivery frequency</p>
              <p className="text-xs text-tetri-muted">How often you receive email notification digests</p>
            </div>
            <select
              value={prefs?.frequency || 'immediate'}
              onChange={(e) => setPrefs((p) => ({ ...p, frequency: e.target.value }))}
              className="text-sm border border-tetri-border rounded-lg px-2 py-1 bg-tetri-surface text-tetri-text"
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily digest</option>
              <option value="weekly">Weekly digest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category-level awareness (display only in this phase) */}
      <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-tetri-text mb-1">Notification Categories</h2>
        <p className="text-xs text-tetri-muted mb-4">Mandatory categories are always delivered and cannot be disabled.</p>
        <div className="space-y-2">
          {CATEGORY_ROWS.map(({ code, label, description }) => {
            const mandatory = MANDATORY_CATEGORIES.includes(code);
            return (
              <div key={code} className="flex items-center justify-between gap-4 py-2 border-b border-tetri-border/60 last:border-0">
                <div className="flex items-start gap-2">
                  {mandatory && <Lock className="w-3.5 h-3.5 text-tetri-neutral mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className="text-sm font-medium text-tetri-text">{label}</p>
                    <p className="text-xs text-tetri-muted">{description}</p>
                    {mandatory && <p className="text-[10px] text-tetri-neutral mt-0.5">Required — cannot be disabled</p>}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${mandatory ? 'bg-emerald-50 text-emerald-700' : 'bg-tetri-bg text-tetri-neutral'}`}>
                  {mandatory ? 'Always on' : 'Active'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-tetri-blue text-white text-sm font-medium rounded-xl hover:bg-tetri-blue/90 disabled:opacity-60 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save preferences'}
        </button>
      </div>
    </div>
  );
}
