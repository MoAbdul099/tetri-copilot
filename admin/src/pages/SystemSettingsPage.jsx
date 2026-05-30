import { useState, useEffect, useCallback } from 'react';
import {
  Settings, Shield, Bell, Brain, FileCheck, HardDrive, Zap, Wrench,
  History, Save, RefreshCw, AlertTriangle, CheckCircle, ToggleLeft, ToggleRight,
  ChevronRight, Search,
} from 'lucide-react';
import {
  getSettings, updateSettings, listFeatureFlags, updateFeatureFlag,
  setMaintenance, getHistory,
} from '../services/adminSettingsService';

// ── helpers ──────────────────────────────────────────────────────────────────

const fmt = (v) => {
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (v === null || v === undefined) return '—';
  return String(v);
};

const TABS = [
  { id: 'overview',      label: 'Overview',       icon: Settings },
  { id: 'general',       label: 'General',         icon: Settings },
  { id: 'branding',      label: 'Branding',        icon: Settings },
  { id: 'security',      label: 'Security',         icon: Shield },
  { id: 'notifications', label: 'Notifications',   icon: Bell },
  { id: 'ai',            label: 'AI',               icon: Brain },
  { id: 'compliance',    label: 'Compliance',       icon: FileCheck },
  { id: 'storage',       label: 'Storage',          icon: HardDrive },
  { id: 'feature-flags', label: 'Feature Flags',   icon: Zap },
  { id: 'maintenance',   label: 'Maintenance',      icon: Wrench },
  { id: 'history',       label: 'History',          icon: History },
];

// ── sub-components ────────────────────────────────────────────────────────────

function FieldRow({ label, description, children }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-200">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
    />
  );
}

