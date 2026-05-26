const { randomUUID } = require('crypto');
const eventBus = require('./eventBus');
const prisma = require('./prisma');
const { EVENT_META } = require('./events');

const EVENT_VERSION = '1';

function mapEventToActivity(eventName, payload) {
  const meta = EVENT_META[eventName] || {};
  return {
    id:              randomUUID(),
    workspaceId:     payload.workspaceId     ?? undefined,
    userId:          payload.userId          ?? undefined,
    userName:        payload.userName        ?? undefined,
    action:          eventName,
    eventId:         payload.eventId         ?? randomUUID(),
    eventVersion:    payload.eventVersion    ?? EVENT_VERSION,
    module:          payload.module          ?? meta.module    ?? null,
    category:        payload.category        ?? meta.category  ?? null,
    entityType:      payload.entityType      ?? undefined,
    entityId:        payload.entityId        ?? undefined,
    referenceNumber: payload.referenceNumber ?? undefined,
    description:     payload.description     ?? undefined,
    metadata:        payload.metadata        ?? undefined,
    ipAddress:       payload.ipAddress       ?? undefined,
    userAgent:       payload.userAgent       ?? undefined,
  };
}

function start() {
  eventBus.subscribeAll(async (eventName, payload) => {
    if (!payload || typeof payload !== 'object') return;

    try {
      const entry = mapEventToActivity(eventName, payload);
      await prisma.activityLog.create({ data: entry });
    } catch (err) {
      console.error(`[ActivityConsumer] failed to persist event "${eventName}":`, err.message);
    }
  });

  console.log('[ActivityConsumer] subscribed to event bus');
}

module.exports = { start };
