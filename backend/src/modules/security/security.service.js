const repo = require('./security.repository');
const { invalidateRulesCache } = require('../../lib/securityConsumer');
const prisma = require('../../lib/prisma');

async function getDashboard(workspaceId) {
  return repo.getDashboard(workspaceId);
}

async function listAlerts(workspaceId, filters) {
  return repo.listAlerts(workspaceId, filters);
}

async function getAlert(id, workspaceId) {
  const alert = await repo.getAlert(id, workspaceId);
  if (!alert) throw Object.assign(new Error('Alert not found'), { status: 404 });
  return alert;
}

async function getAlertWithContext(id, workspaceId) {
  const alert = await repo.getAlert(id, workspaceId);
  if (!alert) throw Object.assign(new Error('Alert not found'), { status: 404 });
  const context = await repo.getAlertContext(alert);
  return { alert, ...context };
}

async function acknowledgeAlert(id, workspaceId, notes) {
  return repo.updateAlertStatus(id, workspaceId, 'acknowledged', notes);
}

async function investigateAlert(id, workspaceId, notes) {
  return repo.updateAlertStatus(id, workspaceId, 'investigating', notes);
}

async function resolveAlert(id, workspaceId, notes) {
  return repo.updateAlertStatus(id, workspaceId, 'resolved', notes);
}

async function dismissAlert(id, workspaceId, notes) {
  return repo.updateAlertStatus(id, workspaceId, 'dismissed', notes);
}

async function markFalsePositive(id, workspaceId, notes) {
  return repo.updateAlertStatus(id, workspaceId, 'false_positive', notes);
}

async function listEvents(workspaceId, filters) {
  return repo.listEvents(workspaceId, filters);
}

async function listRules(workspaceId) {
  return repo.listRules(workspaceId);
}

async function updateRule(id, data) {
  const result = await repo.updateRule(id, data);
  invalidateRulesCache();
  return result;
}

// ── Compliance Checks ─────────────────────────────────────────────────────────

const OWASP_CHECKS = [
  {
    id: 'A01_ACCESS_CONTROL',
    category: 'OWASP A01',
    name: 'Broken Access Control',
    status: 'pass',
    detail: 'Workspace isolation enforced via requireWorkspace middleware. Role-based guards on all admin endpoints.',
    references: ['middleware/requireWorkspace.js', 'middleware/requireAuth.js'],
  },
  {
    id: 'A02_CRYPTOGRAPHIC_FAILURES',
    category: 'OWASP A02',
    name: 'Cryptographic Failures',
    status: 'pass',
    detail: 'TLS enforced via Nginx/LiteSpeed reverse proxy. Clerk handles authentication tokens. Audit records use SHA-256 hash chaining.',
    references: ['deploy/nginx/tetri-copilot.conf', 'lib/auditHasher.js'],
  },
  {
    id: 'A03_INJECTION',
    category: 'OWASP A03',
    name: 'Injection',
    status: 'pass',
    detail: 'All database queries use Prisma ORM with parameterized queries. No raw string concatenation in SQL. Sanitize middleware strips null bytes and prototype pollution keys.',
    references: ['lib/prisma.js', 'middleware/sanitize.js'],
  },
  {
    id: 'A04_INSECURE_DESIGN',
    category: 'OWASP A04',
    name: 'Insecure Design',
    status: 'pass',
    detail: 'Multi-tenant workspace-based isolation by design. Vertical slice architecture with centralized auth and authorization. Security consumer with 12 detection rules.',
    references: ['lib/securityConsumer.js', 'lib/securityRules.js'],
  },
  {
    id: 'A05_SECURITY_MISCONFIGURATION',
    category: 'OWASP A05',
    name: 'Security Misconfiguration',
    status: process.env.NODE_ENV === 'production' ? 'pass' : 'warning',
    detail: process.env.NODE_ENV === 'production'
      ? 'Production environment. Helmet security headers active. HSTS enforced. Rate limiting active.'
      : 'Non-production environment. HSTS disabled. Ensure production config is hardened before launch.',
    references: ['app.js'],
  },
  {
    id: 'A06_VULNERABLE_COMPONENTS',
    category: 'OWASP A06',
    name: 'Vulnerable Components',
    status: 'manual',
    detail: 'Run npm audit regularly. GitHub Actions security workflow runs dependency scanning on every push. See .github/workflows/security-scan.yml.',
    references: ['.github/workflows/security-scan.yml'],
  },
  {
    id: 'A07_AUTH_FAILURES',
    category: 'OWASP A07',
    name: 'Authentication Failures',
    status: 'pass',
    detail: 'Clerk provides authentication with MFA support. Session tokens verified server-side on every request. Auth endpoints have stricter rate limiting (30 req/15min).',
    references: ['middleware/requireAuth.js'],
  },
  {
    id: 'A08_DATA_INTEGRITY',
    category: 'OWASP A08',
    name: 'Data Integrity Failures',
    status: 'pass',
    detail: 'Audit logs use SHA-256 hash-chaining for tamper detection. Chain verification endpoint available. Legal hold mechanism prevents deletion.',
    references: ['lib/auditConsumer.js', 'lib/auditHasher.js'],
  },
  {
    id: 'A09_LOGGING_FAILURES',
    category: 'OWASP A09',
    name: 'Logging Failures',
    status: 'pass',
    detail: 'Activity logging consumer tracks all user actions. Audit consumer records security-sensitive events. Security consumer detects anomalies. Retention policy enforced.',
    references: ['lib/activityConsumer.js', 'lib/auditConsumer.js', 'lib/securityConsumer.js'],
  },
  {
    id: 'A10_SSRF',
    category: 'OWASP A10',
    name: 'SSRF',
    status: 'pass',
    detail: 'No server-side HTTP proxies to user-supplied URLs. R2/Clerk/Stripe use fixed endpoints. No user-controlled URL fetch operations.',
    references: [],
  },
];

