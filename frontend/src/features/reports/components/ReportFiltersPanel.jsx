import { useState } from 'react';
import { Filter, X } from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];
const monthStart = () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; };

export default function ReportFiltersPanel({ supportedFilters = [], onRun, loading }) {
  const [filters, setFilters] = useState({
    dateFrom: monthStart(),
    dateTo:   today(),
    overdueOnly: 'false',
    dueDays: '30',
  });

  const set = (k, v) => setFilters((p) => ({ ...p, [k]: v }));

  const activeFilters = supportedFilters.filter((f) => f !== 'currency');

  return (
    <div className="bg-white rounded-card border border-tetri-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-tetri-blue" />
        <span className="text-sm font-semibold text-tetri-text">Filters</span>
      </div>

      <div className="space-y-3">
        {activeFilters.includes('dateFrom') && (
          <div>
            <label className="block text-xs text-tetri-muted mb-1">From</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => set('dateFrom', e.target.value)}
              className="w-full border border-tetri-border rounded-lg px-3 py-1.5 text-sm text-tetri-text focus:outline-none focus:ring-1 focus:ring-tetri-blue"
            />
          </div>
        )}

        {activeFilters.includes('dateTo') && (
          <div>
            <label className="block text-xs text-tetri-muted mb-1">To</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => set('dateTo', e.target.value)}
              className="w-full border border-tetri-border rounded-lg px-3 py-1.5 text-sm text-tetri-text focus:outline-none focus:ring-1 focus:ring-tetri-blue"
            />
          </div>
        )}

        {activeFilters.includes('asOfDate') && (
          <div>
            <label className="block text-xs text-tetri-muted mb-1">As of Date</label>
            <input
              type="date"
              value={filters.asOfDate || today()}
              onChange={(e) => set('asOfDate', e.target.value)}
              className="w-full border border-tetri-border rounded-lg px-3 py-1.5 text-sm text-tetri-text focus:outline-none focus:ring-1 focus:ring-tetri-blue"
            />
          </div>
        )}

        {activeFilters.includes('dueDays') && (
          <div>
            <label className="block text-xs text-tetri-muted mb-1">Due in (days)</label>
            <select
              value={filters.dueDays || '30'}
              onChange={(e) => set('dueDays', e.target.value)}
              className="w-full border border-tetri-border rounded-lg px-3 py-1.5 text-sm text-tetri-text focus:outline-none focus:ring-1 focus:ring-tetri-blue"
            >
              <option value="7">Next 7 days</option>
              <option value="14">Next 14 days</option>
              <option value="30">Next 30 days</option>
              <option value="60">Next 60 days</option>
              <option value="90">Next 90 days</option>
            </select>
          </div>
        )}

        {activeFilters.includes('overdueOnly') && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.overdueOnly === 'true'}
              onChange={(e) => set('overdueOnly', e.target.checked ? 'true' : 'false')}
              className="rounded border-tetri-border text-tetri-blue"
            />
            <span className="text-xs text-tetri-text">Overdue only</span>
          </label>
        )}

        {activeFilters.includes('status') && (
          <div>
            <label className="block text-xs text-tetri-muted mb-1">Status</label>
            <input
              type="text"
              placeholder="e.g. sent, paid"
              value={filters.status || ''}
              onChange={(e) => set('status', e.target.value)}
              className="w-full border border-tetri-border rounded-lg px-3 py-1.5 text-sm text-tetri-text focus:outline-none focus:ring-1 focus:ring-tetri-blue"
            />
          </div>
        )}
      </div>

      {activeFilters.length > 0 && (
        <button
          onClick={() => setFilters({ dateFrom: monthStart(), dateTo: today(), overdueOnly: 'false', dueDays: '30' })}
          className="flex items-center gap-1 text-[11px] text-tetri-muted hover:text-tetri-text mt-3"
        >
          <X className="w-3 h-3" /> Reset filters
        </button>
      )}

      <button
        onClick={() => onRun(filters)}
        disabled={loading}
        className="w-full mt-4 bg-tetri-blue text-white text-sm font-medium py-2 rounded-lg hover:bg-tetri-blue/90 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Running…' : 'Run Report'}
      </button>
    </div>
  );
}
