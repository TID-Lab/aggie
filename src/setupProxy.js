const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
      '/api',
      createProxyMiddleware({
        target: 'http://127.0.0.1:3000/',
        changeOrigin: true,
        secure: false,
      })
  );
  app.use(
      '/login',
      createProxyMiddleware({
        target: 'http://127.0.0.1:3000/',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'http://127.0.0.1'
      })
  )
  app.use(
      '/logout',
      createProxyMiddleware({
        target: 'http://127.0.0.1:3000/',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'http://127.0.0.1'
      })
  )
  app.use(
      '/session',
      createProxyMiddleware({
        target: 'http://127.0.0.1:3000/',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'http://127.0.0.1'
      })
  )
};