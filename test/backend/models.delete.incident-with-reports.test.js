var utils = require('./init');
var expect = require('chai').expect;
var Incident = require('../../models/incident');
var Report = require('../../models/report');
var async = require('async');

var id1;
var id2;

function createIncidents(done) {
  Incident.create([
    { title: 'Not so important incident', veracity: null, closed: true },
    { title: 'Very important incident', veracity: null, closed: true }
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
    { _incident: id2 }
  ], done);
}

function removeIncident(done) {
  Incident.findOne({ _id: id1 }, function(err, incident) {
    incident.remove(done);
  });
}

describe('Deleting an incident that has associated reports', function() {
  before(function(done) {
    async.series([createIncidents, createReports, removeIncident], done);
  });

  it('should remove the incident', function(done) {
    Incident.find({ _id: id1 }, function(err, incidents) {
      if (err) return done(err);
      expect(incidents.length).to.equal(0);
      done();
    });
  });

  it('should not remove the other incident', function(done) {
    Incident.find({ _id: id2 }, function(err, incidents) {
      if (err) return done(err);
      expect(incidents.length).to.equal(1);
      done();
    });
  });

  it('should not affect other reports', function(done) {
    Report.find({ _incident: id2 }, function(err, reports) {
      if (err) return done(err);
      expect(reports.length).to.equal(3);
      done();
    });
  });

  it('should remove reference to the incidents in the right reports', function(done) {
    Report.find({ _incident: id1 }, function(err, reports) {
      if (err) return done(err);
      expect(reports.length).to.equal(0);
      done();
    });
  });

  after(utils.wipeModels([Report, Incident]));
  after(utils.expectModelsEmpty);
});
