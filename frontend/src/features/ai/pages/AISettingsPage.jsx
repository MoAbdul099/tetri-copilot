import { useState, useEffect, useCallback } from 'react';
import { Brain, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Save, Plus, Pencil } from 'lucide-react';
import aiAdminService from '../services/aiAdminService';
import { Toast } from '../../../components/shared/Toast.jsx';

const STATUS_BADGE = {
  healthy: 'bg-emerald-50 text-emerald-700',
  degraded:'bg-yellow-50 text-yellow-700',
  down:    'bg-red-50 text-red-700',
  unknown: 'bg-slate-100 text-slate-500',
};

function ProviderCard({ provider, onToggle }) {
  const statusColor = STATUS_BADGE[provider.status] || STATUS_BADGE.unknown;
  return (
    <div className="bg-tetri-surface border border-tetri-border rounded-xl p-4 flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-tetri-text">{provider.name}</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>{provider.status}</span>
          {provider.enabled && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">Enabled</span>}
        </div>
        <p className="text-xs text-tetri-muted font-mono truncate">{provider.endpoint || '—'}</p>
        <p className="text-xs text-tetri-muted mt-1">{provider.models?.length || 0} model{provider.models?.length !== 1 ? 's' : ''} configured</p>
      </div>
      <button
        onClick={() => onToggle(provider)}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          provider.enabled
            ? 'border-red-200 text-red-600 hover:bg-red-50'
            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
        }`}
      >
        {provider.enabled ? 'Disable' : 'Enable'}
      </button>
    </div>
  );
}

function ModelRow({ model, onEdit }) {
  return (
    <tr className="border-b border-tetri-border hover:bg-tetri-bg/50 transition-colors">
      <td className="px-4 py-3 text-sm font-medium text-tetri-text">{model.modelName}</td>
      <td className="px-4 py-3 text-xs text-tetri-muted">{model.provider?.name}</td>
      <td className="px-4 py-3 text-xs text-tetri-muted">{model.contextWindow?.toLocaleString() || '—'}</td>
      <td className="px-4 py-3 text-xs text-tetri-muted">${model.inputCostPer1k ?? '—'} / ${model.outputCostPer1k ?? '—'}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {model.isDefault && <span className="px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700">Default</span>}
          {model.active ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
        </div>
      </td>
      <td className="px-4 py-3">
        <button onClick={() => onEdit(model)} className="p-1.5 rounded-lg text-tetri-muted hover:bg-tetri-bg transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}

function ConfigForm({ config, onSave, saving }) {
  const [form, setForm] = useState(config || {});
  useEffect(() => { if (config) setForm(config); }, [config]);

  const field = (key, label, type = 'text') => (
    <div>
      <label className="block text-xs font-medium text-tetri-muted mb-1">{label}</label>
      <input
        type={type}
        value={form[key] || ''}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full px-3 py-2 rounded-lg border border-tetri-border text-sm focus:outline-none focus:ring-2 focus:ring-tetri-blue/30"
      />
    </div>
  );

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {field('default_provider',   'Default Provider')}
        {field('default_model',      'Default Model')}
        {field('temperature',        'Temperature',       'number')}
        {field('max_tokens',         'Max Tokens',        'number')}
        {field('max_retries',        'Max Retries',       'number')}
        {field('timeout_ms',         'Timeout (ms)',      'number')}
        {field('daily_quota',        'Daily Quota (reqs)','number')}
        {field('monthly_quota',      'Monthly Quota',     'number')}
        {field('cost_limit_daily',   'Daily Cost Limit ($)','number')}
        {field('cost_limit_monthly', 'Monthly Cost Limit ($)','number')}
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-tetri-blue text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Configuration'}
        </button>
      </div>
    </form>
  );
}

const TABS = ['Providers', 'Models', 'Configuration'];

export default function AISettingsPage() {
  const [tab,       setTab]       = useState('Providers');
  const [providers, setProviders] = useState([]);
  const [models,    setModels]    = useState([]);
  const [config,    setConfig]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, m, c] = await Promise.all([
        aiAdminService.listProviders(),
        aiAdminService.listModels(),
        aiAdminService.getConfig(),
      ]);
      setProviders(p);
      setModels(m);
      setConfig(c);
    } catch { setToast({ type: 'error', message: 'Failed to load AI settings' }); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (provider) => {
    try {
      await aiAdminService.updateProvider(provider.id, { enabled: !provider.enabled });
      setToast({ type: 'success', message: `Provider ${provider.enabled ? 'disabled' : 'enabled'}` });
      load();
    } catch { setToast({ type: 'error', message: 'Failed to update provider' }); }
  };

  const handleSaveConfig = async (data) => {
    setSaving(true);
    try {
      await aiAdminService.updateConfig(data);
      setToast({ type: 'success', message: 'Configuration saved' });
      load();
    } catch { setToast({ type: 'error', message: 'Failed to save config' }); }
    finally  { setSaving(false); }
  };

  const handleEditModel = async (model) => {
    const active = window.confirm(`Toggle model "${model.modelName}" active status?`);
    if (!active) return;
    try {
      await aiAdminService.updateModel(model.id, { active: !model.active });
      setToast({ type: 'success', message: 'Model updated' });
      load();
    } catch { setToast({ type: 'error', message: 'Failed to update model' }); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-tetri-text flex items-center gap-2">
            <Brain className="w-5 h-5 text-tetri-muted" /> AI Platform
          </h1>
          <p className="text-sm text-tetri-muted mt-0.5">Manage AI providers, models, and configuration</p>
        </div>
        <button onClick={load} className="p-1.5 rounded-lg border border-tetri-border text-tetri-muted hover:bg-tetri-bg transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-tetri-border">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-tetri-blue text-tetri-blue' : 'border-transparent text-tetri-muted hover:text-tetri-text'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <RefreshCw className="w-5 h-5 text-tetri-muted animate-spin" />
        </div>
      ) : (
        <>
          {tab === 'Providers' && (
            <div className="space-y-3">
              {providers.length === 0
                ? <p className="text-sm text-tetri-muted">No providers found.</p>
                : providers.map(p => <ProviderCard key={p.id} provider={p} onToggle={handleToggle} />)
              }
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-medium mb-1">API Key Configuration</p>
                <p className="text-xs">Provider API keys are configured via environment variables on the server: <code className="font-mono">OPENAI_API_KEY</code>, <code className="font-mono">ANTHROPIC_API_KEY</code>. They are never stored in the database.</p>
              </div>
            </div>
          )}

          {tab === 'Models' && (
            <div className="bg-tetri-surface border border-tetri-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-tetri-border bg-tetri-bg">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-tetri-muted">Model</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-tetri-muted">Provider</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-tetri-muted">Context</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-tetri-muted">Cost / 1K tokens (in/out)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-tetri-muted">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {models.map(m => <ModelRow key={m.id} model={m} onEdit={handleEditModel} />)}
                </tbody>
              </table>
              {models.length === 0 && <p className="px-4 py-8 text-center text-sm text-tetri-muted">No models configured.</p>}
            </div>
          )}

          {tab === 'Configuration' && (
            <div className="bg-tetri-surface border border-tetri-border rounded-xl p-5">
              <ConfigForm config={config} onSave={handleSaveConfig} saving={saving} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
