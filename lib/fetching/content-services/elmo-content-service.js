// Fetches data from an instance of ELMO, a field data gathering system.

var ContentService = require('../content-service');
var util = require('util');
var config = require('../../../config/secrets').get().elmo;
var request = require('request');
var _ = require('underscore');

var ELMOContentService = function(options) {
  this._url = options.url;
  this._authToken = options.authToken || (config && config.authToken);
  this._lastReportDate = options.lastReportDate || null;
  this._sourceType = 'elmo';
  this.botType = 'pull';
  ContentService.call(this, options);
};

util.inherits(ELMOContentService, ContentService);

// Fetch from the ELMO content service
ELMOContentService.prototype._doFetch = function(options, callback) {
  var url = options.url || this._url;
  
  var self = this;

  if (!url) {
    process.nextTick(function() {
      self._handleErrors(new Error('Missing ELMO URL'));
    });
    return callback();
  }

  if (!this._authToken) {
    process.nextTick(function() {
      self._handleErrors(new Error('Missing API token'));
    });
    return callback();
  }
  
  options.url = url;
  this._loadData(options, callback);
};

// Load data from online
ELMOContentService.prototype._loadData = function(options, callback) {
  var self = this;
  this._fetchPage(options.url, function(res, data) {
    // Store data
    self._data = _.union(self._data || [], data || []);
    // Fetch next page if necessary
    var nextPage = self._getNextPage(res);
    if (data && nextPage) {
      options.url = nextPage;
      self.fetch(options, callback, nextPage);
    } else {
      if (self._data) {
        self._handleResults(self._data);
        delete self._data;
      }
      callback(null, self._lastReportDate);
    }
  });
};

// Fetch a page of data from ELMO content service
ELMOContentService.prototype._fetchPage = function(url, callback) {
  var self = this;
  this._httpRequest({url: url, headers: {Authorization: 'Token token=' + this._authToken}}, function(err, res, body) {
    // Handle any errors
    if (err) {
      self._handleErrors(new Error('HTTP error: ' + err.message));
      return callback();
    } else if (res.statusCode != 200) {
      self._handleErrors(new Error.HTTP(res.statusCode));
      return callback();
    }

    try {
      // Parse responses
      body = JSON.parse(body);
    } catch (e) {
      self._handleErrors(new Error('Parse error: ' + e.message));
      return callback();
    }

    // Handle responses from ELMO
    if (!(body instanceof Array)) {
      self._handleErrors(new Error('Wrong data'));
      return callback();
    }

    callback(res, body);
  });
};

ELMOContentService.prototype._getNextPage = function(res) {
  // Determine if there is more data to fetch
  if (res && res.headers && res.headers.link) {
    var nextPage;
    res.headers.link.split(', ').forEach(function(rel) {
      nextPage = /<(http.+?)>; rel="next"/i.exec(rel);
    });
    if (nextPage) return nextPage[1];
  }
};

// Handle errors
ELMOContentService.prototype._handleErrors = function(err) {
  this.emit('error', err);
};

// Handle responses returned by ELMO
ELMOContentService.prototype._handleResults = function(data) {
  var self = this;
  // Process reports in order of date
  _.sortBy(data, 'created_at').every(function(response) {
    // Only process new reports
    if (self._isNew(response)) {
      var report_data = self._parse(response);
      if (!self._addReport(report_data)) return false;
    }
    return true;
  });
  
  // Store date of last report
  this._lastReportDate = Math.max.apply(Math, _.pluck(data, 'created_at').map(Date.parse));
  
  self._fetchingFinished();
};

// Determine whether to skip or include a response based on its creation date
ELMOContentService.prototype._isNew = function(response) {
  return !this._lastReportDate || Date.parse(response.created_at) > this._lastReportDate;
};

// Parse each response into our data format
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
  return request(params, callback);
}

module.exports = ELMOContentService;
