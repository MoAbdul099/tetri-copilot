const repo = require('./audit.repository');
const { hashRecord, buildChainHash } = require('../../lib/auditHasher');

async function getAuditFeed(workspaceId, filters) {
  return repo.list(workspaceId, filters);
}

async function getAuditEntry(id, workspaceId) {
  const item = await repo.findById(id, workspaceId);
  if (!item) throw Object.assign(new Error('Audit entry not found'), { status: 404 });
  return item;
}

async function getEntityAuditTrail(entityId, workspaceId, options) {
  return repo.listByEntity(entityId, workspaceId, options);
}

async function getUserAuditTrail(userId, workspaceId, options) {
  return repo.listByUser(userId, workspaceId, options);
}

async function exportAudit(workspaceId, filters) {
  return repo.listForExport(workspaceId, filters);
}

async function verifyChain(workspaceId, entityId = null) {
  const records = await repo.getAllForVerification(workspaceId, entityId);

  if (records.length === 0) return { valid: true, totalRecords: 0, issues: [] };

  const issues = [];
  let prevHash = null;

  for (const rec of records) {
    // Verify previous_record_hash matches the actual previous record hash
    const expectedPrev = prevHash;
    if (rec.previousRecordHash !== expectedPrev) {
      issues.push({
        id: rec.id,
        action: rec.action,
        createdAt: rec.createdAt,
        issue: 'previous_record_hash mismatch',
        expected: expectedPrev,
        actual: rec.previousRecordHash,
      });
    }

    // Verify chain_hash = sha256(recordHash + previousRecordHash)
    const expectedChain = buildChainHash(rec.recordHash, expectedPrev);
    if (rec.chainHash !== expectedChain) {
      issues.push({
        id: rec.id,
        action: rec.action,
        createdAt: rec.createdAt,
        issue: 'chain_hash mismatch — possible tampering',
        expected: expectedChain,
        actual: rec.chainHash,
      });
    }

    prevHash = rec.recordHash;
  }

  return {
    valid: issues.length === 0,
    totalRecords: records.length,
    issues,
  };
}

async function setLegalHold(id, workspaceId, isLegalHold) {
  return repo.setLegalHold(id, workspaceId, isLegalHold);
}

module.exports = { getAuditFeed, getAuditEntry, getEntityAuditTrail, getUserAuditTrail, exportAudit, verifyChain, setLegalHold };
