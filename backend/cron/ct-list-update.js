var CronJob = require('cron').CronJob;
var emitter = require('events').EventEmitter;
var e = new emitter();
var update = require('../scripts/ct-list-update-utils');

var job = new CronJob('0 0 0 * * *', () => update(e), null, true, 'Etc/UTC');
job.start();

module.exports.emitter = e;
