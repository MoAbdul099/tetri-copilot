#!/bin/bash
# Tetri Copilot — Rollback Script
# Usage: bash deploy/scripts/rollback.sh [commit-sha|tag] [environment]
#
# Rolls back to a specific git commit or tag and restarts the backend.
# Optionally restores the database from backup (manual step prompted).

set -euo pipefail

TARGET="${1:-}"
ENVIRONMENT="${2:-production}"
APP_DIR="/var/www/tetri-copilot/backend"
PM2_APP_NAME="tetri-api"
API_URL="${API_INTERNAL_URL:-http://localhost:5000}"
DEPLOY_SECRET="${DEPLOY_SECRET:-}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

if [ -z "$TARGET" ]; then
  log "ERROR: No rollback target specified."
  log "Usage: bash rollback.sh <commit-sha|tag> [environment]"
  exit 1
fi

log "==> Rollback initiated: target=$TARGET environment=$ENVIRONMENT"

# ── Notify API: rollback started ─────────────────────────────────────────────
DEPLOYMENT_ID=""
if [ -n "$DEPLOY_SECRET" ]; then
  VERSION=$(git describe --tags "$TARGET" 2>/dev/null || echo "$TARGET")
  RESPONSE=$(curl -sf -X POST "$API_URL/api/v1/deployments" \
    -H "Authorization: Bearer $DEPLOY_SECRET" \
    -H "Content-Type: application/json" \
    -d "{\"environment\":\"$ENVIRONMENT\",\"version\":\"$VERSION\",\"triggeredBy\":\"rollback\",\"notes\":\"Rollback to $TARGET\"}" \
    2>/dev/null || echo "")
  DEPLOYMENT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
fi

audit_event() {
  local action="$1"
  local details="$2"
  if [ -n "$DEPLOY_SECRET" ] && [ -n "$DEPLOYMENT_ID" ]; then
    curl -sf -X POST "$API_URL/api/v1/deployments/$DEPLOYMENT_ID/audit" \
      -H "Authorization: Bearer $DEPLOY_SECRET" \
      -H "Content-Type: application/json" \
      -d "{\"action\":\"$action\",\"actor\":\"rollback\",\"details\":$details}" \
      >/dev/null 2>&1 || true
  fi
}

complete_deployment() {
  if [ -n "$DEPLOY_SECRET" ] && [ -n "$DEPLOYMENT_ID" ]; then
    curl -sf -X PATCH "$API_URL/api/v1/deployments/$DEPLOYMENT_ID/complete" \
      -H "Authorization: Bearer $DEPLOY_SECRET" \
      -H "Content-Type: application/json" \
      -d "{\"status\":\"$1\",\"actor\":\"rollback\"}" \
      >/dev/null 2>&1 || true
  fi
}

trap 'log "ERROR: Rollback failed"; complete_deployment "failed"; exit 1' ERR

# ── Checkout target ───────────────────────────────────────────────────────────
log "==> Checking out $TARGET..."
cd /var/www/tetri-copilot
git fetch origin
git checkout "$TARGET"
audit_event "git.checkout" "{\"target\":\"$TARGET\"}"

# ── Install dependencies ──────────────────────────────────────────────────────
log "==> Installing dependencies for rollback target..."
cd "$APP_DIR"
npm ci --omit=dev
audit_event "npm.install" '{"mode":"production"}'

# ── Run migrations (forward only — rollback schema changes require manual DB restore) ──
log "==> Running pending migrations..."
npx prisma migrate deploy
npx prisma generate
audit_event "prisma.migrate" '{"command":"migrate deploy"}'

# ── Restart application ───────────────────────────────────────────────────────
log "==> Restarting application..."
pm2 reload "$PM2_APP_NAME" --update-env
pm2 save
audit_event "pm2.reload" "{\"app\":\"$PM2_APP_NAME\"}"

# ── Health check ─────────────────────────────────────────────────────────────
log "==> Running health check..."
sleep 3
HTTP_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" "$API_URL/api/v1/health" 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" != "200" ]; then
  log "ERROR: Health check failed after rollback (HTTP $HTTP_STATUS)"
  complete_deployment "failed"
  exit 1
fi

complete_deployment "success"
log "==> Rollback complete. Running: $(git rev-parse HEAD)"
log ""
log "IMPORTANT: If this rollback includes a schema migration revert,"
log "           you must MANUALLY restore the database from backup."
log "           See: docs/runbooks/database-recovery.md"
