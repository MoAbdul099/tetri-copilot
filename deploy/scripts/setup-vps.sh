#!/bin/bash
# Tetri Copilot — First-Time VPS Setup Guide
# Run as root on a fresh Ubuntu 22.04 VPS
# Review each step before running in production

set -e

# ============================================================
# 1. System Update
# ============================================================
apt update && apt upgrade -y

# ============================================================
# 2. Install Node.js 20 LTS
# ============================================================
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v

# ============================================================
# 3. Install PM2
# ============================================================
npm install -g pm2
pm2 startup systemd -u www-data --hp /home/www-data

# ============================================================
# 4. Install PostgreSQL
# ============================================================
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
# Run these commands as postgres user:
# sudo -u postgres psql
#   CREATE USER tetri_user WITH PASSWORD 'STRONG_PASSWORD_HERE';
#   CREATE DATABASE tetri_copilot_db OWNER tetri_user;
#   GRANT ALL PRIVILEGES ON DATABASE tetri_copilot_db TO tetri_user;
#   \q

# ============================================================
# 5. Install Nginx
# ============================================================
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# ============================================================
# 6. Configure Firewall
# ============================================================
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status

# ============================================================
# 7. Create Application Directory
# ============================================================
mkdir -p /var/www/tetri-copilot
mkdir -p /var/log/pm2

# ============================================================
# 8. Clone Repository
# ============================================================
# cd /var/www
# git clone https://github.com/your-org/tetri-copilot.git
# cd tetri-copilot/backend
# cp .env.example .env
# nano .env   # Fill in production values

# ============================================================
# 9. Install Dependencies & Run Migrations
# ============================================================
# npm ci --omit=dev
# npx prisma migrate deploy
# npx prisma generate

# ============================================================
# 10. Start with PM2
# ============================================================
# cd /var/www/tetri-copilot
# pm2 start deploy/pm2/ecosystem.config.js --env production
# pm2 save

# ============================================================
# 11. Configure Nginx
# ============================================================
# cp deploy/nginx/tetri-copilot.conf /etc/nginx/sites-available/tetri-copilot
# ln -s /etc/nginx/sites-available/tetri-copilot /etc/nginx/sites-enabled/
# nginx -t
# systemctl reload nginx

echo "VPS setup complete. Review comments above for manual steps."
