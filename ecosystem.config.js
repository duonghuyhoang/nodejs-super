/* eslint-disable no-undef */
module.exports = {
  apps: [
    {
      name: 'twitter-clone',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
}
