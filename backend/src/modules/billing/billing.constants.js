const SUPPORTED_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
];

const STRIPE_EVENT_TO_TYPE = {
  'checkout.session.completed':    'checkout_created',
  'customer.subscription.created': 'subscription_created',
  'customer.subscription.updated': 'subscription_updated',
  'customer.subscription.deleted': 'subscription_cancelled',
  'invoice.payment_succeeded':     'payment_succeeded',
  'invoice.payment_failed':        'payment_failed',
};

module.exports = { SUPPORTED_EVENTS, STRIPE_EVENT_TO_TYPE };
