'use strict';

process.env.NODE_ENV = 'test';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var dbTools = require('../database-tools');
var Report = require('../../models/report');
var User = require('../../models/user');
var Source = require('../../models/source');
var Trend = require('../../models/trend');
var Incident = require('../../models/incident');
var expect = require('chai').expect;
var async = require('async');
var _ = require('lodash');

module.exports = _.clone(dbTools);

before(function(done) {
  dbTools.initDb(function(err) {
    if (err) return done(err);
    dbTools.resetDb(done);
  });
});
after(dbTools.disconnectDropDb);

function expectModelsEmpty(done) {
  User.find({}, function(err, results) {
    if (err) return done(err);
    expect(results).to.have.length(1);
    async.each([Report, Source, Trend, Incident], expectEmpty, done);
  });
}
module.exports.expectModelsEmpty = expectModelsEmpty;

function expectEmpty(model, done) {
  model.find({}, function(err, results) {
    if (err) return done(err);
    expect(results).to.be.empty;
    done();
  });
}

function removeUsersExceptAdmin(done) {
  var query = {
    username: { $ne: 'admin' }
  };
  User.remove(query, done);
}
module.exports.removeUsersExceptAdmin = removeUsersExceptAdmin;

// Compare object attributes
function compare(a, b) {
  for (var attr in a) {
    if (b[attr]) {
      expect(a[attr]).to.equal(b[attr]);
    }
  }
}
module.exports.compare = compare;

// Expect listener to not emit reports
function expectToNotEmitReport(listener, done) {
  listener.once('report', function() {
    done(new Error('Should not emit reports'));
  });
}
module.exports.expectToNotEmitReport = expectToNotEmitReport;

// Expect listener to emit specific errors
function expectToEmitError(listener, message, done) {
  listener.once('error', function(err) {
    expect(err).to.be.an.instanceof(Error);
    expect(err.message).to.contain(message);
    done();
  });
}
module.exports.expectToEmitError = expectToEmitError;

// Expect listener to emit warnings
function expectToEmitWarning(listener, done) {
  listener.once('warning', function(err) {
    expect(err).to.be.an.instanceof(Error);
    done();
  });
}
module.exports.expectToEmitWarning = expectToEmitWarning;
