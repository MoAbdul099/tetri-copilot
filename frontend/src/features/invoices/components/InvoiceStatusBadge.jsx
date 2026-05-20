const STATUS_STYLES = {
  draft:     'bg-slate-100 text-slate-600',
  issued:    'bg-blue-50 text-blue-700',
  sent:      'bg-cyan-50 text-cyan-700',
  paid:      'bg-emerald-50 text-emerald-700',
  overdue:   'bg-red-50 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
  void:      'bg-purple-50 text-purple-700',
};

const STATUS_LABELS = {
  draft:     'Draft',
  issued:    'Issued',
  sent:      'Sent',
  paid:      'Paid',
  overdue:   'Overdue',
  cancelled: 'Cancelled',
  void:      'Void',
};

export default function InvoiceStatusBadge({ status, size = 'sm' }) {
  const cls = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600';
  const label = STATUS_LABELS[status] || status;
  const sz = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-flex rounded-full font-semibold ${sz} ${cls}`}>
      {label}
    </span>
  );
}
