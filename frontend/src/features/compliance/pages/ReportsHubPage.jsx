import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, RefreshCw, AlertTriangle, Zap, Bell, BarChart2 } from 'lucide-react';

const REPORTS = [
  {
    title: 'Compliance Register',
    desc: 'Full register of all compliance obligations with filters and export.',
    icon: FileText,
    to: '/compliance/reports/register',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Filing History',
    desc: 'Historical record of all compliance submissions and outcomes.',
    icon: CheckCircle2,
    to: '/compliance/reports/filings',
    color: 'bg-green-50 text-green-600',
  },
  {
    title: 'Renewal Report',
    desc: 'Upcoming license, permit, and registration renewals.',
    icon: RefreshCw,
    to: '/compliance/reports/renewals',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    title: 'Overdue Report',
    desc: 'All overdue obligations with escalation status and days overdue.',
    icon: AlertTriangle,
    to: '/compliance/reports/overdue',
    color: 'bg-red-50 text-red-600',
  },
  {
    title: 'Escalation Analytics',
    desc: 'Escalation volume, resolution rates, and trends by level.',
    icon: Zap,
    to: '/compliance/reports/escalations',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'Reminder Analytics',
    desc: 'Reminder delivery rates, read rates, and channel breakdown.',
    icon: Bell,
    to: '/compliance/reports/reminders',
    color: 'bg-indigo-50 text-indigo-600',
  },
];

export default function ReportsHubPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-tetri-text">Compliance Reports</h1>
        <p className="text-sm text-tetri-muted mt-0.5">Detailed compliance analytics, registers, and export-ready reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map(({ title, desc, icon: Icon, to, color }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="bg-white border border-tetri-border rounded-xl p-5 text-left hover:border-tetri-blue hover:shadow-sm transition-all group"
          >
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-4.5 h-4.5" />
            </span>
            <p className="text-sm font-semibold text-tetri-text group-hover:text-tetri-blue">{title}</p>
            <p className="text-xs text-tetri-neutral mt-1">{desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <BarChart2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900">Analytics on the Dashboard</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Category, jurisdiction, and trend charts are available on the{' '}
            <button onClick={() => navigate('/compliance')} className="underline font-medium">
              Compliance Dashboard
            </button>.
          </p>
        </div>
      </div>
    </div>
  );
}
