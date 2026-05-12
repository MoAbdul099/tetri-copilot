module.exports = {
  apps: [
    {
      name: 'tetri-copilot-api',
      script: './src/server.js',
      cwd: '/var/www/tetri-copilot/backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: '/var/log/pm2/tetri-copilot-error.log',
      out_file: '/var/log/pm2/tetri-copilot-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
