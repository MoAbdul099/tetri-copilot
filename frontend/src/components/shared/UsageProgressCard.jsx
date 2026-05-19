import { cn } from '@/lib/utils';

const STATUS_BAR = {
  normal: 'bg-tetri-blue',
  warning: 'bg-amber-400',
  critical: 'bg-tetri-error',
};

const STATUS_TEXT = {
  normal: '',
  warning: 'text-amber-600',
  critical: 'text-tetri-error',
};

const STATUS_LABEL = {
  normal: null,
  warning: 'Nearing limit',
  critical: 'Limit reached',
};

export default function UsageProgressCard({ icon: Icon, label, used, limit, unlimited, percent, status = 'normal', unit = '' }) {
  const barColor = STATUS_BAR[status] ?? STATUS_BAR.normal;
  const textColor = STATUS_TEXT[status] ?? '';
  const warningLabel = STATUS_LABEL[status];

  const usedDisplay = `${used.toLocaleString()}${unit ? ' ' + unit : ''}`;
  const limitDisplay = unlimited ? 'Unlimited' : `${limit?.toLocaleString() ?? '—'}${unit ? ' ' + unit : ''}`;

  return (
    <div className="rounded-card border border-tetri-border bg-tetri-surface p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-tetri-neutral flex-shrink-0" />}
          <span className="text-sm font-semibold text-tetri-text">{label}</span>
        </div>
        {warningLabel && (
          <span className={cn('text-xs font-semibold', textColor)}>{warningLabel}</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-tetri-bg overflow-hidden">
        {!unlimited && (
          <div
            className={cn('h-full rounded-full transition-all', barColor)}
            style={{ width: `${percent}%` }}
          />
        )}
        {unlimited && (
          <div className="h-full rounded-full bg-tetri-blue/20 w-full" />
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <span className={cn('text-sm font-bold text-tetri-text', textColor)}>
          {usedDisplay}
        </span>
        <span className="text-xs text-tetri-neutral">
          {unlimited ? 'No limit' : `of ${limitDisplay}`}
        </span>
      </div>
    </div>
  );
}
