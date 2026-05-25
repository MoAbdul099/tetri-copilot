import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { getFilingsReport, exportReport } from '../services/complianceService.js';
import { Toast } from '../../../components/shared/Toast.jsx';

const OUTCOME_BADGE = {
  approved:  'bg-green-50 text-green-700',
  rejected:  'bg-red-50 text-red-700',
  pending:   'bg-yellow-50 text-yellow-700',
};

export default function FilingsReportPage() {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast]     = useState(null);
  const [page, setPage]       = useState(1);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', outcome: '' });

  const load = async (p = 1) => {
    setLoading(true);
    try {
      setData(await getFilingsReport({ ...filters, page: p, limit: 50 }));
      setPage(p);
    } catch { setToast({ type: 'error', message: 'Failed to load' }); }
    setLoading(false);
  };

  useEffect(() => { load(1); }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const resp = await exportReport('filings', filters, 'csv');
      const url  = URL.createObjectURL(new Blob([resp.data]));
      const a    = document.createElement('a');
      a.href = url; a.download = `filing-history-${new Date().toISOString().split('T')[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch { setToast({ type: 'error', message: 'Export failed' }); }
    setExporting(false);
  };

  const items = data?.items || [];

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/compliance/reports')} className="text-tetri-muted hover:text-tetri-text">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-tetri-text">Filing History</h1>
          <p className="text-sm text-tetri-muted mt-0.5">All compliance submissions and their outcomes.</p>
        </div>
        <button onClick={handleExport} disabled={exporting} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-tetri-blue rounded-lg hover:bg-tetri-blue-hover transition-colors disabled:opacity-60">
          <Download className="w-3.5 h-3.5" /> {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-tetri-border rounded-xl p-4 flex flex-wrap gap-3">
        <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} className="border border-tetri-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-tetri-blue" />
        <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} className="border border-tetri-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-tetri-blue" />
        <select value={filters.outcome} onChange={e => setFilters(f => ({ ...f, outcome: e.target.value }))} className="border border-tetri-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-tetri-blue bg-white">
          <option value="">All Outcomes</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Pending</option>
        </select>
        <button onClick={() => load(1)} className="px-4 py-1.5 text-xs font-medium text-white bg-tetri-blue rounded-lg hover:bg-tetri-blue-hover transition-colors">Apply</button>
      </div>

      <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-tetri-border bg-tetri-bg/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Obligation</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral hidden md:table-cell">Authority</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Submission Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral hidden lg:table-cell">Submitted By</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral hidden lg:table-cell">Reference</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Outcome</th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-xs text-tetri-neutral">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-xs text-tetri-neutral">No filing records found.</td></tr>
            ) : items.map((s) => (
              <tr key={s.id} className="border-b border-tetri-border/50 hover:bg-tetri-bg/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-tetri-text truncate max-w-[200px]">{s.occurrence?.name || '—'}</p>
                  <p className="text-xs text-tetri-neutral mt-0.5">{s.occurrence?.jurisdiction?.name || '—'}</p>
                </td>
                <td className="px-4 py-3 text-tetri-muted hidden md:table-cell">{s.occurrence?.authority?.name || '—'}</td>
                <td className="px-4 py-3 text-tetri-muted whitespace-nowrap">{new Date(s.submissionDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-tetri-muted hidden lg:table-cell">{s.submittedBy?.fullName || '—'}</td>
                <td className="px-4 py-3 text-tetri-muted hidden lg:table-cell">{s.authorityReference || s.internalReference || '—'}</td>
                <td className="px-4 py-3">
                  {s.outcome ? (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${OUTCOME_BADGE[s.outcome] || 'bg-slate-100 text-slate-600'}`}>{s.outcome}</span>
                  ) : <span className="text-xs text-tetri-neutral">—</span>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/compliance/occurrences/${s.occurrenceId}`)} className="text-tetri-neutral hover:text-tetri-blue transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-tetri-border">
            <p className="text-xs text-tetri-neutral">{data.total} records · Page {page} of {data.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => load(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg border border-tetri-border text-tetri-muted hover:bg-tetri-bg disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => load(page + 1)} disabled={page >= data.pages} className="p-1.5 rounded-lg border border-tetri-border text-tetri-muted hover:bg-tetri-bg disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
