const Stripe = require('stripe');

let stripeClient;

const getStripe = () => {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
    stripeClient = new Stripe(key, {
      apiVersion: process.env.STRIPE_API_VERSION || '2023-10-16',
    });
  }
  return stripeClient;
};

const createCustomer = ({ email, name, workspaceId }) =>
  getStripe().customers.create({ email, name, metadata: { workspaceId } });

const createCheckoutSession = ({ customerId, priceId, workspaceId, successUrl, cancelUrl }) =>
  getStripe().checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { workspaceId },
    subscription_data: { metadata: { workspaceId } },
  });

const createPortalSession = ({ customerId, returnUrl }) =>
  getStripe().billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });

const constructWebhookEvent = (rawBody, signature, secret) =>
  getStripe().webhooks.constructEvent(rawBody, signature, secret);

module.exports = { createCustomer, createCheckoutSession, createPortalSession, constructWebhookEvent };
