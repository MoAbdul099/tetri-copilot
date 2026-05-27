import { useState, useEffect } from 'react';
import { ShieldAlert, Loader2, AlertCircle, CheckCircle, Info, Lock, Zap, Unlock } from 'lucide-react';
import { getGovernance, setGovernanceMode } from '../services/aiActionService.js';

const MODES = [
  {
    id: 'strict',
    label: 'Strict',
    icon: Lock,
    color: 'border-red-300 bg-red-50',
    activeColor: 'border-red-500 bg-red-50 ring-2 ring-red-300',
    badge: 'bg-red-100 text-red-700',
    description: 'All AI actions require human approval before execution. Maximum governance control.',
    approvalRequired: 'All actions',
    recommended: false,
  },
  {
    id: 'standard',
    label: 'Standard',
    icon: ShieldAlert,
    color: 'border-blue-300 bg-blue-50',
    activeColor: 'border-blue-500 bg-blue-50 ring-2 ring-blue-300',
    badge: 'bg-blue-100 text-blue-700',
    description: 'High-risk and critical actions require approval. Low and medium risk actions may auto-execute if action type allows.',
    approvalRequired: 'High & Critical risk',
    recommended: true,
  },
  {
    id: 'flexible',
    label: 'Flexible',
    icon: Unlock,
    color: 'border-emerald-300 bg-emerald-50',
    activeColor: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300',
    badge: 'bg-emerald-100 text-emerald-700',
    description: 'Only critical risk actions require approval. Most AI actions execute automatically once proposed.',
    approvalRequired: 'Critical risk only',
    recommended: false,
  },
];

const POLICY_INFO = [
  {
    title: 'Access Governance',
    description: 'Controls who can create AI action proposals. Currently all workspace members with appropriate roles.',
    icon: '🔐',
  },
  {
    title: 'Approval Governance',
    description: 'Determines who can approve AI actions. Defaults to workspace Admins and Owners for high-risk actions.',
    icon: '✅',
  },
  {
    title: 'Execution Governance',
    description: 'Governs which actions may execute. Based on risk level and governance mode.',
    icon: '▶️',
  },
  {
    title: 'Audit Governance',
    description: 'All AI actions are immutably logged — creation, submission, approval decisions, execution, and failures.',
    icon: '📋',
  },
  {
    title: 'Tenant Isolation',
    description: 'All actions are fully isolated by workspace. No cross-workspace data access is permitted.',
    icon: '🏢',
  },
];

export default function AiGovernancePage() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [err, setErr]           = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await getGovernance();
        setData(result);
        setSelected(result.currentMode || 'standard');
      } catch (e) {
        setErr(e.response?.data?.error || e.message);
      } finally { setLoading(false); }
    })();
  }, []);

  async function handleSave() {
    if (selected === data?.currentMode) return;
    setSaving(true); setErr(''); setSaved(false);
    try {
      await setGovernanceMode(selected);
      setData(d => ({ ...d, currentMode: selected }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setSaving(false); }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-red-100">
          <ShieldAlert className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">AI Governance Center</h1>
          <p className="text-sm text-slate-500">Configure governance policies for AI-generated actions</p>
        </div>
      </div>

      {err && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {err}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : (
        <>
          {/* Governance mode selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Governance Mode</h2>
                <p className="text-xs text-slate-500 mt-0.5">Determines which AI actions require human approval before execution.</p>
              </div>
              <div className="flex items-center gap-2">
                {saved && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || selected === data?.currentMode}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Save Mode
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MODES.map(mode => {
                const Icon = mode.icon;
                const isActive = selected === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelected(mode.id)}
                    className={`relative text-left rounded-xl border-2 p-4 transition-all ${isActive ? mode.activeColor : `${mode.color} hover:shadow-sm`}`}
                  >
                    {mode.recommended && (
                      <span className="absolute top-3 right-3 text-xs font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Recommended</span>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-semibold text-slate-800">{mode.label}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{mode.description}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">Requires approval:</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${mode.badge}`}>{mode.approvalRequired}</span>
                    </div>
                    {isActive && (
                      <div className="absolute top-3 left-3">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current policies (existing DB records) */}
          {data?.policies?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Stored Policies</h2>
              <div className="space-y-2">
                {data.policies.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-700 capitalize">{p.policyType.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-400">{JSON.stringify(p.configuration)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Governance principles */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-slate-800">Platform Governance Principles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {POLICY_INFO.map(p => (
                <div key={p.title} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="text-lg">{p.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{p.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                <strong>Advisory only.</strong> AI actions are recommendations and drafts. All consequential actions require human review and approval. AI cannot bypass permissions, modify unauthorized data, or circumvent approval requirements.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
