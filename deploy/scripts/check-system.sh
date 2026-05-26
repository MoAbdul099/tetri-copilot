#!/usr/bin/env bash
# check-system.sh — disk, CPU, and memory health check
# Usage: ./check-system.sh [--json]

set -euo pipefail

JSON_MODE=false
[[ "${1:-}" == "--json" ]] && JSON_MODE=true

DISK_THRESHOLD=90
MEM_THRESHOLD=90
LOAD_THRESHOLD=4

# ── Disk ──────────────────────────────────────────────────────────────────────
DISK_USAGE=$(df / --output=pcent | tail -1 | tr -d ' %')
DISK_AVAIL=$(df -h / --output=avail | tail -1 | tr -d ' ')
DISK_STATUS="ok"
[[ "$DISK_USAGE" -ge "$DISK_THRESHOLD" ]] && DISK_STATUS="critical"

# ── Memory ────────────────────────────────────────────────────────────────────
MEM_TOTAL_KB=$(awk '/MemTotal/ {print $2}' /proc/meminfo)
MEM_AVAIL_KB=$(awk '/MemAvailable/ {print $2}' /proc/meminfo)
MEM_USED_KB=$(( MEM_TOTAL_KB - MEM_AVAIL_KB ))
MEM_USAGE=$(awk "BEGIN { printf \"%d\", ($MEM_USED_KB / $MEM_TOTAL_KB) * 100 }")
MEM_TOTAL_MB=$(( MEM_TOTAL_KB / 1024 ))
MEM_USED_MB=$(( MEM_USED_KB / 1024 ))
MEM_STATUS="ok"
[[ "$MEM_USAGE" -ge "$MEM_THRESHOLD" ]] && MEM_STATUS="critical"

# ── CPU / Load ────────────────────────────────────────────────────────────────
LOAD_1M=$(awk '{print $1}' /proc/loadavg)
LOAD_5M=$(awk '{print $2}' /proc/loadavg)
LOAD_15M=$(awk '{print $3}' /proc/loadavg)
CPU_COUNT=$(nproc)
LOAD_STATUS="ok"
# Flag if 1-min load exceeds threshold * CPU count
LOAD_PER_CPU=$(awk "BEGIN { printf \"%d\", $LOAD_1M }")
[[ "$LOAD_PER_CPU" -ge "$LOAD_THRESHOLD" ]] && LOAD_STATUS="warning"

# ── PM2 process ───────────────────────────────────────────────────────────────
PM2_STATUS="ok"
if command -v pm2 &>/dev/null; then
  PM2_ONLINE=$(pm2 jlist 2>/dev/null | python3 -c "
import sys, json
procs = json.load(sys.stdin)
online = [p for p in procs if p.get('pm2_env',{}).get('status') == 'online']
print(len(online))
" 2>/dev/null || echo "0")
  [[ "$PM2_ONLINE" -eq 0 ]] && PM2_STATUS="critical"
else
  PM2_STATUS="unavailable"
fi

# ── Output ────────────────────────────────────────────────────────────────────
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
OVERALL="ok"
[[ "$DISK_STATUS" == "critical" || "$MEM_STATUS" == "critical" || "$PM2_STATUS" == "critical" ]] && OVERALL="critical"
[[ "$OVERALL" == "ok" && "$LOAD_STATUS" == "warning" ]] && OVERALL="degraded"

if $JSON_MODE; then
  cat <<EOF
{
  "timestamp": "$TIMESTAMP",
  "overall": "$OVERALL",
  "disk": {
    "status": "$DISK_STATUS",
    "usagePct": $DISK_USAGE,
    "available": "$DISK_AVAIL"
  },
  "memory": {
    "status": "$MEM_STATUS",
    "usagePct": $MEM_USAGE,
    "usedMb": $MEM_USED_MB,
    "totalMb": $MEM_TOTAL_MB
  },
  "cpu": {
    "status": "$LOAD_STATUS",
    "load1m": $LOAD_1M,
    "load5m": $LOAD_5M,
    "load15m": $LOAD_15M,
    "cores": $CPU_COUNT
  },
  "pm2": {
    "status": "$PM2_STATUS"
  }
}
EOF
else
  echo "=== System Health Check — $TIMESTAMP ==="
  echo "Overall: $OVERALL"
  echo ""
  echo "Disk:    ${DISK_USAGE}% used | ${DISK_AVAIL} available [$DISK_STATUS]"
  echo "Memory:  ${MEM_USAGE}% used | ${MEM_USED_MB}/${MEM_TOTAL_MB} MB [$MEM_STATUS]"
  echo "CPU:     load=${LOAD_1M} (1m) ${LOAD_5M} (5m) ${LOAD_15M} (15m) | ${CPU_COUNT} cores [$LOAD_STATUS]"
  echo "PM2:     [$PM2_STATUS]"

  if [[ "$OVERALL" == "critical" ]]; then
    echo ""
    echo "WARNING: System is in critical state!"
    exit 1
  fi
fi
