const STATUS_STYLE = {
  added:    'bg-emerald-50 text-emerald-800 border-emerald-200',
  removed:  'bg-red-50 text-red-800 border-red-200',
  modified: 'bg-amber-50 text-amber-800 border-amber-200',
};

const STATUS_LABEL = {
  added:    'Added',
  removed:  'Removed',
  modified: 'Changed',
};

function ValueCell({ value }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-tetri-neutral italic text-xs">—</span>;
  }
  if (typeof value === 'object') {
    return <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(value, null, 2)}</pre>;
  }
  return <span className="text-xs break-all">{String(value)}</span>;
}

export default function DiffViewer({ fieldChanges = [] }) {
  if (!fieldChanges || fieldChanges.length === 0) {
    return (
      <p className="text-xs text-tetri-neutral italic px-3 py-2">No field-level changes recorded</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-tetri-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-tetri-bg border-b border-tetri-border">
            <th className="text-left px-3 py-2 text-xs font-semibold text-tetri-neutral w-1/4">Field</th>
            <th className="text-left px-3 py-2 text-xs font-semibold text-tetri-neutral w-1/3">Before</th>
            <th className="text-left px-3 py-2 text-xs font-semibold text-tetri-neutral w-1/3">After</th>
            <th className="text-left px-3 py-2 text-xs font-semibold text-tetri-neutral">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-tetri-border">
          {fieldChanges.map((change, i) => (
            <tr key={i} className="hover:bg-tetri-bg transition-colors">
              <td className="px-3 py-2">
                <code className="text-xs font-mono text-tetri-text bg-tetri-bg px-1.5 py-0.5 rounded">
                  {change.field}
                </code>
              </td>
              <td className="px-3 py-2 text-tetri-muted"><ValueCell value={change.oldValue} /></td>
              <td className="px-3 py-2 text-tetri-text"><ValueCell value={change.newValue} /></td>
              <td className="px-3 py-2">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${STATUS_STYLE[change.status] || ''}`}>
                  {STATUS_LABEL[change.status] || change.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