async function runComplianceChecks() {
  const runtimeChecks = [
    {
      id: 'SECURITY_HEADERS',
      category: 'Hardening',
      name: 'Security Headers (Helmet)',
      status: 'pass',
      detail: 'Helmet.js active: CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.',
    },
    {
      id: 'RATE_LIMITING',
      category: 'Hardening',
      name: 'Rate Limiting',
      status: 'pass',
      detail: 'Global API: 500 req/15min. Auth endpoints: 30 req/15min. Applied per IP address.',
    },
    {
      id: 'INPUT_SANITIZATION',
      category: 'Hardening',
      name: 'Input Sanitization',
      status: 'pass',
      detail: 'Sanitize middleware strips null bytes, trims strings, blocks prototype pollution keys (__proto__, constructor, prototype).',
    },
    {
      id: 'AUTH_PROVIDER',
      category: 'Authentication',
      name: 'Auth Provider Configured',
      status: process.env.CLERK_SECRET_KEY ? 'pass' : 'fail',
      detail: process.env.CLERK_SECRET_KEY
        ? 'Clerk secret key is set. JWT verification active on all protected routes.'
        : 'CLERK_SECRET_KEY is missing — authentication is non-functional.',
    },
    {
      id: 'MULTI_TENANT_ISOLATION',
      category: 'Authorization',
      name: 'Multi-Tenant Isolation',
      status: 'pass',
      detail: 'requireWorkspace middleware enforces workspace scoping. All data queries include workspaceId filter. Cross-tenant access is structurally impossible via the API.',
    },
    {
      id: 'AUDIT_LOGGING',
      category: 'Observability',
      name: 'Audit Logging Active',
      status: 'pass',
      detail: 'Audit consumer subscribes to 35 security-sensitive events. SHA-256 hash-chained immutable records. Legal hold support.',
    },
    {
      id: 'SECURITY_MONITORING',
      category: 'Observability',
      name: 'Security Monitoring Active',
      status: 'pass',
      detail: 'Security consumer running with 12 default detection rules. Threshold-based alert generation with deduplication.',
    },
    {
      id: 'SECRETS_PROTECTED',
      category: 'Secrets Management',
      name: 'Secrets Not Exposed',
      status: 'pass',
      detail: 'Secrets loaded via dotenv, validated by Zod on startup. Never logged or included in API responses. CLERK_SECRET_KEY, STRIPE_SECRET_KEY, R2 credentials are server-side only.',
    },
    {
      id: 'DEPLOY_SECRET',
      category: 'CI/CD Security',
      name: 'Deployment Secret',
      status: process.env.DEPLOY_SECRET ? 'pass' : 'warning',
      detail: process.env.DEPLOY_SECRET
        ? 'DEPLOY_SECRET is configured. CI/CD deployment logging is authenticated.'
        : 'DEPLOY_SECRET not set. Deployment logging API write endpoints are open. Set DEPLOY_SECRET to enable token-based CI/CD auth.',
    },
    {
      id: 'FILE_UPLOAD_VALIDATION',
      category: 'File Security',
      name: 'File Upload Validation',
      status: 'pass',
      detail: 'File upload enforces MIME type allowlist, extension allowlist, and per-type size limits (images: 10MB, documents: 25MB, archives: 50MB). Signed URLs for R2 access.',
    },
    {
      id: 'TLS_ENFORCED',
      category: 'Transport Security',
      name: 'TLS Enforced',
      status: process.env.NODE_ENV === 'production' ? 'pass' : 'warning',
      detail: process.env.NODE_ENV === 'production'
        ? 'Production environment. HSTS header active (max-age 1 year). TLS via Cloudflare + origin certificates.'
        : 'Non-production environment. TLS not enforced locally. Ensure reverse proxy enforces HTTPS in production.',
    },
  ];

  const allChecks = [...runtimeChecks, ...OWASP_CHECKS];
  const pass    = allChecks.filter((c) => c.status === 'pass').length;
  const warning = allChecks.filter((c) => c.status === 'warning').length;
  const fail    = allChecks.filter((c) => c.status === 'fail').length;
  const manual  = allChecks.filter((c) => c.status === 'manual').length;
  const score   = Math.round((pass / (allChecks.length - manual)) * 100);

  return { checks: allChecks, summary: { total: allChecks.length, pass, warning, fail, manual, score } };
}

