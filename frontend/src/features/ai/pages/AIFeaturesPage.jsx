import { useEffect, useState } from 'react';
import { Zap, Globe, Lock, FlaskConical } from 'lucide-react';
import aiAdminService from '../services/aiAdminService';
import PageHeader from '../../../components/shared/PageHeader';

export default function AIFeaturesPage() {
  const [features, setFeatures] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState({});

  async function load() {
    setLoading(true);
    try { setFeatures(await aiAdminService.listFeatures()); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function toggle(feature) {
    setSaving((s) => ({ ...s, [feature.id]: true }));
    try {
      await aiAdminService.updateFeature(feature.id, { enabled: !feature.enabled });
      setFeatures((prev) => prev.map((f) => f.id === feature.id ? { ...f, enabled: !f.enabled } : f));
    } catch (e) { alert(e.message); }
    finally { setSaving((s) => ({ ...s, [feature.id]: false })); }
  }

  async function toggleBeta(feature) {
    setSaving((s) => ({ ...s, [`beta_${feature.id}`]: true }));
    try {
      await aiAdminService.updateFeature(feature.id, { beta: !feature.beta });
      setFeatures((prev) => prev.map((f) => f.id === feature.id ? { ...f, beta: !f.beta } : f));
    } catch (e) { alert(e.message); }
    finally { setSaving((s) => ({ ...s, [`beta_${feature.id}`]: false })); }
  }

  if (loading) return <div className="p-8 text-tetri-muted text-sm">Loading features…</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <PageHeader title="AI Feature Registry" subtitle="Enable or disable AI features across the platform" />

      <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-tetri-bg border-b border-tetri-border">
            <tr>
              {['Feature', 'Description', 'Permission', 'Beta', 'Workspaces', 'Enabled'].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-tetri-border">
            {features.map((f) => (
              <tr key={f.id} className="hover:bg-tetri-bg/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${f.enabled ? 'bg-violet-50 text-violet-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Zap size={12} />
                    </div>
                    <div>
                      <div className="font-medium text-tetri-text">{f.featureName}</div>
                      <div className="text-xs text-tetri-muted font-mono">{f.featureCode}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-tetri-muted max-w-xs truncate">{f.description || '—'}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-xs text-tetri-muted">
                    {f.permissionScope === 'admin' ? <Lock size={11} /> : <Globe size={11} />}
                    {f.permissionScope || 'member'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleBeta(f)}
                    disabled={!!saving[`beta_${f.id}`]}
                    className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium transition-colors ${f.beta ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    <FlaskConical size={10} />
                    {f.beta ? 'Beta' : 'GA'}
                  </button>
                </td>
                <td className="px-4 py-3 text-tetri-muted">{f._count?.flags ?? 0} overrides</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggle(f)}
                    disabled={!!saving[f.id]}
                    className={`relative w-10 h-5 rounded-full transition-colors ${f.enabled ? 'bg-tetri-blue' : 'bg-slate-300'} ${saving[f.id] ? 'opacity-50' : ''}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${f.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
