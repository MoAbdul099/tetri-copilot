import { useState, useEffect } from 'react';
import { Siren, Plus, Trash2, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { listEscalationProfiles, createEscalationProfile, addEscalationRule, deleteEscalationRule } from '../../notifications/services/notificationService';
import Toast from '../../../components/shared/Toast.jsx';

const RECIPIENT_LABELS = {
  owner:            'Owner',
  backup_owner:     'Backup Owner',
  workspace_admin:  'Workspace Admin',
  workspace_owner:  'Workspace Owner',
};

const formatRecipients = (types) =>
  types.split(',').map((t) => RECIPIENT_LABELS[t.trim()] || t.trim()).join(' + ');

export default function EscalationProfilesPage() {
  const [profiles, setProfiles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState({});
  const [creating, setCreating]   = useState(false);
  const [newName, setNewName]     = useState('');
  const [ruleForm, setRuleForm]   = useState({});
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const load = async () => {
    setLoading(true);
    try { const d = await listEscalationProfiles(); setProfiles(d); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createEscalationProfile({ name: newName.trim() });
      setNewName(''); setCreating(false);
      showToast('Profile created'); load();
    } catch { showToast('Failed', 'error'); }
  };

  const handleAddRule = async (profileId) => {
    const f = ruleForm[profileId] || {};
    if (!f.triggerAfterDays) return;
    try {
      await addEscalationRule(profileId, {
        level:            parseInt(f.level, 10) || 1,
        triggerAfterDays: parseInt(f.triggerAfterDays, 10),
        recipientTypes:   f.recipientTypes || 'owner',
      });
      setRuleForm((p) => ({ ...p, [profileId]: {} }));
      showToast('Rule added'); load();
    } catch { showToast('Failed', 'error'); }
  };

  const handleDeleteRule = async (ruleId) => {
    try { await deleteEscalationRule(ruleId); showToast('Rule removed'); load(); }
    catch { showToast('Failed', 'error'); }
  };

  if (loading) return <p className="text-sm text-tetri-neutral py-10 text-center">Loading…</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-tetri-text flex items-center gap-2">
            <Siren className="w-5 h-5 text-red-500" /> Escalation Profiles
          </h1>
          <p className="text-sm text-tetri-muted mt-0.5">Define escalation paths when obligations become overdue</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-3 py-2 bg-tetri-blue text-white text-sm font-medium rounded-xl hover:bg-tetri-blue-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> New Profile
        </button>
      </div>

      {creating && (
        <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-4 flex items-center gap-3">
          <input
            autoFocus value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
            placeholder="Profile name"
            className="flex-1 border border-tetri-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tetri-blue/20 bg-tetri-bg"
          />
          <button onClick={handleCreate} className="px-4 py-2 bg-tetri-blue text-white text-sm font-medium rounded-xl">Create</button>
          <button onClick={() => setCreating(false)} className="px-3 py-2 text-sm text-tetri-muted hover:text-tetri-text">Cancel</button>
        </div>
      )}

      <div className="space-y-3">
        {profiles.map((profile) => (
          <div key={profile.id} className="bg-tetri-surface border border-tetri-border rounded-2xl overflow-hidden">
            <button
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-tetri-bg transition-colors text-left"
              onClick={() => setExpanded((p) => ({ ...p, [profile.id]: !p[profile.id] }))}
            >
              {profile.isSystem && <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-tetri-text">{profile.name}</p>
                {profile.description && <p className="text-xs text-tetri-muted mt-0.5 truncate">{profile.description}</p>}
                <p className="text-xs text-tetri-neutral mt-1">{profile.rules?.length || 0} level{profile.rules?.length !== 1 ? 's' : ''}</p>
              </div>
              {profile.isSystem && <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">System</span>}
              {expanded[profile.id] ? <ChevronDown className="w-4 h-4 text-tetri-neutral" /> : <ChevronRight className="w-4 h-4 text-tetri-neutral" />}
            </button>

            {expanded[profile.id] && (
              <div className="border-t border-tetri-border px-5 py-4 space-y-3">
                {profile.rules?.length === 0 ? (
                  <p className="text-xs text-tetri-neutral">No rules yet</p>
                ) : (
                  <div className="space-y-2">
                    {profile.rules.map((rule) => (
                      <div key={rule.id} className="flex items-center gap-3 py-2 border-b border-tetri-border/50 last:border-0">
                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {rule.level}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-tetri-text">After {rule.triggerAfterDays} day{rule.triggerAfterDays !== 1 ? 's' : ''} overdue</p>
                          <p className="text-xs text-tetri-muted">Notify: {formatRecipients(rule.recipientTypes)}</p>
                        </div>
                        {!profile.isSystem && (
                          <button onClick={() => handleDeleteRule(rule.id)} className="text-tetri-neutral hover:text-tetri-error flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!profile.isSystem && (
                  <div className="flex items-center gap-2 pt-2 border-t border-tetri-border/50">
                    <input
                      type="number" min="1"
                      placeholder="Level"
                      value={ruleForm[profile.id]?.level || ''}
                      onChange={(e) => setRuleForm((p) => ({ ...p, [profile.id]: { ...p[profile.id], level: e.target.value } }))}
                      className="w-16 border border-tetri-border rounded-lg px-2 py-1.5 text-xs bg-tetri-bg focus:outline-none"
                    />
                    <input
                      type="number" min="1"
                      placeholder="Days overdue"
                      value={ruleForm[profile.id]?.triggerAfterDays || ''}
                      onChange={(e) => setRuleForm((p) => ({ ...p, [profile.id]: { ...p[profile.id], triggerAfterDays: e.target.value } }))}
                      className="w-28 border border-tetri-border rounded-lg px-2 py-1.5 text-xs bg-tetri-bg focus:outline-none"
                    />
                    <select
                      value={ruleForm[profile.id]?.recipientTypes || 'owner'}
                      onChange={(e) => setRuleForm((p) => ({ ...p, [profile.id]: { ...p[profile.id], recipientTypes: e.target.value } }))}
                      className="border border-tetri-border rounded-lg px-2 py-1.5 text-xs bg-tetri-bg focus:outline-none"
                    >
                      <option value="owner">Owner</option>
                      <option value="owner,backup_owner">Owner + Backup</option>
                      <option value="workspace_admin">Workspace Admin</option>
                      <option value="workspace_owner">Workspace Owner</option>
                      <option value="owner,backup_owner,workspace_admin">All</option>
                    </select>
                    <button
                      onClick={() => handleAddRule(profile.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
