import { Clock, User } from 'lucide-react';
import { useActivityFeed } from '../hooks/useDashboard';

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)     return 'just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const actionLabel = (action) =>
  action
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function ActivityFeedWidget() {
  const { data: items = [], loading } = useActivityFeed(15);

  return (
    <div className="bg-white rounded-card border border-tetri-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-tetri-blue" />
        <p className="text-sm font-semibold text-tetri-text">Recent Activity</p>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-7 h-7 bg-slate-100 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-2.5 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-tetri-muted text-center py-6">No recent activity</p>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 items-start">
              <div className="w-7 h-7 bg-[#eff4ff] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-tetri-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-tetri-text leading-snug">
                  <span className="font-medium">{item.user?.fullName || 'System'}</span>
                  {' '}
                  <span className="text-tetri-muted">{item.description || actionLabel(item.action)}</span>
                </p>
                <p className="text-[11px] text-tetri-muted mt-0.5">{timeAgo(item.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
