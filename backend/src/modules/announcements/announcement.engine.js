const prisma = require('../../lib/prisma');
const notifier = require('../notifications/notification.emitter');

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Publish any announcements whose publishAt has passed
const processScheduled = async () => {
  try {
    const now = new Date();
    const due = await prisma.announcement.findMany({
      where: { status: 'draft', publishAt: { lte: now, not: null } },
    });
    for (const a of due) {
      await prisma.announcement.update({ where: { id: a.id }, data: { status: 'published' } });
      console.log(`[AnnouncementEngine] Auto-published: ${a.title}`);
    }
  } catch (err) {
    console.error('[AnnouncementEngine] processScheduled error:', err.message);
  }
};

// Expire announcements past their expiresAt
const processExpired = async () => {
  try {
    const now = new Date();
    await prisma.announcement.updateMany({
      where: { status: 'published', expiresAt: { lte: now, not: null } },
      data:  { status: 'archived' },
    });
  } catch (err) {
    console.error('[AnnouncementEngine] processExpired error:', err.message);
  }
};

// Deliver newly-published announcements as in-app notifications to target members
const deliverAnnouncements = async () => {
  try {
    // Find published announcements that haven't been delivered yet
    // We use a simple heuristic: announcements published in last 10 minutes with no reads
    const cutoff = new Date(Date.now() - 10 * 60 * 1000);
    const fresh = await prisma.announcement.findMany({
      where: {
        status: 'published',
        publishAt: { gte: cutoff },
        workspaceId: { not: null },
      },
      include: { reads: { select: { userId: true } } },
    });

    for (const a of fresh) {
      const members = await prisma.workspaceMember.findMany({
        where: {
          workspaceId: a.workspaceId,
          status: 'active',
          ...(a.audienceType === 'role' && a.audienceRoles?.length > 0
            ? { role: { in: a.audienceRoles } }
            : {}),
        },
        select: { userId: true },
      });

      for (const { userId } of members) {
        const dedupeKey = `announcement:${a.id}:${userId}`;
        await notifier.emit('USER_INVITED', a.workspaceId, userId, {
          sourceId:   a.id,
          sourceType: 'announcement',
          title:      `Announcement: ${a.title}`,
          body:       a.summary,
          metadata:   { announcementId: a.id, priority: a.priority },
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error('[AnnouncementEngine] deliverAnnouncements error:', err.message);
  }
};

const startAnnouncementEngine = () => {
  console.log('[AnnouncementEngine] Starting announcement engine');
  Promise.all([processScheduled(), processExpired()])
    .catch((err) => console.error('[AnnouncementEngine] Startup error:', err.message));

  setInterval(() => {
    processScheduled().catch(console.error);
    processExpired().catch(console.error);
    deliverAnnouncements().catch(console.error);
  }, POLL_INTERVAL_MS);
};

module.exports = { startAnnouncementEngine };
