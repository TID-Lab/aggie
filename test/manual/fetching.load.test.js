require('../init');
var expect = require('chai').expect;
var Source = require('../../models/source');
var Report = require('../../models/report');
var EventEmitter = require('events').EventEmitter;
var fetching = new EventEmitter();

var totalReports = 1000;
describe('Fetching module', function() {
  before(function(done) {
    // Initialize Bot Master
    botMaster = require('../../lib/fetching/bot-master');
    botMaster.addListeners('source', Source.schema);
    botMaster.addListeners('fetching', fetching);
    // Initialize Report Writer
    reportWriter = require('../../lib/fetching/report-writer');
    done();
  });

  it('should create a source of fast data', function() {
    Source.create({type: 'dummy-fast', keywords: totalReports}, function(err, source) {
      if (err) throw err;
      fetching.emit('start');
    });
  });

  it('should listen to those reports', function(done) {
    this.timeout(15000);
    var remaining = totalReports;
    botMaster.on('bot:report', function(bot) {
      if (--remaining === 0) {
        done();
      }
    });
  });
});
