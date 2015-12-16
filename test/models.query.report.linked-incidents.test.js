require('./init');
var expect = require('chai').expect;
var Incident = require('../models/incident');
var Report = require('../models/report');
var _ = require('underscore');
var async = require('async');
var User = require('../models/user');
var ReportQuery = require('../models/query/report-query');
var user;

function loadUser(done) {
  User.findOne({}, function(err, u) {
    user = u;
    done();
  });
}

function removeAll(done) {
  Report.remove({}, function() {
    Incident.remove({}, done);
  });
}

var id1;
var id2;

function createIncidents(done) {
  Incident.create([
    { title: 'Not so important incident', veracity: null, closed: true },
    { title: 'Very important incident', veracity: null, closed: true },
  ], function(err, incident1, incident2) {
    id1 = incident1._id.toString();
    id2 = incident2._id.toString();
    done();
  });
}

function createReports(done) {
  Report.create([
    { _incident: id1 },
    { _incident: id1 },
    { _incident: id2 },
    { _incident: id2 },
    { _incident: '' },
    {}, //incident: null
  ], done);
}

var queryNone;
var queryAny;

function createQueries(done) {
  queryNone = new ReportQuery({incidentId:'none'});
  queryAny = new ReportQuery({incidentId:'any'});
  done();
}

describe('Querying for reports', function() {
  before(function(done) {
    async.series([loadUser, removeAll, createIncidents, createReports, createQueries], done);
  });

  it('should retrieve 2 documents not linked to incidents', function(done) {
    queryNone.run(function(err, reports) {
      expect(reports.total).to.equal(2);
      done();
    });
  });

  it('should retrieve 4 documents linked to any incident', function(done) {
    queryAny.run(function(err, reports) {
      expect(reports.total).to.equal(4);
      done();
    });
  });
});
