# Slice 13.1 — Production Infrastructure & Deployment

**Product:** Tetri Copilot
**Slice:** 13.1
**Type:** Platform Foundation
**Status:** Planned
**Priority:** Critical
**Dependencies:** Slices 1–12

---

# 1. Executive Summary

This slice establishes the production deployment foundation for Tetri Copilot, including environment management, infrastructure architecture, CI/CD pipelines, deployment automation, backup and recovery foundations, release management, rollback capabilities, operational runbooks, and production governance.

The goal is to make the platform deployable, repeatable, maintainable, and ready for real customer onboarding.

---

# 2. Objectives

- Production-ready infrastructure
- Automated deployments
- Environment isolation
- Secure configuration management
- Database migration automation
- Backup and restore framework
- Release governance
- Rollback capability
- Deployment observability foundation
- Operational readiness

# 3. Target Architecture

## Frontend

- React
- TypeScript
- Vite
- Cloudflare Pages

## Backend

- Node.js
- Express.js
- Prisma ORM
- Ubuntu VPS
- LiteSpeed

## Database

- PostgreSQL

## Storage

- Cloudflare R2

## Authentication

- Clerk

## Source Control

- GitHub

---

# 4. Environment Strategy

## Local
Developer environment.

## Development
Shared internal environment.

## Staging
Production-like validation environment.

## Production
Customer-facing environment.

## Requirements

- Separate databases
- Separate storage buckets
- Separate secrets
- Separate domains
- Separate API endpoints
- Separate environment variables
- No production data in non-production environments

---

# 5. Domain Architecture

## Marketing

https://www.tetricopilot.com

## Application

https://app.tetricopilot.com

## API

https://api.tetricopilot.com

## Future Admin

https://admin.tetricopilot.com

## Future Documentation

https://docs.tetricopilot.com

---

# 6. Environment Variables

## Backend

```env
NODE_ENV=
DATABASE_URL=

CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

JWT_SECRET=
ENCRYPTION_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

EMAIL_PROVIDER_KEY=
```

## Frontend

```env
VITE_API_URL=
VITE_CLERK_PUBLISHABLE_KEY=
VITE_ENVIRONMENT=
```

---

# 7. Backend Deployment

## Server Standards

- Ubuntu LTS
- Dedicated application user
- PM2 process management
- Automatic restart
- Boot persistence
- Deployment logging

## Services

### Current

- tetri-api
- tetri-worker

### Future

- notification-worker
- audit-worker
- ai-worker
- scheduler-worker

---

# 8. LiteSpeed Configuration

## Responsibilities

- HTTPS termination
- Reverse proxy
- Compression
- HTTP/2 support
- WebSocket support
- Security headers
- Cache controls

## Routing

