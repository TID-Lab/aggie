var CronJob = require('cron').CronJob;
var path = require('path')
var emitter = require('events').EventEmitter;
var e = new emitter();

var CTListUpdateService = require(path.resolve(__dirname, '../api/CT-list-update-service.js'));
var job = new CronJob('0 0 0 * * *', function() { // Job is ran every UTC 00:00:00
  var service = new CTListUpdateService();
  service._updateCTList()
    .then(function(data) {
      e.emit("ctListUpdated");
    })
    .catch(function(err) {
      console.log(err)
    })
}, null, true, 'Etc/UTC');
job.start();

module.exports.emitter = e;