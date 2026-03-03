module.exports = {
  apps: [
    {
      name: 'gerenciador-rifa',
      script: 'node_modules/.bin/next',
      args: 'start -p 3003',
      cwd: '/var/www/gerenciador-rifa',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
    },
  ],
};
