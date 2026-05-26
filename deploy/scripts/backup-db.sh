#!/bin/bash
# Tetri Copilot — Database Backup Script
# Usage: bash deploy/scripts/backup-db.sh [daily|weekly|monthly]
#
# Requires:
#   - DATABASE_URL env var (or DB_NAME / DB_USER / DB_HOST)
#   - BACKUP_DIR env var (default: /var/backups/tetri-copilot)
#   - BACKUP_ENCRYPT_KEY env var (optional, enables AES-256 encryption)

set -euo pipefail

TYPE="${1:-daily}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/tetri-copilot}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="${DB_NAME:-tetri_copilot_db}"
DB_USER="${DB_USER:-tetri_user}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

mkdir -p "$BACKUP_DIR/$TYPE"

FILENAME="${BACKUP_DIR}/${TYPE}/tetri_${TYPE}_${TIMESTAMP}.sql.gz"

log "==> Starting $TYPE database backup..."
log "    Database: $DB_NAME @ $DB_HOST:$DB_PORT"
log "    Output:   $FILENAME"

# ── Dump + compress ───────────────────────────────────────────────────────────
PGPASSWORD="${DB_PASSWORD:-}" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-owner \
  --no-acl \
  --format=plain \
  | gzip > "$FILENAME"

# ── Encrypt if key provided ───────────────────────────────────────────────────
if [ -n "${BACKUP_ENCRYPT_KEY:-}" ]; then
  log "==> Encrypting backup..."
  openssl enc -aes-256-cbc -salt -pbkdf2 \
    -in "$FILENAME" \
    -out "${FILENAME}.enc" \
    -pass "pass:$BACKUP_ENCRYPT_KEY"
  rm "$FILENAME"
  FILENAME="${FILENAME}.enc"
  log "    Encrypted: $FILENAME"
fi

# ── Verify file ───────────────────────────────────────────────────────────────
if [ ! -f "$FILENAME" ] || [ ! -s "$FILENAME" ]; then
  log "ERROR: Backup file is empty or missing!"
  exit 1
fi
SIZE=$(du -sh "$FILENAME" | cut -f1)
log "==> Backup complete: $FILENAME ($SIZE)"

# ── Retention cleanup ─────────────────────────────────────────────────────────
case "$TYPE" in
  daily)   RETAIN_DAYS=30 ;;
  weekly)  RETAIN_DAYS=84 ;;   # 12 weeks
  monthly) RETAIN_DAYS=365 ;;  # 12 months
  *)       RETAIN_DAYS=30 ;;
esac

log "==> Cleaning up backups older than $RETAIN_DAYS days..."
find "$BACKUP_DIR/$TYPE" -name "tetri_${TYPE}_*.sql.gz*" -mtime "+${RETAIN_DAYS}" -delete
REMAINING=$(ls "$BACKUP_DIR/$TYPE" | wc -l)
log "    Remaining backups: $REMAINING"

log "==> Backup job complete."
