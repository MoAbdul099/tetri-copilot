const CONFIGS = {
  draft:               { label: 'Draft',               className: 'bg-slate-100 text-slate-600' },
  posted:              { label: 'Posted',               className: 'bg-blue-100 text-blue-700' },
  unallocated:         { label: 'Unallocated',         className: 'bg-amber-100 text-amber-700' },
  partially_allocated: { label: 'Partially Allocated', className: 'bg-orange-100 text-orange-700' },
  allocated:           { label: 'Allocated',           className: 'bg-emerald-100 text-emerald-700' },
  reversed:            { label: 'Reversed',            className: 'bg-red-100 text-red-700' },
  voided:              { label: 'Voided',              className: 'bg-purple-100 text-purple-700' },
};

export default function PaymentStatusBadge({ status }) {
  const cfg = CONFIGS[status] || { label: status, className: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
