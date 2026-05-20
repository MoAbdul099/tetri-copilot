import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, AlertTriangle, Clock, Users, ArrowRight, RefreshCw } from 'lucide-react';
import { getARSummary, getTopDebtors, getAgingData } from '../services/receivablesService';
import { useToast } from '../../../components/shared/Toast.jsx';

const BUCKET_LABELS = {
  current:  { label: 'Current',    color: 'text-emerald-700', bg: 'bg-emerald-50', bar: 'bg-emerald-500' },
  '1_30':   { label: '1–30 Days',  color: 'text-yellow-700',  bg: 'bg-yellow-50',  bar: 'bg-yellow-500' },
  '31_60':  { label: '31–60 Days', color: 'text-orange-700',  bg: 'bg-orange-50',  bar: 'bg-orange-500' },
  '61_90':  { label: '61–90 Days', color: 'text-red-700',     bg: 'bg-red-50',     bar: 'bg-red-500' },
  '91_120': { label: '91–120 Days',color: 'text-red-800',     bg: 'bg-red-100',    bar: 'bg-red-700' },
  '120_plus':{ label: '120+ Days', color: 'text-red-900',     bg: 'bg-red-200',    bar: 'bg-red-900' },
};

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0);

export default function ReceivablesPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [summary, setSummary]   = useState(null);
  const [aging,   setAging]     = useState(null);
  const [debtors, setDebtors]   = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, a, d] = await Promise.all([getARSummary(), getAgingData(), getTopDebtors()]);
      setSummary(s);
      setAging(a);
      setDebtors(d);
    } catch {
      showToast('error', 'Failed to load receivables data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalAging = aging ? Object.values(aging.buckets).reduce((s, v) => s + v, 0) : 0;

  return (
    <div className="space-y-6">
      {ToastContainer}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tetri-text">Receivables</h1>
          <p className="text-sm text-tetri-muted mt-0.5">Accounts Receivable overview and aging analysis</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 text-sm text-tetri-muted border border-tetri-border rounded-lg hover:bg-tetri-bg transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button onClick={() => navigate('/receivables/aging')} className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-tetri-blue rounded-lg hover:bg-tetri-blue-hover transition-colors">
            Aging Analysis
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-tetri-surface rounded-card border border-tetri-border animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Total Receivables"
              value={fmt(summary?.totalReceivables)}
              icon={TrendingUp}
              iconColor="text-tetri-blue"
              sub={`${summary?.openInvoiceCount || 0} open invoices`}
            />
            <SummaryCard
              label="Overdue"
              value={fmt(summary?.overdueReceivables)}
              icon={AlertTriangle}
              iconColor="text-red-500"
              sub="Past due date"
              accent="border-red-100"
            />
            <SummaryCard
              label="Current"
              value={fmt(summary?.currentReceivables)}
              icon={Clock}
              iconColor="text-emerald-500"
              sub="Not yet due"
            />
            <SummaryCard
              label="Credit Balance"
              value={fmt(summary?.creditBalance)}
              icon={Users}
              iconColor="text-purple-500"
              sub={`${summary?.activeCustomers || 0} active customers`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Aging Buckets */}
            <div className="lg:col-span-1 bg-tetri-surface border border-tetri-border rounded-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-tetri-text">Aging Summary</h2>
                <button onClick={() => navigate('/receivables/aging')} className="text-xs text-tetri-blue hover:underline">
                  Full report
                </button>
              </div>
              {aging && Object.entries(aging.buckets).map(([key, val]) => {
                const cfg = BUCKET_LABELS[key];
                const pct = totalAging > 0 ? (val / totalAging) * 100 : 0;
                return (
                  <div key={key} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-xs font-semibold text-tetri-text">{fmt(val)}</span>
                    </div>
                    <div className="w-full bg-tetri-bg rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${cfg.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top Debtors */}
            <div className="lg:col-span-2 bg-tetri-surface border border-tetri-border rounded-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-tetri-text">Top Debtors</h2>
                <button onClick={() => navigate('/receivables/customers')} className="text-xs text-tetri-blue hover:underline">
                  All customers
                </button>
              </div>
              {debtors.length === 0 ? (
                <p className="text-sm text-tetri-muted text-center py-8">No outstanding balances</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-tetri-muted border-b border-tetri-border">
                        <th className="text-left font-medium pb-2">Customer</th>
                        <th className="text-right font-medium pb-2">Balance</th>
                        <th className="text-right font-medium pb-2">Overdue</th>
                        <th className="text-right font-medium pb-2">Invoices</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debtors.map((d) => (
                        <tr
                          key={d.id}
                          className="border-b border-tetri-border/50 hover:bg-tetri-bg cursor-pointer transition-colors"
                          onClick={() => navigate(`/receivables/customers/${d.id}`)}
                        >
                          <td className="py-2.5 pr-3">
                            <p className="font-medium text-tetri-text">{d.name}</p>
                            <p className="text-xs text-tetri-muted">{d.customerCode}</p>
                          </td>
                          <td className="py-2.5 text-right font-semibold text-tetri-text">{fmt(d.totalBalance)}</td>
                          <td className="py-2.5 text-right">
                            {d.overdueBalance > 0 ? (
                              <span className="text-red-600 font-medium">{fmt(d.overdueBalance)}</span>
                            ) : (
                              <span className="text-tetri-muted">—</span>
                            )}
                          </td>
                          <td className="py-2.5 text-right text-tetri-muted">{d.openInvoiceCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Quick nav */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NavCard title="Aging Analysis" desc="View detailed aging by invoice and customer" to="/receivables/aging" navigate={navigate} />
            <NavCard title="Collections" desc="Manage collection activities and follow-ups" to="/collections" navigate={navigate} />
            <NavCard title="Statements" desc="Generate and send customer statements" to="/statements" navigate={navigate} />
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, iconColor, sub, accent = '' }) {
  return (
    <div className={`bg-tetri-surface border border-tetri-border rounded-card p-5 ${accent}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-tetri-muted font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-tetri-text mt-1">{value}</p>
          <p className="text-xs text-tetri-muted mt-1">{sub}</p>
        </div>
        <div className={`p-2 rounded-lg bg-tetri-bg ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function NavCard({ title, desc, to, navigate }) {
  return (
    <button
      onClick={() => navigate(to)}
      className="bg-tetri-surface border border-tetri-border rounded-card p-5 text-left hover:border-tetri-blue/30 hover:shadow-sm transition-all group"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-tetri-text group-hover:text-tetri-blue transition-colors">{title}</h3>
        <ArrowRight className="w-4 h-4 text-tetri-muted group-hover:text-tetri-blue transition-colors" />
      </div>
      <p className="text-sm text-tetri-muted mt-1">{desc}</p>
    </button>
  );
}
