import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, DollarSign, Receipt, Upload, ShieldCheck, Bell } from 'lucide-react';

const ACTIONS = [
  { label: 'New Invoice',      icon: FileText,    to: '/invoices/new',   color: 'text-tetri-blue  bg-[#eff4ff]' },
  { label: 'Record Payment',   icon: DollarSign,  to: '/payments/new',   color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Add Expense',      icon: Receipt,     to: '/expenses/new',   color: 'text-amber-600   bg-amber-50' },
  { label: 'Add Customer',     icon: Plus,        to: '/customers/new',  color: 'text-violet-600  bg-violet-50' },
  { label: 'Compliance',       icon: ShieldCheck, to: '/compliance',     color: 'text-rose-600    bg-rose-50' },
  { label: 'Notifications',    icon: Bell,        to: '/notifications',  color: 'text-slate-600   bg-slate-50' },
];

export default function QuickActionsPanel() {
  return (
    <div className="bg-white rounded-card border border-tetri-border p-5">
      <p className="text-xs font-semibold text-tetri-muted uppercase tracking-wide mb-3">Quick Actions</p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {ACTIONS.map(({ label, icon: Icon, to, color }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl hover:bg-slate-50 transition-colors group text-center"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-tetri-muted group-hover:text-tetri-text leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
