var utils = require('./init');
var expect = require('chai').expect;
var SMTCTag = require('../../models/tag');
var Report = require('../../models/report');
var async = require('async');

var id1;
var id2;

function createTags(done) {
  SMTCTag.create([
    { name: 'Not so important tag' },
    { name: 'Very important tag' }
  ], function(err, tags) {
    id1 = tags[0]._id.toString();
    id2 = tags[1]._id.toString();
    done();
  });
}

function createReports(done) {
  Report.create([
    { smtcTags: [ id1 ] },
    { smtcTags: [ id1 ] },
    { smtcTags: [ id2 ] },
    { smtcTags: [ id2 ] },
    { smtcTags: [ id2 ] }
  ], done);
}

function removeTag(done) {
  SMTCTag.findOne({ _id: id1 }, function(err, tag) {
    tag.remove(done);
  });
}

describe('Deleting a tag that has associated reports', function() {
  before(function(done) {
    async.series([createTags, createReports, removeTag], done);
  });

  it('should remove the tag', function(done) {
    SMTCTag.find({ _id: id1 }, function(err, tags) {
      if (err) return done(err);
      expect(tags.length).to.equal(0);
      done();
    });
  });

  it('should not remove the other tag', function(done) {
    SMTCTag.find({ _id: id2 }, function(err, tags) {
      if (err) return done(err);
      expect(tags.length).to.equal(1);
      done();
    });
  });

  it('should not affect other reports', function(done) {
    Report.find({ smtcTags: id2 }, function(err, reports) {
      if (err) return done(err);
      expect(reports.length).to.equal(3);
      done();
    });
  });

  it('should remove reference to the tags in the right reports', function(done) {
    Report.find({ smtcTags: id1 }, function(err, reports) {
      if (err) return done(err);
      expect(reports.length).to.equal(0);
      done();
    });
  });

  after(utils.wipeModels([Report, SMTCTag]));
  after(utils.expectModelsEmpty);
});
