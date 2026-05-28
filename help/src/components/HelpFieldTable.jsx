export default function HelpFieldTable({ title, rows }) {
  if (!rows || rows.length === 0) return null
  return (
    <div className="my-6">
      {title && <h3 className="text-base font-semibold text-tetri-text mb-3">{title}</h3>}
      <div className="overflow-x-auto rounded-xl border border-tetri-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-tetri-bg border-b border-tetri-border">
              <th className="text-left px-4 py-3 font-semibold text-tetri-text text-xs uppercase tracking-wide">Field</th>
              <th className="text-center px-4 py-3 font-semibold text-tetri-text text-xs uppercase tracking-wide w-20">Required</th>
              <th className="text-left px-4 py-3 font-semibold text-tetri-text text-xs uppercase tracking-wide">Description</th>
              <th className="text-left px-4 py-3 font-semibold text-tetri-text text-xs uppercase tracking-wide hidden md:table-cell">Example</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-tetri-border last:border-0 hover:bg-tetri-bg/50 transition-colors">
                <td className="px-4 py-3 font-medium text-tetri-text align-top">
                  <code className="bg-tetri-bg px-1.5 py-0.5 rounded text-xs font-mono text-tetri-blue">{row.field}</code>
                </td>
                <td className="px-4 py-3 text-center align-top">
                  {row.required ? (
                    <span className="inline-block w-2 h-2 rounded-full bg-tetri-blue" title="Required" />
                  ) : (
                    <span className="text-tetri-neutral text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-tetri-muted leading-relaxed align-top">{row.description}</td>
                <td className="px-4 py-3 text-tetri-neutral text-xs align-top hidden md:table-cell">
                  {row.example || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
