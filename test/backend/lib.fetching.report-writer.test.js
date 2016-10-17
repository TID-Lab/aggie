'use strict';

var utils = require('./init');
var expect = require('chai').expect;
var _ = require('underscore');
var reportWriter = require('../../lib/fetching/report-writer');
var reportQueue = require('../../lib/fetching/report-queue');
var botFactory = require('../../lib/fetching/bot-factory');
var botMaster = require('../../lib/fetching/bot-master');
var Report = require('../../models/report');
var Source = require('../../models/source');

describe('Report writer', function() {
  var bot;

  describe('base functions', function() {
    beforeEach(function(done) {
      botMaster.kill();
      botMaster.addListeners('source', Source.schema);
      reportQueue.clear();
      bot = botFactory.create(new Source({ nickname: 'lorem', media: 'dummy' }));
      done();
    });

    it('should fetch reports from available bots', function(done) {
      bot.once('report', function() {
        reportQueue.enqueue(bot);
        var reportData = reportWriter.fetch();
        expect(reportData).to.have.property('content');
        expect(reportData.content).to.contain('Lorem ipsum');
        done();
      });
      bot.start();
    });

    it('should write reports to database', function(done) {
      bot.once('report', function() {
        reportQueue.enqueue(bot);
        var reportData = reportWriter.fetch();
        reportWriter.write(reportData, function(err, report) {
          if (err) return done(err);
          expect(report).to.have.property('_id');
          Report.findById(report._id, function(err, found) {
            if (err) return done(err);
            expect(found).to.be.an.instanceof(Report);
            expect(found).to.have.property('_id');
            expect(found._id.toString()).to.equal(report._id.toString());
            done();
          });
        });
      });
      bot.start();
    });
  });

  describe('master processing function', function() {
    before(function(done) {
      botMaster.kill();
      // Remove listener to prevent automatic processing
      reportQueue.removeAllListeners('empty');
      reportQueue.removeAllListeners('notEmpty');
      reportQueue.clear();

      // Create sources for the most common words in English
      Source.create({ nickname: 'a', media: 'dummy', keywords: 'a' });
      Source.create({ nickname: 'b', media: 'dummy', keywords: 'b' });
      Source.create({ nickname: 'c', media: 'dummy', keywords: 'c' });

      // Queue starting bots after sources are loaded
      process.nextTick(function() {
        botMaster.start();
        done();
      });
    });

    // Stream data for 100ms
    before(function(done) {
      setTimeout(function() {
        botMaster.stop();
        done();
      }, 100);
    });

    // Count queued and database data
    var queueCount = 0;
    var reportCount = 0;
    before(function(done) {
      // Verify that at there are queued reports
      queueCount = _.reduce(botMaster.bots, function(count, bot) {
        return count + bot.queue.count;
      }, 0);

      // Verify number of reports in database
      Report.find(function(err, reports) {
        if (err) return done(err);
        reportCount = reports.length;
        done();
      });
    });

    it('should process all queued reports from all bots', function(done) {
      expect(queueCount).to.be.greaterThan(0);
      // Listen to queue to determine when it's empty
      reportQueue.on('empty', function() {
        expect(reportQueue.isEmpty()).to.be.true;
        // Verify that bots are all empty
        var haveData = _.any(botMaster.bots, function(bot) {
          return !bot.isEmpty();
        });
        expect(haveData).to.be.false;

        // Let all reports be processed
        process.nextTick(function() {
          // Verify that reports were inserted into database
          Report.find(function(err, reports) {
            if (err) return done(err);
            expect(reports.length).to.equal(queueCount + reportCount);
            done();
          });
        });
      });
      // Start processing of all queued data
      reportWriter.process();
    });
  });

  after(utils.wipeModels([Source, Report]));
  after(utils.expectModelsEmpty);
});