function NumberInput({ value, onChange, min, max }) {
  return (
    <input
      type="number"
      value={value ?? ''}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-40 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
    />
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function SaveBar({ onSave, saving, dirty }) {
  if (!dirty) return null;
  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl shadow-xl px-5 py-3 z-50">
      <span className="text-sm text-gray-300">You have unsaved changes</span>
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50"
      >
        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Changes
      </button>
    </div>
  );
}

// ── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ grouped, flags }) {
  const maintenance = grouped?.maintenance?.maintenance_mode;
  const activeFlags = flags.filter((f) => f.enabled).length;
  const betaFlags   = flags.filter((f) => f.isBeta && f.enabled).length;

  const cards = [
    { label: 'Platform', value: grouped?.general?.platform_name, sub: grouped?.general?.platform_url, color: 'blue' },
    { label: 'Maintenance Mode', value: maintenance ? 'ACTIVE' : 'Disabled', color: maintenance ? 'red' : 'green' },
    { label: 'Active Feature Flags', value: `${activeFlags} / ${flags.length}`, sub: `${betaFlags} beta`, color: 'purple' },
    { label: 'AI Provider', value: grouped?.ai?.ai_default_provider, sub: grouped?.ai?.ai_default_model, color: 'yellow' },
    { label: 'Session Timeout', value: `${grouped?.security?.session_timeout} min`, color: 'gray' },
    { label: 'Max File Size', value: `${grouped?.storage?.max_file_size_mb} MB`, color: 'gray' },
  ];

  const colorMap = { blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400', green: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', red: 'bg-red-500/10 border-red-500/30 text-red-400', purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400', yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400', gray: 'bg-gray-800 border-gray-700 text-gray-400' };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Settings Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`border rounded-xl p-4 ${colorMap[c.color]}`}>
            <p className="text-xs font-medium uppercase tracking-wide opacity-70">{c.label}</p>
            <p className="text-xl font-bold mt-1">{c.value ?? '—'}</p>
            {c.sub && <p className="text-xs opacity-60 mt-0.5">{c.sub}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Feature Flags Overview</h3>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          {flags.map((f, i) => (
            <div key={f.id} className={`flex items-center justify-between px-4 py-3 ${i !== flags.length - 1 ? 'border-b border-gray-700/50' : ''}`}>
              <div>
                <p className="text-sm text-gray-200">{f.name}</p>
                {f.description && <p className="text-xs text-gray-500">{f.description}</p>}
              </div>
              <div className="flex items-center gap-3">
                {f.isBeta && <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">beta</span>}
                <span className={`text-xs font-medium ${f.enabled ? 'text-emerald-400' : 'text-gray-500'}`}>{f.enabled ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Category settings form ────────────────────────────────────────────────────

const CATEGORY_FIELDS = {
  general: [
    { key: 'platform_name',   label: 'Platform Name',   type: 'text',   desc: 'Display name for the platform' },
    { key: 'platform_url',    label: 'Platform URL',    type: 'text',   desc: 'The public URL of the platform' },
    { key: 'support_email',   label: 'Support Email',   type: 'text',   desc: 'Email shown to users for support' },
    { key: 'support_website', label: 'Support Website', type: 'text',   desc: 'Support website or documentation URL' },
    { key: 'contact_info',    label: 'Contact Info',    type: 'text',   desc: 'Additional contact information' },
  ],
  branding: [
    { key: 'logo_url',       label: 'Logo URL',        type: 'text',   desc: 'URL of the platform logo' },
    { key: 'favicon_url',    label: 'Favicon URL',     type: 'text',   desc: 'URL of the favicon' },
    { key: 'primary_color',  label: 'Primary Color',   type: 'text',   desc: 'Hex color code for primary brand color' },
    { key: 'footer_content', label: 'Footer Content',  type: 'text',   desc: 'Text displayed in the footer' },
  ],
  security: [
    { key: 'session_timeout',    label: 'Session Timeout (min)', type: 'number', min: 5,  max: 1440, desc: 'Minutes before inactive session expires' },
    { key: 'min_password_len',   label: 'Min Password Length',   type: 'number', min: 6,  max: 32,   desc: 'Minimum characters required for passwords' },
    { key: 'require_mfa',        label: 'Require MFA',           type: 'toggle',           desc: 'Force MFA for all workspace users' },
    { key: 'max_login_attempts', label: 'Max Login Attempts',    type: 'number', min: 1,  max: 20,   desc: 'Failed attempts before account lockout' },
    { key: 'lockout_duration',   label: 'Lockout Duration (min)',type: 'number', min: 1,  max: 1440, desc: 'Minutes account stays locked after max attempts' },
  ],
  notifications: [
    { key: 'inapp_enabled',   label: 'In-App Notifications', type: 'toggle', desc: 'Enable in-app notification center' },
    { key: 'email_enabled',   label: 'Email Notifications',  type: 'toggle', desc: 'Enable email notification delivery' },
    { key: 'sms_enabled',     label: 'SMS Notifications',    type: 'toggle', desc: 'Enable SMS notifications (future capability)' },
    { key: 'reminder_days',   label: 'Reminder Days',        type: 'number', min: 1, max: 30, desc: 'Default days before due date to send reminders' },
    { key: 'escalation_days', label: 'Escalation Days',      type: 'number', min: 1, max: 30, desc: 'Days after due date before escalation triggers' },
  ],
  ai: [
    { key: 'ai_default_provider',  label: 'Default Provider',           type: 'text',   desc: 'Primary AI provider (gemini, openai, groq)' },
    { key: 'ai_default_model',     label: 'Default Model',              type: 'text',   desc: 'Default model identifier' },
    { key: 'ai_max_requests_day',  label: 'Max Requests / Day',         type: 'number', min: 10, max: 100000, desc: 'Per-workspace daily AI request cap' },
    { key: 'ai_max_cost_month',    label: 'Max Cost / Month (USD)',     type: 'number', min: 1,  max: 10000,  desc: 'Per-workspace monthly AI cost cap in USD' },
  ],
  compliance: [
    { key: 'compliance_reminder_days',   label: 'Reminder Days Before',  type: 'number', min: 1, max: 90, desc: 'Days before compliance deadline to send reminder' },
    { key: 'compliance_escalation_days', label: 'Escalation Days After', type: 'number', min: 1, max: 90, desc: 'Days after deadline before escalation is triggered' },
  ],
  storage: [
    { key: 'max_file_size_mb',   label: 'Max File Size (MB)',     type: 'number', min: 1, max: 500, desc: 'Maximum upload size in megabytes' },
    { key: 'allowed_file_types', label: 'Allowed File Types',     type: 'text',   desc: 'Comma-separated list of allowed extensions (e.g. pdf,docx,jpg)' },
    { key: 'retention_days',     label: 'Retention Period (days)',type: 'number', min: 30, max: 3650, desc: 'Default file retention in days' },
  ],
};

function CategoryForm({ category, grouped, onChange }) {
  const fields = CATEGORY_FIELDS[category] ?? [];
  const vals   = grouped?.[category] ?? {};

  return (
    <div>
      {fields.map((f) => (
        <FieldRow key={f.key} label={f.label} description={f.desc}>
          {f.type === 'toggle' ? (
            <Toggle value={!!vals[f.key]} onChange={(v) => onChange(category, f.key, v)} />
          ) : f.type === 'number' ? (
            <NumberInput value={vals[f.key]} min={f.min} max={f.max} onChange={(v) => onChange(category, f.key, v)} />
          ) : (
            <TextInput value={vals[f.key]} onChange={(v) => onChange(category, f.key, v)} />
          )}
        </FieldRow>
      ))}
    </div>
  );
}

// ── Feature Flags tab ─────────────────────────────────────────────────────────

function FeatureFlagsTab({ flags, onToggle, onRollout, saving }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Feature Flags</h2>
      <p className="text-sm text-gray-500 mb-5">Control feature availability and rollout percentages across the platform.</p>
      <div className="space-y-3">
        {flags.map((f) => (
          <div key={f.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-200">{f.name}</p>
                  {f.isBeta && <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded-full">beta</span>}
                </div>
                {f.description && <p className="text-xs text-gray-500 mt-0.5">{f.description}</p>}
                <div className="flex items-center gap-4 mt-3">
                  <label className="text-xs text-gray-400">Rollout %</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={f.rolloutPercentage}
                    onChange={(e) => onRollout(f.name, Number(e.target.value))}
                    className="w-32 accent-blue-500"
                    disabled={!f.enabled}
                  />
                  <span className="text-xs text-gray-300 w-8">{f.rolloutPercentage}%</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Toggle value={f.enabled} onChange={(v) => onToggle(f, v)} />
                <span className={`text-xs ${f.enabled ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {f.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Maintenance tab ───────────────────────────────────────────────────────────

function MaintenanceTab({ grouped, onChange, onSave, saving }) {
  const enabled = !!grouped?.maintenance?.maintenance_mode;
  const message = grouped?.maintenance?.maintenance_message ?? '';

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Maintenance Mode</h2>
      <p className="text-sm text-gray-500 mb-5">When enabled, all workspace users will see the maintenance message.</p>

      <div className={`border rounded-xl p-5 mb-5 ${enabled ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-800/50 border-gray-700'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {enabled
              ? <AlertTriangle className="w-6 h-6 text-red-400" />
              : <CheckCircle className="w-6 h-6 text-emerald-400" />}
            <div>
              <p className={`font-semibold ${enabled ? 'text-red-400' : 'text-emerald-400'}`}>
                {enabled ? 'Maintenance Mode ACTIVE' : 'Platform is Running Normally'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {enabled ? 'Users cannot access the workspace app.' : 'All features are available to users.'}
              </p>
            </div>
          </div>
          <Toggle value={enabled} onChange={(v) => onChange('maintenance', 'maintenance_mode', v)} />
        </div>
      </div>

      <FieldRow label="Maintenance Message" description="Message displayed to users when maintenance mode is active">
        <textarea
          value={message}
          onChange={(e) => onChange('maintenance', 'maintenance_message', e.target.value)}
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 resize-none"
        />
      </FieldRow>

      <div className="mt-4">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Maintenance Settings
        </button>
      </div>
    </div>
  );
}

// ── History tab ───────────────────────────────────────────────────────────────

function HistoryTab({ history, page, setPage }) {
  if (!history) return <div className="text-gray-500 text-sm">Loading…</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Settings Change History</h2>
      {history.items.length === 0 ? (
        <p className="text-gray-500 text-sm">No changes recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {history.items.map((h) => (
            <div key={h.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-200">{h.settingKey}</p>
                  <p className="text-xs text-gray-500 mt-0.5">by {h.modifiedBy}</p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <div>
                      <span className="text-gray-500">Previous: </span>
                      <span className="text-red-400 font-mono">{fmt(h.previousValue)}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-600 self-center" />
                    <div>
                      <span className="text-gray-500">New: </span>
                      <span className="text-emerald-400 font-mono">{fmt(h.newValue)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(h.modifiedAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {history.total > history.limit && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">{history.total} total changes</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 text-xs rounded bg-gray-800 border border-gray-700 text-gray-300 disabled:opacity-40">Prev</button>
            <button disabled={page * history.limit >= history.total} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 text-xs rounded bg-gray-800 border border-gray-700 text-gray-300 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab]   = useState('overview');
  const [grouped,   setGrouped]     = useState({});
  const [flags,     setFlags]       = useState([]);
  const [history,   setHistory]     = useState(null);
  const [histPage,  setHistPage]    = useState(1);
  const [dirty,     setDirty]       = useState(false);
  const [pendingUpdates, setPending] = useState({});
  const [saving,    setSaving]      = useState(false);
  const [toast,     setToast]       = useState(null);
  const [loading,   setLoading]     = useState(true);
  const [error,     setError]       = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsData, flagsData] = await Promise.all([getSettings(), listFeatureFlags()]);
      setGrouped(settingsData.grouped ?? {});
      setFlags(flagsData ?? []);
    } catch (e) {
      setError('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const h = await getHistory({ page: histPage, limit: 25 });
      setHistory(h);
    } catch {
      setHistory({ items: [], total: 0, limit: 25 });
    }
  }, [histPage]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (activeTab === 'history') loadHistory();
  }, [activeTab, loadHistory]);

  const handleChange = (category, key, value) => {
    setGrouped((prev) => ({
      ...prev,
      [category]: { ...(prev[category] ?? {}), [key]: value },
    }));
    setPending((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(pendingUpdates).map(([k, v]) => ({ key: k, value: v }));
      await updateSettings(updates);
      setPending({});
      setDirty(false);
      showToast('Settings saved successfully.');
    } catch {
      showToast('Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMaintenanceSave = async () => {
    setSaving(true);
    try {
      await updateSettings([
        { key: 'maintenance_mode',    value: grouped?.maintenance?.maintenance_mode ?? false },
        { key: 'maintenance_message', value: grouped?.maintenance?.maintenance_message ?? '' },
      ]);
      setDirty(false);
      setPending({});
      showToast('Maintenance settings saved.');
    } catch {
      showToast('Failed to save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFlagToggle = async (flag, enabled) => {
    setFlags((prev) => prev.map((f) => f.name === flag.name ? { ...f, enabled } : f));
    try {
      await updateFeatureFlag({ name: flag.name, enabled, rolloutPercentage: flag.rolloutPercentage, description: flag.description, isBeta: flag.isBeta });
      showToast(`${flag.name} ${enabled ? 'enabled' : 'disabled'}.`);
    } catch {
      setFlags((prev) => prev.map((f) => f.name === flag.name ? { ...f, enabled: !enabled } : f));
      showToast('Failed to update flag.', 'error');
    }
  };

  const handleFlagRollout = (name, pct) => {
    setFlags((prev) => prev.map((f) => f.name === name ? { ...f, rolloutPercentage: pct } : f));
    const flag = flags.find((f) => f.name === name);
    if (flag) updateFeatureFlag({ ...flag, rolloutPercentage: pct }).catch(() => {});
  };

  const categoryTabs = ['general', 'branding', 'security', 'notifications', 'ai', 'compliance', 'storage', 'maintenance'];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage global platform configuration, feature flags, and operational controls.</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border ${
          toast.type === 'error'
            ? 'bg-red-900/90 border-red-700 text-red-200'
            : 'bg-emerald-900/90 border-emerald-700 text-emerald-200'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-48 shrink-0">
          <nav className="space-y-0.5">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    activeTab === t.id
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl p-6 min-h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading settings…
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab grouped={grouped} flags={flags} />}

              {categoryTabs.includes(activeTab) && activeTab !== 'maintenance' && (
                <>
                  <h2 className="text-lg font-semibold text-white mb-4 capitalize">{activeTab} Settings</h2>
                  <CategoryForm category={activeTab} grouped={grouped} onChange={handleChange} />
                </>
              )}

              {activeTab === 'maintenance' && (
                <MaintenanceTab grouped={grouped} onChange={handleChange} onSave={handleMaintenanceSave} saving={saving} />
              )}

              {activeTab === 'feature-flags' && (
                <FeatureFlagsTab flags={flags} onToggle={handleFlagToggle} onRollout={handleFlagRollout} saving={saving} />
              )}

              {activeTab === 'history' && (
                <HistoryTab history={history} page={histPage} setPage={setHistPage} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating save bar (not for maintenance or flags — they have inline save) */}
      {activeTab !== 'maintenance' && activeTab !== 'feature-flags' && activeTab !== 'overview' && activeTab !== 'history' && (
        <SaveBar onSave={handleSave} saving={saving} dirty={dirty} />
      )}
    </div>
  );
}
