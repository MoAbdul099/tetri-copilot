import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { listProfiles, createProfile, deleteProfile, addRule, deleteRule } from '../../notifications/services/notificationService';
import { Toast } from '../../../components/shared/Toast.jsx';

const DIRECTION_LABEL = { before: 'before due', after: 'after due (overdue)' };
const CHANNEL_LABEL   = { both: 'In-app + Email', inapp: 'In-app only', email: 'Email only' };

export default function ReminderProfilesPage() {
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
    try { const d = await listProfiles(); setProfiles(d); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createProfile({ name: newName.trim() });
      setNewName(''); setCreating(false);
      showToast('Profile created');
      load();
    } catch (e) { showToast(e?.response?.data?.error || 'Failed', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this profile?')) return;
    try { await deleteProfile(id); showToast('Deleted'); load(); }
    catch (e) { showToast('Failed to delete', 'error'); }
  };

  const handleAddRule = async (profileId) => {
    const f = ruleForm[profileId] || {};
    if (!f.offsetDays) return;
    try {
      await addRule(profileId, {
        offsetDays: parseInt(f.offsetDays, 10),
        direction:  f.direction || 'before',
        channel:    f.channel || 'both',
      });
      setRuleForm((prev) => ({ ...prev, [profileId]: {} }));
      showToast('Rule added');
      load();
    } catch (e) { showToast('Failed to add rule', 'error'); }
  };

  const handleDeleteRule = async (ruleId) => {
    try { await deleteRule(ruleId); showToast('Rule removed'); load(); }
    catch { showToast('Failed', 'error'); }
  };

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <p className="text-sm text-tetri-neutral py-10 text-center">Loading…</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-tetri-text flex items-center gap-2">
            <Bell className="w-5 h-5 text-tetri-blue" /> Reminder Profiles
          </h1>
          <p className="text-sm text-tetri-muted mt-0.5">Configure when reminders are sent for compliance obligations</p>
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
            autoFocus
            value={newName}
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
              onClick={() => toggleExpand(profile.id)}
            >
              {profile.isSystem && <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-tetri-text">{profile.name}</p>
                {profile.description && <p className="text-xs text-tetri-muted mt-0.5 truncate">{profile.description}</p>}
                <p className="text-xs text-tetri-neutral mt-1">{profile.rules?.length || 0} rule{profile.rules?.length !== 1 ? 's' : ''}</p>
              </div>
              {profile.isSystem
                ? <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">System</span>
                : <button onClick={(e) => { e.stopPropagation(); handleDelete(profile.id); }} className="p-1.5 text-tetri-neutral hover:text-tetri-error rounded-lg hover:bg-red-50 transition-colors mr-1"><Trash2 className="w-3.5 h-3.5" /></button>
              }
              {expanded[profile.id] ? <ChevronDown className="w-4 h-4 text-tetri-neutral flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-tetri-neutral flex-shrink-0" />}
            </button>

            {expanded[profile.id] && (
              <div className="border-t border-tetri-border px-5 py-4 space-y-3">
                {/* Rules list */}
                {profile.rules?.length === 0
                  ? <p className="text-xs text-tetri-neutral">No rules yet</p>
                  : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-tetri-neutral">
                          <th className="text-left pb-2 font-medium">Offset</th>
                          <th className="text-left pb-2 font-medium">Direction</th>
                          <th className="text-left pb-2 font-medium">Channel</th>
                          {!profile.isSystem && <th />}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-tetri-border/50">
                        {profile.rules.map((rule) => (
                          <tr key={rule.id} className="text-tetri-text">
                            <td className="py-1.5 font-medium">{rule.offsetDays} day{rule.offsetDays !== 1 ? 's' : ''}</td>
                            <td className="py-1.5 text-tetri-muted">{DIRECTION_LABEL[rule.direction]}</td>
                            <td className="py-1.5 text-tetri-muted">{CHANNEL_LABEL[rule.channel]}</td>
                            {!profile.isSystem && (
                              <td className="py-1.5 text-right">
                                <button onClick={() => handleDeleteRule(rule.id)} className="text-tetri-neutral hover:text-tetri-error">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                }

                {/* Add rule form (non-system only) */}
                {!profile.isSystem && (
                  <div className="flex items-center gap-2 pt-2 border-t border-tetri-border/50">
                    <input
                      type="number" min="1" max="365"
                      placeholder="Days"
                      value={ruleForm[profile.id]?.offsetDays || ''}
                      onChange={(e) => setRuleForm((p) => ({ ...p, [profile.id]: { ...p[profile.id], offsetDays: e.target.value } }))}
                      className="w-20 border border-tetri-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-tetri-blue/30 bg-tetri-bg"
                    />
                    <select
                      value={ruleForm[profile.id]?.direction || 'before'}
                      onChange={(e) => setRuleForm((p) => ({ ...p, [profile.id]: { ...p[profile.id], direction: e.target.value } }))}
                      className="border border-tetri-border rounded-lg px-2 py-1.5 text-xs bg-tetri-bg focus:outline-none"
                    >
                      <option value="before">Before</option>
                      <option value="after">After (overdue)</option>
                    </select>
                    <select
                      value={ruleForm[profile.id]?.channel || 'both'}
                      onChange={(e) => setRuleForm((p) => ({ ...p, [profile.id]: { ...p[profile.id], channel: e.target.value } }))}
                      className="border border-tetri-border rounded-lg px-2 py-1.5 text-xs bg-tetri-bg focus:outline-none"
                    >
                      <option value="both">In-app + Email</option>
                      <option value="inapp">In-app only</option>
                      <option value="email">Email only</option>
                    </select>
                    <button
                      onClick={() => handleAddRule(profile.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-tetri-blue text-white text-xs rounded-lg hover:bg-tetri-blue-hover"
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
