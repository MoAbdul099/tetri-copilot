import { useState, useEffect } from 'react';
import {
  ClipboardList, Package, Loader2, AlertCircle, CheckCircle,
  ChevronDown, ChevronRight, Plus, Inbox, FileText,
} from 'lucide-react';
import { listPackages, listChecklists, generatePackage, generateChecklist } from '../services/complianceAiActionService.js';

const PACKAGE_TYPES = [
  'VAT Filing Package',
  'Payroll Declaration Package',
  'Annual Reporting Package',
  'Regulatory Submission Package',
  'Compliance Readiness Report',
  'Filing Preparation Report',
];

const CHECKLIST_TYPES = [
  'VAT Filing Checklist',
  'Payroll Compliance Checklist',
  'Annual Filing Checklist',
  'Evidence Collection Checklist',
  'Document Review Checklist',
  'Regulatory Submission Checklist',
];

const PRIORITY_COLORS = {
  critical: 'text-red-600 bg-red-50',
  high:     'text-orange-600 bg-orange-50',
  medium:   'text-amber-600 bg-amber-50',
  low:      'text-emerald-600 bg-emerald-50',
};

function GenerateModal({ type, options, label, onGenerate, onClose }) {
  const [selected, setSelected] = useState(options[0]);
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState('');

  async function handleSubmit() {
    setLoading(true); setErr('');
    try {
      await onGenerate(selected);
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1">Generate {label}</h3>
        <p className="text-sm text-slate-500 mb-4">Select a type to generate with AI.</p>
        {err && <p className="text-xs text-red-600 mb-3">{err}</p>}
        <div className="space-y-2 mb-4">
          {options.map(opt => (
            <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selected === opt ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <input type="radio" name="type" value={opt} checked={selected === opt} onChange={() => setSelected(opt)} className="text-emerald-600" />
              <span className="text-sm text-slate-700">{opt}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}

function ChecklistCard({ checklist }) {
  const [open, setOpen] = useState(false);
  const data = checklist.checklistData || {};
  const items = data.items || [];
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-start justify-between p-5 hover:bg-slate-50 transition-colors text-left">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 mb-0.5">{data.title || 'Checklist'}</p>
          <p className="text-xs text-slate-500 line-clamp-1">{data.description || ''}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span>{data.totalItems || items.length} items</span>
            <span>{data.estimatedTotalTime || ''}</span>
            <span>{new Date(checklist.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />}
      </button>
      {open && items.length > 0 && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-3 space-y-2">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-5 h-5 rounded border border-slate-300 flex-shrink-0 mt-0.5 bg-white" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-sm text-slate-800">{item.task}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.medium}`}>{item.priority}</span>
                </div>
                <p className="text-xs text-slate-500">{item.category} {item.estimatedTime ? `· ${item.estimatedTime}` : ''}</p>
                {item.notes && <p className="text-xs text-slate-400 mt-0.5">{item.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PackageCard({ pkg }) {
  const [open, setOpen] = useState(false);
  const data = pkg.packageData || {};
  const sections = data.sections || [];
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-start justify-between p-5 hover:bg-slate-50 transition-colors text-left">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 mb-0.5">{data.title || pkg.packageType}</p>
          <p className="text-xs text-slate-500 line-clamp-2">{data.summary || ''}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="capitalize">{pkg.packageType}</span>
            <span>{sections.length} section{sections.length !== 1 ? 's' : ''}</span>
            <span>{new Date(pkg.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />}
      </button>
      {open && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-3">
          {sections.map((section, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-semibold text-slate-800">{section.title}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[section.priority] || PRIORITY_COLORS.medium}`}>{section.priority}</span>
              </div>
              {section.description && <p className="text-xs text-slate-500 mb-2">{section.description}</p>}
              <ul className="space-y-1">
                {(section.items || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {data.requiredDocuments?.length > 0 && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg">
              <p className="text-xs font-medium text-amber-800 mb-1">Required Documents</p>
              <ul className="space-y-0.5">
                {data.requiredDocuments.map((d, i) => <li key={i} className="text-xs text-amber-700">· {d}</li>)}
              </ul>
            </div>
          )}
          {data.timeline && (
            <p className="text-xs text-slate-500 mt-3">Estimated timeline: {data.timeline}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function CompliancePreparationCenterPage() {
  const [tab, setTab]           = useState('packages');
  const [packages, setPackages] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // 'package' | 'checklist'
  const [err, setErr]           = useState('');
  const [msg, setMsg]           = useState('');

  async function loadAll() {
    setLoading(true); setErr('');
    try {
      const [pData, cData] = await Promise.all([listPackages(), listChecklists()]);
      setPackages(pData.items || []);
      setChecklists(cData.items || []);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadAll(); }, []);

  async function handleGeneratePackage(packageType) {
    const data = await generatePackage({ packageType });
    setMsg(`Package "${data.packageData?.title || packageType}" generated.`);
    loadAll();
  }

  async function handleGenerateChecklist(checklistType) {
    const data = await generateChecklist({ checklistType });
    setMsg(`Checklist "${data.checklistData?.title || checklistType}" generated.`);
    loadAll();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-100">
            <ClipboardList className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Preparation Center</h1>
            <p className="text-sm text-slate-500">AI-generated checklists and preparation packages for compliance obligations</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModal('checklist')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ClipboardList className="w-4 h-4" /> New Checklist
          </button>
          <button
            onClick={() => setModal('package')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Package className="w-4 h-4" /> New Package
          </button>
        </div>
      </div>

      {err && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {err}
        </div>
      )}
      {msg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0" /> {msg}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Packages Generated', value: packages.length, icon: Package, color: 'text-teal-600 bg-teal-50' },
          { label: 'Checklists Generated', value: checklists.length, icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}><Icon className="w-4 h-4" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-xl p-1 w-fit">
        {[{ id: 'packages', label: 'Packages' }, { id: 'checklists', label: 'Checklists' }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : tab === 'packages' ? (
        packages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-200 rounded-2xl">
            <Package className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600 mb-1">No packages yet</p>
            <p className="text-xs text-slate-400">Click "New Package" to generate an AI preparation package.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {packages.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)}
          </div>
        )
      ) : (
        checklists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-200 rounded-2xl">
            <ClipboardList className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600 mb-1">No checklists yet</p>
            <p className="text-xs text-slate-400">Click "New Checklist" to generate an AI compliance checklist.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {checklists.map(cl => <ChecklistCard key={cl.id} checklist={cl} />)}
          </div>
        )
      )}

      {modal === 'package' && (
        <GenerateModal
          type="package"
          options={PACKAGE_TYPES}
          label="Preparation Package"
          onGenerate={handleGeneratePackage}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'checklist' && (
        <GenerateModal
          type="checklist"
          options={CHECKLIST_TYPES}
          label="Compliance Checklist"
          onGenerate={handleGenerateChecklist}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
