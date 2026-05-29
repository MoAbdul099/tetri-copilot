import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CreditCard, Building2, CheckCircle } from 'lucide-react';
import { getSubscription, changeStatus } from '../services/subscriptionsService';

const STATUS_STYLE = {
  active:    'bg-green-50 text-green-700 border-green-200',
  trialing:  'bg-blue-50 text-blue-700 border-blue-200',
  past_due:  'bg-orange-50 text-orange-700 border-orange-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  expired:   'bg-gray-50 text-gray-600 border-gray-200',
};

const EVENT_TYPE_STYLE = {
  payment_succeeded: 'bg-green-50 text-green-700',
  payment_failed:    'bg-red-50 text-red-700',
  subscription_created: 'bg-blue-50 text-blue-700',
  subscription_updated: 'bg-yellow-50 text-yellow-700',
  subscription_cancelled: 'bg-red-50 text-red-600',
  subscription_renewed:   'bg-green-50 text-green-700',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtFull = (d) => d ? new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmt     = (n) => Number(n || 0).toLocaleString();
const fmtMoney = (n) => `$${Number(n || 0).toFixed(2)}`;
const daysLeft = (d) => d ? Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24)) : null;

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLE[status] || 'bg-tetri-bg text-tetri-neutral border-tetri-border'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

const TABS = ['Overview', 'Plan Details', 'Billing Events', 'Workspace'];

