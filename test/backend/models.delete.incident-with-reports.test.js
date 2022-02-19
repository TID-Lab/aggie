var utils = require('./init');
var expect = require('chai').expect;
var Group = require('../../backend/models/group');
var Report = require('../../backend/models/report');
var async = require('async');

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
    { _group: id2 }
  ], done);
}

function removeGroup(done) {
  Group.findOne({ _id: id1 }, function(err, group) {
    group.remove(done);
  });
}

describe('Deleting an group that has associated reports', function() {
  before(function(done) {
    async.series([createGroups, createReports, removeGroup], done);
  });

  it('should remove the group', function(done) {
    Group.find({ _id: id1 }, function(err, groups) {
      if (err) return done(err);
      expect(groups.length).to.equal(0);
      done();
    });
  });

  it('should not remove the other group', function(done) {
    Group.find({ _id: id2 }, function(err, groups) {
      if (err) return done(err);
      expect(groups.length).to.equal(1);
      done();
    });
  });

  it('should not affect other reports', function(done) {
    Report.find({ _group: id2 }, function(err, reports) {
      if (err) return done(err);
      expect(reports.length).to.equal(3);
      done();
    });
  });

  it('should remove reference to the groups in the right reports', function(done) {
    Report.find({ _group: id1 }, function(err, reports) {
      if (err) return done(err);
      expect(reports.length).to.equal(0);
      done();
    });
  });

  after(utils.wipeModels([Report, Group]));
  after(utils.expectModelsEmpty);
});
