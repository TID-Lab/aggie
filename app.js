var app = require('./controllers/api').app;
var express = require('express');

// Load main modules
require('./controllers/fetching');

// Load all API controllers
require('./controllers/api/fetching-controller');
require('./controllers/api/incident-controller');
require('./controllers/api/report-controller');
require('./controllers/api/source-controller');
require('./controllers/api/trend-controller');
require('./controllers/api/user-controller');

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function() {
  console.log("✔ Express server listening on port %d", app.get('port'));
});

// The API explorer is a client-side thing so it's loaded as static.
app.use("/explorer", express.static(__dirname + '/public/explorer'));

module.exports = app;
