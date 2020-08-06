var CronJob = require('cron').CronJob;
var path = require('path')
var CTListUpdateService = require(path.resolve(__dirname, '../api/CT-list-update-service.js'));
var job = new CronJob('0 0 0 * * *', function() { // Job is ran every UTC 00:00:00
  var service = new CTListUpdateService({directory: '../../config/crowdtangle_list.json'});
  service._updateCTList();
}, null, true, 'Etc/UTC');

job.start();