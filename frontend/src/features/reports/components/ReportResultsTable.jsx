import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const fmtVal = (v) => {
  if (v == null) return '—';
  if (typeof v === 'number') return v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return String(v);
};

export default function ReportResultsTable({ columns = [], rows = [], totals, rowCount, page, limit, onPage }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const sorted = sortCol
    ? [...rows].sort((a, b) => {
        const av = a[sortCol], bv = b[sortCol];
        const cmp = typeof av === 'number'
          ? av - bv
          : String(av ?? '').localeCompare(String(bv ?? ''));
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : rows;

  const totalPages = rowCount && limit ? Math.ceil(rowCount / limit) : null;

  return (
    <div>
      <div className="overflow-x-auto rounded-card border border-tetri-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-tetri-border">
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => toggleSort(col)}
                  className="px-4 py-3 text-left text-xs font-semibold text-tetri-muted uppercase tracking-wide cursor-pointer hover:text-tetri-text whitespace-nowrap select-none"
                >
                  <span className="flex items-center gap-1">
                    {col}
                    {sortCol === col
                      ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
                      : <ChevronsUpDown className="w-3 h-3 opacity-30" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-tetri-muted text-sm">
                  No data found for the selected filters.
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr key={i} className={`border-b border-tetri-border ${i % 2 === 0 ? '' : 'bg-slate-50/50'} hover:bg-[#eff4ff]/30 transition-colors`}>
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-3 text-xs text-tetri-text whitespace-nowrap">
                      {fmtVal(row[col])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {totals && Object.keys(totals).length > 0 && (
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-tetri-border font-semibold">
                {columns.map((col, i) => (
                  <td key={col} className="px-4 py-3 text-xs text-tetri-text whitespace-nowrap">
                    {i === 0 ? 'Totals' : (totals[col] != null ? fmtVal(totals[col]) : '')}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination */}
      {totalPages && totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-xs text-tetri-muted">
          <span>{rowCount?.toLocaleString()} total rows</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPage?.(page - 1)}
              disabled={page <= 1}
              className="px-2 py-1 rounded border border-tetri-border disabled:opacity-40 hover:bg-slate-50"
            >
              Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => onPage?.(page + 1)}
              disabled={page >= totalPages}
              className="px-2 py-1 rounded border border-tetri-border disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {rowCount != null && (
        <p className="text-[11px] text-tetri-muted mt-2">
          Showing {sorted.length} of {rowCount?.toLocaleString()} rows
        </p>
      )}
    </div>
  );
}
