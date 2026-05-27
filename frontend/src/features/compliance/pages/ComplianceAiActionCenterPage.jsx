import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Loader2, AlertCircle, RefreshCw, ChevronRight,
  CheckCircle, XCircle, Clock, FileText, Inbox,
} from 'lucide-react';
import { listActions, suggestActions } from '../services/complianceAiActionService.js';
import { submitAction } from '../../ai-actions/services/aiActionService.js';

const STATUS_STYLES = {
  draft:            'bg-slate-100 text-slate-600',
  pending_approval: 'bg-amber-100 text-amber-700',
  approved:         'bg-emerald-100 text-emerald-700',
  rejected:         'bg-red-100 text-red-700',
  executing:        'bg-blue-100 text-blue-700',
  completed:        'bg-emerald-100 text-emerald-700',
  failed:           'bg-red-100 text-red-700',
  cancelled:        'bg-slate-100 text-slate-500',
  expired:          'bg-slate-100 text-slate-400',
};

const RISK_COLORS = {
  low:      'text-emerald-600 bg-emerald-50 border-emerald-200',
  medium:   'text-amber-600 bg-amber-50 border-amber-200',
  high:     'text-orange-600 bg-orange-50 border-orange-200',
  critical: 'text-red-600 bg-red-50 border-red-200',
};

const TABS = [
  { id: 'all',              label: 'All' },
  { id: 'draft',            label: 'Draft' },
  { id: 'pending_approval', label: 'Pending' },
  { id: 'approved',         label: 'Approved' },
  { id: 'completed',        label: 'Completed' },
  { id: 'rejected',         label: 'Rejected' },
];

export default function ComplianceAiActionCenterPage() {
  const navigate = useNavigate();
  const [tab, setTab]         = useState('all');
  const [items, setItems]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [submitting, setSubmitting] = useState('');
  const [err, setErr]         = useState('');
  const [msg, setMsg]         = useState('');

  async function load(status = tab) {
    setErr(''); setLoading(true);
    try {
      const data = await listActions({ status: status === 'all' ? undefined : status, pageSize: 50 });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(tab); }, [tab]);

  async function handleSuggest() {
    setSuggesting(true); setErr(''); setMsg('');
    try {
      const data = await suggestActions();
      setMsg(`${data.suggested} action${data.suggested !== 1 ? 's' : ''} suggested and added to Draft.`);
      load(tab);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setSuggesting(false); }
  }

  async function handleSubmit(actionId) {
    setSubmitting(actionId); setErr('');
    try {
      await submitAction(actionId);
      load(tab);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally { setSubmitting(''); }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100">
            <Zap className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Compliance AI Actions</h1>
            <p className="text-sm text-slate-500">AI-generated compliance actions — governed, audited, controlled</p>
          </div>
        </div>
        <button
          onClick={handleSuggest}
          disabled={suggesting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors"
        >
          {suggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Suggest Actions
        </button>
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

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-200 rounded-2xl">
          <Inbox className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600 mb-1">No compliance AI actions</p>
          <p className="text-xs text-slate-400 max-w-xs">Click "Suggest Actions" to have AI analyze your compliance state and generate proposals.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 mb-3">{total} action{total !== 1 ? 's' : ''} total</p>
          <div className="flex flex-col gap-3">
            {items.map(action => (
              <div key={action.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border capitalize ${RISK_COLORS[action.riskLevel] || RISK_COLORS.medium}`}>
                        {action.riskLevel} risk
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[action.status] || STATUS_STYLES.draft}`}>
                        {action.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-400">{action.actionType?.replace(/_/g, ' ')}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-2 line-clamp-2">{action.description}</p>
                    {action.explanation && (
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 font-medium mb-0.5">Why:</p>
                        <p className="text-xs text-slate-600 line-clamp-2">{action.explanation}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                      <span>Confidence: {action.confidenceScore}%</span>
                      <span>{new Date(action.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/ai/actions/${action.id}`)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {action.status === 'draft' && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleSubmit(action.id)}
                      disabled={submitting === action.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                    >
                      {submitting === action.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Submit for Approval
                    </button>
                    <button
                      onClick={() => navigate(`/ai/actions/${action.id}`)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
