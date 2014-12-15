// Fetches data from an instance of ELMO, a field data gathering system.

var ContentService = require('../content-service');
var util = require('util');
var config = require('../../../config/secrets').elmo;
var request = require('request');
var _ = require('underscore');
var logger = require('../../logger');

var ELMOContentService = function(options) {
  this.url = options.url;
  this.authToken = options.authToken || (config && config.authToken);
  this.lastReportDate = options.lastReportDate || null;
  this.sourceType = 'elmo';
  this.botType = 'pull';
  ContentService.call(this, options);
};

util.inherits(ELMOContentService, ContentService);

// Fetch from the ELMO content service
ELMOContentService.prototype.fetch = function(callback, url) {
  callback = callback || function() {};
  url = url || this.url;
  var self = this;

  if (!url) {
    process.nextTick(function() {
      self._handleErrors(new Error('Missing ELMO URL'));
    });
    return callback();
  }

  if (!this.authToken) {
    process.nextTick(function() {
      self._handleErrors(new Error('Missing API token'));
    });
    return callback();
  }

  this._fetchPage(url, function(res, data) {
    // Store data
    self._data = _.union(self._data || [], data || []);
    // Fetch next page if necessary
    var nextPage = self._getNextPage(res);
    if (data && nextPage) {
      self.fetch(callback, nextPage);
    } else {
      if (self._data) {
        self._handleResults(self._data);
        delete self._data;
      }
      callback(null, self.lastReportDate);
    }
  });

  logger('ELMOContentService#fetch');
  logger.debug(this);
};

// Fetch a page of data from ELMO content service
ELMOContentService.prototype._fetchPage = function(url, callback) {
  var self = this;
  this._httpRequest({url: url, headers: {Authorization: 'Token token=' + this.authToken}}, function(err, res, body) {
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
  _.sortBy(data, 'created_at').forEach(function(response) {
    // Only process new reports
    if (self._isNew(response)) {
      var report_data = self._parse(response);
      self.emit('report', report_data);
    }
  });
  // Store date of last report
  this.lastReportDate = Math.max.apply(Math, _.pluck(data, 'created_at').map(Date.parse));
};

// Determine whether to skip or include a response based on its creation date
ELMOContentService.prototype._isNew = function(response) {
  return !this.lastReportDate || Date.parse(response.created_at) > this.lastReportDate;
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
