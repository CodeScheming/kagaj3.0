// PM2 Ecosystem Configuration for Kagaj Ko Katha
// Usage: pm2 start deploy/ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'kagaj-frontend',
      cwd: '/root/kagaj3.0/frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3100',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'https://blogs.kagajkokatha.com/api',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
    {
      name: 'kagaj-backend',
      cwd: '/root/kagaj3.0/backend',
      interpreter: '/root/kagaj3.0/backend/venv/bin/python',
      script: '-m',
      args: 'uvicorn main:app --host 127.0.0.1 --port 8100',
      env: {
        SECRET_KEY: 'kagaj3_prod_secret_change_this_later',
        DATABASE_URL: 'sqlite:///./sql_app.db',
        FRONTEND_URL: 'https://blogs.kagajkokatha.com',
        BACKEND_URL: 'https://blogs.kagajkokatha.com/api',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
    },
  ],
};
