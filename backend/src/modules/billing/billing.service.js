const stripeProvider = require('./providers/stripe.provider');
const repo = require('./billing.repository');
const { checkoutSessionSchema } = require('./billing.validation');
const { SUPPORTED_EVENTS, STRIPE_EVENT_TO_TYPE } = require('./billing.constants');
const { logActivity, logAudit } = require('../../lib/activityLogger');

const getSuccessUrl = () => process.env.STRIPE_SUCCESS_URL || 'http://localhost:5173/billing?checkout=success';
const getCancelUrl = () => process.env.STRIPE_CANCEL_URL || 'http://localhost:5173/billing/plans';
const getPortalReturnUrl = () =>
  process.env.STRIPE_PORTAL_RETURN_URL || process.env.FRONTEND_URL
    ? `${process.env.STRIPE_PORTAL_RETURN_URL || process.env.FRONTEND_URL}/billing`
    : 'http://localhost:5173/billing';

const getPriceId = (planCode, billingInterval) => {
  if (!process.env.STRIPE_PRICES) return null;
  try {
    const prices = JSON.parse(process.env.STRIPE_PRICES);
    return prices[`${planCode}_${billingInterval}`] || null;
  } catch {
    return null;
  }
};

const requireStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    const err = new Error('Payment processing is not configured. Contact support.');
    err.statusCode = 503;
    throw err;
  }
};

const createCheckoutSession = async (workspaceId, userId, rawPayload) => {
  requireStripe();

  const { planCode, billingInterval } = checkoutSessionSchema.parse(rawPayload);

  if (planCode === 'free') {
    const err = new Error('The Free plan does not require checkout.');
    err.statusCode = 400;
    throw err;
  }

  const priceId = getPriceId(planCode, billingInterval);
  if (!priceId) {
    const err = new Error(
      `No Stripe price configured for ${planCode} (${billingInterval}). Add it to STRIPE_PRICES in your environment.`
    );
    err.statusCode = 400;
    throw err;
  }

  const subscription = await repo.findSubscriptionByWorkspace(workspaceId);
  if (!subscription) {
    const err = new Error('No subscription found');
    err.statusCode = 404;
    throw err;
  }

  let stripeCustomerId = subscription.stripeCustomerId;
  if (!stripeCustomerId) {
    const [owner, workspace] = await Promise.all([
      repo.findWorkspaceOwner(workspaceId),
      repo.findWorkspaceById(workspaceId),
    ]);
    const customer = await stripeProvider.createCustomer({
      email: owner?.user?.email || '',
      name: workspace?.name || '',
      workspaceId,
    });
    stripeCustomerId = customer.id;
    await repo.updateSubscriptionStripeFields(workspaceId, { stripeCustomerId });
  }

  const session = await stripeProvider.createCheckoutSession({
    customerId: stripeCustomerId,
    priceId,
    workspaceId,
    successUrl: getSuccessUrl(),
    cancelUrl: getCancelUrl(),
  });

  logActivity({
    workspaceId,
    userId,
    action: 'billing.checkout_created',
    entityType: 'subscription',
    entityId: subscription.id,
    description: `Stripe checkout initiated for ${planCode} (${billingInterval})`,
    metadata: { sessionId: session.id, planCode, billingInterval },
  });

  return { checkoutUrl: session.url };
};

const createPortalSession = async (workspaceId, userId) => {
  requireStripe();

  const subscription = await repo.findSubscriptionByWorkspace(workspaceId);
  if (!subscription?.stripeCustomerId) {
    const err = new Error('No billing account found. Complete a Stripe checkout first to set up billing.');
    err.statusCode = 400;
    throw err;
  }

  const session = await stripeProvider.createPortalSession({
    customerId: subscription.stripeCustomerId,
    returnUrl: getPortalReturnUrl(),
  });

  logActivity({
    workspaceId,
    userId,
    action: 'billing.portal_created',
    entityType: 'subscription',
    entityId: subscription.id,
    description: 'Billing portal session created',
  });

  return { portalUrl: session.url };
};

