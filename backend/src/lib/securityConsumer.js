const { randomUUID } = require('crypto');
const eventBus = require('./eventBus');
const prisma = require('./prisma');

let rulesCache = null;
let rulesCachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getRules() {
  if (rulesCache && Date.now() - rulesCachedAt < CACHE_TTL_MS) return rulesCache;
  rulesCache = await prisma.securityRule.findMany({ where: { enabled: true } });
  rulesCachedAt = Date.now();
  return rulesCache;
}

function severityToScore(severity) {
  return { info: 5, low: 10, medium: 20, high: 35, critical: 50 }[severity] || 10;
}

async function processEvent(eventName, payload) {
  const { workspaceId, userId, userName, entityType, entityId } = payload;
  if (!workspaceId) return;

  const allRules = await getRules();
  const matchingRules = allRules.filter(
    (r) => r.eventType === eventName && (!r.workspaceId || r.workspaceId === workspaceId)
  );

  for (const rule of matchingRules) {
    // Record the security event
    await prisma.securityEvent.create({
      data: {
        workspaceId,
        eventId:    payload.eventId ?? randomUUID(),
        eventType:  eventName,
        category:   rule.category,
        riskScore:  rule.riskScore,
        severity:   rule.severity,
        entityType: entityType ?? undefined,
        entityId:   entityId   ?? undefined,
        userId:     userId     ?? undefined,
        userName:   userName   ?? undefined,
        description: rule.description ?? undefined,
        metadata:   payload.metadata  ?? undefined,
      },
    });

    // Count matching events in the detection window
    const windowStart = new Date(Date.now() - rule.windowMins * 60 * 1000);
    const recentCount = await prisma.securityEvent.count({
      where: {
        workspaceId,
        eventType: eventName,
        createdAt: { gte: windowStart },
      },
    });

    if (recentCount >= rule.threshold) {
      // Avoid duplicate open alerts of the same type
      const existingOpen = await prisma.securityAlert.findFirst({
        where: {
          workspaceId,
          alertType: rule.ruleName,
          status: { in: ['new', 'acknowledged', 'investigating'] },
          createdAt: { gte: windowStart },
        },
      });

      if (!existingOpen) {
        await prisma.securityAlert.create({
          data: {
            workspaceId,
            alertType:        rule.ruleName,
            category:         rule.category,
            severity:         rule.severity,
            riskScore:        rule.riskScore,
            status:           'new',
            entityType:       entityType ?? undefined,
            entityId:         entityId   ?? undefined,
            userId:           userId     ?? undefined,
            userName:         userName   ?? undefined,
            description:      `${rule.description} (${recentCount} event${recentCount !== 1 ? 's' : ''} in ${rule.windowMins} min)`,
            recommendedAction: rule.recommendedAction ?? undefined,
          },
        });

        console.log(`[SecurityConsumer] Alert generated: ${rule.ruleName} (workspace: ${workspaceId})`);
      }
    }
  }
}

function start() {
  eventBus.subscribeAll(async (eventName, payload) => {
    if (!payload || typeof payload !== 'object') return;
    try {
      await processEvent(eventName, payload);
    } catch (err) {
      console.error(`[SecurityConsumer] error on event "${eventName}":`, err.message);
    }
  });

  console.log('[SecurityConsumer] subscribed to event bus');
}

function invalidateRulesCache() {
  rulesCache = null;
}

module.exports = { start, invalidateRulesCache };
