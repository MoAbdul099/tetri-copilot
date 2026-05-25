import { Link } from 'react-router-dom';
import { ArrowRight, CheckSquare, AlertTriangle } from 'lucide-react';
import { useUpcomingTasks } from '../hooks/useDashboard';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const fmtCur  = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const statusColor = (s) => {
  if (s === 'overdue')     return 'text-red-600 bg-red-50';
  if (s === 'in_progress') return 'text-blue-600 bg-blue-50';
  return 'text-amber-700 bg-amber-50';
};

export default function UpcomingTasksWidget() {
  const { data, loading } = useUpcomingTasks();
  const tasks       = data?.complianceTasks   || [];
  const approvals   = data?.pendingApprovals  || [];
  const total       = tasks.length + approvals.length;

  return (
    <div className="bg-white rounded-card border border-tetri-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-tetri-blue" />
          <p className="text-sm font-semibold text-tetri-text">Upcoming Tasks</p>
          {total > 0 && (
            <span className="text-[11px] bg-[#eff4ff] text-tetri-blue px-1.5 py-0.5 rounded-full font-semibold">{total}</span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-100 rounded" />)}
        </div>
      ) : total === 0 ? (
        <p className="text-sm text-tetri-muted text-center py-4">No pending tasks</p>
      ) : (
        <div className="space-y-2">
          {approvals.map((a) => (
            <Link
              key={a.id}
              to="/approvals"
              className="flex items-start gap-2 p-2.5 rounded-xl border border-tetri-border hover:bg-slate-50 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-tetri-text truncate">{a.description}</p>
                <p className="text-[11px] text-tetri-muted">{fmtCur(a.amount)} · Pending approval</p>
              </div>
            </Link>
          ))}
          {tasks.map((t) => (
            <Link
              key={t.id}
              to="/compliance"
              className="flex items-start gap-2 p-2.5 rounded-xl border border-tetri-border hover:bg-slate-50 transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5 text-tetri-blue mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-tetri-text truncate">{t.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${statusColor(t.status)}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-tetri-muted">Due {fmtDate(t.dueDate)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
