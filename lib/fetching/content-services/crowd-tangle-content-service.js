var request = require('request');
var url = require('url');
var fs = require('fs');
var path = require('path');

var ContentService = require('../content-service');
var util = require('util');
var config = require('../../../config/secrets');
var crowdtangle_lists = require('../../../config/crowdtangle_list');

var request = require('request');
var _ = require('underscore');

//options.lastReportDate is passed here through the content-service-factory and will be utilised in calling the api, but its actually only maintained by the parent content service, it is only utilised by the child
var CrowdTangleContentService = function(options) {
	this._baseUrl = config.get().crowdtangle.baseUrl;
	this._nextPageUrl = undefined;
	this._pathName = config.get().crowdtangle.pathName;
	this._count = config.get().crowdtangle.count;
	this._language = config.get().crowdtangle.language;
	this._sortParameter = config.get().crowdtangle.sortParam;
	this._apiToken = config.get().crowdtangle.apiToken;
	this._keywords = options.keywords;
	this._lastReportDate = options._lastReportDate;
	this._listIds = parseInt(options.tags);
	this.fetchType = 'pull';
	this.interval = 1000;
	ContentService.call(this, options); //associates the child service with its parent, which has the notion of lastreportdate
}

util.inherits(CrowdTangleContentService, ContentService);

//this method overwrites the _doFetch method in the content-service (which is the parent class)
//and then inside the content-service, we have a fetch method that is called by the pull-bot and is responsible for emitting (writing) the reports and updating the final value of lastReportDate
//options.maxCount (present but not used, used by the parent content service)
//what about types? -- discuss with Michael
CrowdTangleContentService.prototype._doFetch = function(options, callback) {
	var self = this;
 	//handle errors using process.nextTick
 	// this will depend mostly on the options that we expect to receive, and if there is issue with that

	// if (!this._url) {
	// 	process.nextTick(function() { self.emit('error', new Error('Missing URL')); });
	// 	return callback([]);
	// }

	  //now we need to submit the request
		this._httpRequest( {url: this._completeUrl(options)}, function(err, res, body) {
			if (err) {
				self.emit('error', new Error('HTTP error: ' + err.message));
				return callback([]);
			} else if (res.statusCode != 200) {
				self.emit('error', new Error.HTTP(res.statusCode));
				return callback([]);
			}

			//if no errors, parse the body..
			var responses;
			try {
				responses = JSON.parse(body).result.posts;
				this._nextPageUrl = JSON.parse(body).result.pagination.nextPage;
				if (!(responses instanceof Array)) {
					self.emit('error', new Error('Wrong data'));
					return callback([]);
				}
				// any other error handling wrt the structure of responses
			} catch (e) {
				self.emit('error', new Error('Parse error: ' + e.message));
				return callback([]);
			}
			// the responses will be sorted by the content-service (parent method)
			// Parse response data and return them.
			var reportData = responses.map(function(x) { return self._parse(x); });
			callback({"nextPageUrl": this._nextPageUrl, "reportData": reportData});
		})
};

CrowdTangleContentService.prototype._httpRequest = function(params, callback) {
	request(params, callback);
};

CrowdTangleContentService.prototype._completeUrl = function() {
	// add one second to last report date to start fetching from
	// if it is the first time fetching data, initialize start date to an old date
	var initialStartDate = new Date();
	initialStartDate.setHours(initialStartDate.getHours() - 3);
	var startDate = this._lastReportDate ? new Date(this._lastReportDate.getTime() + 1000): initialStartDate;
	if(this._nextPageUrl !== undefined && this._nextPageUrl !== null) {
		// this._nextPageUrl contains all information about language, searchTerm, sortBy etc.
		return url.format(this._nextPageUrl, {
			protocol: 'https'
		});
	} else {
		return url.format({
			protocol: 'https',
			hostname: this._baseUrl,
			pathname: this._pathName,
			query: {
				token: this._apiToken,
				count: this._count,
				language: this._language,
				listIds: this._listIds,
				searchTerm: this._keywords,
				sortBy: this._sortParameter,
				startDate: startDate.toISOString(),
				endDate: new Date().toISOString()
			}
		});
	}
}

CrowdTangleContentService.prototype._parse = function(data) {

	var metadata = {
		sponsor: data.brandedContentSponsor	|| null,
		caption: data.caption || null,
		description: data.description || null, // this stores the content of sharedposts
		title: data.title || null,
		crowdtangleId: data.id || null,
		externalUrl: data.link || null,
		platform: data.platform || null,
		type: data.type || null,
		accountVerified: data.account ? data.account.verified : false,
		accountHandle: data.account ? data.account.handle : null,
		subscriberCount: data.account ? data.account.subscriberCount : 0,
		accountUrl: data.account ? data.account.url : null,
		mediaUrl: data.media? data.media.map(function(medium) {
			return {type: medium.type, url: medium.url}
		}) : null,
		actualStatistics: data.statistics.actual || null,
		expectedStatistics: data.statistics.expected || null,
		rawAPIResponse: data
	};

	var author = data.account ? data.account.name || data.account.handle : null;
	var content = data.message || 'No Content'

	// This code deals specifically with matching a crowdtangle list to a report's account id
	this.crowdtangle_lists = crowdtangle_lists.crowdtangle_list_account_pairs;
	// If the list is found and matched, then the ct_tag is the list name
	if (this.crowdtangle_lists[data.account.id]) {
		metadata.ct_tag = this.crowdtangle_lists[data.account.id];
	} else {
		// If the list is not found and not matched, make the ct_tag the account.id so we can identify it later.
		metadata.ct_tag = data.account.id;
	}

	return {
	    authoredAt: new Date(data.date + " UTC") || new Date(),
	    fetchedAt: new Date(),
	    content: content,
	    author: author,
	    metadata: metadata,
	    url: data.postUrl,
	    //_sources: '', //need to get this info from somewhere
	    //_sourceNicknames: ''
  	};
}

CrowdTangleContentService.prototype.reloadSettings = function() {
	this._baseUrl = config.get().crowdtangle.baseUrl;
	this._pathName = config.get().crowdtangle.pathName;
	this._count = config.get().crowdtangle.count;
	this._language = config.get().crowdtangle.language;
};

CrowdTangleContentService.prototype.reloadCTList = function() {
	var listFile = path.resolve(__dirname + '../../../../config/crowdtangle_list.json');
	fs.readFile(listFile, 'utf8', function(err, data) {
			crowdtangle_lists = JSON.parse(data);
	});
};

module.exports = CrowdTangleContentService;
