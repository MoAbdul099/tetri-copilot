const prisma = require('./prisma');

const TTL_MS = 30_000; // refresh every 30 seconds

let cache = null;
let lastFetch = 0;

async function load() {
  const [settings, flags] = await Promise.all([
    prisma.systemSetting.findMany(),
    prisma.featureFlag.findMany(),
  ]);

  const map = {};
  for (const s of settings) map[s.key] = s.value;

  const flagMap = {};
  for (const f of flags) flagMap[f.name] = { enabled: f.enabled, rolloutPercentage: f.rolloutPercentage, isBeta: f.isBeta };

  cache = { map, flagMap, flags };
  lastFetch = Date.now();
}

async function get(key, fallback = null) {
  if (!cache || Date.now() - lastFetch > TTL_MS) await load().catch(() => {});
  return cache?.map?.[key] ?? fallback;
}

async function getFlag(name) {
  if (!cache || Date.now() - lastFetch > TTL_MS) await load().catch(() => {});
  return cache?.flagMap?.[name] ?? { enabled: false };
}

async function getAllFlags() {
  if (!cache || Date.now() - lastFetch > TTL_MS) await load().catch(() => {});
  return cache?.flags ?? [];
}

function invalidate() {
  lastFetch = 0;
}

module.exports = { get, getFlag, getAllFlags, invalidate };
