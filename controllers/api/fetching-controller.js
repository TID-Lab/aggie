var api = require('../api').app;
var botMaster = require('../fetching/bot-master');

api.get('/api/fetching', function(req, res) {
  res.send(200, {enabled: botMaster.enabled});
});

// Enable/disable global fetching
api.put('/api/fetching/:op', function(req, res) {
  switch(req.params.op) {
    case 'on':
      botMaster.start();
      return res.send(200);
    case 'off':
      botMaster.stop();
      return res.send(200);
    default:
      return res.send(404);
  }
});

module.exports = api;
