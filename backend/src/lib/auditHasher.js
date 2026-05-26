const { createHash } = require('crypto');

function sha256(input) {
  return createHash('sha256').update(String(input)).digest('hex');
}

function hashRecord(payload) {
  // Deterministic: sort keys before hashing
  const normalized = JSON.stringify(payload, Object.keys(payload).sort());
  return sha256(normalized);
}

function buildChainHash(recordHash, previousRecordHash) {
  return sha256(`${recordHash}:${previousRecordHash || 'GENESIS'}`);
}

module.exports = { hashRecord, buildChainHash };