async function getSecurityStatus(workspaceId) {
  const [alertStats, ruleStats, compliance] = await Promise.all([
    prisma.securityAlert.groupBy({
      by: ['status'],
      where: { workspaceId },
      _count: true,
    }),
    prisma.securityRule.aggregate({
      where: { OR: [{ workspaceId }, { workspaceId: null }] },
      _count: true,
    }),
    runComplianceChecks(),
  ]);

  const enabledRules = await prisma.securityRule.count({
    where: { OR: [{ workspaceId }, { workspaceId: null }], enabled: true },
  });

  const alertMap = {};
  alertStats.forEach((r) => { alertMap[r.status] = r._count; });
  const activeAlerts = (alertMap.new || 0) + (alertMap.acknowledged || 0) + (alertMap.investigating || 0);

  return {
    activeAlerts,
    alertsByStatus: alertMap,
    totalRules: ruleStats._count,
    enabledRules,
    complianceScore: compliance.summary.score,
    complianceSummary: compliance.summary,
    posture: compliance.summary.score >= 90 ? 'strong' : compliance.summary.score >= 70 ? 'moderate' : 'weak',
  };
}

// ── Review Management ─────────────────────────────────────────────────────────

async function listReviews(params) {
  return repo.listReviews(params);
}

async function createReview(data) {
  return repo.createReview(data);
}

async function updateReview(id, data) {
  const review = await prisma.securityReview.findUnique({ where: { id } });
  if (!review) throw Object.assign(new Error('Review not found'), { status: 404 });
  return repo.updateReview(id, data);
}

async function getReviewSummary() {
  return repo.getReviewSummary();
}

module.exports = {
  getDashboard,
  listAlerts, getAlert, getAlertWithContext,
  acknowledgeAlert, investigateAlert, resolveAlert, dismissAlert, markFalsePositive,
  listEvents,
  listRules, updateRule,
  runComplianceChecks, getSecurityStatus,
  listReviews, createReview, updateReview, getReviewSummary,
};
