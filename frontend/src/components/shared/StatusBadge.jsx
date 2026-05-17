import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLE_LABELS = { owner: 'Owner', user: 'User', viewer: 'Viewer', admin: 'Admin' };
const ROLE_STYLES = {
  owner: 'bg-[#eff4ff] text-tetri-blue',
  user: 'bg-emerald-50 text-emerald-700',
  viewer: 'bg-amber-50 text-amber-700',
  admin: 'bg-purple-50 text-purple-700',
};
const STATUS_LABELS = { active: 'Active', inactive: 'Inactive', invited: 'Invited', suspended: 'Suspended', pending: 'Pending' };
const STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-red-50 text-tetri-error',
  invited: 'bg-amber-50 text-amber-700',
  pending: 'bg-amber-50 text-amber-700',
  suspended: 'bg-red-50 text-tetri-error',
};

export function RoleBadge({ role, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
        ROLE_STYLES[role] || 'bg-tetri-bg text-tetri-muted',
        className
      )}
    >
      <Shield className="w-3 h-3" />
      {ROLE_LABELS[role] || role}
    </span>
  );
}

export function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        'inline-flex px-2 py-0.5 rounded-full text-xs font-semibold',
        STATUS_STYLES[status] || 'bg-tetri-bg text-tetri-muted',
        className
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export { ROLE_LABELS, ROLE_STYLES, STATUS_LABELS, STATUS_STYLES };
