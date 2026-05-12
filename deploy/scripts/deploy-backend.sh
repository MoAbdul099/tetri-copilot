#!/bin/bash
# Tetri Copilot — Backend Deployment Script
# Run from the VPS: bash deploy/scripts/deploy-backend.sh

set -e

APP_DIR="/var/www/tetri-copilot/backend"
PM2_APP_NAME="tetri-copilot-api"

echo "==> Pulling latest code..."
cd /var/www/tetri-copilot
git pull origin main

echo "==> Installing backend dependencies..."
cd "$APP_DIR"
npm ci --omit=dev

echo "==> Running Prisma migrations..."
npx prisma migrate deploy

echo "==> Generating Prisma client..."
npx prisma generate

echo "==> Restarting application..."
pm2 restart "$PM2_APP_NAME" --update-env

echo "==> Saving PM2 process list..."
pm2 save

echo "==> Deployment complete."
pm2 status "$PM2_APP_NAME"
