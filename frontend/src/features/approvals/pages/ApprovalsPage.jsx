import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, LayoutGrid, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import { getApprovalInbox, getApprovalDashboard } from '../services/approvalsService.js';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtAmt  = (n, c = '') => `${c} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`.trim();

function StatCard({ label, value, color = 'text-tetri-text' }) {
  return (
    <div className="bg-white border border-tetri-border rounded-xl p-5">
      <p className="text-xs font-medium text-tetri-neutral uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function ApprovalsPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getApprovalInbox(), getApprovalDashboard()])
      .then(([inbox, dashboard]) => {
        setAssignments(inbox || []);
        setStats(dashboard);
      })
      .catch(() => showToast('error', 'Failed to load approvals'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {ToastContainer}
      <PageHeader title="Approvals" subtitle="Review and action pending expense approvals">
        <Button variant="outline" onClick={() => navigate('/approvals/config')}>
          Configure Rules
        </Button>
      </PageHeader>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="My Pending"     value={stats.myPending}     color="text-yellow-600" />
          <StatCard label="All Pending"    value={stats.allPending}    color="text-tetri-text" />
          <StatCard label="Approved Today" value={stats.approvedToday} color="text-green-600" />
          <StatCard label="Rejected Today" value={stats.rejectedToday} color="text-red-600" />
        </div>
      )}

      <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-tetri-border flex items-center gap-2">
          <Inbox className="w-4 h-4 text-tetri-neutral" />
          <h3 className="text-sm font-semibold text-tetri-text">My Pending Approvals</h3>
          {assignments.length > 0 && (
            <span className="ml-auto text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">
              {assignments.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-tetri-neutral text-sm">Loading…</div>
        ) : assignments.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-tetri-border mx-auto" />
            <p className="text-sm font-medium text-tetri-neutral">All caught up</p>
            <p className="text-xs text-tetri-neutral/70">No pending approvals assigned to you</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tetri-border bg-tetri-bg">
                {['Expense', 'Submitted By', 'Category', 'Amount', 'Submitted', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => {
                const exp = a.workflow?.expense;
                return (
                  <tr
                    key={a.id}
                    onClick={() => navigate(`/approvals/${a.workflow?.expenseId}`)}
                    className="border-b border-tetri-border last:border-0 hover:bg-tetri-bg/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-tetri-text">{exp?.expenseNumber}</td>
                    <td className="px-4 py-3 text-tetri-neutral">{a.workflow?.submittedBy?.fullName || '—'}</td>
                    <td className="px-4 py-3 text-tetri-neutral">{exp?.category?.name || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-tetri-text tabular-nums">{fmtAmt(exp?.amount, exp?.currencyCode)}</td>
                    <td className="px-4 py-3 text-tetri-neutral">{fmtDate(a.workflow?.submittedAt)}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/approvals/${a.workflow?.expenseId}`); }}>
                        Review
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
