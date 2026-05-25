import { Activity } from 'lucide-react';

const labelColor = {
  Excellent:         'text-emerald-600',
  Healthy:           'text-blue-600',
  'Attention Needed':'text-amber-600',
  Critical:          'text-red-600',
};

const ringColor = {
  Excellent:         'stroke-emerald-500',
  Healthy:           'stroke-blue-500',
  'Attention Needed':'stroke-amber-500',
  Critical:          'stroke-red-500',
};

function ScoreRing({ score, label }) {
  const r   = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const col = ringColor[label] || 'stroke-slate-400';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-700 ${col}`}
        />
      </svg>
      <span className="absolute text-xl font-bold text-tetri-text">{score}</span>
    </div>
  );
}

export default function HealthScoreWidget({ health }) {
  if (!health) return null;
  const { overall, label, components } = health;
  const textColor = labelColor[label] || 'text-slate-600';

  const compList = [
    { key: 'financial',    label: 'Financial',    ...components.financial },
    { key: 'compliance',   label: 'Compliance',   ...components.compliance },
    { key: 'operational',  label: 'Operational',  ...components.operational },
    { key: 'subscription', label: 'Subscription', ...components.subscription },
  ];

  return (
    <div className="bg-white rounded-card border border-tetri-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-tetri-blue" />
        <h3 className="text-sm font-semibold text-tetri-text">Business Health Score</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <ScoreRing score={overall} label={label} />
          <span className={`text-sm font-semibold ${textColor}`}>{label}</span>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3 w-full">
          {compList.map((c) => (
            <div key={c.key} className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-tetri-muted">{c.label}</span>
                <span className="text-xs text-tetri-muted">{c.weight}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-tetri-blue transition-all duration-500"
                    style={{ width: `${c.score}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-tetri-text w-6 text-right">{c.score}</span>
              </div>
              <p className={`text-xs mt-0.5 ${labelColor[c.label] || 'text-slate-500'}`}>{c.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
