var request = require('request');
var url = require('url');
var fs = require('fs');
var path = require('path');
var ContentService = require('../content-service');
var util = require('util');
var config = require('../../../config/secrets');
var crowdtangle_lists = require('../../../config/crowdtangle_list');
var Promise = require('promise');


var request = require('request');
var _ = require('underscore');

//options.lastReportDate is passed here through the content-service-factory and will be utilised in calling the api, but its actually only maintained by the parent content service, it is only utilised by the child
var CrowdTangleContentService = function(options) {
	this._nextPageUrl = undefined;
	this._nextPageUrlSavedSearch = undefined;
	this.reloadSettings();
	this._keywords = options.keywords;
	this._lastReportDate = options.lastReportDate;
	this._lastReportDateSavedSearch = options.lastReportDateSavedSearch;
	this.fetchType = 'pull';
	this.interval = 15000;
	this.detectHateSpeech = config.get().detectHateSpeech;
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

	// now we need to submit the request
	var  requestUrl = this._completeUrl(options)

	if (requestUrl !== null){
		this._httpRequest({url: requestUrl}, function(err, res, body) {
			if (err) {
				self.emit('error', new Error('HTTP error: ' + err.message));
				return callback([]);
			} else if (res.statusCode !== 200) {
				console.error("Error response:", JSON.stringify(res, null, 2));
				if (res.statusCode === 504 || res.statusCode === 401 || res.statusCode === 400) {
					// Ignore transient errors, the CT API is flaky.
					// 504: Gateway Timeout
					// 401: Invalid API token
					// 400: Disabled dashboard
				} else {
					self.emit('error', new Error.HTTP(res.statusCode));
				}
				return callback([]);
			}

			//if no errors, parse the body..
			var responses;
			try {
				responses = JSON.parse(body).result.posts;
				var nextPageUrl = JSON.parse(body).result.pagination.nextPage;
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
			if (self.detectHateSpeech){
				var hateSpeechRequests = responses.map(function(x) {return {"data" : x, "request" :ContentService.prototype.getHateSpeechRequest(x.message ? x.message : "")}; });
				Promise.all(hateSpeechRequests.map(function(x){return x.request})).then(
					function(hateSpeechResults){
						hateSpeechResults.forEach((hateSpeechResult, index)=>{
							hateSpeechRequests[index].data.hateSpeechScore = hateSpeechResult.result.hateSpeechScore;
						});
						return hateSpeechRequests;
					}
				).then(function(hateSpeechRequests) {
					callback({"nextPageUrl": nextPageUrl, "reportData": hateSpeechRequests.map(function(x){return self._parse(x.data, options);})});
				});
			} else{
				var reportData = responses.map(function(x) { return self._parse(x, options); });
				callback({"nextPageUrl": nextPageUrl, "reportData": reportData});
			}

		});
	} else {
		callback({});
	}

};

CrowdTangleContentService.prototype._httpRequest = function(params, callback) {
	request(params, callback);
};

CrowdTangleContentService.prototype._completeUrl = function(options) {
	// add one second to last report date to start fetching from
	// if it is the first time fetching data, initialize start date to an old date
	var initialStartDate = new Date();
	initialStartDate.setHours(initialStartDate.getHours() - 3);

	//assigning correct value to lastReportDate based on whether the request is for SAVED_SEARCH or LIST
	var lastReportDate =  this._lastReportDate;
	var nextPageUrl = this._nextPageUrl;
	var listIds = "";
	if(options.requestType == "SAVED_SEARCH"){
		lastReportDate = this._lastReportDateSavedSearch;
		nextPageUrl = this._nextPageUrlSavedSearch;
		listIds = Object.keys(crowdtangle_lists.crowdtangle_saved_searches).join(",");
		//this ensures that if a user doesn't have saved search configured, Aggie doesnt make a Saved search request to CT
		if(listIds == "") {
			return null;
		}
	}

	var startDate = lastReportDate ? new Date(lastReportDate.getTime() + 1000): initialStartDate;
	if(nextPageUrl !== undefined && nextPageUrl !== null) {
		// this._nextPageUrl contains all information about language, searchTerm, sortBy etc.
		var urlObj = url.format(nextPageUrl, {
			protocol: 'https'
		});
		return urlObj;
	} else {
		var urlObj = url.format({
			protocol: 'https',
			hostname: this._baseUrl,
			pathname: this._pathName,
			query: {
				token: this._apiToken,
				count: this._count,
				language: this._language,
				listIds: listIds,
				searchTerm: this._keywords,
				sortBy: this._sortParameter,
				startDate: startDate.toISOString(),
				endDate: new Date().toISOString()
			}
		});
		return urlObj;
	}
}

CrowdTangleContentService.prototype._parse = function(data, options) {
	var metadata = {
		sponsor: data.brandedContentSponsor	|| null,
		caption: data.caption || null,
		description: data.description || null, // this stores the content of sharedposts
		imageText: data.imageText || null,
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
		rawAPIResponse: data,
		hateSpeechScore: data.hateSpeechScore || null
	};

	var author = data.account ? data.account.name || data.account.handle : null;
	var content = data.message || 'No Content'

	// This code deals specifically with matching a crowdtangle list to a report's account id
	this.crowdtangle_lists = crowdtangle_lists.crowdtangle_list_account_pairs;
	this.crowdtangle_saved_searches = crowdtangle_lists.crowdtangle_saved_searches;
	// If the list is found and matched, then the ct_tag is the list name
	if (this.crowdtangle_lists[data.account.id]) {
		metadata.ct_tag = this.crowdtangle_lists[data.account.id];
	} else if (options.requestType == "SAVED_SEARCH") {
		metadata.ct_tag = []
		// This is a workaround to identify possible saved search names associated with a post using substring search.
		// We plan to remove this workaround when CT adds list IDs/account IDs to saved search API responses.
		for(var saved_search_id in this.crowdtangle_saved_searches){
			var saved_search = this.crowdtangle_saved_searches[saved_search_id];
			const doesMatch = this.doesReportMatchWords(saved_search.words, content, metadata)
			doesMatch && metadata.ct_tag.push(saved_search.name);
		}
		//if no matches are found, then add default "Saved Search" tag.
		if(metadata.ct_tag.length == 0){
			metadata.ct_tag.push("Saved Search");
		}
	}
	else {
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

//regex function used to check if words in saved searches match report data
CrowdTangleContentService.prototype.doesReportMatchWords = function(words, content, metadata) {
	try{
		var regex = new RegExp(words.join("|"), 'gi');
		if (words.length &&
			(regex.test(content)||
			regex.test(metadata.caption) ||
			regex.test(metadata.title) ||
			regex.test(metadata.description)||
			regex.test(metadata.imageText))) {
				return true;
		}
	} catch (err) {
		console.error("Error creating regex for saved searches");
	}
	return false;
}
CrowdTangleContentService.prototype.reloadSettings = function() {
	this._baseUrl = config.get().crowdtangle.baseUrl;
	this._pathName = config.get().crowdtangle.pathName;
	this._count = config.get().crowdtangle.count;
	const useLanguage = config.get().crowdtangle.useLanguage;
	this._language = useLanguage ? config.get().crowdtangle.language : undefined;
	this._sortParameter = config.get().crowdtangle.sortParam;
	this._apiToken = config.get().crowdtangle.apiToken;
};

CrowdTangleContentService.prototype.reloadCTList = function() {
	var listFile = path.resolve(__dirname + '../../../../config/crowdtangle_list.json');
	fs.readFile(listFile, 'utf8', function(err, data) {
			crowdtangle_lists = JSON.parse(data);
	});
};

module.exports = CrowdTangleContentService;
