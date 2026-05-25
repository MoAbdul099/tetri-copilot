import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ExternalLink, Download } from 'lucide-react';
import { getRenewalsReport, exportReport } from '../services/complianceService.js';
import { Toast } from '../../../components/shared/Toast.jsx';

const PRIORITY_BADGE = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-slate-100 text-slate-600',
};

function daysUntil(date) {
  return Math.ceil((new Date(date) - new Date()) / 86400000);
}

export default function RenewalsReportPage() {
  const navigate = useNavigate();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast]     = useState(null);
  const [days, setDays]       = useState(90);

  const load = async (d = days) => {
    setLoading(true);
    try { setItems(await getRenewalsReport(d)); }
    catch { setToast({ type: 'error', message: 'Failed to load' }); }
    setLoading(false);
  };

  useEffect(() => { load(days); }, [days]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const resp = await exportReport('renewals', {}, 'csv');
      const url  = URL.createObjectURL(new Blob([resp.data]));
      const a    = document.createElement('a');
      a.href = url; a.download = `renewals-${new Date().toISOString().split('T')[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch { setToast({ type: 'error', message: 'Export failed' }); }
    setExporting(false);
  };

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/compliance/reports')} className="text-tetri-muted hover:text-tetri-text">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-tetri-text">Renewal Report</h1>
          <p className="text-sm text-tetri-muted mt-0.5">Upcoming license, permit, and registration renewals.</p>
        </div>
        <select value={days} onChange={e => setDays(Number(e.target.value))} className="border border-tetri-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-tetri-blue bg-white">
          <option value={30}>Next 30 days</option>
          <option value={60}>Next 60 days</option>
          <option value={90}>Next 90 days</option>
          <option value={180}>Next 180 days</option>
        </select>
        <button onClick={handleExport} disabled={exporting} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-tetri-blue rounded-lg hover:bg-tetri-blue-hover transition-colors disabled:opacity-60">
          <Download className="w-3.5 h-3.5" /> {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-tetri-border bg-tetri-bg/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Renewal</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral hidden md:table-cell">Jurisdiction</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral hidden md:table-cell">Authority</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral hidden lg:table-cell">Owner</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Due Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral">Days Left</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral hidden md:table-cell">Priority</th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-xs text-tetri-neutral">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-xs text-tetri-neutral">No renewals due in this period.</td></tr>
            ) : items.map((occ) => {
              const d = daysUntil(occ.dueDate);
              return (
                <tr key={occ.id} className="border-b border-tetri-border/50 hover:bg-tetri-bg/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-tetri-text truncate max-w-[200px]">{occ.name}</p>
                    <p className="text-xs text-tetri-neutral mt-0.5">{occ.template?.name || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-tetri-muted hidden md:table-cell">{occ.jurisdiction?.name || '—'}</td>
                  <td className="px-4 py-3 text-tetri-muted hidden md:table-cell">{occ.authority?.name || '—'}</td>
                  <td className="px-4 py-3 text-tetri-muted hidden lg:table-cell">{occ.owner?.fullName || '—'}</td>
                  <td className="px-4 py-3 text-tetri-muted whitespace-nowrap">{new Date(occ.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${d <= 14 ? 'text-red-600' : d <= 30 ? 'text-orange-600' : 'text-tetri-muted'}`}>{d}d</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${PRIORITY_BADGE[occ.priority] || ''}`}>{occ.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/compliance/occurrences/${occ.id}`)} className="text-tetri-neutral hover:text-tetri-blue transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
