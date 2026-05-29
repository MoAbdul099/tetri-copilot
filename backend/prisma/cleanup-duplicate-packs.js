/**
 * One-time cleanup: remove duplicate compliance packs, keeping the oldest per name.
 * Also marks all seeded/remaining packs as 'published' so they appear in the workspace Pack Library.
 * Run: node prisma/cleanup-duplicate-packs.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allPacks = await prisma.compliancePack.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, jurisdictionId: true, createdAt: true, status: true },
  });

  // Group by name — keep first (oldest), collect rest as duplicates
  const seen = new Map();
  const toDelete = [];

  for (const pack of allPacks) {
    const key = pack.name.trim().toLowerCase();
    if (seen.has(key)) {
      toDelete.push(pack.id);
    } else {
      seen.set(key, pack);
    }
  }

  if (toDelete.length > 0) {
    // CompliancePackTemplate has onDelete: Cascade, so deleting packs removes their items
    const del = await prisma.compliancePack.deleteMany({ where: { id: { in: toDelete } } });
    console.log(`Deleted ${del.count} duplicate packs`);
  } else {
    console.log('No duplicates found');
  }

  // Publish all remaining packs that are still 'draft' (seeded packs should be visible)
  const published = await prisma.compliancePack.updateMany({
    where: { status: 'draft' },
    data: { status: 'published', publishedAt: new Date() },
  });
  console.log(`Published ${published.count} draft packs`);

  const remaining = await prisma.compliancePack.count();
  console.log(`Remaining packs: ${remaining}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
