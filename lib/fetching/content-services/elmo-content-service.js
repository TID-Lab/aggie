// Fetches data from an instance of ELMO, a field data gathering system.

var ContentService = require('../content-service');
var util = require('util');
var config = require('../../../config/secrets').elmo;
var request = require('request');
var dateFormat = require('dateformat');
var _ = require('underscore');

// options.url - The URL of the ELMO api endpoint.
// options.lastReportDate - The fetchedAt time of the last already fetched report (optional).
var ELMOContentService = function(options) {
  this._authToken = options.authToken || (config && config.authToken);
  this._url = options.url;
  this.fetchType = 'pull';
  ContentService.call(this, options);
};

util.inherits(ELMOContentService, ContentService);

// Fetch from ELMO
// options.maxCount - Max number of reports that will be accepted. (required)
// callback(reportData) - Callback via which to return fetched report data.
ELMOContentService.prototype._doFetch = function(options, callback) {
  var self = this;

  // Handle errors
  if (!this._url) {
    process.nextTick(function() { self.emit('error', new Error('Missing ELMO URL')); });
    return callback([]);
  }
  if (!this._authToken) {
    process.nextTick(function() { self.emit('error', new Error('Missing API token')); });
    return callback([]);
  }

  // Do the request. We just fetch one page at this time. If there is more data, we will fetch it next time.
  // Assumes the responses will be returned in chronological order, oldest to newest.
  this._httpRequest({url: this._urlWithDate(), headers: {Authorization: 'Token token=' + this._authToken}}, function(err, res, body) {

    // Handle any errors
    if (err) {
      self.emit('error', new Error('HTTP error: ' + err.message));
      return callback([]);
    } else if (res.statusCode != 200) {
      self.emit('error', new Error.HTTP(res.statusCode));
      return callback([]);
    }

    // Parse JSON.
    var responses;
    try {
      responses = JSON.parse(body);
      if (!(responses instanceof Array)) {
        self.emit('error', new Error('Wrong data'));
        return callback([]);
      }
    } catch (e) {
      self.emit('error', new Error('Parse error: ' + e.message));
      return callback([]);
    }

    // Parse response data and return them.
    var reportData = responses.map(function(response) { return self._parse(response); });
    callback(reportData);
  });
};

// Parse each response into our common data format
ELMOContentService.prototype._parse = function(response) {
  var content = _.map(response.answers, function(answer) {
    return '[' + answer.code + ': ' + answer.answer + ']';
  }).join(' ');

  return {
    authoredAt: new Date(response.created_at),
    fetchedAt: new Date(),
    content: content,
    author: response.submitter
  };
};

// Move this into a private method so it can be stubbed in testing.
ELMOContentService.prototype._httpRequest = function(params, callback) {
  request(params, callback);
}

// Gets the ELMO URL with the date constraint applied.
ELMOContentService.prototype._urlWithDate = function() {
  return this._url + (this._lastReportDate ? '?created_after=' + dateFormat(this._lastReportDate, 'yyyymmddhhmmss') : '');
}

module.exports = ELMOContentService;
