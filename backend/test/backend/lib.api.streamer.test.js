var utils = require('./init');
var expect = require('chai').expect;
var streamer = require('../../lib/api/streamer');
var ReportQuery = require('../../models/query/report-query');
var Report = require('../../models/report');

describe('Streamer', function() {
  before(function(done) {
    streamer.queries = [];
    Report.create({ content: '1 one' });
    Report.create({ content: '2 two' });
    Report.create({ content: 'One one' });
    Report.create({ content: 'Two two' });
    setTimeout(done, 500);
  });

  it('should track Query objects', function(done) {
    var queryOne = new ReportQuery({ keywords: 'one' });
    var queryTwo = new ReportQuery({ keywords: 'two' });
    streamer.addQuery(queryOne);
    streamer.addQuery(queryTwo);
    expect(streamer.queries).to.be.an.instanceof(Array);
    expect(streamer.queries).to.not.be.empty;
    done();
  });

  it('should run queries and emit results', function(done) {
    var remaining = streamer.queries.length;
    streamer.on('reports', function(query, reports) {
      expect(reports).to.be.an.instanceof(Array);
      expect(reports).to.not.be.empty;
      expect(reports[0]).to.be.an.instanceof(Report);
      expect(reports[0].content).to.match(/(one|two)/);
      if (--remaining === 0) {
        streamer.removeAllListeners('reports');
        done();
      }
    });
    streamer.query();
  });

  it('should listen to new reports and re-start query', function(done) {
    streamer.queries = [];
    var queryThree = new ReportQuery({ keywords: 'three' });
    streamer.addQuery(queryThree);
    streamer.addListeners('report', Report.schema);
    process.nextTick(function() {
      Report.create({ content: '3 three' });
      Report.create({ content: 'Three three' });
    });
    streamer.once('reports', function(query, reports) {
      expect(reports).to.be.an.instanceof(Array);
      expect(reports).to.not.be.empty;
      expect(reports[0]).to.be.an.instanceof(Report);
      expect(reports[0].content).to.contain('three');
      done();
    });
  });

  after(utils.wipeModels([Report]));
  after(utils.expectModelsEmpty);
});
