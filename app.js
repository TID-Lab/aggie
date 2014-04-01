var express = require('express');
var app = express();

var processManager = require('./controllers/process-manager');
processManager.fork('/controllers/api');
processManager.fork('/controllers/fetching');
processManager.fork('/controllers/streaming');

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function() {
  console.log("✔ Express server listening on port %d", app.get('port'));
});

// The API explorer is a client-side thing so it's loaded as static.
app.use("/explorer", express.static(__dirname + '/public/explorer'));

module.exports = app;
