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
      bot = botFactory.create({sourceType: 'dummy', keywords: 'e'});
      bot.start();
      setTimeout(function() {
        done();
      }, 100);
    });

    it('should process all queued reports from a single bot', function(done) {
      expect(bot.isEmpty()).to.be.false;
      reportWriter.processBot(bot, function(err) {
        if (err) return done(err);
        expect(bot.isEmpty()).to.be.true;
        process.nextTick(function() {
          Report.find(function(err, reports) {
            if (err) return done(err);
            expect(reports).to.be.an.instanceof(Array);
            expect(reports).to.not.be.empty;
            reports = _.filter(reports, function(report) {
              return report.content && report.content.indexOf('e') > -1;
            });
            expect(reports).to.not.be.empty;
            done();
          });
        });
      });
    });

    after(function(done) {
      bot.stop();
      done();
    });
  });

  describe('master processing function', function() {
    before(function(done) {
      botMaster.kill();

      // Mark report writer as busy so that we can manually control processing
      reportWriter.busy = true;

      // Create sources for the most common words in English
      Source.create({type: 'dummy', keywords: 'a'});
      Source.create({type: 'dummy', keywords: 'b'});
      Source.create({type: 'dummy', keywords: 'c'});

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
    before(function(done) {
       // Verify that at there are queued reports
      queueCount = _.reduce(botMaster.bots, function(count, bot) {
        return count + bot.queue.count;
      }, 0);

      // Verify number of reports in database
      reportCount = 0;
      Report.find(function(err, reports) {
        reportCount = reports.length;
        done();
      });
    });

    it('should process all queued reports from all bots', function(done) {
     expect(queueCount).to.be.greaterThan(0);
      // Mark report writer as no longer busy
      reportWriter.busy = false;
      // Process all queued data
      reportWriter.process(function() {
        // Verify that bots are all empty
        var haveData = _.any(botMaster.bots, function(bot) {
          return !bot.isEmpty();
        });
        expect(haveData).to.be.false;

        // Verify that reports were inserted into database
        Report.find(function(err, reports) {
          expect(reports.length).to.equal(queueCount + reportCount);
          done();
        });
      });
    });
  });

});
