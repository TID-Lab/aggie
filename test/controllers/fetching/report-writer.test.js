var expect = require('chai').expect;
var Report = require(root_path + '/models/report');
var Source = require(root_path + '/models/source');
var reportWriter = require(root_path + '/controllers/fetching/report-writer');
var botMaster = require(root_path + '/controllers/fetching/bot-master');

describe('Report writer', function() {
  before(function(done) {
    Source.create({type: 'dummy', keywords: 'a'});
    Source.create({type: 'dummy', keywords: 'b'});
    Source.create({type: 'dummy', keywords: 'c'});
    botMaster.start();
    done();
  });

  it('should listen to notifications from bots', function(done) {
    setTimeout(function() {
      botMaster.stop();
      Report.find(function(err, reports) {
        if (err) return done(err);
        done();
      });
    }, 1000);
  });

});
