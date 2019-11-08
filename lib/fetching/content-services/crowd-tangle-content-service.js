var request = require('request');
var url = require('url');
var prettyjson = require('prettyjson');



var ContentService = require('../content-service');
var util = require('util');
var config = require('../../../config/secrets');
var request = require('request');
var dateFormat = require('dateformat');
var _ = require('underscore');


//options.lastReportDate is passed here through the content-service-factory and will be utilised in calling the api, but its actually only maintained by the parent content service, it is only utilised by the child
var CrowdTangleContentService = function(options) {
	this._baseUrl = config.get().crowdtangle.baseUrl
	this._pathName = config.get().crowdtangle.pathName
	this._count = config.get().crowdtangle.count
	this._language = config.get().crowdtangle.language
	this._sortParameter = config.get().crowdtangle.sortParameter
	this._apiToken = options.apiToken
	this._keywords = options.keywords
	this._listIds = options.listIds
	this.fetchType = 'pull';
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
	    console.log(reportData);
	    callback(reportData);
  	});
};

CrowdTangleContentService.prototype._httpRequest = function(params, callback) {
	request(params, callback);
};

CrowdTangleContentService.prototype._completeUrl = function() {
	return url.format({
		protocol: 'https',
		hostname: this._baseUrl,
		pathname: this._pathName,
		query: {
			token: this._apiToken,
	    	count: this._count,
	    	language: this._language,
	    	listIds: this._listIds, //make sure that the default is null!
	    	searchTerm: this._keywords, //default is null!
	    	sortBy: this._sortParameter,
	    	startDate: this._lastReportDate,
	    	endDate: null,
	    	types: 'status', //need to fix this
	  	}
	});
}

CrowdTangleContentService.prototype._parse = function(data) {
	var metadata = {
		sponsor: data.brandedContentSponsor	|| null,
		caption: data.caption || null,
		description: data.description || null,
		title: data.title || null,
		crowdtangleId: data.id || null,
		externalUrl: data.link || null,
		platform: data.platform || null,
		type: data.type || null,
		accountVerified: data.account ? data.account.verified : false,
		accountHandle: data.account ? data.account.handle : null,
		subscriberCount: data.account ? data.account.subscriberCount : 0,
		accountUrl: data.account ? data.account.url : null
	};
	var text = data.message || data.description || data.title || data.caption || null; //??? need to revisit, what if there is no text? what about youtube case
	var author = data.account ? data.account.name || data.account.handle : null;
	return {
	    authoredAt: new Date(data.date) || new Date(),
	    fetchedAt: new Date(),
	    content: text,
	    author: author,
	    metadata: metadata,
	    url: data.postUrl,
	    _sources: '', //need to get this info from somewhere
	    _sourceNicknames: ''
  	};
}


CrowdTangleContentService.prototype.reloadSettings = function() {
	this._baseUrl = config.get().crowdtangle.baseUrl
	this._pathName = config.get().crowdtangle.pathName
	this._count = config.get().crowdtangle.count
	this._language = config.get().crowdtangle.language
};

module.exports = CrowdTangleContentService;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// This is testing code



// console.log("hello world");

// var endPoint = url.format({
// 	protocol: 'https',
// 	hostname: 'api.crowdtangle.com/',
// 	pathname: 'posts',
// 	query: {
// 		token: '2XWvVhLXgnqfAujzbIRz5LrHvDwo3OEUe1ATY3qS',
//     	count: 1,
//     	language: 'en',
//     	listIds: null,
//     	searchTerm: 'Trump',
//     	sortBy: 'date',
//     	startDate: null,
//     	types: 'status',
//   	}
// });


// request(endPoint, function (error, response, body) {
// 	if (error) {
// 		console.log('error:', error); // Print the error if one occurred
// 	}

//   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
 
//   	var responses;
//     try {
//       responses = JSON.parse(body);
//       console.log(prettyjson.render(responses));
//     } catch (e) {
//       console.log(e.message);
//     }
// });
