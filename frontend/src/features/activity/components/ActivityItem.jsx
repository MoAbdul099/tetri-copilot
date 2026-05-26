function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)   return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60)   return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)   return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30)   return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const CATEGORY_COLORS = {
  Customers:      'bg-blue-50 text-blue-700',
  Invoices:       'bg-violet-50 text-violet-700',
  Payments:       'bg-emerald-50 text-emerald-700',
  Expenses:       'bg-orange-50 text-orange-700',
  Files:          'bg-teal-50 text-teal-700',
  Compliance:     'bg-amber-50 text-amber-700',
  Users:          'bg-pink-50 text-pink-700',
  Workspace:      'bg-slate-100 text-slate-600',
  Authentication: 'bg-slate-100 text-slate-600',
  Billing:        'bg-indigo-50 text-indigo-700',
  Subscription:   'bg-indigo-50 text-indigo-700',
  Notifications:  'bg-sky-50 text-sky-700',
  Administration: 'bg-slate-100 text-slate-600',
  System:         'bg-slate-100 text-slate-600',
};

function avatar(name) {
  const n = name || '?';
  return n[0].toUpperCase();
}

export default function ActivityItem({ item }) {
  const catStyle = CATEGORY_COLORS[item.category] || 'bg-slate-100 text-slate-600';
  const ago = timeAgo(item.createdAt);

  return (
    <div className="flex items-start gap-3 py-3 px-4 hover:bg-tetri-bg transition-colors rounded-xl">
      <div className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-tetri-blue text-xs font-bold">{avatar(item.userName)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-tetri-text leading-snug">
          {item.description || item.action}
          {item.referenceNumber && (
            <span className="ml-1 text-tetri-blue font-medium">{item.referenceNumber}</span>
          )}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {item.category && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${catStyle}`}>
              {item.category}
            </span>
          )}
          {item.module && item.module !== item.category?.toLowerCase() && (
            <span className="text-[10px] text-tetri-neutral">{item.module}</span>
          )}
          <span className="text-[10px] text-tetri-neutral">{ago}</span>
        </div>
      </div>
    </div>
  );
}
