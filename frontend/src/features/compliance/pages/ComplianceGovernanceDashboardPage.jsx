import { useState, useEffect } from 'react';
import {
  ShieldAlert, Loader2, AlertCircle, Zap, CheckCircle,
  XCircle, Clock, Package, ClipboardList, TrendingUp,
} from 'lucide-react';
import { getDashboard } from '../services/complianceAiActionService.js';

const STATUS_COLORS = {
  draft:            { bg: 'bg-slate-100',   text: 'text-slate-600'  },
  pending_approval: { bg: 'bg-amber-100',   text: 'text-amber-700'  },
  approved:         { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  rejected:         { bg: 'bg-red-100',     text: 'text-red-700'    },
  executing:        { bg: 'bg-blue-100',    text: 'text-blue-700'   },
  completed:        { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  failed:           { bg: 'bg-red-100',     text: 'text-red-700'    },
  cancelled:        { bg: 'bg-slate-100',   text: 'text-slate-400'  },
};

const RISK_COLORS = {
  low:      'text-emerald-600 bg-emerald-50 border border-emerald-200',
  medium:   'text-amber-600 bg-amber-50 border border-amber-200',
  high:     'text-orange-600 bg-orange-50 border border-orange-200',
  critical: 'text-red-600 bg-red-50 border border-red-200',
};

function KpiCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
        <div className={`p-1.5 rounded-lg ${color}`}><Icon className="w-4 h-4" /></div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function ComplianceGovernanceDashboardPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr]       = useState('');

  useEffect(() => {
    (async () => {
      try {
        const d = await getDashboard();
        setData(d);
      } catch (e) {
        setErr(e.response?.data?.error || e.message);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-violet-100">
          <ShieldAlert className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Compliance Governance Dashboard</h1>
          <p className="text-sm text-slate-500">AI action utilization, approval metrics, and governance compliance</p>
        </div>
      </div>

      {err && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {err}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : data ? (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Total Actions" value={data.totals.total} sub="All compliance AI actions" icon={Zap} color="bg-violet-50 text-violet-600" />
            <KpiCard label="Pending Approval" value={data.totals.pending} sub="Awaiting human decision" icon={Clock} color="bg-amber-50 text-amber-600" />
            <KpiCard label="Approval Rate" value={`${data.approvalRate}%`} sub="Approved / total actioned" icon={TrendingUp} color="bg-emerald-50 text-emerald-600" />
            <KpiCard label="Packages + Checklists" value={data.packages + data.checklists} sub={`${data.packages} packages · ${data.checklists} checklists`} icon={Package} color="bg-teal-50 text-teal-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Status breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Action Status Breakdown</h2>
              <div className="space-y-2">
                {Object.entries(data.statusCounts || {}).map(([status, count]) => {
                  const pct = data.totals.total > 0 ? Math.round((count / data.totals.total) * 100) : 0;
                  const col = STATUS_COLORS[status] || STATUS_COLORS.draft;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className="w-28 flex-shrink-0">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${col.bg} ${col.text}`}>
                          {status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
                {Object.keys(data.statusCounts || {}).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">No actions yet</p>
                )}
              </div>
            </div>

            {/* Approval performance */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Approval Performance</h2>
              <div className="space-y-4">
                {[
                  { label: 'Approved / Completed', value: data.totals.approved, icon: CheckCircle, cls: 'text-emerald-600' },
                  { label: 'Rejected', value: data.totals.rejected, icon: XCircle, cls: 'text-red-500' },
                  { label: 'Pending Decision', value: data.totals.pending, icon: Clock, cls: 'text-amber-500' },
                  { label: 'Draft', value: data.totals.draft, icon: Zap, cls: 'text-slate-400' },
                ].map(({ label, value, icon: Icon, cls }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${cls}`} />
                      <span className="text-sm text-slate-600">{label}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Overall approval rate</span>
                  <span className={`font-semibold ${data.approvalRate >= 70 ? 'text-emerald-600' : data.approvalRate >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                    {data.approvalRate}%
                  </span>
                </div>
                <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${data.approvalRate >= 70 ? 'bg-emerald-500' : data.approvalRate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${data.approvalRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preparation artifacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-teal-600" />
                <h2 className="text-sm font-semibold text-slate-800">Preparation Packages</h2>
                <span className="ml-auto text-lg font-bold text-teal-600">{data.packages}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                AI-generated structured preparation packages for compliance obligations, filings, and regulatory submissions.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-800">Compliance Checklists</h2>
                <span className="ml-auto text-lg font-bold text-blue-600">{data.checklists}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Detailed task-level checklists with evidence, documentation and approval requirements for compliance readiness.
              </p>
            </div>
          </div>

          {/* Recent actions */}
          {data.recentActions?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Recent Compliance Actions</h2>
              <div className="space-y-3">
                {data.recentActions.map(action => (
                  <div key={action.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{action.title}</p>
                      <p className="text-xs text-slate-400">{action.actionType?.replace(/_/g, ' ')} · {new Date(action.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className={`text-xs px-2 py-0.5 rounded border capitalize ${RISK_COLORS[action.riskLevel] || RISK_COLORS.medium}`}>
                        {action.riskLevel}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${(STATUS_COLORS[action.status] || STATUS_COLORS.draft).bg} ${(STATUS_COLORS[action.status] || STATUS_COLORS.draft).text}`}>
                        {action.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Governance advisory */}
          <div className="mt-6 p-4 bg-violet-50 border border-violet-200 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-violet-800 mb-0.5">Governance Advisory</p>
              <p className="text-xs text-violet-700 leading-relaxed">
                All compliance AI actions operate within the platform governance framework. Actions require human approval per the configured governance mode. No AI action modifies compliance records without explicit human authorization. Full audit trails are maintained for regulatory review.
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
