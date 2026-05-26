module.exports = {
  apps: [
    {
      name: 'tetri-api',
      script: './src/server.js',
      cwd: '/var/www/tetri-copilot/backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      error_file: '/var/log/pm2/tetri-api-error.log',
      out_file: '/var/log/pm2/tetri-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 5001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],

  deploy: {
    production: {
      user: 'www-data',
      host: 'api.tetricopilot.com',
      ref: 'origin/main',
      repo: 'git@github.com:MoAbdul099/tetri-copilot.git',
      path: '/var/www/tetri-copilot',
      'pre-deploy-local': '',
      'post-deploy': [
        'cd backend',
        'npm ci --omit=dev',
        'npx prisma migrate deploy',
        'npx prisma generate',
        'pm2 reload ecosystem.config.js --env production',
        'pm2 save',
      ].join(' && '),
      'pre-setup': '',
      env: {
        NODE_ENV: 'production',
      },
    },
    staging: {
      user: 'www-data',
      host: 'api.tetricopilot.com',
      ref: 'origin/staging',
      repo: 'git@github.com:MoAbdul099/tetri-copilot.git',
      path: '/var/www/tetri-copilot-staging',
      'post-deploy': [
        'cd backend',
        'npm ci --omit=dev',
        'npx prisma migrate deploy',
        'npx prisma generate',
        'pm2 reload ecosystem.config.js --env staging',
        'pm2 save',
      ].join(' && '),
      env: {
        NODE_ENV: 'staging',
      },
    },
  },
};
