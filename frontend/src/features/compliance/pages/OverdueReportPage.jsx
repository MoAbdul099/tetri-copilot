import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ExternalLink, Download, AlertTriangle } from 'lucide-react';
import { getOverdueReport, exportReport, listJurisdictions, listCategories } from '../services/complianceService.js';
import { Toast } from '../../../components/shared/Toast.jsx';

const PRIORITY_BADGE = {
  critical: 'bg-red-100 text-red-700 font-semibold',
  high:     'bg-orange-100 text-orange-700 font-semibold',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-slate-100 text-slate-600',
};

function daysAgo(date) {
  return Math.abs(Math.floor((new Date(date) - new Date()) / 86400000));
}

export default function OverdueReportPage() {
  const navigate = useNavigate();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast]     = useState(null);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [categories, setCategories]       = useState([]);
  const [filters, setFilters] = useState({ jurisdictionId: '', categoryId: '', priority: '' });

  const load = async () => {
    setLoading(true);
    try { setItems(await getOverdueReport(filters)); }
    catch { setToast({ type: 'error', message: 'Failed to load' }); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    listJurisdictions().then(setJurisdictions).catch(() => {});
    listCategories().then(setCategories).catch(() => {});
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const resp = await exportReport('overdue', filters, 'csv');
      const url  = URL.createObjectURL(new Blob([resp.data]));
      const a    = document.createElement('a');
      a.href = url; a.download = `overdue-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch { setToast({ type: 'error', message: 'Export failed' }); }
    setExporting(false);
  };

  const totalOverdue = items.length;
  const escalatedCount = items.filter(i => i.escalationInstances?.length > 0).length;

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/compliance/reports')} className="text-tetri-muted hover:text-tetri-text">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-tetri-text">Overdue Report</h1>
          <p className="text-sm text-tetri-muted mt-0.5">All overdue compliance obligations.</p>
        </div>
        <button onClick={handleExport} disabled={exporting} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-tetri-blue rounded-lg hover:bg-tetri-blue-hover transition-colors disabled:opacity-60">
          <Download className="w-3.5 h-3.5" /> {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-600 font-medium mb-1">Total Overdue</p>
          <p className="text-2xl font-bold text-red-700">{totalOverdue}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-600 font-medium mb-1">Escalated</p>
          <p className="text-2xl font-bold text-amber-700">{escalatedCount}</p>
        </div>
        <div className="bg-white border border-tetri-border rounded-xl p-4">
          <p className="text-xs text-tetri-neutral font-medium mb-1">Not Escalated</p>
          <p className="text-2xl font-bold text-tetri-text">{totalOverdue - escalatedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-tetri-border rounded-xl p-4 flex flex-wrap gap-3">
        <select value={filters.jurisdictionId} onChange={e => setFilters(f => ({ ...f, jurisdictionId: e.target.value }))} className="border border-tetri-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-tetri-blue bg-white">
          <option value="">All Jurisdictions</option>
          {jurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
        </select>
        <select value={filters.categoryId} onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value }))} className="border border-tetri-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-tetri-blue bg-white">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))} className="border border-tetri-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-tetri-blue bg-white">
          <option value="">All Priorities</option>
          {['critical','high','medium','low'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={load} className="px-4 py-1.5 text-xs font-medium text-white bg-tetri-blue rounded-lg hover:bg-tetri-blue-hover transition-colors">Apply</button>
      </div>

      <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-red-100 bg-red-50/40">
              <th className="text-left px-4 py-3 text-xs font-semibold text-red-700">Obligation</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-red-700 hidden md:table-cell">Owner</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-red-700">Due Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-red-700">Days Overdue</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-red-700 hidden md:table-cell">Priority</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-red-700">Escalation</th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-xs text-tetri-neutral">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-xs text-tetri-neutral">
                <AlertTriangle className="w-5 h-5 text-green-400 mx-auto mb-1" />
                No overdue obligations.
              </td></tr>
            ) : items.map((occ) => (
              <tr key={occ.id} className="border-b border-red-100/60 hover:bg-red-50/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-tetri-text truncate max-w-[200px]">{occ.name}</p>
                  <p className="text-xs text-tetri-neutral mt-0.5">{occ.jurisdiction?.name || '—'} · {occ.authority?.name || '—'}</p>
                </td>
                <td className="px-4 py-3 text-tetri-muted hidden md:table-cell">{occ.owner?.fullName || '—'}</td>
                <td className="px-4 py-3 text-tetri-muted whitespace-nowrap">{new Date(occ.dueDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold text-red-600">{daysAgo(occ.dueDate)}d</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${PRIORITY_BADGE[occ.priority] || ''}`}>{occ.priority}</span>
                </td>
                <td className="px-4 py-3">
                  {occ.escalationInstances?.length > 0
                    ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Level {occ.escalationInstances[0].level}</span>
                    : <span className="text-xs text-tetri-neutral">—</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/compliance/occurrences/${occ.id}`)} className="text-tetri-neutral hover:text-tetri-blue transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
