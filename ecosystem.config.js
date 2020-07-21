module.exports = {
  apps: [
    {
      name: 'aggie',
      script: 'app.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
  deploy: {
    // Example config.
    production: {
      user: 'foo',
      host: ['aggie.example.com'],
      ref: 'origin/production',
      repo: 'git@github.com:TID-Lab/aggie.git',
      path: '/home/ubuntu/aggie',
      'post-deploy': 'ln -s {../shared/,./}config/secrets.json; npm install; npm run serve',
    },
  },
};