export default function SubscriptionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sub, setSub]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('Overview');
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setSub(await getSubscription(id)); }
    catch { setError('Failed to load subscription'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (status) => {
    setBusy(true);
    try {
      await changeStatus(id, status);
      setSub((s) => ({ ...s, status }));
    } catch { /* ignore */ }
    finally { setBusy(false); }
  };

  if (loading) return <div className="py-32 text-center text-tetri-neutral text-sm">Loading…</div>;
  if (!sub || error) return (
    <div className="py-32 text-center space-y-3">
      <p className="text-sm text-tetri-neutral">{error || 'Subscription not found'}</p>
      <button onClick={() => navigate('/plans')} className="text-sm text-tetri-primary hover:underline">Back to Plans</button>
    </div>
  );

  const days = daysLeft(sub.currentPeriodEnd);

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Back + Header */}
      <div>
        <button onClick={() => navigate('/plans')} className="flex items-center gap-1.5 text-sm text-tetri-neutral hover:text-tetri-text mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Plans & Subscriptions
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-tetri-primary/10 flex items-center justify-center">
                <CreditCard className="w-4.5 h-4.5 text-tetri-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-tetri-text">
                    {sub.workspace?.company?.companyName || sub.workspace?.name || '—'}
                  </h1>
                  <StatusBadge status={sub.status} />
                </div>
                <p className="text-sm text-tetri-neutral capitalize">{sub.plan?.name} plan · {sub.workspace?.owner?.email}</p>
              </div>
            </div>
            {days !== null && sub.status === 'active' && days <= 14 && (
              <p className={`text-xs font-medium mt-1 ${days <= 3 ? 'text-red-600' : 'text-orange-600'}`}>
                Renews in {days} day{days !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {sub.status !== 'active' && (
              <button onClick={() => handleStatus('active')} disabled={busy}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors">
                Activate
              </button>
            )}
            {sub.status === 'active' && (
              <button onClick={() => handleStatus('cancelled')} disabled={busy}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors">
                Cancel
              </button>
            )}
            {sub.status !== 'expired' && sub.status !== 'active' && (
              <button onClick={() => handleStatus('expired')} disabled={busy}
                className="px-3 py-1.5 text-sm border border-tetri-border bg-white rounded-lg hover:bg-tetri-bg disabled:opacity-60 transition-colors text-tetri-neutral">
                Mark Expired
              </button>
            )}
            <button onClick={load} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-tetri-border bg-white rounded-lg hover:bg-tetri-bg disabled:opacity-60 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-tetri-border overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === t ? 'border-tetri-primary text-tetri-primary' : 'border-transparent text-tetri-neutral hover:text-tetri-text'
            }`}>{t}</button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-tetri-text">Subscription Details</h2>
            <dl className="space-y-2 text-sm">
              {[
                ['Status', <StatusBadge status={sub.status} />],
                ['Plan', sub.plan?.name],
                ['Monthly Price', fmtMoney(sub.plan?.monthlyPriceUsd)],
                ['Period Start', fmtDate(sub.currentPeriodStart)],
                ['Period End', fmtDate(sub.currentPeriodEnd)],
                ['Cancel at Period End', sub.cancelAtPeriodEnd ? 'Yes' : 'No'],
                ['Created', fmtFull(sub.createdAt)],
                ['Last Updated', fmtFull(sub.updatedAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-tetri-neutral">{k}</dt>
                  <dd className="text-tetri-text font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-tetri-text">Billing Information</h2>
            <dl className="space-y-2 text-sm">
              {[
                ['Stripe Customer ID', sub.stripeCustomerId ? sub.stripeCustomerId : '—'],
                ['Stripe Subscription ID', sub.stripeSubscriptionId ? sub.stripeSubscriptionId : '—'],
                ['Billing Events', fmt(sub.billingEvents?.length)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <dt className="text-tetri-neutral flex-shrink-0">{k}</dt>
                  <dd className="text-tetri-text font-medium text-right text-xs truncate max-w-[55%]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {/* ── Plan Details ── */}
      {tab === 'Plan Details' && sub.plan && (
        <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-tetri-text capitalize">{sub.plan.name}</h2>
              {sub.plan.description && <p className="text-sm text-tetri-neutral mt-1">{sub.plan.description}</p>}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-tetri-primary">{fmtMoney(sub.plan.monthlyPriceUsd)}<span className="text-sm font-normal text-tetri-neutral">/mo</span></p>
              {sub.plan.yearlyPriceUsd && Number(sub.plan.yearlyPriceUsd) > 0 && (
                <p className="text-xs text-tetri-muted">{fmtMoney(sub.plan.yearlyPriceUsd)}/yr</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Included Users', sub.plan.includedUsers],
              ['Max Users', sub.plan.maxUsers || 'Unlimited'],
              ['Max Monthly Invoices', sub.plan.maxMonthlyInvoices ? fmt(sub.plan.maxMonthlyInvoices) : 'Unlimited'],
              ['Max AI Requests/mo', sub.plan.maxMonthlyAiRequests ? fmt(sub.plan.maxMonthlyAiRequests) : 'Unlimited'],
              ['Max Storage', sub.plan.maxStorageMb ? (sub.plan.maxStorageMb >= 1024 ? `${(sub.plan.maxStorageMb / 1024).toFixed(0)} GB` : `${sub.plan.maxStorageMb} MB`) : 'Unlimited'],
              ['Plan Code', sub.plan.code],
              ['Public Plan', sub.plan.isPublic ? 'Yes' : 'No'],
              ['Plan Status', sub.plan.isActive ? 'Active' : 'Inactive'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between bg-tetri-bg rounded-lg px-3 py-2">
                <span className="text-tetri-neutral">{k}</span>
                <span className="font-medium text-tetri-text">{v}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-tetri-text">Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                ['Expenses', sub.plan.hasExpenses],
                ['AI Categorization', sub.plan.hasAiCategorization],
                ['Advanced Compliance', sub.plan.hasAdvancedCompliance],
              ].map(([label, enabled]) => (
                <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${enabled ? 'border-green-200 bg-green-50' : 'border-tetri-border bg-tetri-bg'}`}>
                  <CheckCircle className={`w-4 h-4 flex-shrink-0 ${enabled ? 'text-green-500' : 'text-tetri-muted'}`} />
                  <span className={`text-sm ${enabled ? 'text-green-700' : 'text-tetri-muted'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Billing Events ── */}
      {tab === 'Billing Events' && (
        <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
          {sub.billingEvents?.length === 0 ? (
            <div className="py-16 text-center text-tetri-neutral text-sm">No billing events recorded</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tetri-border bg-tetri-bg">
                  {['Event Type', 'Provider', 'Provider Event ID', 'Date'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sub.billingEvents.map((e) => (
                  <tr key={e.id} className="border-b border-tetri-border last:border-0">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${EVENT_TYPE_STYLE[e.eventType] || 'bg-gray-50 text-gray-600'}`}>
                        {e.eventType?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-tetri-neutral capitalize">{e.provider}</td>
                    <td className="px-4 py-3 text-tetri-muted text-xs truncate max-w-[200px]">{e.providerEventId || '—'}</td>
                    <td className="px-4 py-3 text-tetri-neutral text-xs">{fmtFull(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Workspace ── */}
      {tab === 'Workspace' && sub.workspace && (
        <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-tetri-text flex items-center gap-2">
              <Building2 className="w-4 h-4 text-tetri-primary" /> Workspace Information
            </h2>
            <button onClick={() => navigate(`/organizations/${sub.workspace.id}`)}
              className="text-sm text-tetri-primary hover:underline">
              View Organization →
            </button>
          </div>
          <dl className="space-y-2 text-sm">
            {[
              ['Company Name', sub.workspace.company?.companyName || '—'],
              ['Workspace Name', sub.workspace.name],
              ['Status', sub.workspace.status],
              ['Owner', `${sub.workspace.owner?.fullName || '—'} (${sub.workspace.owner?.email || '—'})`],
              ['Members', fmt(sub.workspace._count?.members)],
              ['Country', sub.workspace.countryProfile?.countryName || '—'],
              ['Created', fmtDate(sub.workspace.createdAt)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-tetri-neutral">{k}</dt>
                <dd className="text-tetri-text font-medium capitalize">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
