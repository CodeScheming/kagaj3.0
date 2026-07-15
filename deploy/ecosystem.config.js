// PM2 Ecosystem Configuration for Kagaj Ko Katha
// Usage: pm2 start deploy/ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'kagaj-frontend',
      cwd: './frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'https://kagajkokatha.com/api/v2',
      },
      // For standalone builds, use this instead:
      // script: '.next/standalone/server.js',
      // env: {
      //   PORT: 3000,
      //   NODE_ENV: 'production',
      //   NEXT_PUBLIC_API_URL: 'https://kagajkokatha.com/api/v2',
      // },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
    {
      name: 'kagaj-backend',
      cwd: './backend',
      interpreter: './venv/bin/python',
      script: '-m',
      args: 'uvicorn main:app --host 0.0.0.0 --port 8000',
      env: {
        SECRET_KEY: 'change_me_to_a_random_secret_key',
        DATABASE_URL: 'sqlite:///./sql_app.db',
        FRONTEND_URL: 'https://kagajkokatha.com',
        BACKEND_URL: 'https://kagajkokatha.com/api/v2',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
    },
  ],
};
