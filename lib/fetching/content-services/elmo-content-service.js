var ContentService = require('../content-service');
var util = require('util');
var config = require('../../../config/secrets').elmo;
var request = require('request');
var _ = require('underscore');

var ELMOContentService = function(options) {
  this.url = options.url;
  this.authToken = options.authToken || config.authToken;
  this.lastReportDate = options.lastReportDate || null;
  this.sourceType = 'elmo';
  this.botType = 'pull';
  ContentService.call(this, options);
};

util.inherits(ELMOContentService, ContentService);

// Fetch from the ELMO content service
ELMOContentService.prototype.fetch = function(callback) {
  callback = callback || function() {};
  var self = this;

  if (!this.url) {
    process.nextTick(function() {
      self._handleErrors(new Error('Missing ELMO URL'));
    });
    return;
  }

  if (!this.authToken) {
    process.nextTick(function() {
      self._handleErrors(new Error('Missing ELMO auth token'));
    });
    return;
  }

  request({url: this.url, headers: {Authorization: 'Token token=' + this.authToken}}, function(err, res, body) {
    if (err) {
      self._handleErrors(new Error('HTTP error: ' + err.message));
      return callback();
    } else if (res.statusCode != 200) {
      self._handleErrors(new Error.HTTP(res.statusCode));
      return callback();
    }
    try {
      body = JSON.parse(body);
    } catch (e) {
      self._handleErrors(new Error('Parse error: ' + e.message));
      return callback();
    }
    if (!(body instanceof Array)) {
      self._handleErrors(new Error('Wrong data'));
      return callback();
    } else if (body.length) {
      self._handleResults(body);
      callback(null, self.lastReportDate);
    }
  });
};

// Handle errors
ELMOContentService.prototype._handleErrors = function(err) {
  this.emit('error', err);
};

// Handle responses returned by ELMO
ELMOContentService.prototype._handleResults = function(data) {
  var self = this;
  var lastReportDate = 0;
  _.sortBy(data, 'created_at').forEach(function(response) {
    // Only process new reports
    if (self._isNew(response)) {
      lastReportDate = Math.max(lastReportDate, Date.parse(response.created_at));
      var report_data = self._parse(response);
      self.emit('report', report_data);
    }
  });
  this.lastReportDate = lastReportDate;
};

// Determine whether to skip or include a response based on its creation date
ELMOContentService.prototype._isNew = function(response) {
  return !this.lastReportDate || Date.parse(response.created_at) > this.lastReportDate;
};

// Parse each response into our data format
ELMOContentService.prototype._parse = function(response) {
  var content = _.map(response.answers, function(answer) {
    return '[Code' + answer.code + ': ' + answer.answer + ']';
  }).join(' ');

  return {
    authoredAt: response.created_at,
    fetchedAt: new Date(),
    content: content,
    author: response.submitter
  };
};

module.exports = ELMOContentService;
