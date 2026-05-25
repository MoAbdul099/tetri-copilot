/**
 * Lightweight SVG sparkline / bar chart — no chart library dependency.
 * Renders a simple bar chart for monthly trend data.
 */
export default function TrendChart({ data = [], valueKey = 'revenue', labelKey = 'month', color = '#3b82f6', height = 80 }) {
  if (!data.length) return null;

  const values = data.map((d) => Number(d[valueKey]) || 0);
  const max    = Math.max(...values, 1);
  const barW   = 100 / data.length;

  return (
    <div className="w-full" style={{ height }}>
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        {values.map((v, i) => {
          const barH = (v / max) * (height - 8);
          const x    = i * barW + barW * 0.15;
          const w    = barW * 0.7;
          const y    = height - barH;
          return (
            <g key={i}>
              <title>{data[i][labelKey]}: {v}</title>
              <rect x={x} y={y} width={w} height={barH} rx="1.5" fill={color} opacity="0.85" />
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between mt-1 px-1">
        {data.map((d, i) => (
          <span key={i} className="text-[9px] text-tetri-muted leading-none" style={{ width: `${barW}%`, textAlign: 'center' }}>
            {d[labelKey]}
          </span>
        ))}
      </div>
    </div>
  );
}