const syncSubscriptionFromStripe = async (workspaceId, stripeSubData) => {
  const STATUS_MAP = {
    active:   'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'cancelled',
    unpaid:   'past_due',
    incomplete: 'past_due',
    incomplete_expired: 'expired',
  };

  const fields = {};
  if (stripeSubData.id)       fields.stripeSubscriptionId = stripeSubData.id;
  if (stripeSubData.customer) fields.stripeCustomerId = stripeSubData.customer;
  if (stripeSubData.status)   fields.status = STATUS_MAP[stripeSubData.status] || 'active';
  if (stripeSubData.current_period_start) {
    fields.currentPeriodStart = new Date(stripeSubData.current_period_start * 1000);
  }
  if (stripeSubData.current_period_end) {
    fields.currentPeriodEnd = new Date(stripeSubData.current_period_end * 1000);
  }
  if (stripeSubData.cancel_at_period_end !== undefined) {
    fields.cancelAtPeriodEnd = stripeSubData.cancel_at_period_end;
  }

  if (Object.keys(fields).length === 0) return null;

  const updated = await repo.updateSubscriptionStripeFields(workspaceId, fields);

  logAudit({
    workspaceId,
    action: 'subscription.stripe_synced',
    entityType: 'subscription',
    entityId: updated.id,
    newValue: fields,
  });

  return updated;
};

const handleWebhookEvent = async (rawBody, signature) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    const err = new Error('Webhook secret not configured');
    err.statusCode = 500;
    throw err;
  }

  let event;
  try {
    event = stripeProvider.constructWebhookEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const e = new Error(`Webhook signature verification failed: ${err.message}`);
    e.statusCode = 400;
    throw e;
  }

  // Idempotency — skip already-processed events
  const existing = await repo.findEventByProviderId(event.id);
  if (existing) return { received: true, skipped: true };

  // Ignore unsupported event types without storing
  if (!SUPPORTED_EVENTS.includes(event.type)) {
    return { received: true };
  }

  const eventType = STRIPE_EVENT_TO_TYPE[event.type];
  const eventData = event.data.object;

  // Resolve workspaceId from metadata or customer reverse-lookup
  let workspaceId = eventData.metadata?.workspaceId;
  let subscriptionId;

  if (!workspaceId && eventData.customer) {
    const sub = await repo.findSubscriptionByStripeCustomerId(eventData.customer);
    if (sub) {
      workspaceId = sub.workspaceId;
      subscriptionId = sub.id;
    }
  }

  await repo.storeBillingEvent({
    workspaceId: workspaceId || null,
    subscriptionId: subscriptionId || null,
    eventType,
    provider: 'stripe',
    providerEventId: event.id,
    payload: { type: event.type, objectId: eventData.id },
  });

  if (workspaceId) {
    logActivity({
      workspaceId,
      action: `billing.webhook_received`,
      entityType: 'subscription',
      entityId: subscriptionId,
      description: `Stripe event received: ${event.type}`,
      metadata: { eventId: event.id, eventType: event.type },
    });
  }

  // Sync subscription state
  if (workspaceId) {
    if (event.type === 'checkout.session.completed' && eventData.customer) {
      await repo.updateSubscriptionStripeFields(workspaceId, { stripeCustomerId: eventData.customer });
    } else if (event.type.startsWith('customer.subscription.')) {
      await syncSubscriptionFromStripe(workspaceId, eventData);
    } else if (event.type === 'invoice.payment_failed') {
      await repo.updateSubscriptionStripeFields(workspaceId, { status: 'past_due' });
      logActivity({
        workspaceId,
        action: 'billing.payment_failed',
        entityType: 'subscription',
        entityId: subscriptionId,
        description: 'Stripe payment failed — subscription marked past_due',
      });
    }
  }

  return { received: true };
};

const listBillingEvents = async (workspaceId, params = {}) => {
  const result = await repo.listEventsByWorkspace(workspaceId, params);
  return {
    ...result,
    events: result.events.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      provider: e.provider,
      providerEventId: e.providerEventId,
      createdAt: e.createdAt,
    })),
  };
};

module.exports = { createCheckoutSession, createPortalSession, handleWebhookEvent, listBillingEvents };
