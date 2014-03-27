var expect = require('chai').expect;
var _ = require('underscore');
var reportWriter = require(root_path + '/controllers/fetching/report-writer');
var botFactory = require(root_path + '/controllers/fetching/bot-factory');
var botMaster = require(root_path + '/controllers/fetching/bot-master');
var Report = require(root_path + '/models/report');
var Source = require(root_path + '/models/source');

describe('Report writer', function() {

  describe('base functions', function() {
    beforeEach(function(done) {
      bot = botFactory.create({sourceType: 'dummy', keywords: 'Lorem ipsum'});
      bot.start();
      done();
    });

    it('should fetch reports from available bots', function(done) {
      bot.once('reports', function() {
        var report_data = reportWriter.fetch(this);
        expect(report_data).to.have.property('content');
        expect(report_data.content).to.contain('Lorem ipsum');
        done();
      });
    });

    it('should write reports to database', function(done) {
      bot.once('reports', function() {
        var report_data = reportWriter.fetch(this);
        reportWriter.write(report_data, function(err, report) {
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
    });
  });

  describe('bot processing function', function() {
    before(function(done) {
      bot = botFactory.create({sourceType: 'twitter', keywords: 'http'});
      bot.start();
      // Stream data for ~1.5 seconds, then stop
      setTimeout(function() {
        bot.stop();
        done();
      }, 1500);
    });

    it('should process all queued reports from a single bot', function(done) {
      expect(bot.isEmpty()).to.be.false;
      reportWriter.processBot(bot, function(err) {
        if (err) return done(err);
        expect(bot.isEmpty()).to.be.true;
        Report.find(function(err, reports) {
          if (err) return done(err);
          expect(reports).to.be.an.instanceof(Array);
          expect(reports).to.not.be.empty;
          reports = _.filter(reports, function(report) {
            return report.content && report.content.indexOf('http') > -1;
          });
          expect(reports).to.not.be.empty;
          done();
        });
      });
    });
  });

  describe('master processing function', function() {
    before(function(done) {
      // Create sources for the most common words in English
      Source.create({type: 'twitter', keywords: 'the'});
      Source.create({type: 'twitter', keywords: 'be'});
      Source.create({type: 'twitter', keywords: 'to'});
      process.nextTick(function() {
        botMaster.start();
        done();
      });
    });

    it('should process all queued reports from all bots', function(done) {
      // Stream data for ~1.5
      setTimeout(function() {
        expect(reportWriter.busy).to.be.true;
        process.nextTick(function() {
          expect(reportWriter.busy).to.be.true;
        });
        botMaster.stop();
        done();
      }, 1500);
    });

  });

});
