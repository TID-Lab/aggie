const { createProxyMiddleware } = require('http-proxy-middleware');

if (process.env.ENVIRONMENT === "development") {
  module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
          target: 'http://127.0.0.1:3000/',
          changeOrigin: true,
          secure: false,
        })
    );
    app.post(
        '/login',
        createProxyMiddleware({
          target:  'http://127.0.0.1:3000/',
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
    );
  };
}