/api/* -> Express API

/uploads/* -> Cloudflare R2

/* -> Frontend

---

# 9. Frontend Deployment

## Cloudflare Pages

### Requirements

- Automatic builds
- Preview deployments
- Production deployments
- Rollbacks
- Cache invalidation
- Custom domains

---

# 10. CI/CD Pipeline

## Validation Stage

- ESLint
- TypeScript checks
- Unit tests
- Build validation

## Build Stage

- Backend build
- Frontend build

## Deployment Stage

- Staging deployment
- Smoke tests
- Production deployment

## Verification Stage

- Health checks
- Database validation
- Storage validation

---

# 11. Database Migration Framework

## Tooling

- Prisma Migrate

## Workflow

1. Create migration
2. Validate migration
3. Backup database
4. Execute migration
5. Verify schema
6. Deploy application

---

# 12. Backup Strategy

## Database Backups

### Daily

Incremental

### Weekly

Full

### Monthly

Archive

## Retention

| Type | Retention |
|------|------------|
| Daily | 30 Days |
| Weekly | 12 Weeks |
| Monthly | 12 Months |

## Requirements

- Encryption
- Integrity validation
- Restore testing
- Recovery documentation

---

# 13. File Storage Protection

## Cloudflare R2

Requirements:

- Metadata backup
- File integrity checks
- Recovery procedures
- Orphan detection
- Missing file reporting

---

# 14. Release Management

## Release Types

### Major
Breaking or significant functionality.

### Minor
Enhancements.

### Patch
Bug fixes.

### Hotfix
Emergency fixes.

## Versioning

MAJOR.MINOR.PATCH

Example:

1.3.5

---

# 15. Rollback Strategy

## Supported Rollbacks

- Frontend rollback
- Backend rollback
- Database restore
- Configuration rollback

## Targets

- Recovery under 15 minutes
- Documented procedures
- Logged activities

---

# 16. Health Check Endpoints

```http
GET /api/health
GET /api/health/db
GET /api/health/storage
GET /api/health/version
```

Returned information:

- Service status
- Database connectivity
- Storage connectivity
- Version
- Deployment timestamp

---

# 17. Deployment Audit Logging

Tracked Events:

- Deployment started
- Deployment completed
- Deployment failed
- Rollback started
- Rollback completed
- Migration executed

Captured Fields:

- Timestamp
- User
- Environment
- Version
- Result
- Notes

---

# 18. Operational Runbooks

Required Runbooks:

1. Initial deployment
2. Standard release
3. Emergency hotfix
4. Rollback
5. Database recovery
6. Server recovery
7. SSL renewal
8. Domain migration

---

# 19. Database Changes

## deployment_logs

- id
- environment
- version
- status
- started_at
- completed_at
- triggered_by
- notes

## deployment_audit_logs

- id
- deployment_id
- action
- actor
- timestamp
- details

## system_versions

- id
- version
- release_date
- release_notes

---

# 20. API Endpoints

```http
GET /api/system/version
GET /api/system/build-info
GET /api/health
GET /api/health/db
GET /api/health/storage
GET /api/health/version
```

---

# 21. UI Components

## System Information Widget

Displays:

- Environment
- Version
- Build timestamp
- API status
- Database status

## Deployment History

Displays:

- Deployment records
- Rollbacks
- Duration
- Initiator
- Status

---

# 22. Acceptance Criteria

## Infrastructure

- Production environment configured
- Staging environment configured
- SSL operational
- DNS operational

## Deployment

- Automated deployments operational
- Rollback tested
- Deployment logs generated

## Database

- Backups operational
- Migration framework operational
- Restore procedure validated

## Documentation

- Runbooks completed
- Recovery procedures documented
- Release procedures documented

---

# 23. Out of Scope

Moved to Slice 13.2:

- Security hardening
- Vulnerability remediation
- Penetration testing
- Compliance validation

Moved to Slice 13.3:

- Monitoring
- Alerting
- Load testing
- Disaster recovery validation
- Reliability engineering

---

# 24. Implementation Phases

## Phase 1
Environment setup

## Phase 2
Domain configuration

## Phase 3
Backend deployment

## Phase 4
Frontend deployment

## Phase 5
Migration automation

## Phase 6
Backup automation

## Phase 7
CI/CD implementation

## Phase 8
Rollback framework

## Phase 9
Operational documentation

---

# 25. Claude Code Implementation Guidance

Implement incrementally:

1. Environment configuration validation
2. Health endpoints
3. PM2 deployment scripts
4. LiteSpeed routing
5. GitHub Actions pipeline
6. Prisma migration automation
7. Backup automation
8. Rollback tooling
9. Deployment audit logging
10. Runbook documentation

All functionality must include:

- Backend implementation
- UI where applicable
- Tests
- Documentation
- Migration support

---

# 26. Success Metrics

- Deployment success rate >95%
- Rollback completion <15 minutes
- Deployment duration <10 minutes
- Backup success rate >99%
- Zero manual production configuration changes
- Fully automated release process
- Production readiness checklist completed

---

# End of Document
