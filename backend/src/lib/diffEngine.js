// Generic JSON diff engine — compares before/after snapshots and returns field-level changes

function flattenObject(obj, prefix = '', result = {}) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    result[prefix] = obj;
    return result;
  }
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      flattenObject(value, fullKey, result);
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

function serialize(value) {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return JSON.stringify(value);
  return value;
}

function diff(before, after) {
  if (!before && !after) return [];

  const flatBefore = before ? flattenObject(before) : {};
  const flatAfter  = after  ? flattenObject(after)  : {};

  const allKeys = new Set([...Object.keys(flatBefore), ...Object.keys(flatAfter)]);
  const changes = [];

  // Skip internal/audit fields
  const SKIP = new Set(['id', 'createdAt', 'updatedAt', 'workspaceId', 'created_at', 'updated_at', 'workspace_id']);

  for (const key of allKeys) {
    if (SKIP.has(key)) continue;

    const oldVal = serialize(flatBefore[key]);
    const newVal = serialize(flatAfter[key]);

    if (!(key in flatBefore)) {
      changes.push({ field: key, oldValue: null, newValue: newVal, status: 'added' });
    } else if (!(key in flatAfter)) {
      changes.push({ field: key, oldValue: oldVal, newValue: null, status: 'removed' });
    } else if (String(oldVal) !== String(newVal)) {
      changes.push({ field: key, oldValue: oldVal, newValue: newVal, status: 'modified' });
    }
  }

  return changes;
}

module.exports = { diff };
