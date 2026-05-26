#!/bin/bash
# Tetri Copilot — Backend Deployment Script
# Usage: bash deploy/scripts/deploy-backend.sh [environment] [version] [actor]
#
# Examples:
#   bash deploy/scripts/deploy-backend.sh production 1.2.0 github-actions
#   bash deploy/scripts/deploy-backend.sh staging 1.2.0-rc.1 CI

set -euo pipefail

ENVIRONMENT="${1:-production}"
VERSION="${2:-$(cd /var/www/tetri-copilot/backend && node -p "require('./package.json').version")}"
ACTOR="${3:-manual}"
APP_DIR="/var/www/tetri-copilot/backend"
PM2_APP_NAME="tetri-api"
API_URL="${API_INTERNAL_URL:-http://localhost:5000}"
DEPLOY_SECRET="${DEPLOY_SECRET:-}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# ── Notify API: deployment started ──────────────────────────────────────────
DEPLOYMENT_ID=""
if [ -n "$DEPLOY_SECRET" ]; then
  log "Registering deployment start..."
  RESPONSE=$(curl -sf -X POST "$API_URL/api/v1/deployments" \
    -H "Authorization: Bearer $DEPLOY_SECRET" \
    -H "Content-Type: application/json" \
    -d "{\"environment\":\"$ENVIRONMENT\",\"version\":\"$VERSION\",\"triggeredBy\":\"$ACTOR\"}" \
    2>/dev/null || echo "")
  DEPLOYMENT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  log "Deployment ID: ${DEPLOYMENT_ID:-unknown}"
fi

audit_event() {
  local action="$1"
  local details="$2"
  if [ -n "$DEPLOY_SECRET" ] && [ -n "$DEPLOYMENT_ID" ]; then
    curl -sf -X POST "$API_URL/api/v1/deployments/$DEPLOYMENT_ID/audit" \
      -H "Authorization: Bearer $DEPLOY_SECRET" \
      -H "Content-Type: application/json" \
      -d "{\"action\":\"$action\",\"actor\":\"$ACTOR\",\"details\":$details}" \
      >/dev/null 2>&1 || true
  fi
}

complete_deployment() {
  local status="$1"
  if [ -n "$DEPLOY_SECRET" ] && [ -n "$DEPLOYMENT_ID" ]; then
    curl -sf -X PATCH "$API_URL/api/v1/deployments/$DEPLOYMENT_ID/complete" \
      -H "Authorization: Bearer $DEPLOY_SECRET" \
      -H "Content-Type: application/json" \
      -d "{\"status\":\"$status\",\"actor\":\"$ACTOR\"}" \
      >/dev/null 2>&1 || true
  fi
}

# ── Trap for failure ─────────────────────────────────────────────────────────
trap 'log "ERROR: Deployment failed"; complete_deployment "failed"; exit 1' ERR

log "==> Starting $ENVIRONMENT deployment: version $VERSION (triggered by $ACTOR)"

# ── Pull code ────────────────────────────────────────────────────────────────
log "==> Pulling latest code..."
cd /var/www/tetri-copilot
git pull origin main
audit_event "git.pull" '{"branch":"main"}'

# ── Generate build-info.json ─────────────────────────────────────────────────
log "==> Writing build-info.json..."
COMMIT_SHA=$(git rev-parse HEAD)
BUILD_TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat > "$APP_DIR/build-info.json" <<EOF
{
  "version": "$VERSION",
  "environment": "$ENVIRONMENT",
  "buildTimestamp": "$BUILD_TS",
  "commitSha": "$COMMIT_SHA",
  "branch": "main"
}
EOF
audit_event "build.info.written" "{\"version\":\"$VERSION\",\"commitSha\":\"$COMMIT_SHA\"}"

# ── Install dependencies ──────────────────────────────────────────────────────
log "==> Installing backend dependencies..."
cd "$APP_DIR"
npm ci --omit=dev
audit_event "npm.install" '{"mode":"production"}'

# ── Run Prisma migrations ─────────────────────────────────────────────────────
log "==> Running Prisma migrations..."
npx prisma migrate deploy
audit_event "prisma.migrate" '{"command":"migrate deploy"}'

# ── Regenerate Prisma client ──────────────────────────────────────────────────
log "==> Generating Prisma client..."
npx prisma generate

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
  log "ERROR: Health check failed (HTTP $HTTP_STATUS)"
  complete_deployment "failed"
  exit 1
fi
audit_event "health.check" "{\"status\":\"ok\",\"httpCode\":$HTTP_STATUS}"

# ── Done ─────────────────────────────────────────────────────────────────────
complete_deployment "success"
log "==> Deployment complete. Environment: $ENVIRONMENT | Version: $VERSION"
pm2 status "$PM2_APP_NAME"
