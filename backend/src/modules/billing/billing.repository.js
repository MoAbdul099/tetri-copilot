const prisma = require('../../lib/prisma');

const storeBillingEvent = ({ workspaceId, subscriptionId, eventType, provider, providerEventId, payload }) =>
  prisma.billingEvent.create({
    data: { workspaceId, subscriptionId, eventType, provider: provider || 'stripe', providerEventId, payload },
  });

const findEventByProviderId = (providerEventId) =>
  prisma.billingEvent.findFirst({ where: { providerEventId } });

const listEventsByWorkspace = (workspaceId, limit = 20) =>
  prisma.billingEvent.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

const updateSubscriptionStripeFields = (workspaceId, fields) =>
  prisma.subscription.update({
    where: { workspaceId },
    data: fields,
    include: { plan: true },
  });

const findSubscriptionByWorkspace = (workspaceId) =>
  prisma.subscription.findUnique({ where: { workspaceId }, include: { plan: true } });

const findSubscriptionByStripeCustomerId = (stripeCustomerId) =>
  prisma.subscription.findFirst({ where: { stripeCustomerId }, include: { plan: true } });

const findWorkspaceById = (id) =>
  prisma.workspace.findUnique({ where: { id }, select: { id: true, name: true } });

const findWorkspaceOwner = (workspaceId) =>
  prisma.workspaceMember.findFirst({
    where: { workspaceId, role: 'owner', status: 'active' },
    include: { user: { select: { email: true, fullName: true } } },
  });

module.exports = {
  storeBillingEvent,
  findEventByProviderId,
  listEventsByWorkspace,
  updateSubscriptionStripeFields,
  findSubscriptionByWorkspace,
  findSubscriptionByStripeCustomerId,
  findWorkspaceById,
  findWorkspaceOwner,
};
