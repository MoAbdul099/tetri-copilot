import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, Save } from 'lucide-react';
import { getWorkspaceSettings, updateWorkspaceSettings } from '../services/notificationService';
import { Toast } from '../../../components/shared/Toast.jsx';

const PRIORITY_OPTIONS = [
  { value: 'low',      label: 'Low and above' },
  { value: 'medium',   label: 'Medium and above' },
  { value: 'high',     label: 'High and above' },
  { value: 'critical', label: 'Critical only' },
];

export default function WorkspaceNotificationSettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  useEffect(() => {
    getWorkspaceSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));
  const set    = (key, val) => setSettings((s) => ({ ...s, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await updateWorkspaceSettings(settings);
      setSettings(saved);
      setToast({ message: 'Notification settings saved', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save settings', type: 'error' });
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
            <Bell className="w-5 h-5 text-tetri-blue" /> Workspace Notification Settings
          </h1>
          <p className="text-sm text-tetri-muted mt-0.5">Configure how notifications behave across your workspace.</p>
        </div>
      </div>

      {/* Main toggles */}
      <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-tetri-text">Delivery Channels</h2>
        {[
          { key: 'notificationsEnabled', label: 'Enable notifications',       desc: 'Master switch for the notification system' },
          { key: 'inAppEnabled',         label: 'In-app notifications',       desc: 'Show notifications in the notification center and bell' },
          { key: 'toastEnabled',         label: 'Toast notifications',        desc: 'Show brief pop-up toasts for new events' },
        ].map(({ key, label, desc }) => (
          <label key={key} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-tetri-text">{label}</p>
              <p className="text-xs text-tetri-muted">{desc}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`relative w-10 h-5 rounded-full transition-colors ${settings?.[key] ? 'bg-tetri-blue' : 'bg-tetri-border'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings?.[key] ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </label>
        ))}
      </div>

      {/* Toast priority + retention */}
      <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-tetri-text">Advanced Settings</h2>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-tetri-text">Minimum toast priority</p>
            <p className="text-xs text-tetri-muted">Only show toast pop-ups at or above this priority level</p>
          </div>
          <select
            value={settings?.minimumToastPriority || 'medium'}
            onChange={(e) => set('minimumToastPriority', e.target.value)}
            className="text-sm border border-tetri-border rounded-lg px-2 py-1 bg-tetri-surface text-tetri-text"
          >
            {PRIORITY_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-tetri-text">Notification retention</p>
            <p className="text-xs text-tetri-muted">How long notifications are kept before expiry</p>
          </div>
          <select
            value={settings?.retentionMonths || 24}
            onChange={(e) => set('retentionMonths', Number(e.target.value))}
            className="text-sm border border-tetri-border rounded-lg px-2 py-1 bg-tetri-surface text-tetri-text"
          >
            {[3, 6, 12, 24, 36].map((m) => (
              <option key={m} value={m}>{m} months</option>
            ))}
          </select>
        </div>
      </div>

      {/* Future channels (read-only preview) */}
      <div className="bg-tetri-bg border border-tetri-border rounded-2xl p-5 opacity-60">
        <h2 className="text-sm font-semibold text-tetri-text mb-3">Coming Soon</h2>
        <div className="space-y-2">
          {['Email notifications', 'Reminders engine', 'Escalation automation'].map((item) => (
            <div key={item} className="flex items-center justify-between">
              <p className="text-sm text-tetri-muted">{item}</p>
              <span className="text-xs text-tetri-neutral bg-tetri-border/50 px-2 py-0.5 rounded-full">Upcoming</span>
            </div>
          ))}
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
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </div>
  );
}
