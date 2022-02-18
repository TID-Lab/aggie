var utils = require('./init');
var expect = require('chai').expect;
var Group = require('../../models/group');
var Report = require('../../models/report');
var async = require('async');
var ReportQuery = require('../../models/query/report-query');

var id1;
var id2;

function createGroups(done) {
  Group.create([
    { title: 'Not so important group', veracity: null, closed: true },
    { title: 'Very important group', veracity: null, closed: true }
  ], function(err, groups) {
    id1 = groups[0]._id.toString();
    id2 = groups[1]._id.toString();
    done();
  });
}

function createReports(done) {
  Report.create([
    { _group: id1 },
    { _group: id1 },
    { _group: id2 },
    { _group: id2 },
    { _group: '' },
    {} // group: null
  ], done);
}

var queryNone;
var queryAny;

function createQueries(done) {
  queryNone = new ReportQuery({ groupId: 'none' });
  queryAny = new ReportQuery({ groupId: 'any' });
  done();
}

describe('Querying for reports', function() {
  before(function(done) {
    async.series([createGroups, createReports, createQueries], done);
  });

  it('should retrieve 2 documents not linked to groups', function(done) {
    queryNone.run(function(err, reports) {
      if (err) return done(err);
      expect(reports.total).to.equal(2);
      done();
    });
  });

  it('should retrieve 4 documents linked to any group', function(done) {
    queryAny.run(function(err, reports) {
      if (err) return done(err);
      expect(reports.total).to.equal(4);
      done();
    });
  });

  after(utils.wipeModels([Report, Group]));
  after(utils.expectModelsEmpty);
});
