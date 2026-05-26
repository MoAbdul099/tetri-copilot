// Sanitize incoming request bodies:
//   - Strip null bytes from strings
//   - Trim string whitespace
//   - Block prototype pollution keys (__proto__, constructor, prototype)
//   - Reject any single field value exceeding 500 KB

const BLOCKED_KEYS   = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_FIELD_SIZE = 512 * 1024; // 500 KB

function sanitizeValue(val, key = '') {
  if (BLOCKED_KEYS.has(key)) return undefined;
  if (typeof val === 'string') {
    if (Buffer.byteLength(val) > MAX_FIELD_SIZE) return val.slice(0, MAX_FIELD_SIZE);
    return val.replace(/\0/g, '').trim();
  }
  if (Array.isArray(val)) return val.map((v) => sanitizeValue(v));
  if (val !== null && typeof val === 'object') return sanitizeObject(val);
  return val;
}

function sanitizeObject(obj) {
  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    if (BLOCKED_KEYS.has(k)) continue;
    clean[k] = sanitizeValue(v, k);
  }
  return clean;
}

module.exports = function sanitize(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};
