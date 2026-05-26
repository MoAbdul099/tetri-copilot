import { useEffect, useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Play, RotateCcw, CheckCircle, Archive, Tag, Clock } from 'lucide-react';
import aiAdminService from '../services/aiAdminService';
import PageHeader from '../../../components/shared/PageHeader';

const STATUS_COLORS = {
  active:   'bg-emerald-100 text-emerald-700',
  draft:    'bg-yellow-100 text-yellow-700',
  archived: 'bg-slate-100 text-slate-500',
};

const CATEGORIES = ['general', 'assistant', 'classification', 'extraction', 'summarization', 'analytics', 'compliance', 'recommendation'];

export default function AIPromptsPage() {
  const [prompts,   setPrompts]   = useState([]);
  const [groups,    setGroups]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState(null);
  const [modal,     setModal]     = useState(null); // 'create' | 'version' | 'test'
  const [selected,  setSelected]  = useState(null);
  const [testResult,setTestResult]= useState(null);
  const [saving,    setSaving]    = useState(false);

  const [form, setForm] = useState({ name: '', description: '', category: 'general', groupId: '' });
  const [versionForm, setVersionForm] = useState({ content: '', changeNotes: '' });
  const [testForm, setTestForm] = useState({ variables: '{}' });

  async function load() {
    setLoading(true);
    try {
      const [p, g] = await Promise.all([aiAdminService.listPrompts(), aiAdminService.listPromptGroups()]);
      setPrompts(p);
      setGroups(g);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    setSaving(true);
    try {
      await aiAdminService.createPrompt(form);
      setModal(null);
      setForm({ name: '', description: '', category: 'general', groupId: '' });
      await load();
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  }

  async function handleCreateVersion() {
    setSaving(true);
    try {
      await aiAdminService.createVersion(selected.id, versionForm);
      setModal(null);
      setVersionForm({ content: '', changeNotes: '' });
      await load();
      const updated = await aiAdminService.getPrompt(selected.id);
      setSelected(updated);
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  }

  async function handleActivate(promptId, versionId) {
    try {
      await aiAdminService.activateVersion(promptId, { versionId });
      await load();
      if (selected?.id === promptId) {
        const updated = await aiAdminService.getPrompt(promptId);
        setSelected(updated);
      }
    } catch (e) { alert(e.message); }
  }

  async function handleTest() {
    setSaving(true);
    setTestResult(null);
    try {
      let vars = {};
      try { vars = JSON.parse(testForm.variables); } catch { alert('Variables must be valid JSON'); setSaving(false); return; }
      const result = await aiAdminService.testPrompt({ promptId: selected.id, variables: vars });
      setTestResult(result);
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  }

  async function handleArchive(id) {
    if (!confirm('Archive this prompt?')) return;
    await aiAdminService.archivePrompt(id);
    await load();
  }

  async function expandRow(prompt) {
    if (expanded === prompt.id) { setExpanded(null); setSelected(null); return; }
    setExpanded(prompt.id);
    const detail = await aiAdminService.getPrompt(prompt.id);
    setSelected(detail);
  }

  if (loading) return <div className="p-8 text-tetri-muted text-sm">Loading prompts…</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <PageHeader title="Prompt Management" subtitle="Create, version, and manage AI prompts">
        <button onClick={() => setModal('create')} className="flex items-center gap-2 px-4 py-2 bg-tetri-blue text-white text-sm font-medium rounded-btn hover:bg-tetri-blue-hover transition-colors">
          <Plus size={15} /> New Prompt
        </button>
      </PageHeader>

      {/* Prompt list */}
      <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden">
        {prompts.length === 0 ? (
          <div className="p-12 text-center text-tetri-muted text-sm">No prompts yet. Create your first prompt.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-tetri-bg border-b border-tetri-border">
              <tr>
                {['', 'Name', 'Category', 'Status', 'Versions', 'Group', ''].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-tetri-border">
              {prompts.map((p) => (
                <>
                  <tr key={p.id} className="hover:bg-tetri-bg/50 transition-colors cursor-pointer" onClick={() => expandRow(p)}>
                    <td className="px-4 py-3">
                      {expanded === p.id ? <ChevronDown size={14} className="text-tetri-muted" /> : <ChevronRight size={14} className="text-tetri-muted" />}
                    </td>
                    <td className="px-4 py-3 font-medium text-tetri-text">{p.name}</td>
                    <td className="px-4 py-3 text-tetri-muted capitalize">{p.category}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_COLORS[p.status] || 'bg-slate-100 text-slate-600'}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-tetri-muted">{p._count?.versions ?? 0}</td>
                    <td className="px-4 py-3 text-tetri-muted">{p.group?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setSelected(p); setModal('version'); }} className="text-xs text-tetri-blue hover:underline">+ Version</button>
                        {p.status !== 'archived' && (
                          <button onClick={() => handleArchive(p.id)} className="text-xs text-tetri-muted hover:text-tetri-error"><Archive size={12} /></button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded version history */}
                  {expanded === p.id && selected?.id === p.id && (
                    <tr key={`${p.id}-detail`}>
                      <td colSpan={7} className="bg-tetri-bg px-6 py-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-tetri-neutral uppercase tracking-wider">Versions</span>
                            <button onClick={() => { setModal('test'); setTestResult(null); }} className="flex items-center gap-1 text-xs text-violet-600 hover:underline">
                              <Play size={11} /> Test active version
                            </button>
                          </div>
                          {selected.versions?.length === 0 && <p className="text-xs text-tetri-muted">No versions yet.</p>}
                          <div className="space-y-2">
                            {selected.versions?.map((v) => (
                              <div key={v.id} className="flex items-start gap-3 bg-tetri-surface border border-tetri-border rounded-lg p-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-tetri-text">v{v.versionNumber}</span>
                                    <span className={`px-1.5 py-0.5 text-xs rounded font-medium ${STATUS_COLORS[v.status] || 'bg-slate-100 text-slate-500'}`}>{v.status}</span>
                                    {selected.activeVersionId === v.id && <CheckCircle size={12} className="text-emerald-500" />}
                                    <span className="text-xs text-tetri-muted ml-auto"><Clock size={11} className="inline mr-1" />{new Date(v.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  {v.changeNotes && <p className="text-xs text-tetri-muted">{v.changeNotes}</p>}
                                  <pre className="mt-2 text-xs bg-tetri-bg rounded p-2 overflow-auto max-h-28 whitespace-pre-wrap">{v.content}</pre>
                                </div>
                                <div className="flex flex-col gap-1 shrink-0">
                                  {selected.activeVersionId !== v.id && (
                                    <button onClick={() => handleActivate(selected.id, v.id)} className="text-xs text-tetri-blue hover:underline whitespace-nowrap">Activate</button>
                                  )}
                                  {selected.activeVersionId !== v.id && selected.versions?.length > 1 && (
                                    <button onClick={() => handleActivate(selected.id, v.id)} className="text-xs text-tetri-muted hover:underline flex items-center gap-1"><RotateCcw size={10} />Rollback</button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Prompt Modal */}
      {modal === 'create' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-tetri-surface border border-tetri-border rounded-card p-6 w-full max-w-lg space-y-4">
            <h3 className="text-sm font-semibold text-tetri-text">New Prompt</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-tetri-border rounded-btn px-3 py-2 text-sm bg-tetri-bg text-tetri-text focus:outline-none focus:border-tetri-blue" placeholder="e.g. Invoice Summary Prompt" />
              </div>
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-tetri-border rounded-btn px-3 py-2 text-sm bg-tetri-bg text-tetri-text focus:outline-none focus:border-tetri-blue resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-tetri-neutral mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-tetri-border rounded-btn px-3 py-2 text-sm bg-tetri-bg text-tetri-text focus:outline-none">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-tetri-neutral mb-1">Group</label>
                  <select value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })} className="w-full border border-tetri-border rounded-btn px-3 py-2 text-sm bg-tetri-bg text-tetri-text focus:outline-none">
                    <option value="">None</option>
                    {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-tetri-muted border border-tetri-border rounded-btn hover:bg-tetri-bg">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.name} className="px-4 py-2 text-sm bg-tetri-blue text-white rounded-btn hover:bg-tetri-blue-hover disabled:opacity-50">
                {saving ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Version Modal */}
      {modal === 'version' && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-tetri-surface border border-tetri-border rounded-card p-6 w-full max-w-2xl space-y-4">
            <h3 className="text-sm font-semibold text-tetri-text">New Version — {selected.name}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1">Prompt Content *</label>
                <p className="text-xs text-tetri-muted mb-2">Use <code className="bg-tetri-bg px-1 rounded">{'{{variable_name}}'}</code> for dynamic values.</p>
                <textarea value={versionForm.content} onChange={(e) => setVersionForm({ ...versionForm, content: e.target.value })} rows={8} className="w-full border border-tetri-border rounded-btn px-3 py-2 text-sm bg-tetri-bg text-tetri-text focus:outline-none focus:border-tetri-blue resize-none font-mono" placeholder="You are a helpful assistant for {{company_name}}..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1">Change Notes</label>
                <input value={versionForm.changeNotes} onChange={(e) => setVersionForm({ ...versionForm, changeNotes: e.target.value })} className="w-full border border-tetri-border rounded-btn px-3 py-2 text-sm bg-tetri-bg text-tetri-text focus:outline-none focus:border-tetri-blue" placeholder="What changed in this version?" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-tetri-muted border border-tetri-border rounded-btn hover:bg-tetri-bg">Cancel</button>
              <button onClick={handleCreateVersion} disabled={saving || !versionForm.content} className="px-4 py-2 text-sm bg-tetri-blue text-white rounded-btn hover:bg-tetri-blue-hover disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Version'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Prompt Modal */}
      {modal === 'test' && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-tetri-surface border border-tetri-border rounded-card p-6 w-full max-w-2xl space-y-4">
            <h3 className="text-sm font-semibold text-tetri-text">Test Prompt — {selected.name}</h3>
            <div>
              <label className="block text-xs font-medium text-tetri-neutral mb-1">Variables (JSON)</label>
              <textarea value={testForm.variables} onChange={(e) => setTestForm({ ...testForm, variables: e.target.value })} rows={3} className="w-full border border-tetri-border rounded-btn px-3 py-2 text-sm bg-tetri-bg text-tetri-text focus:outline-none font-mono resize-none" placeholder='{"company_name": "Acme Corp"}' />
            </div>
            {testResult && (
              <div className="space-y-2">
                <div className="flex gap-4 text-xs text-tetri-muted">
                  <span>Tokens: {testResult.tokens}</span>
                  <span>Cost: ${testResult.cost?.toFixed(6)}</span>
                  <span>Duration: {testResult.durationMs}ms</span>
                  <span className={testResult.success ? 'text-emerald-600' : 'text-red-600'}>{testResult.success ? '✓ Success' : '✗ Failed'}</span>
                </div>
                <div className="bg-tetri-bg rounded-lg p-3 text-sm text-tetri-text whitespace-pre-wrap max-h-48 overflow-auto">
                  {testResult.output || testResult.errorMessage || 'No output'}
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => { setModal(null); setTestResult(null); }} className="px-4 py-2 text-sm text-tetri-muted border border-tetri-border rounded-btn hover:bg-tetri-bg">Close</button>
              <button onClick={handleTest} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm bg-violet-600 text-white rounded-btn hover:bg-violet-700 disabled:opacity-50">
                <Play size={13} />{saving ? 'Running…' : 'Run Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
