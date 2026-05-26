#!/bin/bash
# Tetri Copilot — VPS Setup & Hardening Script
# Run as root on a fresh Ubuntu 22.04 LTS VPS
# Covers: Slice 13.1 (infrastructure) + Slice 13.2 (security hardening)
#
# Review each section before running in production.

set -euo pipefail

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# ============================================================
# 1. System Update
# ============================================================
log "==> Updating system packages..."
apt update && apt upgrade -y
apt install -y curl wget gnupg ufw fail2ban unattended-upgrades apt-listchanges

# ============================================================
# 2. Automatic Security Updates
# ============================================================
log "==> Configuring automatic security updates..."
dpkg-reconfigure --priority=low unattended-upgrades
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

# ============================================================
# 3. Install Node.js 20 LTS
# ============================================================
log "==> Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v && npm -v

# ============================================================
# 4. Install PM2
# ============================================================
log "==> Installing PM2..."
npm install -g pm2
pm2 startup systemd -u www-data --hp /home/www-data

# ============================================================
# 5. Install PostgreSQL
# ============================================================
log "==> Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

systemctl start postgresql
systemctl enable postgresql

log "PostgreSQL installed. Create DB manually:"
log "  sudo -u postgres psql"
log "  CREATE USER tetri_user WITH PASSWORD 'STRONG_PASSWORD';"
log "  CREATE DATABASE tetri_copilot_db OWNER tetri_user;"
log "  GRANT ALL PRIVILEGES ON DATABASE tetri_copilot_db TO tetri_user;"
log "  ALTER ROLE tetri_user NOSUPERUSER NOCREATEDB NOCREATEROLE;"
log "  \\q"

# ============================================================
# 6. PostgreSQL Hardening
# ============================================================
log "==> Hardening PostgreSQL..."
PG_CONF=$(find /etc/postgresql -name "postgresql.conf" | head -1)
PG_HBA=$(find /etc/postgresql -name "pg_hba.conf" | head -1)

# Restrict PostgreSQL to localhost only
if [ -f "$PG_CONF" ]; then
  sed -i "s/^#listen_addresses.*/listen_addresses = 'localhost'/" "$PG_CONF"
  log "  PostgreSQL restricted to localhost"
fi

# ============================================================
# 7. Firewall (UFW)
# ============================================================
log "==> Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp    # HTTP (redirect to HTTPS)
ufw allow 443/tcp   # HTTPS
# Do NOT expose port 5000 (Node.js) — only via reverse proxy
ufw --force enable
ufw status verbose

# ============================================================
# 8. Fail2Ban (brute-force protection)
# ============================================================
log "==> Configuring Fail2Ban..."
cat > /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 5
backend  = systemd

[sshd]
enabled  = true
port     = ssh
logpath  = %(sshd_log)s

[nginx-http-auth]
enabled  = true
filter   = nginx-http-auth
logpath  = /var/log/nginx/error.log
maxretry = 5

[nginx-limit-req]
enabled  = true
filter   = nginx-limit-req
logpath  = /var/log/nginx/error.log
maxretry = 10
EOF

systemctl restart fail2ban
systemctl enable fail2ban
log "  Fail2Ban active — SSH and nginx protected"

# ============================================================
# 9. SSH Hardening
# ============================================================
log "==> Hardening SSH..."
SSHD_CONFIG=/etc/ssh/sshd_config

# Backup original config
cp "$SSHD_CONFIG" "${SSHD_CONFIG}.bak.$(date +%Y%m%d)"

# Apply hardening
cat >> "$SSHD_CONFIG" <<'EOF'

# Tetri Copilot hardening
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
X11Forwarding no
AllowTcpForwarding no
MaxAuthTries 3
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2
EOF

systemctl reload sshd
log "  SSH hardened: root login disabled, password auth disabled"
log "  IMPORTANT: Ensure your SSH key is added before logging out!"

# ============================================================
# 10. Create Application User
# ============================================================
log "==> Creating application user..."
if ! id "www-data" &>/dev/null; then
  useradd -r -s /bin/bash -d /home/www-data -m www-data
fi
mkdir -p /var/www/tetri-copilot
chown www-data:www-data /var/www/tetri-copilot
mkdir -p /var/log/pm2
chown www-data:www-data /var/log/pm2
mkdir -p /var/backups/tetri-copilot/{daily,weekly,monthly}
chown -R www-data:www-data /var/backups/tetri-copilot

# ============================================================
# 11. Install Nginx (fallback — LiteSpeed preferred)
# ============================================================
log "==> Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# ============================================================
# 12. Nginx Security Hardening
# ============================================================
log "==> Hardening Nginx..."
cat > /etc/nginx/conf.d/security.conf <<'EOF'
# Hide Nginx version
server_tokens off;

# Prevent clickjacking
add_header X-Frame-Options "DENY" always;

# Prevent MIME sniffing
add_header X-Content-Type-Options "nosniff" always;

# XSS protection (legacy)
add_header X-XSS-Protection "0" always;

# Referrer policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions policy
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
EOF

nginx -t && systemctl reload nginx

# ============================================================
# 13. Clone Repository
# ============================================================
log ""
log "==> Manual steps required:"
log "  cd /var/www"
log "  git clone https://github.com/MoAbdul099/tetri-copilot.git"
log "  cd tetri-copilot/backend"
log "  cp .env.example .env && nano .env  # Fill production values"
log "  npm ci --omit=dev"
log "  npx prisma migrate deploy"
log "  npx prisma generate"
log ""

# ============================================================
# 14. Start with PM2
# ============================================================
log "  cd /var/www/tetri-copilot"
log "  pm2 start deploy/pm2/ecosystem.config.js --env production"
log "  pm2 save"
log ""

# ============================================================
# 15. Configure Nginx / LiteSpeed
# ============================================================
log "  # Nginx:"
log "  cp deploy/nginx/tetri-copilot.conf /etc/nginx/sites-available/tetri-copilot"
log "  ln -s /etc/nginx/sites-available/tetri-copilot /etc/nginx/sites-enabled/"
log "  nginx -t && systemctl reload nginx"
log ""

# ============================================================
# 16. Setup Backup Cron
# ============================================================
log "==> Setting up backup cron jobs..."
CRON_FILE=/etc/cron.d/tetri-backups
cat > "$CRON_FILE" <<'EOF'
# Tetri Copilot — Database Backups
# Daily at 02:00 UTC
0 2 * * * www-data bash /var/www/tetri-copilot/deploy/scripts/backup-db.sh daily >> /var/log/tetri-backup.log 2>&1

# Weekly (Sunday) at 03:00 UTC
0 3 * * 0 www-data bash /var/www/tetri-copilot/deploy/scripts/backup-db.sh weekly >> /var/log/tetri-backup.log 2>&1

# Monthly (1st) at 04:00 UTC
0 4 1 * * www-data bash /var/www/tetri-copilot/deploy/scripts/backup-db.sh monthly >> /var/log/tetri-backup.log 2>&1
EOF
chmod 644 "$CRON_FILE"
log "  Backup cron jobs installed at $CRON_FILE"

log ""
log "==> VPS setup and hardening complete."
log "    Review all manual steps above before going live."
