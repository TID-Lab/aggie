// Determines user's preferred language from request headers

var locale = require('locale');
var supported = ['en', 'es']; // TODO generate this dynamically

module.exports = function(app) {
  app.use(locale(supported)); // Sets req.locale to the best available language

  app.use(function(req, res, next) {
    res.cookie('lang', req.locale);
    next();
  });
};
