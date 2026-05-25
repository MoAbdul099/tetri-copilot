import { Calendar, Globe, CreditCard } from 'lucide-react';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const fmtDate = () =>
  new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function WelcomeBanner({ user, workspace, subscription }) {
  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || '';

  return (
    <div className="bg-white rounded-card border border-tetri-border px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-lg font-bold text-tetri-text">
          {greeting()}{firstName ? `, ${firstName}` : ''} 👋
        </h1>
        <p className="text-sm text-tetri-muted mt-0.5">
          {workspace?.name || 'Your workspace'} — here's your business at a glance.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-tetri-muted">
          <Calendar className="w-3.5 h-3.5" />
          <span>{fmtDate()}</span>
        </div>
        {workspace?.country && (
          <div className="flex items-center gap-1.5 text-tetri-muted">
            <Globe className="w-3.5 h-3.5" />
            <span>{workspace.country}</span>
          </div>
        )}
        {subscription?.plan && (
          <div className="flex items-center gap-1.5 text-tetri-blue bg-[#eff4ff] px-2 py-0.5 rounded-full font-medium">
            <CreditCard className="w-3 h-3" />
            <span>{subscription.plan}</span>
          </div>
        )}
      </div>
    </div>
  );
}
