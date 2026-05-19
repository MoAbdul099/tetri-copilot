import { Calendar, CreditCard, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

const EVENT_CONFIG = {
  checkout_created: {
    label: 'Checkout initiated',
    icon: CreditCard,
    iconClass: 'text-tetri-blue bg-[#eff4ff]',
  },
  subscription_created: {
    label: 'Subscription started',
    icon: CheckCircle,
    iconClass: 'text-emerald-600 bg-emerald-50',
  },
  subscription_updated: {
    label: 'Subscription updated',
    icon: RefreshCw,
    iconClass: 'text-tetri-muted bg-tetri-bg',
  },
  subscription_cancelled: {
    label: 'Subscription cancelled',
    icon: XCircle,
    iconClass: 'text-tetri-error bg-red-50',
  },
  payment_succeeded: {
    label: 'Payment succeeded',
    icon: CheckCircle,
    iconClass: 'text-emerald-600 bg-emerald-50',
  },
  payment_failed: {
    label: 'Payment failed',
    icon: AlertTriangle,
    iconClass: 'text-tetri-error bg-red-50',
  },
};

export default function BillingEventList({ events = [] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-card border border-tetri-border bg-tetri-surface p-6 text-center">
        <p className="text-sm text-tetri-muted">No billing events yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-tetri-border bg-tetri-surface divide-y divide-tetri-border">
      {events.map((event) => {
        const cfg = EVENT_CONFIG[event.eventType] ?? {
          label: event.eventType.replace(/_/g, ' '),
          icon: CreditCard,
          iconClass: 'text-tetri-muted bg-tetri-bg',
        };
        const Icon = cfg.icon;

        return (
          <div key={event.id} className="flex items-center gap-3 px-5 py-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.iconClass}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-tetri-text">{cfg.label}</p>
              {event.providerEventId && (
                <p className="text-xs text-tetri-neutral font-mono truncate">{event.providerEventId}</p>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-tetri-neutral flex-shrink-0">
              <Calendar className="w-3 h-3" />
              {new Date(event.createdAt).toLocaleDateString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
