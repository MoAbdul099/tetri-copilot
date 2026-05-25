const prisma = require('../../lib/prisma');
const { seedEventRegistry, EVENTS } = require('./notification.emitter');
const { success } = require('../../utils/response');

const listEvents = async (req, res, next) => {
  try {
    const items = await prisma.notificationEventRegistry.findMany({
      orderBy: [{ categoryCode: 'asc' }, { eventCode: 'asc' }],
    });
    success(res, items);
  } catch (e) { next(e); }
};

const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, defaultTitle, defaultMessage, defaultPriority } = req.body;
    const item = await prisma.notificationEventRegistry.update({
      where: { id },
      data: {
        ...(isActive !== undefined ? { isActive } : {}),
        ...(defaultTitle    ? { defaultTitle }    : {}),
        ...(defaultMessage  ? { defaultMessage }  : {}),
        ...(defaultPriority ? { defaultPriority } : {}),
      },
    });
    success(res, item);
  } catch (e) { next(e); }
};

const triggerSeed = async (req, res, next) => {
  try {
    await seedEventRegistry();
    const count = Object.keys(EVENTS).length;
    success(res, { seeded: count }, `${count} events synced to registry`);
  } catch (e) { next(e); }
};

const getIntegrationStatus = async (req, res, next) => {
  try {
    const [total, active] = await Promise.all([
      prisma.notificationEventRegistry.count(),
      prisma.notificationEventRegistry.count({ where: { isActive: true } }),
    ]);
    success(res, { total, active, inactive: total - active, registeredInMemory: Object.keys(EVENTS).length });
  } catch (e) { next(e); }
};

module.exports = { listEvents, updateEvent, triggerSeed, getIntegrationStatus };
