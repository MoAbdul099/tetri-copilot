import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import { listApprovalRules, createApprovalRule, updateApprovalRule, deleteApprovalRule } from '../services/approvalsService.js';
import { listCategories } from '../../expenses/services/expensesService.js';

const RULE_TYPE_LABELS = {
  amount_based:    'Amount-Based',
  category_based:  'Category-Based',
  department_based: 'Department-Based',
  default:         'Default (Fallback)',
};

const ROLE_LABELS = { owner: 'Owner', admin: 'Admin/Owner' };

const EMPTY_FORM = { name: '', ruleType: 'default', priority: 0, amountMin: '', amountMax: '', categoryId: '', department: '', approverRole: 'admin', approverUserId: '' };

function RuleModal({ rule, categories, onSave, onClose }) {
  const [form, setForm] = useState(rule ? {
    name: rule.name || '',
    ruleType: rule.ruleType || 'default',
    priority: rule.priority ?? 0,
    amountMin: rule.amountMin ?? '',
    amountMax: rule.amountMax ?? '',
    categoryId: rule.categoryId || '',
    department: rule.department || '',
    approverRole: rule.approverRole || 'admin',
    approverUserId: rule.approverUserId || '',
  } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('error', 'Rule name is required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        ruleType: form.ruleType,
        priority: Number(form.priority) || 0,
        approverRole: form.approverRole || undefined,
        approverUserId: form.approverUserId || undefined,
      };
      if (form.ruleType === 'amount_based') {
        if (form.amountMin !== '') payload.amountMin = Number(form.amountMin);
        if (form.amountMax !== '') payload.amountMax = Number(form.amountMax);
      }
      if (form.ruleType === 'category_based') payload.categoryId = form.categoryId || undefined;
      if (form.ruleType === 'department_based') payload.department = form.department || undefined;

      await onSave(payload);
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <h3 className="text-base font-semibold text-tetri-text">{rule ? 'Edit Rule' : 'New Approval Rule'}</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-tetri-neutral mb-1">Rule Name</label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Large Expense Approval" />
          </div>
          <div>
            <label className="block text-xs font-medium text-tetri-neutral mb-1">Rule Type</label>
            <select value={form.ruleType} onChange={(e) => set('ruleType', e.target.value)} className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue">
              {Object.entries(RULE_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-tetri-neutral mb-1">Priority (lower = first)</label>
            <Input type="number" value={form.priority} onChange={(e) => set('priority', e.target.value)} min={0} />
          </div>

          {form.ruleType === 'amount_based' && (
            <>
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1">Min Amount</label>
                <Input type="number" value={form.amountMin} onChange={(e) => set('amountMin', e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1">Max Amount (blank = unlimited)</label>
                <Input type="number" value={form.amountMax} onChange={(e) => set('amountMax', e.target.value)} placeholder="No limit" />
              </div>
            </>
          )}
          {form.ruleType === 'category_based' && (
            <div className="col-span-2">
              <label className="block text-xs font-medium text-tetri-neutral mb-1">Category</label>
              <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          {form.ruleType === 'department_based' && (
            <div className="col-span-2">
              <label className="block text-xs font-medium text-tetri-neutral mb-1">Department</label>
              <Input value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="e.g. Marketing" />
            </div>
          )}

          <div className="col-span-2">
            <label className="block text-xs font-medium text-tetri-neutral mb-1">Approver Role</label>
            <select value={form.approverRole} onChange={(e) => set('approverRole', e.target.value)} className="w-full text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-tetri-blue">
              <option value="admin">Admin / Owner (all admins and owners)</option>
              <option value="owner">Owner only</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {rule ? 'Save Changes' : 'Create Rule'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowConfigPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () =>
    Promise.all([listApprovalRules(), listCategories({ limit: 200 })])
      .then(([r, cats]) => { setRules(r || []); setCategories(cats?.items || []); })
      .catch(() => showToast('error', 'Failed to load rules'))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (editTarget?.id) {
      await updateApprovalRule(editTarget.id, data);
      showToast('success', 'Rule updated');
    } else {
      await createApprovalRule(data);
      showToast('success', 'Rule created');
    }
    setShowModal(false);
    setEditTarget(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteApprovalRule(deleteTarget.id);
      showToast('success', 'Rule deleted');
      setDeleteTarget(null);
      load();
    } catch {
      showToast('error', 'Failed to delete rule');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {ToastContainer}
      <PageHeader title="Approval Rules" subtitle="Configure how expenses are routed for approval">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/approvals')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button onClick={() => { setEditTarget(null); setShowModal(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> New Rule
          </Button>
        </div>
      </PageHeader>

      <div className="bg-tetri-bg border border-tetri-border rounded-xl p-4 text-sm text-tetri-neutral">
        Rules are evaluated in priority order (lowest number first). The first matching rule determines the approver. If no rules match, all workspace admins and owners are assigned as approvers.
      </div>

      <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-tetri-neutral text-sm">Loading…</div>
        ) : rules.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-medium text-tetri-neutral">No rules configured</p>
            <p className="text-xs text-tetri-neutral/70">All expenses will be routed to workspace admins by default</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tetri-border bg-tetri-bg">
                {['Priority', 'Name', 'Type', 'Condition', 'Approver', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="border-b border-tetri-border last:border-0">
                  <td className="px-4 py-3 text-tetri-neutral font-mono">{rule.priority}</td>
                  <td className="px-4 py-3 font-medium text-tetri-text">{rule.name}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{RULE_TYPE_LABELS[rule.ruleType] || rule.ruleType}</td>
                  <td className="px-4 py-3 text-tetri-neutral text-xs">
                    {rule.ruleType === 'amount_based' && (
                      <span>{rule.amountMin != null ? `≥ ${Number(rule.amountMin).toLocaleString()}` : ''}{rule.amountMax != null ? ` ≤ ${Number(rule.amountMax).toLocaleString()}` : ''}</span>
                    )}
                    {rule.ruleType === 'category_based' && <span>{rule.category?.name || rule.categoryId}</span>}
                    {rule.ruleType === 'department_based' && <span>{rule.department}</span>}
                    {rule.ruleType === 'default' && <span className="italic">Fallback</span>}
                  </td>
                  <td className="px-4 py-3 text-tetri-neutral">
                    {rule.approverUser ? rule.approverUser.fullName : ROLE_LABELS[rule.approverRole] || rule.approverRole || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditTarget(rule); setShowModal(true); }} className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg hover:text-tetri-text">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(rule)} className="p-1.5 rounded-lg text-tetri-neutral hover:bg-red-50 hover:text-tetri-error">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <RuleModal
          rule={editTarget}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Rule"
        description={`Delete rule "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
