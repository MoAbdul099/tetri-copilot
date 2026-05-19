/**
 * Abstract billing provider interface.
 * All providers must implement the following methods:
 *
 * createCustomer({ email, name, workspaceId }) → Stripe Customer
 * createCheckoutSession({ customerId, priceId, workspaceId, successUrl, cancelUrl }) → Stripe Session
 * createPortalSession({ customerId, returnUrl }) → Stripe BillingPortal Session
 * constructWebhookEvent(rawBody, signature, secret) → Stripe Event
 */
module.exports = {};
